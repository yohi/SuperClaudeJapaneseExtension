import { execSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { I18nManager } from '../../src/i18n/i18nManager';
import { HintProvider } from '../../src/hint/hintProvider';
import { CompletionEngine } from '../../src/completion/completionEngine';
import { CommandMetadataLoader } from '../../src/metadata/commandMetadataLoader';
import { Result, HintError } from '../../src/types';

describe('E2E User Workflow Tests', () => {
  let i18nManager: I18nManager;
  let hintProvider: HintProvider;
  let completionEngine: CompletionEngine;
  let metadataLoader: CommandMetadataLoader;
  const translationsDir = path.join(__dirname, '../..', 'translations');
  const fixturesDir = path.join(__dirname, '../fixtures/commands');

  beforeAll(async () => {
    i18nManager = new I18nManager(translationsDir);
    await i18nManager.initialize('ja');

    metadataLoader = new CommandMetadataLoader({
      maxCacheSize: 100,
      cacheTTL: 3600000,
    });
    await metadataLoader.loadCommandsFromDirectory(fixturesDir);

    hintProvider = new HintProvider(i18nManager, metadataLoader);
    completionEngine = new CompletionEngine(metadataLoader, i18nManager);
  });

  describe('First-Time User Experience', () => {
    it('should provide Japanese hints on first command', () => {
      // Simulate new user's first command: /build
      const result = hintProvider.generateCommandHint('build');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toContain('フレームワーク検出付きプロジェクトビルダー');
        expect(result.value).toContain('カテゴリー: 開発・デプロイ');
        // Should show argument hint
        expect(result.value).toContain('引数');
      }
    });

    it('should provide completion suggestions', () => {
      // User types: /bu[TAB]
      const result = completionEngine.completeCommand('bu');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBeGreaterThan(0);
        expect(result.value[0].name).toBe('build');
        expect(result.value[0].description).toContain('日本語');
      }
    });
  });

  describe('Typical Workflow: Build Command', () => {
    it('should assist user through build command workflow', () => {
      // Step 1: User types /build
      const cmdHint = hintProvider.generateCommandHint('build');
      expect(cmdHint.ok).toBe(true);

      // Step 2: User considers flags - types --
      const flagCompletions = completionEngine.completeFlag('build', '--');
      expect(flagCompletions.ok).toBe(true);
      if (flagCompletions.ok) {
        expect(flagCompletions.value.length).toBeGreaterThan(0);
      }

      // Step 3: User selects --plan flag
      const planHint = hintProvider.generateFlagHint('plan');
      expect(planHint.ok).toBe(true);
      if (planHint.ok) {
        expect(planHint.value).toContain('実行前に計画を表示');
      }

      // Step 4: User provides argument - types prod
      const argCompletions = completionEngine.completeArgument('build', 0, 'prod');
      expect(argCompletions.ok).toBe(true);
      if (argCompletions.ok) {
        expect(argCompletions.value.some((item) => item.value === 'production')).toBe(true);
      }
    });
  });

  describe('Error Recovery Workflow', () => {
    it('should help user recover from typos', () => {
      // User makes a typo: /buidl
      const error = hintProvider.formatError(
        {
          type: 'COMMAND_NOT_FOUND',
          command: 'buidl',
        },
        ['build']
      );

      expect(error).toContain('コマンド');
      expect(error).toContain('build'); // Should suggest correct command
    });

    it('should help with flag typos', () => {
      // User makes a typo: --plann
      const error = hintProvider.formatError(
        {
          type: 'FLAG_NOT_FOUND',
          flag: '--plann',
        },
        ['--plan']
      );

      expect(error).toContain('フラグ');
      expect(error).toContain('--plan');
    });
  });

  describe('Language Switching Workflow', () => {
    it('should allow user to switch from Japanese to English', () => {
      // User starts with Japanese
      i18nManager.changeLanguage('ja');
      const jaResult = hintProvider.generateCommandHint('build');
      expect(jaResult.ok).toBe(true);
      if (jaResult.ok) {
        expect(jaResult.value).toContain('フレームワーク');
      }

      // User switches to English (via environment variable)
      i18nManager.changeLanguage('en');
      const enResult = hintProvider.generateCommandHint('build');
      expect(enResult.ok).toBe(true);
      if (enResult.ok) {
        expect(enResult.value).toContain('framework');
        expect(enResult.value).not.toContain('フレームワーク');
      }
    });
  });

  describe('Multi-Command Session', () => {
    it('should maintain performance across multiple commands', async () => {
      const commands = ['build', 'implement', 'analyze', 'troubleshoot', 'explain'];
      const timings: number[] = [];

      for (const cmd of commands) {
        const start = Date.now();
        const result = await hintProvider.generateCommandHint(cmd);

        // 操作が成功した場合のみタイミングを記録
        expect(result.ok).toBe(true);
        const duration = Date.now() - start;
        timings.push(duration);
      }

      const avgTiming = timings.reduce((a, b) => a + b, 0) / timings.length;
      expect(avgTiming).toBeLessThan(100);
    });
  });

  describe('Flag Combination Workflow', () => {
    it('should suggest related flags when user enters --think', () => {
      // User enters --think
      const thinkHint = hintProvider.generateFlagHint('think');
      expect(thinkHint.ok).toBe(true);

      // 確認: `--seq`フラグのヒントを確認する
      const seqHint = hintProvider.generateFlagHint('seq');
      expect(seqHint.ok).toBe(true);
      if (seqHint.ok) {
        expect(seqHint.value).toContain('Sequential');
      }
    });
  });

  describe('Argument Path Completion', () => {
    it('should complete file paths for @<path> notation', () => {
      // User types @src/
      const completions = completionEngine.completeArgument('build', 0, '@src/');

      expect(completions.ok).toBe(true);
      if (completions.ok) {
        // Should return file/directory completions
        expect(completions.value.length).toBeGreaterThan(0);
      }
    });
  });

  describe('SuperClaude Framework Compatibility', () => {
    it('should not interfere with core SuperClaude functionality', () => {
      // All our operations should work independently
      const commands = ['build', 'implement', 'analyze'];

      commands.forEach((cmd) => {
        const result = hintProvider.generateCommandHint(cmd);
        expect(result.ok).toBe(true);
      });

      // Completions should also work
      commands.forEach((cmd) => {
        const result = completionEngine.completeCommand(cmd.substring(0, 3));
        expect(result.ok).toBe(true);
      });
    });
  });

  describe('Performance Under Real Usage', () => {
    it('should maintain sub-100ms response time for typical usage', async () => {
      // Simulate realistic user session: 20 operations
      const operations = [
        () => hintProvider.generateCommandHint('build'),
        () => completionEngine.completeCommand('impl'),
        () => hintProvider.generateFlagHint('think'),
        () => completionEngine.completeFlag('build', '--uc'),
        () => hintProvider.generateArgumentHint('build', 'target'),
      ];

      const timings: number[] = [];

      // Repeat operations 4 times (total 20)
      for (let i = 0; i < 4; i++) {
        for (const op of operations) {
          const start = Date.now();
          const result = await op();

          // 操作が成功した場合のみタイミングを記録
          expect(result.ok).toBe(true);
          const elapsed = Date.now() - start;
          timings.push(elapsed);
        }
      }

      const avgTiming = timings.reduce((a, b) => a + b, 0) / timings.length;
      const maxTiming = Math.max(...timings);

      expect(avgTiming).toBeLessThan(50);
      expect(maxTiming).toBeLessThan(100);
    });
  });

  describe('Concurrent User Simulation', () => {
    it('should handle multiple simultaneous operations', async () => {
      const operations = Array.from({ length: 50 }, (_, i) => {
        const cmd = ['build', 'implement', 'analyze'][i % 3];
        return () => hintProvider.generateCommandHint(cmd);
      });

      const promises = operations.map(
        (op) =>
          new Promise<Result<string, HintError>>((resolve) => {
            setImmediate(() => {
              resolve(op());
            });
          }),
      );
      const results = await Promise.all(promises);

      results.forEach((result) => {
        expect(result.ok).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty input gracefully', () => {
      const result = completionEngine.completeCommand('');
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBeGreaterThan(0);
      }
    });

    it('should handle very long prefixes', () => {
      const longPrefix = 'a'.repeat(100);
      const result = completionEngine.completeCommand(longPrefix);
      expect(result.ok).toBe(true);
    });

    it('should handle special characters in input', () => {
      const specialChars = ['@', '#', '$', '/', '\\', '*'];
      specialChars.forEach((char) => {
        const result = completionEngine.completeCommand(char);
        expect(result.ok).toBe(true);
      });
    });
  });
});
