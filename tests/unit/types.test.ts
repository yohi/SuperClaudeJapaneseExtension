/**
 * 型定義の基本テスト
 */

import { LogLevel, VERSION, DEFAULT_CONFIG } from '../../src/index';
import type { SupportedLocale, Result } from '../../src/types';

describe('Types', () => {
  describe('LogLevel', () => {
    it('should have correct log levels', () => {
      expect(LogLevel.ERROR).toBe('ERROR');
      expect(LogLevel.WARN).toBe('WARN');
      expect(LogLevel.INFO).toBe('INFO');
      expect(LogLevel.DEBUG).toBe('DEBUG');
    });
  });

  describe('SupportedLocale', () => {
    it('should accept valid locales', () => {
      const enLocale: SupportedLocale = 'en';
      const jaLocale: SupportedLocale = 'ja';

      expect(enLocale).toBe('en');
      expect(jaLocale).toBe('ja');
    });
  });

  describe('Result type', () => {
    it('should represent success', () => {
      const success: Result<string> = { ok: true, value: 'test' };

      expect(success.ok).toBe(true);
      if (success.ok) {
        expect(success.value).toBe('test');
      }
    });

    it('should represent failure', () => {
      const failure: Result<string> = {
        ok: false,
        error: new Error('test error'),
      };

      expect(failure.ok).toBe(false);
      if (!failure.ok) {
        expect(failure.error.message).toBe('test error');
      }
    });
  });

  describe('Constants', () => {
    it('should have correct version', () => {
      expect(VERSION).toBe('1.0.0');
    });

    it('should have correct default config', () => {
      expect(DEFAULT_CONFIG).toEqual({
        locale: 'ja',
        cacheTtl: 3600000,
        maxCacheSize: 100,
        logLevel: 'INFO',
      });
    });
  });
});
