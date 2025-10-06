/**
 * 補完エンジン
 * コマンド、フラグ、引数の補完機能を提供
 */

import type { CommandMetadataLoader } from '../metadata/commandMetadataLoader';
import type { I18nManager } from '../i18n/i18nManager';
import type {
  CompletionCandidate,
  CompletionItem,
  CompletionError,
  Result,
} from '../types';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

/**
 * 補完エンジンクラス
 */
export class CompletionEngine {
  private metadataLoader: CommandMetadataLoader;
  private i18nManager: I18nManager;

  constructor(
    metadataLoader: CommandMetadataLoader,
    i18nManager: I18nManager
  ) {
    this.metadataLoader = metadataLoader;
    this.i18nManager = i18nManager;
  }

  /**
   * コマンド名の補完
   * @param prefix 入力プレフィックス
   * @returns 補完候補リスト
   */
  completeCommand(
    prefix: string
  ): Result<CompletionCandidate[], CompletionError> {
    const commands = this.metadataLoader.getAllCommands();
    const candidates: CompletionCandidate[] = [];

    // プレフィックスマッチング
    for (const [name, metadata] of commands.entries()) {
      if (name.startsWith(prefix.toLowerCase())) {
        // 翻訳取得
        const translationKey = `commands.${name}.description`;
        const translationResult = this.i18nManager.translate(translationKey);

        // 説明の取得（翻訳 → メタデータの順）
        let description = '';
        if (translationResult.ok) {
          description = translationResult.value;
        } else if (metadata.description) {
          description = metadata.description;
        }

        // スコア計算
        const score = this.calculateCommandScore(name, prefix);

        // カテゴリ取得
        const categoryKey = `commands.${name}.category`;
        const categoryResult = this.i18nManager.translate(categoryKey);
        const category = categoryResult.ok
          ? categoryResult.value
          : metadata.category;

        candidates.push({
          name,
          description,
          category,
          score,
        });
      }
    }

    // スコア順にソート（降順）
    candidates.sort((a, b) => b.score - a.score);

    return {
      ok: true,
      value: candidates,
    };
  }

  /**
   * フラグ補完
   * @param commandName コマンド名（フィルタリング用、オプション）
   * @param prefix 入力プレフィックス（例: "--p", "p", "uc"）
   * @returns 補完候補リスト
   */
  completeFlag(
    commandName: string | undefined,
    prefix: string
  ): Result<CompletionCandidate[], CompletionError> {
    // コマンド名が指定された場合、存在確認
    if (commandName && !this.metadataLoader.hasCommand(commandName)) {
      return {
        ok: false,
        error: {
          type: 'INVALID_COMMAND',
          command: commandName,
        },
      };
    }

    // プレフィックスの正規化（--を除去）
    const normalizedPrefix = prefix.replace(/^--/, '').toLowerCase();

    const candidates: CompletionCandidate[] = [];

    // フラグの翻訳キー一覧を取得するために、各フラグを個別に取得
    // 既知のフラグ名のリスト（将来的には動的に取得可能にする）
    const knownFlags = ['plan', 'uc', 'think', 'persona-architect', 'persona-developer'];

    for (const flagName of knownFlags) {
      // プレフィックスマッチングの早期判定
      const descriptionKey = `flags.${flagName}.description`;
      const aliasKey = `flags.${flagName}.alias`;

      // 説明を取得
      const descriptionResult = this.i18nManager.translate(descriptionKey);
      const description = descriptionResult.ok ? descriptionResult.value : '';

      // エイリアスを取得
      const aliasResult = this.i18nManager.translate(aliasKey);
      const alias = aliasResult.ok ? aliasResult.value : undefined;

      const fullFlagName = `--${flagName}`;

      // プレフィックスマッチング
      const matchesName = flagName.startsWith(normalizedPrefix);
      const matchesAlias =
        alias && alias.toLowerCase().startsWith(normalizedPrefix);

      if (matchesName || matchesAlias) {
        // スコア計算
        const score = this.calculateFlagScore(
          flagName,
          normalizedPrefix,
          alias
        );

        candidates.push({
          name: fullFlagName,
          description,
          score,
          alias,
        });
      }
    }

    // コマンドコンテキストでのフィルタリング（将来の拡張）
    if (commandName) {
      // 現時点では全フラグを返すが、将来的にコマンド固有のフラグのみに制限可能
    }

    // スコア順にソート（降順）
    candidates.sort((a, b) => b.score - a.score);

    return {
      ok: true,
      value: candidates,
    };
  }

