/**
 * TranslationLoader のユニットテスト
 */

import { TranslationLoader } from '../../../src/i18n/translationLoader';
import type { SupportedLocale } from '../../../src/types';
import * as fs from 'fs';
import * as path from 'path';

describe('TranslationLoader', () => {
  let loader: TranslationLoader;
  const testTranslationsDir = path.join(__dirname, '../../../translations');

  beforeEach(() => {
    loader = new TranslationLoader(testTranslationsDir);
  });

  describe('loadTranslations', () => {
    it('should load Japanese translations successfully', async () => {
      const result = await loader.loadTranslations('ja');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.version).toBe('1.0.0');
        expect(result.value.commands).toBeDefined();
        expect(result.value.flags).toBeDefined();
        expect(result.value.errors).toBeDefined();
      }
    });

    it('should load English translations successfully', async () => {
      const result = await loader.loadTranslations('en');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.version).toBe('1.0.0');
        expect(result.value.commands).toBeDefined();
      }
    });

    it('should include specific command translations', async () => {
      const result = await loader.loadTranslations('ja');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.commands.build).toBeDefined();
        expect(result.value.commands.build.description).toContain(
          'ビルダー'
        );
      }
    });

    it('should return error for non-existent locale', async () => {
      const result = await loader.loadTranslations('fr' as SupportedLocale);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('FILE_NOT_FOUND');
      }
    });

    it('should validate translation resource structure', async () => {
      const result = await loader.loadTranslations('ja');

      expect(result.ok).toBe(true);
      if (result.ok) {
        // commands構造の検証
        expect(typeof result.value.commands).toBe('object');
        expect(Object.keys(result.value.commands).length).toBeGreaterThan(0);

        // flags構造の検証
        expect(typeof result.value.flags).toBe('object');

        // errors構造の検証
        expect(typeof result.value.errors).toBe('object');
      }
    });
  });

  describe('validateSchema', () => {
    it('should validate valid translation resource', () => {
      const validData = {
        version: '1.0.0',
        commands: {
          test: {
            description: 'Test command',
          },
        },
        flags: {
          plan: {
            description: 'Plan flag',
          },
        },
        errors: {
          TEST_ERROR: 'Test error',
        },
      };

      const result = loader.validateSchema(validData);

      expect(result.ok).toBe(true);
    });

    it('should reject translation resource without version', () => {
      const invalidData = {
        commands: {},
        flags: {},
        errors: {},
      };

      const result = loader.validateSchema(invalidData);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('SCHEMA_VALIDATION_FAILED');
      }
    });

    it('should reject translation resource with invalid version format', () => {
      const invalidData = {
        version: 'invalid',
        commands: {},
        flags: {},
        errors: {},
      };

      const result = loader.validateSchema(invalidData);

      expect(result.ok).toBe(false);
    });
  });

  describe('getTranslationPath', () => {
    it('should return correct path for locale and namespace', () => {
      const commandsPath = loader.getTranslationPath('ja', 'commands');

      expect(commandsPath).toContain('translations');
      expect(commandsPath).toContain('ja');
      expect(commandsPath).toContain('commands.json');
    });
  });
});
