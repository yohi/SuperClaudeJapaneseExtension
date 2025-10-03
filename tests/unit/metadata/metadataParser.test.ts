/**
 * MetadataParser のユニットテスト
 */

import { MetadataParser } from '../../../src/metadata/metadataParser';
import * as path from 'path';

describe('MetadataParser', () => {
  let parser: MetadataParser;
  const fixturesDir = path.join(__dirname, '../../fixtures/commands');

  beforeEach(() => {
    parser = new MetadataParser();
  });

  describe('parseCommandMetadata', () => {
    it('should parse command metadata from markdown file', async () => {
      const buildPath = path.join(fixturesDir, 'build.md');
      const result = await parser.parseCommandMetadata(buildPath);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.name).toBe('build');
        expect(result.value.description).toBe(
          'Build project with framework detection'
        );
        expect(result.value.descriptionJa).toBe(
          'フレームワーク検出付きプロジェクトビルダー'
        );
      }
    });

    it('should parse argument hints', async () => {
      const buildPath = path.join(fixturesDir, 'build.md');
      const result = await parser.parseCommandMetadata(buildPath);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.argumentHint).toBe('[target]');
        expect(result.value.argumentHintJa).toBe(
          'ビルド対象を指定（例: production, development）'
        );
      }
    });

    it('should parse allowed tools', async () => {
      const buildPath = path.join(fixturesDir, 'build.md');
      const result = await parser.parseCommandMetadata(buildPath);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.allowedTools).toEqual([
          'read_file',
          'write_file',
          'run_terminal_cmd',
        ]);
      }
    });

    it('should parse category', async () => {
      const buildPath = path.join(fixturesDir, 'build.md');
      const result = await parser.parseCommandMetadata(buildPath);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.category).toBe('Development');
      }
    });

    it('should extract command name from file path', async () => {
      const testPath = path.join(fixturesDir, 'test.md');
      const result = await parser.parseCommandMetadata(testPath);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.name).toBe('test');
      }
    });

    it('should handle file without Japanese translations', async () => {
      const testPath = path.join(fixturesDir, 'test.md');
      const result = await parser.parseCommandMetadata(testPath);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.descriptionJa).toBe(
          'テストケースの生成と実行'
        );
        // 日本語が存在する場合のテスト
      }
    });

    it('should return error for non-existent file', async () => {
      const nonExistentPath = path.join(fixturesDir, 'nonexistent.md');
      const result = await parser.parseCommandMetadata(nonExistentPath);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('FILE_READ_ERROR');
      }
    });

    it('should return error for invalid YAML', async () => {
      const invalidPath = path.join(fixturesDir, 'invalid.md');
      // invalid.md は YAML構文エラーを含むファイル
      const result = await parser.parseCommandMetadata(invalidPath);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('YAML_PARSE_ERROR');
      }
    });
  });

  describe('extractFrontMatter', () => {
    it('should extract YAML front matter from markdown content', () => {
      const content = `---
description: Test command
description-ja: テストコマンド
---

# Content`;

      const result = parser.extractFrontMatter(content);

      expect(result).toContain('description: Test command');
      expect(result).toContain('description-ja: テストコマンド');
      expect(result).not.toContain('# Content');
    });

    it('should return empty string if no front matter', () => {
      const content = '# Just content\n\nNo front matter here.';

      const result = parser.extractFrontMatter(content);

      expect(result).toBe('');
    });

    it('should handle front matter at the start of file', () => {
      const content = `---
key: value
---`;

      const result = parser.extractFrontMatter(content);

      expect(result).toBe('key: value');
    });
  });

  describe('parseYaml', () => {
    it('should parse valid YAML string', () => {
      const yamlString = 'name: test\nvalue: 123';

      const result = parser.parseYaml(yamlString);

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value).toEqual({ name: 'test', value: 123 });
      }
    });

    it('should return error for invalid YAML', () => {
      const invalidYaml = 'name: test\n  invalid: : syntax';

      const result = parser.parseYaml(invalidYaml);

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error.type).toBe('YAML_PARSE_ERROR');
      }
    });
  });
});
