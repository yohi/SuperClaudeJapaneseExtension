/**
 * 共通型定義
 */
/**
 * サポートされる言語
 */
export type SupportedLocale = 'en' | 'ja';
/**
 * Result型パターン - 成功または失敗を表現
 */
export type Result<T, E = Error> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: E;
};
/**
 * ログレベル
 */
export declare enum LogLevel {
    ERROR = "ERROR",
    WARN = "WARN",
    INFO = "INFO",
    DEBUG = "DEBUG"
}
/**
 * 翻訳リソース
 */
export interface TranslationResource {
    version: string;
    commands: Record<string, CommandTranslation>;
    flags: Record<string, FlagTranslation>;
    errors: Record<string, string>;
}
/**
 * コマンド翻訳
 */
export interface CommandTranslation {
    description: string;
    category?: string;
    arguments?: Record<string, string>;
}
/**
 * フラグ翻訳
 */
export interface FlagTranslation {
    description: string;
    alias?: string;
    example?: string;
}
/**
 * コマンドメタデータ
 */
export interface CommandMetadata {
    name: string;
    description: string;
    descriptionJa?: string;
    category?: string;
    argumentHint?: string;
    argumentHintJa?: string;
    allowedTools?: string[];
    flags?: FlagMetadata[];
}
/**
 * フラグメタデータ
 */
export interface FlagMetadata {
    name: string;
    alias?: string;
    description?: string;
    descriptionJa?: string;
}
/**
 * ヒント出力
 */
export interface HintOutput {
    text: string;
    formatted: string;
    metadata: {
        required: boolean;
        example?: string;
    };
}
/**
 * 補完候補アイテム
 */
export interface CompletionItem {
    value: string;
    description: string;
    score: number;
    metadata?: {
        alias?: string;
        category?: string;
    };
}
/**
 * 補完オプション
 */
export interface CompletionOptions {
    maxResults?: number;
    includeHistory?: boolean;
}
/**
 * キャッシュエントリ
 */
export interface CacheEntry<T> {
    key: string;
    value: T;
    timestamp: number;
    accessCount: number;
}
/**
 * 翻訳オプション
 */
export interface TranslateOptions {
    defaultValue?: string;
    interpolation?: Record<string, string | number>;
}
/**
 * エラー型定義
 */
export type I18nError = {
    type: 'INIT_FAILED';
    message: string;
} | {
    type: 'RESOURCE_NOT_FOUND';
    locale: string;
};
export type TranslationNotFoundError = {
    type: 'TRANSLATION_NOT_FOUND';
    key: string;
    locale: string;
};
export type LoadError = {
    type: 'FILE_NOT_FOUND';
    path: string;
} | {
    type: 'PARSE_ERROR';
    message: string;
};
export type ValidationError = {
    type: 'SCHEMA_VALIDATION_FAILED';
    errors: Array<{
        field: string;
        message: string;
    }>;
};
export type HintError = {
    type: 'COMMAND_NOT_FOUND';
    command: string;
} | {
    type: 'TRANSLATION_UNAVAILABLE';
    key: string;
};
export type CompletionError = {
    type: 'INVALID_COMMAND';
    command: string;
} | {
    type: 'NO_CANDIDATES_FOUND';
};
export type ParseError = {
    type: 'YAML_PARSE_ERROR';
    message: string;
    line?: number;
} | {
    type: 'FILE_READ_ERROR';
    path: string;
};
//# sourceMappingURL=types.d.ts.map