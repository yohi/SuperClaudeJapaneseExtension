import { MetricsData, PercentileStats, MetricsExportError, Result } from './types';
/**
 * メトリクス収集システム
 *
 * パフォーマンスメトリクス（翻訳取得時間、キャッシュヒット率、エラー発生率）を記録・分析します。
 */
export declare class MetricsCollector {
    private metricsDir;
    private metrics;
    constructor(metricsDir?: string);
    /**
     * 翻訳取得時間を記録
     * @param durationMs 取得時間（ミリ秒）
     */
    recordTranslationTime(durationMs: number): void;
    /**
     * キャッシュヒットを記録
     */
    recordCacheHit(): void;
    /**
     * キャッシュミスを記録
     */
    recordCacheMiss(): void;
    /**
     * エラーを記録
     * @param errorType エラータイプ
     */
    recordError(errorType: string): void;
    /**
     * メトリクスデータを取得
     */
    getMetrics(): MetricsData;
    /**
     * パーセンタイル値を計算（線形補間を使用）
     * @returns p50、p95、p99のパーセンタイル統計
     */
    calculatePercentiles(): PercentileStats;
    /**
     * キャッシュヒット率を計算
     * @returns キャッシュヒット率（0.0 〜 1.0）
     */
    getCacheHitRate(): number;
    /**
     * エラー発生率を計算
     * @returns エラー発生率（0.0 〜 1.0）
     */
    getErrorRate(): number;
    /**
     * メトリクスをJSON形式でエクスポート
     * @param exportPath エクスポート先ファイルパス
     */
    exportMetrics(exportPath: string): Result<void, MetricsExportError>;
    /**
     * メトリクスをリセット
     */
    reset(): void;
    /**
     * メトリクスのサマリーを取得
     * @returns サマリー文字列
     */
    getMetricsSummary(): string;
}
//# sourceMappingURL=metricsCollector.d.ts.map