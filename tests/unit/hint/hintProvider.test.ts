/**
 * HintProvider のユニットテスト
 */

import { HintProvider } from '../../../src/hint/hintProvider';
import { I18nManager } from '../../../src/i18n/i18nManager';
import { CommandMetadataLoader } from '../../../src/metadata/commandMetadataLoader';
import type { HintError } from '../../../src/types';
import * as path from 'path';

describe('HintProvider', () => {
  let hintProvider: HintProvider;
  let i18nManager: I18nManager;
  let metadataLoader: CommandMetadataLoader;
  const fixturesDir = path.join(__dirname, '../../fixtures/commands');
  const translationsDir = path.join(__dirname, '../../..', 'translations');

  beforeEach(async () => {
    // i18nManagerの初期化
    i18nManager = new I18nManager(translationsDir);
    await i18nManager.initialize('ja');

    // MetadataLoaderの初期化とコマンド読み込み
    metadataLoader = new CommandMetadataLoader({
      maxCacheSize: 10,
      cacheTTL: 60000,
    });
    await metadataLoader.loadCommandsFromDirectory(fixturesDir);

    // HintProviderの初期化
    hintProvider = new HintProvider(i18nManager, metadataLoader);
  });

  describe('generateCommandHint', () => {
    it('should generate Japanese hint for command', () => {
      const result = hintProvider.generateCommandHint('build');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toContain('build');
        expect(result.value).toContain('フレームワーク検出付き');
        // chalkによる色付けコードを含む
      }
    });

    it('should fallback to English when Japanese not available', async () => {
      // 英語に切り替え
      await i18nManager.changeLanguage('en');

      const result = hintProvider.generateCommandHint('build');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toContain('build');
        expect(result.value).toContain('framework detection');
      }
    });

    it('should return error for non-existent command', () => {
      const result = hintProvider.generateCommandHint('nonexistent');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('COMMAND_NOT_FOUND');
      }
    });

    it('should include argument hint if available', () => {
      const result = hintProvider.generateCommandHint('build');

      expect(result.ok).toBe(true);
      if (result.ok) {
        // 引数ヒントが含まれる（翻訳済み日本語版）
        expect(result.value).toContain('ビルド対象を指定');
      }
    });

    it('should include category if available', () => {
      const result = hintProvider.generateCommandHint('build');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toContain('Development');
      }
    });
  });

  describe('generateCommandHintPlain', () => {
    it('should generate plain hint without color codes', () => {
      const result = hintProvider.generateCommandHintPlain('build');

      expect(result.ok).toBe(true);
      if (result.ok) {
        // ANSI色コードを含まない
        expect(result.value).not.toMatch(/\x1b\[/);
        expect(result.value).toContain('build');
        expect(result.value).toContain('フレームワーク検出付き');
      }
    });
  });

  describe('performance', () => {
    it('should generate hint within 100ms', () => {
      const start = Date.now();
      hintProvider.generateCommandHint('build');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(100);
    });

    it('should be faster on subsequent calls (cache)', () => {
      // ウォームアップ
      hintProvider.generateCommandHint('build');

      // 計測
      const start = Date.now();
      hintProvider.generateCommandHint('build');
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(10); // キャッシュ効果で高速
    });
  });

  describe('fallback mechanism', () => {
    it('should use Japanese description from metadata when available', () => {
      // コマンドメタデータに日本語がある場合
      const result = hintProvider.generateCommandHint('test');

      expect(result.ok).toBe(true);
      if (result.ok) {
        // メタデータの日本語説明を使用
        expect(result.value).toContain('テストケースの生成と実行');
      }
    });

    it('should use metadata description when translation not found', () => {
      const result = hintProvider.generateCommandHint('build');

      expect(result.ok).toBe(true);
      if (result.ok) {
        // 翻訳またはメタデータのいずれかから説明を取得
        expect(result.value.length).toBeGreaterThan(0);
      }
    });
  });

  describe('formatting', () => {
    it('should format hint with proper structure', () => {
      const result = hintProvider.generateCommandHint('build');

      expect(result.ok).toBe(true);
      if (result.ok) {
        // コマンド名が含まれる
        expect(result.value).toMatch(/build/i);
        // 説明が含まれる
        expect(result.value.length).toBeGreaterThan(10);
      }
    });

    it('should include newlines for readability', () => {
      const result = hintProvider.generateCommandHint('build');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toContain('\n');
      }
    });
  });

  describe('generateFlagHint', () => {
    it('should generate Japanese hint for flag', () => {
      const result = hintProvider.generateFlagHint('plan');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toContain('plan');
        expect(result.value).toContain('実行前に詳細な計画を表示');
      }
    });

    it('should include alias information when available', () => {
      const result = hintProvider.generateFlagHint('uc');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toContain('uc');
        expect(result.value).toContain('ultracompressed');
        expect(result.value).toContain('トークン使用を30-50%削減');
      }
    });

    it('should include example when available', () => {
      const result = hintProvider.generateFlagHint('plan');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toContain('例:');
        expect(result.value).toContain('claude /build --plan');
      }
    });

    it('should fallback to English when Japanese not available', async () => {
      await i18nManager.changeLanguage('en');

      const result = hintProvider.generateFlagHint('plan');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toContain('plan');
        expect(result.value).toContain('Display execution plan before operations');
      }
    });

    it('should return error for non-existent flag', () => {
      const result = hintProvider.generateFlagHint('nonexistent');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('FLAG_NOT_FOUND');
      }
    });
  });

  describe('generateFlagHintPlain', () => {
    it('should generate plain flag hint without color codes', () => {
      const result = hintProvider.generateFlagHintPlain('plan');

      expect(result.ok).toBe(true);
      if (result.ok) {
        // ANSI色コードを含まない
        expect(result.value).not.toMatch(/\x1b\[/);
        expect(result.value).toContain('plan');
        expect(result.value).toContain('実行前に詳細な計画を表示');
      }
    });
  });

  describe('generateArgumentHint', () => {
    it('should generate Japanese hint for argument', () => {
      const result = hintProvider.generateArgumentHint('build', 'target');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toContain('target');
        expect(result.value).toContain('ビルド対象を指定');
      }
    });

    it('should detect @<path> notation', () => {
      const result = hintProvider.generateArgumentHint('test', '@config.json');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toContain('@config.json');
        expect(result.value).toContain('ファイルパス');
      }
    });

    it('should show argument type hints', () => {
      const result = hintProvider.generateArgumentHint('build', 'target');

      expect(result.ok).toBe(true);
      if (result.ok) {
        // 型情報が含まれる（文字列、ファイルパスなど）
        expect(result.value.length).toBeGreaterThan(10);
      }
    });

    it('should fallback to English when Japanese not available', async () => {
      await i18nManager.changeLanguage('en');

      const result = hintProvider.generateArgumentHint('build', 'target');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toContain('target');
        expect(result.value).toContain('Specify build target');
      }
    });

    it('should return error for non-existent command', () => {
      const result = hintProvider.generateArgumentHint('nonexistent', 'arg');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('COMMAND_NOT_FOUND');
      }
    });

    it('should return error for non-existent argument', () => {
      const result = hintProvider.generateArgumentHint('build', 'nonexistent');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('ARGUMENT_NOT_FOUND');
      }
    });
  });

  describe('generateArgumentHintPlain', () => {
    it('should generate plain argument hint without color codes', () => {
      const result = hintProvider.generateArgumentHintPlain('build', 'target');

      expect(result.ok).toBe(true);
      if (result.ok) {
        // ANSI色コードを含まない
        expect(result.value).not.toMatch(/\x1b\[/);
        expect(result.value).toContain('target');
        expect(result.value).toContain('ビルド対象を指定');
      }
    });
  });

  describe('formatError', () => {
    it('should format COMMAND_NOT_FOUND error in Japanese', () => {
      const error: HintError = {
        type: 'COMMAND_NOT_FOUND',
        command: 'nonexistent',
      };

      const result = hintProvider.formatError(error);

      expect(result).toContain('コマンドが見つかりません');
      expect(result).toContain('nonexistent');
    });

    it('should format FLAG_NOT_FOUND error in Japanese', () => {
      const error: HintError = {
        type: 'FLAG_NOT_FOUND',
        flag: 'nonexistent',
      };

      const result = hintProvider.formatError(error);

      expect(result).toContain('フラグが見つかりません');
      expect(result).toContain('nonexistent');
    });

    it('should format ARGUMENT_NOT_FOUND error in Japanese', () => {
      const error: HintError = {
        type: 'ARGUMENT_NOT_FOUND',
        command: 'build',
        argument: 'nonexistent',
      };

      const result = hintProvider.formatError(error);

      expect(result).toContain('引数が見つかりません');
      expect(result).toContain('build');
      expect(result).toContain('nonexistent');
    });

    it('should provide suggestions for typos', () => {
      const error: HintError = {
        type: 'COMMAND_NOT_FOUND',
        command: 'buidl',
      };

      const result = hintProvider.formatError(error, ['build', 'test']);

      expect(result).toContain('もしかして:');
      expect(result).toContain('build');
    });

    it('should format error in English when language is English', async () => {
      await i18nManager.changeLanguage('en');

      const error: HintError = {
        type: 'COMMAND_NOT_FOUND',
        command: 'nonexistent',
      };

      const result = hintProvider.formatError(error);

      expect(result).toContain('Command not found');
      expect(result).toContain('nonexistent');
    });

    it('should handle TRANSLATION_UNAVAILABLE error', () => {
      const error: HintError = {
        type: 'TRANSLATION_UNAVAILABLE',
        key: 'some.key',
      };

      const result = hintProvider.formatError(error);

      expect(result).toContain('翻訳が利用できません');
      expect(result).toContain('some.key');
    });
  });

  describe('formatErrorPlain', () => {
    it('should format error without color codes', () => {
      const error: HintError = {
        type: 'COMMAND_NOT_FOUND',
        command: 'nonexistent',
      };

      const result = hintProvider.formatErrorPlain(error);

      expect(result).not.toMatch(/\x1b\[/);
      expect(result).toContain('コマンドが見つかりません');
    });
  });
});
