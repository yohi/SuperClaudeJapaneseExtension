/**
 * I18nManager のユニットテスト
 */

import { I18nManager } from '../../../src/i18n/i18nManager';
import * as path from 'path';

describe('I18nManager', () => {
  let manager: I18nManager;
  const testTranslationsDir = path.join(__dirname, '../../../translations');

  beforeEach(async () => {
    manager = new I18nManager(testTranslationsDir);
  });

  describe('initialize', () => {
    it('should initialize with Japanese locale', async () => {
      const result = await manager.initialize('ja');

      expect(result.ok).toBe(true);
      expect(manager.getCurrentLocale()).toBe('ja');
    });

    it('should initialize with English locale', async () => {
      const result = await manager.initialize('en');

      expect(result.ok).toBe(true);
      expect(manager.getCurrentLocale()).toBe('en');
    });

    it('should return error for invalid locale', async () => {
      const result = await manager.initialize('fr' as any);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('RESOURCE_NOT_FOUND');
      }
    });

    it('should be idempotent (multiple initializations)', async () => {
      const result1 = await manager.initialize('ja');
      const result2 = await manager.initialize('ja');

      expect(result1.ok).toBe(true);
      expect(result2.ok).toBe(true);
    });
  });

  describe('translate', () => {
    beforeEach(async () => {
      await manager.initialize('ja');
    });

    it('should translate command description', () => {
      const result = manager.translate('commands.build.description');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toContain('ビルダー');
      }
    });

    it('should translate flag description', () => {
      const result = manager.translate('flags.plan.description');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toContain('計画');
      }
    });

    it('should translate error message', () => {
      const result = manager.translate('errors.COMMAND_NOT_FOUND');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toContain('見つかりません');
      }
    });

    it('should return error for non-existent key', () => {
      const result = manager.translate('commands.nonexistent.description');

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('TRANSLATION_NOT_FOUND');
      }
    });

    it('should use default value when translation not found', () => {
      const result = manager.translate('commands.nonexistent.description', {
        defaultValue: 'Default description',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toBe('Default description');
      }
    });

    it('should support interpolation', () => {
      const result = manager.translate('commands.build.description', {
        interpolation: { name: 'TestProject' },
      });

      expect(result.ok).toBe(true);
    });
  });

  describe('changeLanguage', () => {
    beforeEach(async () => {
      await manager.initialize('ja');
    });

    it('should change language from Japanese to English', async () => {
      const result = await manager.changeLanguage('en');

      expect(result.ok).toBe(true);
      expect(manager.getCurrentLocale()).toBe('en');
    });

    it('should translate in new language after change', async () => {
      await manager.changeLanguage('en');

      const result = manager.translate('commands.build.description');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toContain('builder');
      }
    });

    it('should return error for invalid locale', async () => {
      const result = await manager.changeLanguage('fr' as any);

      expect(result.ok).toBe(false);
      // 元の言語が維持されている
      expect(manager.getCurrentLocale()).toBe('ja');
    });
  });

  describe('getCurrentLocale', () => {
    it('should return default locale before initialization', () => {
      const newManager = new I18nManager(testTranslationsDir);
      expect(newManager.getCurrentLocale()).toBe('en');
    });

    it('should return current locale after initialization', async () => {
      await manager.initialize('ja');
      expect(manager.getCurrentLocale()).toBe('ja');
    });
  });

  describe('isInitialized', () => {
    it('should return false before initialization', () => {
      const newManager = new I18nManager(testTranslationsDir);
      expect(newManager.isInitialized()).toBe(false);
    });

    it('should return true after successful initialization', async () => {
      await manager.initialize('ja');
      expect(manager.isInitialized()).toBe(true);
    });
  });

  describe('cache behavior', () => {
    beforeEach(async () => {
      await manager.initialize('ja');
    });

    it('should cache translations for fast access', () => {
      // 初回アクセス
      const start1 = Date.now();
      manager.translate('commands.build.description');
      const time1 = Date.now() - start1;

      // 2回目アクセス（キャッシュヒット）
      const start2 = Date.now();
      manager.translate('commands.build.description');
      const time2 = Date.now() - start2;

      // 2回目の方が速いはず（キャッシュの効果）
      expect(time2).toBeLessThanOrEqual(time1);
    });
  });
});
