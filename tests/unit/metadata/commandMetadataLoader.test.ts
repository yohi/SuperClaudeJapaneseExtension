/**
 * CommandMetadataLoader のユニットテスト
 */

import { CommandMetadataLoader } from '../../../src/metadata/commandMetadataLoader';
import * as path from 'path';

describe('CommandMetadataLoader', () => {
  let loader: CommandMetadataLoader;
  const fixturesDir = path.join(__dirname, '../../fixtures/commands');

  beforeEach(() => {
    loader = new CommandMetadataLoader({
      maxCacheSize: 10,
      cacheTTL: 60000, // 60秒
    });
  });

  describe('loadCommand', () => {
    it('should load command metadata from file', async () => {
      const buildPath = path.join(fixturesDir, 'build.md');
      const result = await loader.loadCommand(buildPath);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.name).toBe('build');
        expect(result.value.description).toContain('Build project');
      }
    });

    it('should cache loaded command', async () => {
      const buildPath = path.join(fixturesDir, 'build.md');

      // 初回読み込み
      await loader.loadCommand(buildPath);

      // 2回目はキャッシュから取得（速い）
      const start = Date.now();
      const result = await loader.loadCommand(buildPath);
      const duration = Date.now() - start;

      expect(result.ok).toBe(true);
      expect(duration).toBeLessThan(10); // キャッシュヒットで高速
    });

    it('should return error for invalid file', async () => {
      const invalidPath = path.join(fixturesDir, 'nonexistent.md');
      const result = await loader.loadCommand(invalidPath);

      expect(result.ok).toBe(false);
    });
  });

  describe('loadCommandsFromDirectory', () => {
    it('should load all commands from directory', async () => {
      const result = await loader.loadCommandsFromDirectory(fixturesDir);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.size).toBeGreaterThan(0);
        expect(result.value.has('build')).toBe(true);
        expect(result.value.has('test')).toBe(true);
      }
    });

    it('should skip invalid files', async () => {
      const result = await loader.loadCommandsFromDirectory(fixturesDir);

      expect(result.ok).toBe(true);
      if (result.ok) {
        // invalidファイルはスキップされる
        expect(result.value.has('invalid')).toBe(false);
      }
    });

    it('should return empty map for non-existent directory', async () => {
      const nonExistentDir = path.join(fixturesDir, 'nonexistent');
      const result = await loader.loadCommandsFromDirectory(nonExistentDir);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.size).toBe(0);
      }
    });
  });

  describe('getCommand', () => {
    beforeEach(async () => {
      await loader.loadCommandsFromDirectory(fixturesDir);
    });

    it('should get cached command by name', () => {
      const result = loader.getCommand('build');

      expect(result).not.toBeNull();
      if (result) {
        expect(result.name).toBe('build');
      }
    });

    it('should return null for non-existent command', () => {
      const result = loader.getCommand('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('getAllCommands', () => {
    beforeEach(async () => {
      await loader.loadCommandsFromDirectory(fixturesDir);
    });

    it('should return all loaded commands', () => {
      const commands = loader.getAllCommands();

      expect(commands.size).toBeGreaterThan(0);
      expect(commands.has('build')).toBe(true);
      expect(commands.has('test')).toBe(true);
    });
  });

  describe('clearCache', () => {
    beforeEach(async () => {
      await loader.loadCommandsFromDirectory(fixturesDir);
    });

    it('should clear all cached commands', () => {
      loader.clearCache();

      const commands = loader.getAllCommands();

      expect(commands.size).toBe(0);
    });
  });

  describe('hasCommand', () => {
    beforeEach(async () => {
      await loader.loadCommandsFromDirectory(fixturesDir);
    });

    it('should return true for existing command', () => {
      expect(loader.hasCommand('build')).toBe(true);
    });

    it('should return false for non-existent command', () => {
      expect(loader.hasCommand('nonexistent')).toBe(false);
    });
  });
});
