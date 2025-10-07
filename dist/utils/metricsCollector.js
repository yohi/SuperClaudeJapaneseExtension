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
exports.MetricsCollector = void 0;
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
/**
 * メトリクス収集システム
 *
 * パフォーマンスメトリクス（翻訳取得時間、キャッシュヒット率、エラー発生率）を記録・分析します。
 */
class MetricsCollector {
    metricsDir;
    metrics;
    constructor(metricsDir) {
        this.metricsDir =
            metricsDir ||
                path.join(process.env.HOME || '', '.claude', 'extensions', 'japanese-i18n', 'metrics');
        this.metrics = {
            translationTime: {
                count: 0,
                samples: [],
            },
            cacheHits: 0,
            cacheMisses: 0,
            errors: {},
        };
    }
    /**
     * 翻訳取得時間を記録
     * @param durationMs 取得時間（ミリ秒）
     */
    recordTranslationTime(durationMs) {
        this.metrics.translationTime.count++;
        this.metrics.translationTime.samples.push(durationMs);
    }
    /**
     * キャッシュヒットを記録
     */
    recordCacheHit() {
        this.metrics.cacheHits++;
    }
    /**
     * キャッシュミスを記録
     */
    recordCacheMiss() {
        this.metrics.cacheMisses++;
    }
    /**
     * エラーを記録
     * @param errorType エラータイプ
     */
    recordError(errorType) {
        if (!this.metrics.errors[errorType]) {
            this.metrics.errors[errorType] = 0;
        }
        this.metrics.errors[errorType]++;
    }
    /**
     * メトリクスデータを取得
     */
    getMetrics() {
        return this.metrics;
    }
    /**
     * パーセンタイル値を計算（線形補間を使用）
     * @returns p50、p95、p99のパーセンタイル統計
     */
    calculatePercentiles() {
        const samples = [...this.metrics.translationTime.samples].sort((a, b) => a - b);
        if (samples.length === 0) {
            return { p50: 0, p95: 0, p99: 0 };
        }
        const getPercentile = (percentile) => {
            if (samples.length === 1) {
                return samples[0];
            }
            const pos = ((percentile / 100) * (samples.length - 1));
            const lower = Math.floor(pos);
            const upper = Math.ceil(pos);
            if (lower === upper) {
                return samples[lower];
            }
            // 線形補間
            const fraction = pos - lower;
            return samples[lower] + fraction * (samples[upper] - samples[lower]);
        };
        return {
            p50: getPercentile(50),
            p95: getPercentile(95),
            p99: getPercentile(99),
        };
    }
    /**
     * キャッシュヒット率を計算
     * @returns キャッシュヒット率（0.0 〜 1.0）
     */
    getCacheHitRate() {
        const total = this.metrics.cacheHits + this.metrics.cacheMisses;
        if (total === 0) {
            return 0;
        }
        return this.metrics.cacheHits / total;
    }
    /**
     * エラー発生率を計算
     * @returns エラー発生率（0.0 〜 1.0）
     */
    getErrorRate() {
        const totalErrors = Object.values(this.metrics.errors).reduce((sum, count) => sum + count, 0);
        const totalOperations = this.metrics.translationTime.count + totalErrors;
        if (totalOperations === 0) {
            return 0;
        }
        return totalErrors / totalOperations;
    }
    /**
     * メトリクスをJSON形式でエクスポート
     * @param exportPath エクスポート先ファイルパス
     */
    exportMetrics(exportPath) {
        try {
            // エクスポートディレクトリを作成
            const exportDir = path.dirname(exportPath);
            if (!fs.existsSync(exportDir)) {
                fs.mkdirSync(exportDir, { recursive: true });
            }
            // メトリクスデータと統計情報を含めたエクスポートデータを作成
            const exportData = {
                timestamp: new Date().toISOString(),
                ...this.metrics,
                statistics: {
                    percentiles: this.calculatePercentiles(),
                    cacheHitRate: this.getCacheHitRate(),
                    errorRate: this.getErrorRate(),
                },
            };
            // JSON形式で書き込み
            fs.writeFileSync(exportPath, JSON.stringify(exportData, null, 2), 'utf-8');
            return { ok: true, value: undefined };
        }
        catch (error) {
            return {
                ok: false,
                error: {
                    type: 'EXPORT_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown error',
                },
            };
        }
    }
    /**
     * メトリクスをリセット
     */
    reset() {
        this.metrics = {
            translationTime: {
                count: 0,
                samples: [],
            },
            cacheHits: 0,
            cacheMisses: 0,
            errors: {},
        };
    }
    /**
     * メトリクスのサマリーを取得
     * @returns サマリー文字列
     */
    getMetricsSummary() {
        const percentiles = this.calculatePercentiles();
        const cacheHitRate = this.getCacheHitRate() * 100;
        const errorRate = this.getErrorRate() * 100;
        const lines = [
            'Metrics Summary:',
            `  Translation Time: count=${this.metrics.translationTime.count}, p50=${percentiles.p50.toFixed(2)}ms, p95=${percentiles.p95.toFixed(2)}ms, p99=${percentiles.p99.toFixed(2)}ms`,
            `  Cache Hit Rate: ${cacheHitRate.toFixed(2)}%`,
            `  Error Rate: ${errorRate.toFixed(2)}%`,
            `  Errors:`,
        ];
        for (const [errorType, count] of Object.entries(this.metrics.errors)) {
            lines.push(`    ${errorType}: ${count}`);
        }
        return lines.join('\n');
    }
}
exports.MetricsCollector = MetricsCollector;
//# sourceMappingURL=metricsCollector.js.map