import { LogLevel } from './types';
/**
 * ロガー設定
 */
export interface LoggerConfig {
    logFile: string;
    level: LogLevel;
    maxFileSize?: number;
    maxFiles?: number;
}
/**
 * ロギングシステム
 * - ログレベル定義（ERROR、WARN、INFO、DEBUG）
 * - ログファイルへの出力
 * - ログローテーション機能（10MB/ファイル、最大5ファイル）
 * - パフォーマンスメトリクスのロギング
 */
export declare class Logger {
    private logFile;
    private level;
    private maxFileSize;
    private maxFiles;
    private readonly LOG_LEVELS;
    constructor(config: LoggerConfig);
    /**
     * ログディレクトリが存在することを確認
     */
    private ensureLogDirectory;
    /**
     * ログレベルが出力対象かチェック
     */
    private shouldLog;
    /**
     * ログエントリを作成
     */
    private createLogEntry;
    /**
     * ログファイルに書き込み
     */
    private writeLog;
    /**
     * ログローテーション処理
     */
    private rotateIfNeeded;
    /**
     * ローテーション実行
     */
    private performRotation;
    /**
     * ERRORレベルのログを出力
     */
    error(message: string, metadata?: Record<string, unknown>): void;
    /**
     * WARNレベルのログを出力
     */
    warn(message: string, metadata?: Record<string, unknown>): void;
    /**
     * INFOレベルのログを出力
     */
    info(message: string, metadata?: Record<string, unknown>): void;
    /**
     * DEBUGレベルのログを出力
     */
    debug(message: string, metadata?: Record<string, unknown>): void;
    /**
     * 汎用ログ出力
     */
    log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void;
}
//# sourceMappingURL=logger.d.ts.map