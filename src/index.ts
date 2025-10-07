/**
 * SuperClaude Japanese Extension
 * エントリーポイント
 */

// 型定義のエクスポート
export type {
  SupportedLocale,
  Result,
  TranslationResource,
  CommandTranslation,
  FlagTranslation,
  CommandMetadata,
  FlagMetadata,
  HintOutput,
  CompletionItem,
  CompletionCandidate,
  CompletionOptions,
  CacheEntry,
  TranslateOptions,
  I18nError,
  TranslationNotFoundError,
  LoadError,
  ValidationError,
  HintError,
  CompletionError,
  ParseError,
} from './types';

export { LogLevel } from './types';

// i18nコンポーネント
export { I18nManager } from './i18n/i18nManager';
export { TranslationLoader } from './i18n/translationLoader';

// メタデータコンポーネント
export { MetadataParser } from './metadata/metadataParser';
export { CommandMetadataLoader } from './metadata/commandMetadataLoader';

// ヒントコンポーネント
export { HintProvider } from './hint/hintProvider';

// 補完コンポーネント
export { CompletionEngine } from './completion/completionEngine';

// キャッシュコンポーネント
export { CacheManager } from './cache/cacheManager';

// ユーティリティコンポーネント
export { ErrorHandler } from './utils/errorHandler';
export { Logger } from './utils/logger';
export { MetricsCollector } from './utils/metricsCollector';

/**
 * バージョン情報
 */
export const VERSION = '1.0.0';

/**
 * デフォルト設定
 */
export const DEFAULT_CONFIG = {
  locale: 'ja' as const,
  cacheTtl: 3600000, // 1時間
  maxCacheSize: 100,
  logLevel: 'INFO' as const,
};
