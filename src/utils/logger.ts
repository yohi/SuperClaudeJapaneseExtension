import * as fs from 'fs';
import * as path from 'path';
import { LogLevel, LogEntry } from './types';

/**
 * ロガー設定
 */
export interface LoggerConfig {
  logFile: string;
  level: LogLevel;
  maxFileSize?: number; // バイト単位（デフォルト: 10MB）
  maxFiles?: number; // 最大ファイル数（デフォルト: 5）
}

/**
 * ロギングシステム
 * - ログレベル定義（ERROR、WARN、INFO、DEBUG）
 * - ログファイルへの出力
 * - ログローテーション機能（10MB/ファイル、最大5ファイル）
 * - パフォーマンスメトリクスのロギング
 */
export class Logger {
  private logFile: string;
  private level: LogLevel;
  private maxFileSize: number;
  private maxFiles: number;

  private readonly LOG_LEVELS: Record<LogLevel, number> = {
    ERROR: 0,
    WARN: 1,
    INFO: 2,
    DEBUG: 3,
  };

  constructor(config: LoggerConfig) {
    this.logFile = config.logFile;
    this.level = config.level;
    this.maxFileSize = config.maxFileSize || 10 * 1024 * 1024; // 10MB
    this.maxFiles = config.maxFiles || 5;

    this.ensureLogDirectory();
  }

  /**
   * ログディレクトリが存在することを確認
   */
  private ensureLogDirectory(): void {
    try {
      const logDir = path.dirname(this.logFile);
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }
    } catch (error) {
      // ディレクトリ作成エラーは無視（既に存在する場合など）
    }
  }

  /**
   * ログレベルが出力対象かチェック
   */
  private shouldLog(level: LogLevel): boolean {
    return this.LOG_LEVELS[level] <= this.LOG_LEVELS[this.level];
  }

  /**
   * ログエントリを作成
   */
  private createLogEntry(
    level: LogLevel,
    message: string,
    metadata?: Record<string, unknown>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      metadata,
    };
  }

  /**
   * ログファイルに書き込み
   */
  private writeLog(entry: LogEntry): void {
    try {
      const logLine = JSON.stringify(entry) + '\n';
      fs.appendFileSync(this.logFile, logLine);

      // 書き込み後にローテーションチェック
      this.rotateIfNeeded();
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  /**
   * ログローテーション処理
   */
  private rotateIfNeeded(): void {
    try {
      // ファイルが存在しない場合はスキップ
      if (!fs.existsSync(this.logFile)) {
        return;
      }

      const stats = fs.statSync(this.logFile);
      if (stats.size < this.maxFileSize) {
        return;
      }

      // ローテーション実行
      this.performRotation();
    } catch (error) {
      console.error('Failed to rotate log:', error);
    }
  }

  /**
   * ローテーション実行
   */
  private performRotation(): void {
    const logDir = path.dirname(this.logFile);
    const logBaseName = path.basename(this.logFile);

    // 既存のログファイル番号を取得
    const existingLogs = fs
      .readdirSync(logDir)
      .filter((file) => file.startsWith(logBaseName + '.'))
      .map((file) => {
        const match = file.match(/\.(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .sort((a, b) => b - a);

    // 古いファイルを削除（最大保持数を超える高番号を削除）
    const numbersToDelete = existingLogs.filter((n) => n >= this.maxFiles);
    for (const num of numbersToDelete) {
      const fileToDelete = path.join(logDir, `${logBaseName}.${num}`);
      if (fs.existsSync(fileToDelete)) {
        fs.unlinkSync(fileToDelete);
      }
    }

    // 既存のファイルをリネーム（高番号→高番号+1 の順で衝突回避）
    for (const currentNum of existingLogs) {
      // existingLogs は降順ソート済みなので、高番号から処理される
      const oldPath = path.join(logDir, `${logBaseName}.${currentNum}`);
      const nextPath = path.join(logDir, `${logBaseName}.${currentNum + 1}`);
      if (fs.existsSync(oldPath)) {
        fs.renameSync(oldPath, nextPath);
      }
    }

    // 現在のログファイルを .1 にリネーム
    const newPath = path.join(logDir, `${logBaseName}.1`);
    fs.renameSync(this.logFile, newPath);
  }

  /**
   * ERRORレベルのログを出力
   */
  error(message: string, metadata?: Record<string, unknown>): void {
    if (this.shouldLog('ERROR')) {
      const entry = this.createLogEntry('ERROR', message, metadata);
      this.writeLog(entry);
    }
  }

  /**
   * WARNレベルのログを出力
   */
  warn(message: string, metadata?: Record<string, unknown>): void {
    if (this.shouldLog('WARN')) {
      const entry = this.createLogEntry('WARN', message, metadata);
      this.writeLog(entry);
    }
  }

  /**
   * INFOレベルのログを出力
   */
  info(message: string, metadata?: Record<string, unknown>): void {
    if (this.shouldLog('INFO')) {
      const entry = this.createLogEntry('INFO', message, metadata);
      this.writeLog(entry);
    }
  }

  /**
   * DEBUGレベルのログを出力
   */
  debug(message: string, metadata?: Record<string, unknown>): void {
    if (this.shouldLog('DEBUG')) {
      const entry = this.createLogEntry('DEBUG', message, metadata);
      this.writeLog(entry);
    }
  }

  /**
   * 汎用ログ出力
   */
  log(level: LogLevel, message: string, metadata?: Record<string, unknown>): void {
    if (this.shouldLog(level)) {
      const entry = this.createLogEntry(level, message, metadata);
      this.writeLog(entry);
    }
  }
}
