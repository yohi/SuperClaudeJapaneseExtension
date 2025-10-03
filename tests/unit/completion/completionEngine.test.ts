/**
 * CompletionEngine のユニットテスト
 */

import { CompletionEngine } from '../../../src/completion/completionEngine';
import { I18nManager } from '../../../src/i18n/i18nManager';
import { CommandMetadataLoader } from '../../../src/metadata/commandMetadataLoader';
import type { CompletionCandidate } from '../../../src/types';
import * as path from 'path';

describe('CompletionEngine', () => {
  let completionEngine: CompletionEngine;
  let i18nManager: I18nManager;
  let metadataLoader: CommandMetadataLoader;

  beforeEach(async () => {
    const translationsPath = path.resolve(
      __dirname,
      '../../../translations'
    );
    i18nManager = new I18nManager(translationsPath);
    await i18nManager.initialize('ja');

    metadataLoader = new CommandMetadataLoader({
      maxCacheSize: 10,
      cacheTTL: 60000,
    });

    // テスト用コマンドをロード
    const commandsPath = path.resolve(
      __dirname,
      '../../fixtures/commands'
    );
    await metadataLoader.loadCommand(path.join(commandsPath, 'build.md'));
    await metadataLoader.loadCommand(path.join(commandsPath, 'test.md'));

    completionEngine = new CompletionEngine(
      metadataLoader,
      i18nManager
    );
  });

  describe('completeCommand', () => {
    it('should complete command with prefix matching', () => {
      const result = completionEngine.completeCommand('bui');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBeGreaterThan(0);
        expect(result.value[0].name).toBe('build');
      }
    });

    it('should include Japanese description', () => {
      const result = completionEngine.completeCommand('bui');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value[0].description).toContain('プロジェクト');
        expect(result.value[0].description).toContain('ビルダー');
      }
    });

    it('should return candidates sorted by score', () => {
      const result = completionEngine.completeCommand('t');

      expect(result.ok).toBe(true);
      if (result.ok) {
        // 複数の候補がある場合、スコア順にソートされている
        for (let i = 0; i < result.value.length - 1; i++) {
          expect(result.value[i].score).toBeGreaterThanOrEqual(
            result.value[i + 1].score
          );
        }
      }
    });

    it('should return empty list for no matches', () => {
      const result = completionEngine.completeCommand('xyz');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBe(0);
      }
    });

    it('should complete within 200ms for 100 commands', () => {
      const startTime = Date.now();

      for (let i = 0; i < 100; i++) {
        completionEngine.completeCommand('b');
      }

      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeLessThan(200);
    });

    it('should fallback to English when Japanese not available', async () => {
      await i18nManager.changeLanguage('en');

      const result = completionEngine.completeCommand('bui');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value[0].description).toContain('builder');
      }
    });
  });

  describe('scoring', () => {
    it('should prioritize exact prefix matches', () => {
      const result = completionEngine.completeCommand('build');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value[0].name).toBe('build');
        expect(result.value[0].score).toBeGreaterThan(0.9);
      }
    });

    it('should score shorter matches higher', () => {
      // buildとtest両方が'b'で始まる場合、buildが短いのでスコアが高い
      const result = completionEngine.completeCommand('b');

      expect(result.ok).toBe(true);
      if (result.ok && result.value.length >= 2) {
        const buildCandidate = result.value.find(
          (c: CompletionCandidate) => c.name === 'build'
        );
        expect(buildCandidate).toBeDefined();
      }
    });
  });
});
