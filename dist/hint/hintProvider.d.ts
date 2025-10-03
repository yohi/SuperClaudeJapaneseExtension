/**
 * ヒント提供システム
 * コマンド、フラグ、引数のヒントを生成
 */
import type { I18nManager } from '../i18n/i18nManager';
import type { CommandMetadataLoader } from '../metadata/commandMetadataLoader';
import type { Result, HintError } from '../types';
/**
 * ヒント提供クラス
 */
export declare class HintProvider {
    private i18nManager;
    private metadataLoader;
    private hintCache;
    /**
     * コンストラクタ
     * @param i18nManager 国際化マネージャー
     * @param metadataLoader メタデータローダー
     */
    constructor(i18nManager: I18nManager, metadataLoader: CommandMetadataLoader);
    /**
     * コマンドヒントを生成（色付き）
     * @param commandName コマンド名
     * @returns ヒント文字列またはエラー
     */
    generateCommandHint(commandName: string): Result<string, HintError>;
    /**
     * コマンドヒントを生成（プレーンテキスト）
     * @param commandName コマンド名
     * @returns ヒント文字列またはエラー
     */
    generateCommandHintPlain(commandName: string): Result<string, HintError>;
    /**
     * 説明を取得（フォールバック付き）
     * @param commandName コマンド名
     * @param metadata コマンドメタデータ
     * @returns 説明文字列
     */
    private getDescription;
    /**
     * 引数ヒントを取得（フォールバック付き）
     * @param commandName コマンド名
     * @param metadata コマンドメタデータ
     * @returns 引数ヒント文字列
     */
    private getArgumentHint;
    /**
     * フラグヒントを生成（色付き）
     * @param flagName フラグ名
     * @returns ヒント文字列またはエラー
     */
    generateFlagHint(flagName: string): Result<string, HintError>;
    /**
     * フラグヒントを生成（プレーンテキスト）
     * @param flagName フラグ名
     * @returns ヒント文字列またはエラー
     */
    generateFlagHintPlain(flagName: string): Result<string, HintError>;
    /**
     * フラグ翻訳を取得（フォールバック付き）
     * @param flagName フラグ名
     * @returns フラグ翻訳またはnull
     */
    private getFlagTranslation;
    /**
     * キャッシュをクリア
     */
    clearCache(): void;
}
//# sourceMappingURL=hintProvider.d.ts.map