  /**
   * コマンドスコアの計算
   * @param commandName コマンド名
   * @param prefix 入力プレフィックス
   * @returns スコア（0.0-1.0）
   */
  private calculateCommandScore(
    commandName: string,
    prefix: string
  ): number {
    if (commandName === prefix) {
      // 完全一致
      return 1.0;
    }

    if (prefix.length === 0) {
      // プレフィックスが空の場合
      return 0.5;
    }

    // プレフィックスマッチのスコア
    // - プレフィックスが長いほど高スコア
    // - コマンド名が短いほど高スコア
    const prefixRatio = prefix.length / commandName.length;
    const lengthPenalty = 1.0 / (1.0 + commandName.length / 10.0);

    return 0.6 + prefixRatio * 0.3 + lengthPenalty * 0.1;
  }

  /**
   * 引数補完
   * @param commandName コマンド名
   * @param argumentIndex 引数インデックス
   * @param currentValue 現在の入力値
   * @returns 補完候補リスト
   */
  completeArgument(
    commandName: string,
    argumentIndex: number,
    currentValue: string
  ): Result<CompletionItem[], CompletionError> {
    // コマンドの存在確認
    if (!this.metadataLoader.hasCommand(commandName)) {
      return {
        ok: false,
        error: {
          type: 'INVALID_COMMAND',
          command: commandName,
        },
      };
    }

    const candidates: CompletionItem[] = [];

    // ファイルパス補完の検出
    const isFilePath =
      currentValue.startsWith('./') ||
      currentValue.startsWith('../') ||
      currentValue.startsWith('/') ||
      currentValue.startsWith('~/');
    const isAtNotation = currentValue.startsWith('@');

    if (isFilePath || isAtNotation) {
      // ファイルパス補完
      const pathCandidates = this.getFilePathCompletions(currentValue);
      candidates.push(...pathCandidates);
    } else {
      // 定型値補完
      const predefinedCandidates =
        this.getPredefinedValueCompletions(currentValue);
      candidates.push(...predefinedCandidates);
    }

    // スコア順にソート（降順）
    candidates.sort((a, b) => b.score - a.score);

    return {
      ok: true,
      value: candidates,
    };
  }

  /**
   * ファイルパス補完候補を取得
   * @param currentValue 現在の入力値
   * @returns 補完候補リスト
   */
  private getFilePathCompletions(currentValue: string): CompletionItem[] {
    const candidates: CompletionItem[] = [];

    try {
      // @記法の検出とプレフィックス抽出
      const isAtNotation = currentValue.startsWith('@');
      const pathWithoutAt = isAtNotation ? currentValue.slice(1) : currentValue;

      // ユーザー入力プレフィックスの保持（./, ../, /, ~/）
      let originalPrefix = '';
      let pathForParsing = pathWithoutAt;

      if (pathWithoutAt.startsWith('~/')) {
        originalPrefix = '~/';
        pathForParsing = pathWithoutAt;
      } else if (pathWithoutAt.startsWith('./')) {
        originalPrefix = './';
        pathForParsing = pathWithoutAt;
      } else if (pathWithoutAt.startsWith('../')) {
        originalPrefix = '../';
        pathForParsing = pathWithoutAt;
      } else if (pathWithoutAt.startsWith('/')) {
        originalPrefix = '/';
        pathForParsing = pathWithoutAt;
      }

      // ファイルシステム操作用パスの構築（~ 展開、相対パス解決）
      let fsPath: string;
      if (pathWithoutAt.startsWith('~/')) {
        // ~ をホームディレクトリに展開
        fsPath = path.join(os.homedir(), pathWithoutAt.slice(2));
      } else if (pathWithoutAt.startsWith('/')) {
        // 絶対パス
        fsPath = pathWithoutAt;
      } else {
        // 相対パス（カレントディレクトリから解決）
        fsPath = path.resolve(process.cwd(), pathWithoutAt);
      }

      // パスの解析
      let fsBasePath: string;
      let filePrefix: string;

      // 末尾が/の場合はディレクトリ全体を表示
      if (pathForParsing.endsWith('/')) {
        fsBasePath = fsPath;
        filePrefix = '';
      } else {
        fsBasePath = path.dirname(fsPath);
        filePrefix = path.basename(fsPath);
      }

      // ディレクトリの存在確認
      if (fs.existsSync(fsBasePath)) {
        const entries = fs.readdirSync(fsBasePath);

        for (const entry of entries) {
          // プレフィックスマッチング
          if (entry.toLowerCase().startsWith(filePrefix.toLowerCase())) {
            const entryFsPath = path.join(fsBasePath, entry);
            const stats = fs.statSync(entryFsPath);
            const isDirectory = stats.isDirectory();

            // 表示用パスの構築（ユーザープレフィックス保持、セパレータ正規化）
            let displayPath: string;
            if (pathForParsing.endsWith('/')) {
              // ディレクトリ全体を表示する場合
              displayPath = (originalPrefix + entry).replace(/\\/g, '/');
            } else {
              // プレフィックスマッチング中の場合
              const basePart = path.dirname(pathForParsing);
              if (basePart === '.') {
                displayPath = (originalPrefix + entry).replace(/\\/g, '/');
              } else {
                displayPath = (basePart + '/' + entry).replace(/\\/g, '/');
              }
            }

            // @記法の場合は @ を先頭に追加
            const value = isAtNotation ? `@${displayPath}` : displayPath;

            // 説明の翻訳キー取得
            const descKey = isDirectory
              ? 'arguments.path.directory'
              : 'arguments.path.file';
            const descResult = this.i18nManager.translate(descKey);
            const description = descResult.ok
              ? `${descResult.value}: ${entry}`
              : entry;

            // スコア計算（エントリ名のみを使用）
            const score = this.calculateArgumentScore(entry, filePrefix);

            candidates.push({
              value,
              description,
              score,
            });
          }
        }
      }
    } catch (error) {
      // ファイルシステムエラーは無視
    }

    return candidates;
  }

