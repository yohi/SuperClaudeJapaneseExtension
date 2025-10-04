/**
 * コマンドメタデータローダー
 * コマンドメタデータの読み込みとキャッシュ管理
 */

import { MetadataParser } from './metadataParser';
import { CacheManager } from '../cache/cacheManager';
import type { Result, CommandMetadata, ParseError } from '../types';

/**
 * ローダー設定
 */
export interface LoaderConfig {
  maxCacheSize: number;
  cacheTTL: number;
}

/**
 * コマンドメタデータローダークラス
 */
export class CommandMetadataLoader {
  private parser: MetadataParser;
  private cache: CacheManager<CommandMetadata>;
  private commands: Map<string, CommandMetadata>;

  /**
   * コンストラクタ
   * @param config ローダー設定
   */
  constructor(config: LoaderConfig) {
    this.parser = new MetadataParser();
    this.cache = new CacheManager<CommandMetadata>({
      maxSize: config.maxCacheSize,
      ttl: config.cacheTTL,
    });
    this.commands = new Map();
  }

  /**
   * コマンドメタデータを読み込む
   * @param filePath コマンドファイルのパス
   * @returns コマンドメタデータまたはエラー
   */
  async loadCommand(
    filePath: string
  ): Promise<Result<CommandMetadata, ParseError>> {
    // キャッシュをチェック
    const cached = this.cache.get(filePath);
    if (cached) {
      return {
        ok: true,
        value: cached,
      };
    }

    // ファイルを解析
    const result = await this.parser.parseCommandMetadata(filePath);

    if (result.ok) {
      // キャッシュに保存
      this.cache.set(filePath, result.value);
      // コマンドマップに追加
      this.commands.set(result.value.name, result.value);
    }

    return result;
  }

  /**
   * ディレクトリから全コマンドメタデータを読み込む
   * @param dirPath ディレクトリパス
   * @returns コマンドメタデータのマップまたはエラー
   */
  async loadCommandsFromDirectory(
    dirPath: string
  ): Promise<Result<Map<string, CommandMetadata>, ParseError>> {
    const result = await this.parser.loadAllCommands(dirPath);

    if (result.ok) {
      // コマンドマップを更新
      for (const [name, metadata] of result.value.entries()) {
        this.commands.set(name, metadata);
      }
    }

    return result;
  }

  /**
   * コマンドメタデータを取得
   * @param commandName コマンド名
   * @returns コマンドメタデータまたはnull
   */
  getCommand(commandName: string): CommandMetadata | null {
    return this.commands.get(commandName) || null;
  }

  /**
   * 全コマンドメタデータを取得
   * @returns コマンドメタデータのマップ
   */
  getAllCommands(): Map<string, CommandMetadata> {
    return new Map(this.commands);
  }

  /**
   * コマンドが存在するか確認
   * @param commandName コマンド名
   * @returns 存在するか
   */
  hasCommand(commandName: string): boolean {
    return this.commands.has(commandName);
  }

  /**
   * コマンドメタデータを登録
   * @param metadata コマンドメタデータ
   */
  registerCommand(metadata: CommandMetadata): void {
    this.commands.set(metadata.name, metadata);
  }

  /**
   * キャッシュをクリア
   */
  clearCache(): void {
    this.cache.clear();
    this.commands.clear();
  }
}
