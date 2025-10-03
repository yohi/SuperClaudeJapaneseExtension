/**
 * 入力履歴管理
 * コマンド入力履歴の保存、読み込み、スコア計算を管理
 */

import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import type {
  HistoryEntry,
  HistoryManagerOptions,
  HistoryError,
  Result,
} from '../types';

/**
 * シンプルなPromiseベースのミューテックス
 * 非同期操作の直列化を保証
 */
class Mutex {
  private locked = false;
  private queue: Array<() => void> = [];

  /**
   * ロックを取得
   * ロックが解放されるまで待機
   */
  async acquire(): Promise<void> {
    if (!this.locked) {
      this.locked = true;
      return;
    }

    return new Promise<void>((resolve) => {
      this.queue.push(resolve);
    });
  }

  /**
   * ロックを解放
   * 待機中の次の操作にロックを渡す
   */
  release(): void {
    const next = this.queue.shift();
    if (next) {
      next();
    } else {
      this.locked = false;
    }
  }
}

/**
 * 履歴マネージャークラス
 *
 * 注意: このクラスは内部的にミューテックスを使用して、
 * 並行呼び出しに対してMap操作を直列化します。
 */
export class HistoryManager {
  private historyFile: string;
  private history: Map<string, HistoryEntry> = new Map();
  private maxHistorySize: number;
  private mutex: Mutex = new Mutex();

  /**
   * コンストラクタ
   * @param historyFile 履歴ファイルのパス
   * @param options オプション
   */
  constructor(historyFile: string, options?: HistoryManagerOptions) {
    this.historyFile = historyFile;
    this.maxHistorySize = options?.maxHistorySize ?? 1000;
  }

  /**
   * コマンドを履歴に記録
   *
   * 並行性保護: このメソッドはミューテックスで保護されており、
   * 複数の並行呼び出しが直列化されます。
   *
   * @param command コマンド名
   * @returns 記録結果
   */
  async recordCommand(command: string): Promise<Result<void, HistoryError>> {
    // ミューテックスを取得（並行呼び出しを直列化）
    await this.mutex.acquire();

    try {
      // this.historyへの全てのアクセスをロック内で実行
      const existing = this.history.get(command);

      if (existing) {
        // 既存エントリを更新
        existing.frequency += 1;
        existing.lastUsed = Date.now();
      } else {
        // 新規エントリを追加
        this.history.set(command, {
          command,
          frequency: 1,
          lastUsed: Date.now(),
        });
      }

      // 履歴サイズの制限（evictionもロック内で実行）
      if (this.history.size > this.maxHistorySize) {
        this.evictOldestEntry();
      }

      return {
        ok: true,
        value: undefined,
      };
    } finally {
      // 必ずロックを解放（例外発生時も確実に実行）
      this.mutex.release();
    }
  }

  /**
   * 履歴を取得
   * @returns 履歴エントリのリスト
   */
  getHistory(): HistoryEntry[] {
    return Array.from(this.history.values());
  }

  /**
   * コマンドのスコアを取得
   * @param command コマンド名
   * @returns スコア（0.0-1.0）
   */
  getCommandScore(command: string): number {
    const entry = this.history.get(command);

    if (!entry) {
      return 0;
    }

    // スコア計算
    // - 頻度: 高いほど高スコア
    // - 最近使用: 最近使用されたほど高スコア

    const now = Date.now();
    const millisSinceLastUse = now - entry.lastUsed;

    // 頻度スコア（0.0-0.5）
    const frequencyScore = Math.min(entry.frequency / 10, 0.5);

    // 最近使用スコア（0.0-0.5）
    // より細かい時間粒度でスコアリング
    let recencyScore = 0.0;
    if (millisSinceLastUse < 1000) {
      // 1秒以内
      recencyScore = 0.5;
    } else if (millisSinceLastUse < 60000) {
      // 1分以内
      recencyScore = 0.45;
    } else if (millisSinceLastUse < 3600000) {
      // 1時間以内
      recencyScore = 0.4;
    } else if (millisSinceLastUse < 86400000) {
      // 1日以内
      recencyScore = 0.3;
    } else if (millisSinceLastUse < 604800000) {
      // 7日以内
      recencyScore = 0.2;
    }

    return frequencyScore + recencyScore;
  }

  /**
   * 履歴をファイルに保存
   *
   * 並行性保護: このメソッドはミューテックスで保護されており、
   * 保存中の履歴読み取りの一貫性を保証します。
   *
   * @returns 保存結果
   */
  async save(): Promise<Result<void, HistoryError>> {
    await this.mutex.acquire();

    try {
      // this.historyの読み取りをロック内で実行
      const data = {
        version: '1.0.0',
        entries: Array.from(this.history.values()),
      };

      // ファイルI/Oもロック内で実行（一貫性を保証）
      await fs.writeFile(this.historyFile, JSON.stringify(data, null, 2));

      return {
        ok: true,
        value: undefined,
      };
    } catch (error) {
      return {
        ok: false,
        error: {
          type: 'SAVE_FAILED',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    } finally {
      this.mutex.release();
    }
  }

  /**
   * 履歴をファイルから読み込み
   *
   * 並行性保護: このメソッドはミューテックスで保護されており、
   * 読み込み中の履歴変更（clear/set）の一貫性を保証します。
   *
   * @returns 読み込み結果
   */
  async load(): Promise<Result<void, HistoryError>> {
    await this.mutex.acquire();

    try {
      // ファイルが存在しない場合は空の履歴として扱う
      if (!fsSync.existsSync(this.historyFile)) {
        return {
          ok: true,
          value: undefined,
        };
      }

      const content = await fs.readFile(this.historyFile, 'utf-8');
      const data = JSON.parse(content) as {
        version: string;
        entries: HistoryEntry[];
      };

      // this.historyの変更（clear/set）をロック内で実行
      this.history.clear();
      for (const entry of data.entries) {
        this.history.set(entry.command, entry);
      }

      return {
        ok: true,
        value: undefined,
      };
    } catch (error) {
      return {
        ok: false,
        error: {
          type: 'LOAD_FAILED',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    } finally {
      this.mutex.release();
    }
  }

  /**
   * 最も古いエントリを削除
   * @private
   */
  private evictOldestEntry(): void {
    let oldestCommand: string | null = null;
    let oldestTime = Infinity;

    for (const [command, entry] of this.history.entries()) {
      if (entry.lastUsed < oldestTime) {
        oldestTime = entry.lastUsed;
        oldestCommand = command;
      }
    }

    if (oldestCommand) {
      this.history.delete(oldestCommand);
    }
  }
}
