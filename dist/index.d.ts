/**
 * SuperClaude Japanese Extension
 * エントリーポイント
 */
export type { SupportedLocale, Result, TranslationResource, CommandTranslation, FlagTranslation, CommandMetadata, FlagMetadata, HintOutput, CompletionItem, CompletionCandidate, CompletionOptions, CacheEntry, TranslateOptions, I18nError, TranslationNotFoundError, LoadError, ValidationError, HintError, CompletionError, ParseError, } from './types';
export { LogLevel } from './types';
export { I18nManager } from './i18n/i18nManager';
export { TranslationLoader } from './i18n/translationLoader';
export { MetadataParser } from './metadata/metadataParser';
export { CommandMetadataLoader } from './metadata/commandMetadataLoader';
export { HintProvider } from './hint/hintProvider';
export { CompletionEngine } from './completion/completionEngine';
export { CacheManager } from './cache/cacheManager';
/**
 * バージョン情報
 */
export declare const VERSION = "1.0.0";
/**
 * デフォルト設定
 */
export declare const DEFAULT_CONFIG: {
    locale: "ja";
    cacheTtl: number;
    maxCacheSize: number;
    logLevel: "INFO";
};
//# sourceMappingURL=index.d.ts.map