import { I18nManager } from '../../src/i18n/i18nManager';
import { HintProvider } from '../../src/hint/hintProvider';
import { CompletionEngine } from '../../src/completion/completionEngine';
import { CommandMetadataLoader } from '../../src/metadata/commandMetadataLoader';
import * as path from 'path';

describe('Translation Flow Integration Tests', () => {
  let i18nManager: I18nManager;
  let hintProvider: HintProvider;
  let completionEngine: CompletionEngine;
  let metadataLoader: CommandMetadataLoader;
  const translationsDir = path.join(__dirname, '../..', 'translations');
  const fixturesDir = path.join(__dirname, '../fixtures/commands');

  beforeEach(async () => {
    // i18nManagerの初期化
    i18nManager = new I18nManager(translationsDir);
    await i18nManager.initialize('ja');

    // MetadataLoaderの初期化
    metadataLoader = new CommandMetadataLoader({
      maxCacheSize: 100,
      cacheTTL: 60000,
    });
    await metadataLoader.loadCommandsFromDirectory(fixturesDir);

    // HintProviderとCompletionEngineの初期化
    hintProvider = new HintProvider(i18nManager, metadataLoader);
    completionEngine = new CompletionEngine(metadataLoader, i18nManager);
  });

  describe('Full Command Flow', () => {
    it('should display Japanese hints for /build command', () => {
      const result = hintProvider.generateCommandHint('build');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toContain('build');
        expect(result.value).toContain('フレームワーク');
      }
    });

    it('should return error for non-existent command', () => {
      const result = hintProvider.generateCommandHint('nonexistent-command');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('COMMAND_NOT_FOUND');
      }
    });

    it('should provide completions for /build command', () => {
      const result = completionEngine.completeCommand('bui');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBeGreaterThan(0);
        expect(result.value[0].name).toBe('build');
        expect(result.value[0].description).toContain('フレームワーク');
      }
    });
  });

  describe('Flag Integration', () => {
    it('should display Japanese hints for --think flag', () => {
      const result = hintProvider.generateFlagHint('think');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toContain('think');
        expect(result.value).toContain('分析');
      }
    });

    it('should provide completions for --th prefix', () => {
      const result = completionEngine.completeFlag(undefined, '--th');

      expect(result.ok).toBe(true);
      if (result.ok) {
        const thinkFlags = result.value.filter((item) =>
          item.name.startsWith('--think')
        );
        expect(thinkFlags.length).toBeGreaterThan(0);
        expect(thinkFlags.some((flag) => flag.description.includes('分析'))).toBe(true);
      }
    });

    it('should handle flag aliases correctly', () => {
      const ucResult = hintProvider.generateFlagHint('uc');
      const ultracompressedResult = hintProvider.generateFlagHint('ultracompressed');

      expect(ucResult.ok).toBe(true);
      expect(ultracompressedResult.ok).toBe(true);

      if (ucResult.ok && ultracompressedResult.ok) {
        // Both should contain similar description text
        expect(ucResult.value).toContain('トークン使用を30-50%削減');
        expect(ultracompressedResult.value).toContain('トークン使用を30-50%削減');
      }
    });
  });

  describe('Language Switching', () => {
    it('should switch between Japanese and English seamlessly', async () => {
      // Japanese
      const jaResult = hintProvider.generateCommandHint('build');
      expect(jaResult.ok).toBe(true);
      if (jaResult.ok) {
        expect(jaResult.value).toContain('フレームワーク');
      }

      // Switch to English
      await i18nManager.changeLanguage('en');
      const enResult = hintProvider.generateCommandHint('build');
      expect(enResult.ok).toBe(true);
      if (enResult.ok) {
        expect(enResult.value).toContain('framework');
        expect(enResult.value).not.toContain('フレームワーク');
      }

      // Back to Japanese
      await i18nManager.changeLanguage('ja');
      const jaResult2 = hintProvider.generateCommandHint('build');
      expect(jaResult2.ok).toBe(true);
      if (jaResult2.ok) {
        expect(jaResult2.value).toContain('フレームワーク');
      }
    });
  });

  describe('Cache Integration', () => {
    it('should cache hint results and return them on subsequent calls', () => {
      // First call
      const result1 = hintProvider.generateCommandHint('build');
      expect(result1.ok).toBe(true);

      // Second call - should return cached value
      const result2 = hintProvider.generateCommandHint('build');
      expect(result2.ok).toBe(true);

      if (result1.ok && result2.ok) {
        expect(result1.value).toBe(result2.value);
      }
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle command not found errors with suggestions', () => {
      const result = hintProvider.formatError(
        {
          type: 'COMMAND_NOT_FOUND',
          command: 'buidl', // typo
        },
        ['build', 'implement']
      );

      expect(result).toContain('コマンドが見つかりません');
      expect(result).toContain('buidl');
      expect(result).toContain('build');
    });

    it('should handle flag not found errors', () => {
      const result = hintProvider.formatError(
        {
          type: 'FLAG_NOT_FOUND',
          flag: '--plann', // typo
        },
        ['--plan']
      );

      expect(result).toContain('フラグが見つかりません');
      expect(result).toContain('--plann');
      expect(result).toContain('--plan');
    });
  });

  describe('Argument Completion Integration', () => {
    it('should complete file path arguments', () => {
      const result = completionEngine.completeArgument('build', 0, 'prod');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.some((item) => item.value === 'production')).toBe(true);
      }
    });

    it('should provide Japanese descriptions for argument completions', () => {
      const result = completionEngine.completeArgument('build', 0, '');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBeGreaterThan(0);
        expect(result.value.some((item) => item.description.length > 0)).toBe(true);
      }
    });
  });
});
