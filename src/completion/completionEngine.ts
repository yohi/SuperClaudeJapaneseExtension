/**
 * 補完エンジン
 * コマンド、フラグ、引数の補完機能を提供
 */

import type { CommandMetadataLoader } from '../metadata/commandMetadataLoader';
import type { I18nManager } from '../i18n/i18nManager';
import type {
  CompletionCandidate,
  CompletionError,
  Result,
} from '../types';

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
}