  /**
   * 定型値補完候補を取得
   * @param currentValue 現在の入力値
   * @returns 補完候補リスト
   */
  private getPredefinedValueCompletions(
    currentValue: string
  ): CompletionItem[] {
    const candidates: CompletionItem[] = [];

    // よく使われる定型値（将来的にはコマンドメタデータから取得）
    const predefinedValues = [
      { value: 'production', descKey: 'arguments.env.production' },
      { value: 'development', descKey: 'arguments.env.development' },
      { value: 'staging', descKey: 'arguments.env.staging' },
      { value: 'test', descKey: 'arguments.env.test' },
    ];

    for (const { value, descKey } of predefinedValues) {
      // プレフィックスマッチング
      if (value.toLowerCase().startsWith(currentValue.toLowerCase())) {
        // 説明の翻訳取得
        const descResult = this.i18nManager.translate(descKey);
        const description = descResult.ok ? descResult.value : value;

        // スコア計算
        const score = this.calculateArgumentScore(value, currentValue);

        candidates.push({
          value,
          description,
          score,
        });
      }
    }

    return candidates;
  }

  /**
   * 引数スコアの計算
   * @param argValue 引数値
   * @param prefix 入力プレフィックス
   * @returns スコア（0.0-1.0）
   */
  private calculateArgumentScore(argValue: string, prefix: string): number {
    if (argValue === prefix) {
      // 完全一致
      return 1.0;
    }

    if (prefix.length === 0) {
      // プレフィックスが空の場合
      return 0.5;
    }

    // プレフィックスマッチのスコア
    const prefixRatio = prefix.length / argValue.length;
    const lengthPenalty = 1.0 / (1.0 + argValue.length / 10.0);

    return 0.6 + prefixRatio * 0.3 + lengthPenalty * 0.1;
  }

  /**
   * フラグスコアの計算
   * @param flagName フラグ名（--なし）
   * @param prefix 入力プレフィックス（--なし）
   * @param alias エイリアス（オプション）
   * @returns スコア（0.0-1.0）
   */
  private calculateFlagScore(
    flagName: string,
    prefix: string,
    alias?: string
  ): number {
    if (flagName === prefix) {
      // 完全一致
      return 1.0;
    }

    if (alias && alias.toLowerCase() === prefix) {
      // エイリアス完全一致
      return 0.95;
    }

    if (prefix.length === 0) {
      // プレフィックスが空の場合
      return 0.5;
    }

    // プレフィックスマッチのスコア
    let score = 0.6;

    // フラグ名マッチング
    if (flagName.startsWith(prefix)) {
      const prefixRatio = prefix.length / flagName.length;
      score += prefixRatio * 0.3;
    }

    // エイリアスマッチング
    if (alias && alias.toLowerCase().startsWith(prefix)) {
      const prefixRatio = prefix.length / alias.length;
      score += prefixRatio * 0.2;
    }

    // 長さペナルティ
    const lengthPenalty = 1.0 / (1.0 + flagName.length / 10.0);
    score += lengthPenalty * 0.1;

    return Math.min(score, 0.99); // 完全一致以外は1.0未満
  }
}
