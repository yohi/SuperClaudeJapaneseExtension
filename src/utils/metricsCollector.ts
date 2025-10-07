import * as fs from 'fs';
import * as path from 'path';
import {
  MetricsData,
  PercentileStats,
  MetricsExportError,
  Result,
} from './types';

/**
 * メトリクス収集システム
 *
 * パフォーマンスメトリクス（翻訳取得時間、キャッシュヒット率、エラー発生率）を記録・分析します。
 */
export class MetricsCollector {
  private metricsDir: string;
  private metrics: MetricsData;

  constructor(metricsDir?: string) {
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
  recordTranslationTime(durationMs: number): void {
    this.metrics.translationTime.count++;
    this.metrics.translationTime.samples.push(durationMs);
  }

  /**
   * キャッシュヒットを記録
   */
  recordCacheHit(): void {
    this.metrics.cacheHits++;
  }

  /**
   * キャッシュミスを記録
   */
  recordCacheMiss(): void {
    this.metrics.cacheMisses++;
  }

  /**
   * エラーを記録
   * @param errorType エラータイプ
   */
  recordError(errorType: string): void {
    if (!this.metrics.errors[errorType]) {
      this.metrics.errors[errorType] = 0;
    }
    this.metrics.errors[errorType]++;
  }

  /**
   * メトリクスデータを取得
   */
  getMetrics(): MetricsData {
    return this.metrics;
  }

  /**
   * パーセンタイル値を計算（線形補間を使用）
   * @returns p50、p95、p99のパーセンタイル統計
   */
  calculatePercentiles(): PercentileStats {
    const samples = [...this.metrics.translationTime.samples].sort((a, b) => a - b);

    if (samples.length === 0) {
      return { p50: 0, p95: 0, p99: 0 };
    }

    const getPercentile = (percentile: number): number => {
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
  getCacheHitRate(): number {
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
  getErrorRate(): number {
    const totalErrors = Object.values(this.metrics.errors).reduce(
      (sum, count) => sum + count,
      0
    );
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
  exportMetrics(exportPath: string): Result<void, MetricsExportError> {
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
    } catch (error) {
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
  reset(): void {
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
  getMetricsSummary(): string {
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
