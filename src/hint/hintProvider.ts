/**
 * ヒント提供システム
 * コマンド、フラグ、引数のヒントを生成
 */

import chalk from 'chalk';
import type { I18nManager } from '../i18n/i18nManager';
import type { CommandMetadataLoader } from '../metadata/commandMetadataLoader';
import type { Result, HintError } from '../types';

/**
 * ヒント提供クラス
 */
export class HintProvider {
  private i18nManager: I18nManager;
  private metadataLoader: CommandMetadataLoader;
  private hintCache: Map<string, string>;

  /**
   * コンストラクタ
   * @param i18nManager 国際化マネージャー
   * @param metadataLoader メタデータローダー
   */
  constructor(i18nManager: I18nManager, metadataLoader: CommandMetadataLoader) {
    this.i18nManager = i18nManager;
    this.metadataLoader = metadataLoader;
    this.hintCache = new Map();
  }

  /**
   * コマンドヒントを生成（色付き）
   * @param commandName コマンド名
   * @returns ヒント文字列またはエラー
   */
  generateCommandHint(commandName: string): Result<string, HintError> {
    // キャッシュをチェック
    const cacheKey = `${commandName}:${this.i18nManager.getCurrentLocale()}`;
    const cached = this.hintCache.get(cacheKey);
    if (cached) {
      return {
        ok: true,
        value: cached,
      };
    }

    // コマンドメタデータを取得
    const metadata = this.metadataLoader.getCommand(commandName);
    if (!metadata) {
      return {
        ok: false,
        error: {
          type: 'COMMAND_NOT_FOUND',
          command: commandName,
        },
      };
    }

    // 翻訳を取得（フォールバック付き）
    const description = this.getDescription(commandName, metadata);
    const argumentHint = this.getArgumentHint(commandName, metadata);

    // ヒントを構築
    let hint = '';

    // コマンド名（青色、太字）
    hint += chalk.bold.blue(`/${commandName}`);

    // 引数ヒント（グレー）
    if (argumentHint) {
      hint += ` ${chalk.gray(argumentHint)}`;
    }

    hint += '\n';

    // 説明（通常）
    hint += `  ${description}`;

    // カテゴリー（黄色）
    if (metadata.category) {
      hint += `\n  ${chalk.yellow(`[${metadata.category}]`)}`;
    }

    // キャッシュに保存
    this.hintCache.set(cacheKey, hint);

    return {
      ok: true,
      value: hint,
    };
  }

  /**
   * コマンドヒントを生成（プレーンテキスト）
   * @param commandName コマンド名
   * @returns ヒント文字列またはエラー
   */
  generateCommandHintPlain(commandName: string): Result<string, HintError> {
    // コマンドメタデータを取得
    const metadata = this.metadataLoader.getCommand(commandName);
    if (!metadata) {
      return {
        ok: false,
        error: {
          type: 'COMMAND_NOT_FOUND',
          command: commandName,
        },
      };
    }

    // 翻訳を取得（フォールバック付き）
    const description = this.getDescription(commandName, metadata);
    const argumentHint = this.getArgumentHint(commandName, metadata);

    // ヒントを構築（色なし）
    let hint = '';

    // コマンド名
    hint += `/${commandName}`;

    // 引数ヒント
    if (argumentHint) {
      hint += ` ${argumentHint}`;
    }

    hint += '\n';

    // 説明
    hint += `  ${description}`;

    // カテゴリー
    if (metadata.category) {
      hint += `\n  [${metadata.category}]`;
    }

    return {
      ok: true,
      value: hint,
    };
  }

  /**
   * 説明を取得（フォールバック付き）
   * @param commandName コマンド名
   * @param metadata コマンドメタデータ
   * @returns 説明文字列
   */
  private getDescription(commandName: string, metadata: any): string {
    const locale = this.i18nManager.getCurrentLocale();

    // 1. 翻訳データから取得を試みる
    const translationKey = `commands.${commandName}.description`;
    const translationResult = this.i18nManager.translate(translationKey);

    if (translationResult.ok) {
      return translationResult.value;
    }

    // 2. メタデータの日本語説明を使用
    if (locale === 'ja' && metadata.descriptionJa) {
      return metadata.descriptionJa;
    }

    // 3. メタデータの英語説明を使用（フォールバック）
    if (metadata.description) {
      return metadata.description;
    }

    // 4. デフォルトメッセージ
    return locale === 'ja' ? '説明なし' : 'No description available';
  }

  /**
   * 引数ヒントを取得（フォールバック付き）
   * @param commandName コマンド名
   * @param metadata コマンドメタデータ
   * @returns 引数ヒント文字列
   */
  private getArgumentHint(commandName: string, metadata: any): string {
    const locale = this.i18nManager.getCurrentLocale();

    // 1. 翻訳データから取得を試みる
    const translationKey = `commands.${commandName}.arguments`;
    const translationResult = this.i18nManager.translate(translationKey);

    if (translationResult.ok && translationResult.value) {
      return translationResult.value;
    }

    // 2. メタデータの日本語引数ヒントを使用
    if (locale === 'ja' && metadata.argumentHintJa) {
      return metadata.argumentHintJa;
    }

    // 3. メタデータの英語引数ヒントを使用（フォールバック）
    if (metadata.argumentHint) {
      return metadata.argumentHint;
    }

    return '';
  }

  /**
   * キャッシュをクリア
   */
  clearCache(): void {
    this.hintCache.clear();
  }
}
