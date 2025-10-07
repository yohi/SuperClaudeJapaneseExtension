/**
 * エラーハンドリング用の型定義
 */
export type Result<T, E> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: E;
};
export type ErrorCategory = 'USER_ERROR' | 'SYSTEM_ERROR' | 'BUSINESS_LOGIC_ERROR';
export type UserError = {
    type: 'COMMAND_NOT_FOUND';
    command: string;
} | {
    type: 'FLAG_NOT_FOUND';
    flag: string;
} | {
    type: 'ARGUMENT_NOT_FOUND';
    argument: string;
    command: string;
};
export type SystemError = {
    type: 'FILE_NOT_FOUND';
    path: string;
} | {
    type: 'PARSE_ERROR';
    message: string;
    line?: number;
} | {
    type: 'INIT_FAILED';
    message: string;
} | {
    type: 'RESOURCE_NOT_FOUND';
    locale: string;
};
export type BusinessLogicError = {
    type: 'TRANSLATION_NOT_FOUND';
    key: string;
    locale: string;
} | {
    type: 'TRANSLATION_UNAVAILABLE';
    key: string;
} | {
    type: 'INVALID_COMMAND';
    command: string;
} | {
    type: 'NO_CANDIDATES_FOUND';
};
export interface ErrorHandlerResult {
    message: string;
    suggestions?: string[];
    fallback?: string;
    recovery?: string;
    defaultValue?: string;
    logLevel?: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
}
export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    metadata?: Record<string, unknown>;
}
export interface PerformanceMetrics {
    translationTime: {
        p50: number;
        p95: number;
        p99: number;
    };
    cacheHitRate: number;
    errorRate: number;
}
export interface MetricsData {
    translationTime: {
        count: number;
        samples: number[];
    };
    cacheHits: number;
    cacheMisses: number;
    errors: Record<string, number>;
}
export interface PercentileStats {
    p50: number;
    p95: number;
    p99: number;
}
export type MetricsExportError = {
    type: 'EXPORT_ERROR';
    message: string;
};
//# sourceMappingURL=types.d.ts.map