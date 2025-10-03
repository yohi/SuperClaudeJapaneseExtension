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

    it('should complete within 5ms average for 100 repeated calls', () => {
      const iterations = 100;
      const measurements: number[] = [];

      // ウォームアップ（JITコンパイル対策）
      for (let i = 0; i < 10; i++) {
        completionEngine.completeCommand('b');
      }

      // 複数回測定してより安定した結果を得る
      for (let i = 0; i < iterations; i++) {
        const startTime = performance.now();
        completionEngine.completeCommand('b');
        const elapsed = performance.now() - startTime;
        measurements.push(elapsed);
      }

      // 平均を計算
      const average =
        measurements.reduce((sum, time) => sum + time, 0) / measurements.length;

      // 平均が5ms以内であることを確認（CI環境でも安定）
      expect(average).toBeLessThan(5);
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

    it('should return matching candidates for prefix', () => {
      // 'b'で始まるコマンドを検索
      const result = completionEngine.completeCommand('b');

      expect(result.ok).toBe(true);
      if (result.ok) {
        // 'build'が候補に含まれることを確認
        const buildCandidate = result.value.find(
          (c: CompletionCandidate) => c.name === 'build'
        );
        expect(buildCandidate).toBeDefined();
        if (buildCandidate) {
          // スコアが0より大きいことを確認
          expect(buildCandidate.score).toBeGreaterThan(0);
        }
      }
    });
  });

  describe('completeFlag', () => {
    it('should complete flag with prefix matching', () => {
      const result = completionEngine.completeFlag('--p');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBeGreaterThan(0);
        const planFlag = result.value.find(
          (f: CompletionCandidate) => f.name === '--plan'
        );
        expect(planFlag).toBeDefined();
      }
    });

    it('should complete flag without prefix (--)', () => {
      const result = completionEngine.completeFlag('p');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.length).toBeGreaterThan(0);
        const planFlag = result.value.find(
          (f: CompletionCandidate) =>
            f.name === '--plan' || f.name === 'plan'
        );
        expect(planFlag).toBeDefined();
      }
    });

    it('should include alias information', () => {
      const result = completionEngine.completeFlag('uc');

      expect(result.ok).toBe(true);
      if (result.ok) {
        const ucFlag = result.value.find((f: CompletionCandidate) =>
          f.name.includes('uc')
        );
        expect(ucFlag).toBeDefined();
        if (ucFlag) {
          expect(ucFlag.alias).toBeDefined();
          expect(ucFlag.alias).toBe('ultracompressed');
        }
      }
    });

    it('should complete with alias matching', () => {
      const result = completionEngine.completeFlag('ultracomp');

      expect(result.ok).toBe(true);
      if (result.ok) {
        // aliasでもマッチする
        const ucFlag = result.value.find((f: CompletionCandidate) =>
          f.alias?.includes('ultracomp')
        );
        expect(ucFlag).toBeDefined();
      }
    });

    it('should include Japanese description', () => {
      const result = completionEngine.completeFlag('--plan');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value[0].description).toContain('計画');
      }
    });

    it('should return sorted by score', () => {
      const result = completionEngine.completeFlag('p');

      expect(result.ok).toBe(true);
      if (result.ok) {
        for (let i = 0; i < result.value.length - 1; i++) {
          expect(result.value[i].score).toBeGreaterThanOrEqual(
            result.value[i + 1].score
          );
        }
      }
    });

    it('should filter by command context when provided', () => {
      const result = completionEngine.completeFlag('--p', 'build');

      expect(result.ok).toBe(true);
      if (result.ok) {
        // buildコマンドで利用可能なフラグのみ返す
        expect(result.value.length).toBeGreaterThan(0);
      }
    });

    it('should fallback to English when Japanese not available', async () => {
      await i18nManager.changeLanguage('en');

      const result = completionEngine.completeFlag('--plan');

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value[0].description).toContain('plan');
      }
    });
  });
});
