import { performance } from 'perf_hooks';
import { I18nManager } from '../../src/i18n/i18nManager';
import { HintProvider } from '../../src/hint/hintProvider';
import { CompletionEngine } from '../../src/completion/completionEngine';
import { CacheManager } from '../../src/cache/cacheManager';

describe('Performance Benchmarks', () => {
  let i18nManager: I18nManager;
  let hintProvider: HintProvider;
  let completionEngine: CompletionEngine;
  let cacheManager: CacheManager;

  beforeAll(() => {
    cacheManager = new CacheManager();
    i18nManager = new I18nManager();
    hintProvider = new HintProvider(i18nManager, cacheManager);
    completionEngine = new CompletionEngine(i18nManager);
  });

  describe('Hint Display Performance', () => {
    it('should display command hints within 100ms (cold start)', () => {
      const start = performance.now();
      const result = hintProvider.generateCommandHint('build', 'ja');
      const duration = performance.now() - start;

      expect(result.ok).toBe(true);
      expect(duration).toBeLessThan(100);
      console.log(`Cold start hint display: ${duration.toFixed(2)}ms`);
    });

    it('should display command hints within 10ms (cache hit)', () => {
      // Warm up cache
      hintProvider.generateCommandHint('build', 'ja');

      const start = performance.now();
      const result = hintProvider.generateCommandHint('build', 'ja');
      const duration = performance.now() - start;

      expect(result.ok).toBe(true);
      expect(duration).toBeLessThan(10);
      console.log(`Cache hit hint display: ${duration.toFixed(2)}ms`);
    });

    it('should display flag hints within 100ms', () => {
      const start = performance.now();
      const result = hintProvider.generateFlagHint('think', 'ja');
      const duration = performance.now() - start;

      expect(result.ok).toBe(true);
      expect(duration).toBeLessThan(100);
      console.log(`Flag hint display: ${duration.toFixed(2)}ms`);
    });

    it('should display argument hints within 100ms', () => {
      const start = performance.now();
      const result = hintProvider.generateArgumentHint('build', 'target', 'ja');
      const duration = performance.now() - start;

      expect(result.ok).toBe(true);
      expect(duration).toBeLessThan(100);
      console.log(`Argument hint display: ${duration.toFixed(2)}ms`);
    });
  });

  describe('Completion Performance', () => {
    it('should generate command completions within 200ms', () => {
      const start = performance.now();
      const result = completionEngine.completeCommand('bu', 'ja');
      const duration = performance.now() - start;

      expect(result.ok).toBe(true);
      expect(duration).toBeLessThan(200);
      console.log(`Command completion: ${duration.toFixed(2)}ms`);
    });

    it('should generate flag completions within 200ms', () => {
      const start = performance.now();
      const result = completionEngine.completeFlag('--th', 'ja');
      const duration = performance.now() - start;

      expect(result.ok).toBe(true);
      expect(duration).toBeLessThan(200);
      console.log(`Flag completion: ${duration.toFixed(2)}ms`);
    });

    it('should generate argument completions within 200ms', () => {
      const start = performance.now();
      const result = completionEngine.completeArgument('build', 'target', 'prod', 'ja');
      const duration = performance.now() - start;

      expect(result.ok).toBe(true);
      expect(duration).toBeLessThan(200);
      console.log(`Argument completion: ${duration.toFixed(2)}ms`);
    });

    it('should handle 100 command completions within 200ms each', () => {
      const commands = Array.from({ length: 100 }, (_, i) => `cmd${i}`);
      const durations: number[] = [];

      commands.forEach((cmd) => {
        const start = performance.now();
        completionEngine.completeCommand(cmd, 'ja');
        durations.push(performance.now() - start);
      });

      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const maxDuration = Math.max(...durations);

      expect(maxDuration).toBeLessThan(200);
      console.log(`100 completions - Avg: ${avgDuration.toFixed(2)}ms, Max: ${maxDuration.toFixed(2)}ms`);
    });
  });

  describe('Language Switching Performance', () => {
    it('should switch languages within 150ms', () => {
      // Warm up with Japanese
      hintProvider.generateCommandHint('build', 'ja');

      // Switch to English
      const start = performance.now();
      const result = hintProvider.generateCommandHint('build', 'en');
      const duration = performance.now() - start;

      expect(result.ok).toBe(true);
      expect(duration).toBeLessThan(150);
      console.log(`Language switch: ${duration.toFixed(2)}ms`);
    });

    it('should handle rapid language switching', () => {
      const iterations = 10;
      const durations: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const locale = i % 2 === 0 ? 'ja' : 'en';
        const start = performance.now();
        hintProvider.generateCommandHint('build', locale);
        durations.push(performance.now() - start);
      }

      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      expect(avgDuration).toBeLessThan(150);
      console.log(`Rapid language switching (${iterations}x) - Avg: ${avgDuration.toFixed(2)}ms`);
    });
  });

  describe('Cache Performance', () => {
    it('should have cache hit rate > 80% for repeated operations', () => {
      const operations = 100;
      const uniqueCommands = ['build', 'implement', 'analyze', 'troubleshoot', 'explain'];
      let cacheHits = 0;

      // Warm up cache
      uniqueCommands.forEach((cmd) => hintProvider.generateCommandHint(cmd, 'ja'));

      // Perform operations
      for (let i = 0; i < operations; i++) {
        const cmd = uniqueCommands[i % uniqueCommands.length];
        const key = `cmd:${cmd}:ja`;

        if (cacheManager.get<string>(key) !== null) {
          cacheHits++;
        }

        hintProvider.generateCommandHint(cmd, 'ja');
      }

      const hitRate = (cacheHits / operations) * 100;
      expect(hitRate).toBeGreaterThan(80);
      console.log(`Cache hit rate: ${hitRate.toFixed(1)}%`);
    });

    it('should maintain performance with cache saturation', () => {
      const largeTtlCache = new CacheManager(1000); // Large cache
      const largeHintProvider = new HintProvider(i18nManager, largeTtlCache);

      // Fill cache with 100 entries
      for (let i = 0; i < 100; i++) {
        largeHintProvider.generateCommandHint(`cmd${i}`, 'ja');
      }

      // Measure performance after saturation
      const start = performance.now();
      largeHintProvider.generateCommandHint('build', 'ja');
      const duration = performance.now() - start;

      expect(duration).toBeLessThan(100);
      console.log(`Performance with saturated cache: ${duration.toFixed(2)}ms`);
    });
  });

  describe('Memory Usage', () => {
    it('should keep memory usage under 50MB', () => {
      const beforeMemory = process.memoryUsage().heapUsed;

      // Perform various operations
      for (let i = 0; i < 1000; i++) {
        hintProvider.generateCommandHint('build', 'ja');
        completionEngine.completeCommand('bu', 'ja');
        completionEngine.completeFlag('--th', 'ja');
      }

      const afterMemory = process.memoryUsage().heapUsed;
      const memoryUsedMB = (afterMemory - beforeMemory) / 1024 / 1024;

      expect(memoryUsedMB).toBeLessThan(50);
      console.log(`Memory used: ${memoryUsedMB.toFixed(2)}MB`);
    });
  });

  describe('Load Testing', () => {
    it('should handle 100 simultaneous operations without degradation', async () => {
      const operations = 100;
      const promises: Promise<any>[] = [];

      const start = performance.now();

      for (let i = 0; i < operations; i++) {
        promises.push(
          Promise.resolve().then(() => {
            const opStart = performance.now();
            hintProvider.generateCommandHint('build', 'ja');
            return performance.now() - opStart;
          })
        );
      }

      const durations = await Promise.all(promises);
      const totalDuration = performance.now() - start;
      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
      const maxDuration = Math.max(...durations);

      expect(maxDuration).toBeLessThan(100);
      expect(avgDuration).toBeLessThan(50);
      console.log(
        `100 simultaneous operations - Total: ${totalDuration.toFixed(2)}ms, Avg: ${avgDuration.toFixed(2)}ms, Max: ${maxDuration.toFixed(2)}ms`
      );
    });
  });
});
