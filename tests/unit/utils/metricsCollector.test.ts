import { MetricsCollector } from '../../../src/utils/metricsCollector';
import * as fs from 'fs';
import * as path from 'path';

describe('MetricsCollector', () => {
  let metricsCollector: MetricsCollector;
  const testMetricsDir = path.join(__dirname, '../../fixtures/metrics');

  beforeEach(() => {
    // テスト用のメトリクスディレクトリを作成
    if (!fs.existsSync(testMetricsDir)) {
      fs.mkdirSync(testMetricsDir, { recursive: true });
    }
    metricsCollector = new MetricsCollector(testMetricsDir);
  });

  afterEach(() => {
    // テスト後にメトリクスディレクトリをクリーンアップ
    if (fs.existsSync(testMetricsDir)) {
      fs.rmSync(testMetricsDir, { recursive: true, force: true });
    }
  });

  describe('recordTranslationTime', () => {
    it('翻訳取得時間を記録できる', () => {
      metricsCollector.recordTranslationTime(42.5);
      metricsCollector.recordTranslationTime(38.2);
      metricsCollector.recordTranslationTime(45.8);

      const metrics = metricsCollector.getMetrics();
      expect(metrics.translationTime.count).toBe(3);
      expect(metrics.translationTime.samples).toEqual([42.5, 38.2, 45.8]);
    });

    it('複数の翻訳時間を記録できる', () => {
      const times = [10, 20, 30, 40, 50];
      times.forEach((time) => metricsCollector.recordTranslationTime(time));

      const metrics = metricsCollector.getMetrics();
      expect(metrics.translationTime.count).toBe(5);
    });
  });

  describe('recordCacheHit', () => {
    it('キャッシュヒットを記録できる', () => {
      metricsCollector.recordCacheHit();
      metricsCollector.recordCacheHit();

      const metrics = metricsCollector.getMetrics();
      expect(metrics.cacheHits).toBe(2);
    });
  });

  describe('recordCacheMiss', () => {
    it('キャッシュミスを記録できる', () => {
      metricsCollector.recordCacheMiss();

      const metrics = metricsCollector.getMetrics();
      expect(metrics.cacheMisses).toBe(1);
    });
  });

  describe('recordError', () => {
    it('エラーを記録できる', () => {
      metricsCollector.recordError('COMMAND_NOT_FOUND');
      metricsCollector.recordError('TRANSLATION_NOT_FOUND');
      metricsCollector.recordError('COMMAND_NOT_FOUND');

      const metrics = metricsCollector.getMetrics();
      expect(metrics.errors.COMMAND_NOT_FOUND).toBe(2);
      expect(metrics.errors.TRANSLATION_NOT_FOUND).toBe(1);
    });

    it('未知のエラータイプも記録できる', () => {
      metricsCollector.recordError('UNKNOWN_ERROR');

      const metrics = metricsCollector.getMetrics();
      expect(metrics.errors.UNKNOWN_ERROR).toBe(1);
    });
  });

  describe('calculatePercentiles', () => {
    it('パーセンタイル値を正しく計算できる', () => {
      const times = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
      times.forEach((time) => metricsCollector.recordTranslationTime(time));

      const percentiles = metricsCollector.calculatePercentiles();
      // 線形補間: p50の位置は4.5 (0-indexed), つまり50と60の中間 = 55
      expect(percentiles.p50).toBeCloseTo(55, 1);
      // p95の位置は8.55, つまり90と100の中間付近 = 95.5
      expect(percentiles.p95).toBeCloseTo(95.5, 1);
      // p99の位置は8.91, つまり90と100の間 = 99.1
      expect(percentiles.p99).toBeCloseTo(99.1, 1);
    });

    it('サンプル数が少ない場合でもパーセンタイルを計算できる', () => {
      metricsCollector.recordTranslationTime(10);
      metricsCollector.recordTranslationTime(20);

      const percentiles = metricsCollector.calculatePercentiles();
      // p50の位置は0.5, つまり10と20の中間 = 15
      expect(percentiles.p50).toBe(15);
      // p95の位置は0.95, つまり10と20の間 = 19.5
      expect(percentiles.p95).toBeCloseTo(19.5, 1);
      // p99の位置は0.99, つまり10と20の間 = 19.9
      expect(percentiles.p99).toBeCloseTo(19.9, 1);
    });

    it('サンプルがない場合は0を返す', () => {
      const percentiles = metricsCollector.calculatePercentiles();
      expect(percentiles.p50).toBe(0);
      expect(percentiles.p95).toBe(0);
      expect(percentiles.p99).toBe(0);
    });
  });

  describe('getCacheHitRate', () => {
    it('キャッシュヒット率を正しく計算できる', () => {
      metricsCollector.recordCacheHit();
      metricsCollector.recordCacheHit();
      metricsCollector.recordCacheHit();
      metricsCollector.recordCacheMiss();

      const hitRate = metricsCollector.getCacheHitRate();
      expect(hitRate).toBe(0.75); // 3/(3+1) = 0.75
    });

    it('キャッシュアクセスがない場合は0を返す', () => {
      const hitRate = metricsCollector.getCacheHitRate();
      expect(hitRate).toBe(0);
    });

    it('ヒットのみの場合は1を返す', () => {
      metricsCollector.recordCacheHit();
      metricsCollector.recordCacheHit();

      const hitRate = metricsCollector.getCacheHitRate();
      expect(hitRate).toBe(1);
    });
  });

  describe('getErrorRate', () => {
    it('エラー発生率を正しく計算できる', () => {
      // 10回の翻訳のうち2回エラー
      for (let i = 0; i < 8; i++) {
        metricsCollector.recordTranslationTime(50);
      }
      metricsCollector.recordError('COMMAND_NOT_FOUND');
      metricsCollector.recordError('TRANSLATION_NOT_FOUND');

      const errorRate = metricsCollector.getErrorRate();
      expect(errorRate).toBe(0.2); // 2/(8+2) = 0.2
    });

    it('操作がない場合は0を返す', () => {
      const errorRate = metricsCollector.getErrorRate();
      expect(errorRate).toBe(0);
    });
  });

  describe('exportMetrics', () => {
    it('メトリクスをJSON形式でファイルにエクスポートできる', () => {
      metricsCollector.recordTranslationTime(42.5);
      metricsCollector.recordCacheHit();
      metricsCollector.recordError('COMMAND_NOT_FOUND');

      const exportPath = path.join(testMetricsDir, 'metrics-export.json');
      const result = metricsCollector.exportMetrics(exportPath);

      expect(result.ok).toBe(true);
      expect(fs.existsSync(exportPath)).toBe(true);

      const exportedData = JSON.parse(fs.readFileSync(exportPath, 'utf-8'));
      expect(exportedData.translationTime.count).toBe(1);
      expect(exportedData.cacheHits).toBe(1);
      expect(exportedData.errors.COMMAND_NOT_FOUND).toBe(1);
    });

    it('統計情報を含めてエクスポートできる', () => {
      const times = [10, 20, 30, 40, 50];
      times.forEach((time) => metricsCollector.recordTranslationTime(time));
      metricsCollector.recordCacheHit();
      metricsCollector.recordCacheMiss();

      const exportPath = path.join(testMetricsDir, 'metrics-with-stats.json');
      metricsCollector.exportMetrics(exportPath);

      const exportedData = JSON.parse(fs.readFileSync(exportPath, 'utf-8'));
      expect(exportedData.statistics).toBeDefined();
      expect(exportedData.statistics.percentiles.p50).toBeDefined();
      expect(exportedData.statistics.cacheHitRate).toBeDefined();
    });

    it('無効なパスの場合はエラーを返す', () => {
      const invalidPath = '/invalid/path/metrics.json';
      const result = metricsCollector.exportMetrics(invalidPath);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('EXPORT_ERROR');
      }
    });
  });

  describe('reset', () => {
    it('メトリクスをリセットできる', () => {
      metricsCollector.recordTranslationTime(42.5);
      metricsCollector.recordCacheHit();
      metricsCollector.recordError('COMMAND_NOT_FOUND');

      metricsCollector.reset();

      const metrics = metricsCollector.getMetrics();
      expect(metrics.translationTime.count).toBe(0);
      expect(metrics.cacheHits).toBe(0);
      expect(metrics.cacheMisses).toBe(0);
      expect(Object.keys(metrics.errors).length).toBe(0);
    });
  });

  describe('getMetricsSummary', () => {
    it('メトリクスのサマリーを取得できる', () => {
      const times = [10, 20, 30, 40, 50];
      times.forEach((time) => metricsCollector.recordTranslationTime(time));
      metricsCollector.recordCacheHit();
      metricsCollector.recordCacheHit();
      metricsCollector.recordCacheMiss();
      metricsCollector.recordError('COMMAND_NOT_FOUND');

      const summary = metricsCollector.getMetricsSummary();
      expect(summary).toContain('Translation Time: count=5');
      expect(summary).toContain('Cache Hit Rate: 66.67%');
      expect(summary).toContain('Error Rate: 16.67%');
    });
  });
});
