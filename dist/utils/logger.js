"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Logger = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * ロギングシステム
 * - ログレベル定義（ERROR、WARN、INFO、DEBUG）
 * - ログファイルへの出力
 * - ログローテーション機能（10MB/ファイル、最大5ファイル）
 * - パフォーマンスメトリクスのロギング
 */
class Logger {
    logFile;
    level;
    maxFileSize;
    maxFiles;
    LOG_LEVELS = {
        ERROR: 0,
        WARN: 1,
        INFO: 2,
        DEBUG: 3,
    };
    constructor(config) {
        this.logFile = config.logFile;
        this.level = config.level;
        this.maxFileSize = config.maxFileSize || 10 * 1024 * 1024; // 10MB
        this.maxFiles = config.maxFiles || 5;
        this.ensureLogDirectory();
    }
    /**
     * ログディレクトリが存在することを確認
     */
    ensureLogDirectory() {
        try {
            const logDir = path.dirname(this.logFile);
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }
        }
        catch (error) {
            // ディレクトリ作成エラーは無視（既に存在する場合など）
        }
    }
    /**
     * ログレベルが出力対象かチェック
     */
    shouldLog(level) {
        return this.LOG_LEVELS[level] <= this.LOG_LEVELS[this.level];
    }
    /**
     * ログエントリを作成
     */
    createLogEntry(level, message, metadata) {
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
    writeLog(entry) {
        try {
            const logLine = JSON.stringify(entry) + '\n';
            fs.appendFileSync(this.logFile, logLine);
            // 書き込み後にローテーションチェック
            this.rotateIfNeeded();
        }
        catch (error) {
            console.error('Failed to write log:', error);
        }
    }
    /**
     * ログローテーション処理
     */
    rotateIfNeeded() {
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
        }
        catch (error) {
            console.error('Failed to rotate log:', error);
        }
    }
    /**
     * ローテーション実行
     */
    performRotation() {
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
    error(message, metadata) {
        if (this.shouldLog('ERROR')) {
            const entry = this.createLogEntry('ERROR', message, metadata);
            this.writeLog(entry);
        }
    }
    /**
     * WARNレベルのログを出力
     */
    warn(message, metadata) {
        if (this.shouldLog('WARN')) {
            const entry = this.createLogEntry('WARN', message, metadata);
            this.writeLog(entry);
        }
    }
    /**
     * INFOレベルのログを出力
     */
    info(message, metadata) {
        if (this.shouldLog('INFO')) {
            const entry = this.createLogEntry('INFO', message, metadata);
            this.writeLog(entry);
        }
    }
    /**
     * DEBUGレベルのログを出力
     */
    debug(message, metadata) {
        if (this.shouldLog('DEBUG')) {
            const entry = this.createLogEntry('DEBUG', message, metadata);
            this.writeLog(entry);
        }
    }
    /**
     * 汎用ログ出力
     */
    log(level, message, metadata) {
        if (this.shouldLog(level)) {
            const entry = this.createLogEntry(level, message, metadata);
            this.writeLog(entry);
        }
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map