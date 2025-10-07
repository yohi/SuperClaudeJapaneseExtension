/**
 * エラーハンドリング用の型定義
 */

// Result型
export type Result<T, E> =
  | { ok: true; value: T }
  | { ok: false; error: E };

// エラーカテゴリ
export type ErrorCategory = 'USER_ERROR' | 'SYSTEM_ERROR' | 'BUSINESS_LOGIC_ERROR';

// ユーザーエラー型
export type UserError =
  | { type: 'COMMAND_NOT_FOUND'; command: string }
  | { type: 'FLAG_NOT_FOUND'; flag: string }
  | { type: 'ARGUMENT_NOT_FOUND'; argument: string; command: string };

// システムエラー型
export type SystemError =
  | { type: 'FILE_NOT_FOUND'; path: string }
  | { type: 'PARSE_ERROR'; message: string; line?: number }
  | { type: 'INIT_FAILED'; message: string }
  | { type: 'RESOURCE_NOT_FOUND'; locale: string };

// ビジネスロジックエラー型
export type BusinessLogicError =
  | { type: 'TRANSLATION_NOT_FOUND'; key: string; locale: string }
  | { type: 'TRANSLATION_UNAVAILABLE'; key: string }
  | { type: 'INVALID_COMMAND'; command: string }
  | { type: 'NO_CANDIDATES_FOUND' };

// エラーハンドリング結果
export interface ErrorHandlerResult {
  message: string;
  suggestions?: string[];
  fallback?: string;
  recovery?: string;
  defaultValue?: string;
  logLevel?: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';
}

// ログレベル
export type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

// ログエントリ
export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  metadata?: Record<string, unknown>;
}

// パフォーマンスメトリクス
export interface PerformanceMetrics {
  translationTime: {
    p50: number;
    p95: number;
    p99: number;
  };
  cacheHitRate: number;
  errorRate: number;
}

// メトリクスデータ
export interface MetricsData {
  translationTime: {
    count: number;
    samples: number[];
  };
  cacheHits: number;
  cacheMisses: number;
  errors: Record<string, number>;
}

// パーセンタイル統計
export interface PercentileStats {
  p50: number;
  p95: number;
  p99: number;
}

// メトリクスエクスポートエラー
export type MetricsExportError = {
  type: 'EXPORT_ERROR';
  message: string;
};
