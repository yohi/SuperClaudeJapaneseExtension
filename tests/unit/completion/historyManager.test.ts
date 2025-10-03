/**
 * HistoryManager のユニットテスト
 */

import { HistoryManager } from '../../../src/completion/historyManager';
import type { HistoryEntry } from '../../../src/types';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('HistoryManager', () => {
  let historyManager: HistoryManager;
  let tempHistoryFile: string;

  beforeEach(() => {
    // 一時ファイルを作成
    tempHistoryFile = path.join(os.tmpdir(), `test-history-${Date.now()}.json`);
    historyManager = new HistoryManager(tempHistoryFile, {
      maxHistorySize: 100,
    });
  });

  afterEach(() => {
    // テスト後にファイルを削除
    if (fs.existsSync(tempHistoryFile)) {
      fs.unlinkSync(tempHistoryFile);
    }
  });

  describe('recordCommand', () => {
    it('should record command to history', async () => {
      const result = await historyManager.recordCommand('build');

      expect(result.ok).toBe(true);
    });

    it('should increment frequency for repeated commands', async () => {
      await historyManager.recordCommand('build');
      await historyManager.recordCommand('build');

      const history = historyManager.getHistory();
      const buildEntry = history.find((h: HistoryEntry) => h.command === 'build');

      expect(buildEntry).toBeDefined();
      if (buildEntry) {
        expect(buildEntry.frequency).toBe(2);
      }
    });

    it('should update lastUsed timestamp', async () => {
      const before = Date.now();
      await historyManager.recordCommand('test');
      const after = Date.now();

      const history = historyManager.getHistory();
      const testEntry = history.find((h: HistoryEntry) => h.command === 'test');

      expect(testEntry).toBeDefined();
      if (testEntry) {
        expect(testEntry.lastUsed).toBeGreaterThanOrEqual(before);
        expect(testEntry.lastUsed).toBeLessThanOrEqual(after);
      }
    });

    it('should limit history size to maxHistorySize', async () => {
      historyManager = new HistoryManager(tempHistoryFile, {
        maxHistorySize: 5,
      });

      // 10個のコマンドを記録
      for (let i = 0; i < 10; i++) {
        await historyManager.recordCommand(`command${i}`);
      }

      const history = historyManager.getHistory();
      expect(history.length).toBeLessThanOrEqual(5);
    });
  });

  describe('getHistory', () => {
    it('should return empty array initially', () => {
      const history = historyManager.getHistory();
      expect(history).toEqual([]);
    });

    it('should return recorded commands', async () => {
      await historyManager.recordCommand('build');
      await historyManager.recordCommand('test');

      const history = historyManager.getHistory();
      expect(history.length).toBe(2);
      expect(history.some((h: HistoryEntry) => h.command === 'build')).toBe(true);
      expect(history.some((h: HistoryEntry) => h.command === 'test')).toBe(true);
    });
  });

  describe('getCommandScore', () => {
    it('should return 0 for unknown command', () => {
      const score = historyManager.getCommandScore('unknown');
      expect(score).toBe(0);
    });

    it('should return score based on frequency and recency', async () => {
      await historyManager.recordCommand('build');
      await new Promise((resolve) => setTimeout(resolve, 1100)); // 1.1秒待機
      await historyManager.recordCommand('test');

      const buildScore = historyManager.getCommandScore('build');
      const testScore = historyManager.getCommandScore('test');

      // testの方が最近使用されたため、スコアが高い（1秒以内 vs 1秒超）
      expect(testScore).toBeGreaterThan(buildScore);
    });

    it('should prioritize frequently used commands', async () => {
      await historyManager.recordCommand('build');
      await historyManager.recordCommand('build');
      await historyManager.recordCommand('build');
      await historyManager.recordCommand('test');

      const buildScore = historyManager.getCommandScore('build');
      const testScore = historyManager.getCommandScore('test');

      // buildの方が頻繁に使用されたため、スコアが高い
      expect(buildScore).toBeGreaterThan(testScore);
    });
  });

  describe('persistence', () => {
    it('should save history to file', async () => {
      await historyManager.recordCommand('build');
      await historyManager.save();

      expect(fs.existsSync(tempHistoryFile)).toBe(true);
    });

    it('should load history from file', async () => {
      await historyManager.recordCommand('build');
      await historyManager.save();

      // 新しいインスタンスを作成
      const newHistoryManager = new HistoryManager(tempHistoryFile);
      await newHistoryManager.load();

      const history = newHistoryManager.getHistory();
      expect(history.length).toBe(1);
      expect(history[0].command).toBe('build');
    });

    it('should handle missing file gracefully', async () => {
      const nonExistentFile = path.join(
        os.tmpdir(),
        'non-existent-history.json'
      );
      const newHistoryManager = new HistoryManager(nonExistentFile);
      const result = await newHistoryManager.load();

      expect(result.ok).toBe(true);
      expect(newHistoryManager.getHistory()).toEqual([]);
    });
  });

  describe('concurrency', () => {
    it('should handle concurrent recordCommand calls correctly', async () => {
      // 100回の並行呼び出しを実行
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(historyManager.recordCommand('concurrent-test'));
      }

      await Promise.all(promises);

      const history = historyManager.getHistory();
      const entry = history.find(
        (h: HistoryEntry) => h.command === 'concurrent-test'
      );

      // 全ての呼び出しが正しくカウントされていることを確認
      expect(entry).toBeDefined();
      if (entry) {
        expect(entry.frequency).toBe(100);
      }
    });

    it('should serialize concurrent save and recordCommand calls', async () => {
      // recordCommandとsaveを並行実行
      const promises = [];
      for (let i = 0; i < 10; i++) {
        promises.push(historyManager.recordCommand(`cmd-${i}`));
        if (i % 3 === 0) {
          promises.push(historyManager.save());
        }
      }

      // 全ての操作が例外なく完了することを確認
      await expect(Promise.all(promises)).resolves.toBeDefined();

      const history = historyManager.getHistory();
      expect(history.length).toBeGreaterThan(0);
    });

    it('should serialize concurrent load and recordCommand calls', async () => {
      // 初期データを保存
      await historyManager.recordCommand('initial');
      await historyManager.save();

      // loadとrecordCommandを並行実行
      const promises = [
        historyManager.load(),
        historyManager.recordCommand('new-command'),
        historyManager.load(),
        historyManager.recordCommand('another-command'),
      ];

      // 全ての操作が例外なく完了することを確認
      await expect(Promise.all(promises)).resolves.toBeDefined();

      // データの整合性を確認
      const history = historyManager.getHistory();
      expect(history.length).toBeGreaterThan(0);
    });
  });
});
