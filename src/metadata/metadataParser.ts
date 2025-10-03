/**
 * メタデータパーサー
 * YAMLフロントマターとマークダウンコマンド定義の解析
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import YAML from 'yaml';
import type { Result, CommandMetadata, ParseError } from '../types';

/**
 * メタデータパーサークラス
 */
export class MetadataParser {
  /**
   * コマンドメタデータを解析
   * @param filePath マークダウンファイルのパス
   * @returns コマンドメタデータまたはエラー
   */
  async parseCommandMetadata(
    filePath: string
  ): Promise<Result<CommandMetadata, ParseError>> {
    try {
      // ファイルを読み込む
      const content = await fs.readFile(filePath, 'utf-8');

      // YAMLフロントマターを抽出
      const frontMatter = this.extractFrontMatter(content);

      if (!frontMatter) {
        return {
          ok: false,
          error: {
            type: 'YAML_PARSE_ERROR',
            message: 'No YAML front matter found',
          },
        };
      }

      // YAMLをパース
      const yamlResult = this.parseYaml(frontMatter);

      if (!yamlResult.ok) {
        return yamlResult;
      }

      const yaml = yamlResult.value;

      // ファイル名からコマンド名を抽出
      const commandName = path.basename(filePath, '.md');

      // コマンドメタデータを構築
      const metadata: CommandMetadata = {
        name: commandName,
        description: (yaml as any).description || '',
        descriptionJa: (yaml as any)['description-ja'],
        category: (yaml as any).category,
        argumentHint: (yaml as any)['argument-hint'],
        argumentHintJa: (yaml as any)['argument-hint-ja'],
        allowedTools: (yaml as any)['allowed-tools'],
      };

      return {
        ok: true,
        value: metadata,
      };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        return {
          ok: false,
          error: {
            type: 'FILE_READ_ERROR',
            path: filePath,
          },
        };
      }

      return {
        ok: false,
        error: {
          type: 'FILE_READ_ERROR',
          path: filePath,
        },
      };
    }
  }

  /**
   * マークダウンコンテンツからYAMLフロントマターを抽出
   * @param content マークダウンコンテンツ
   * @returns YAMLフロントマター文字列
   */
  extractFrontMatter(content: string): string {
    const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---/;
    const match = content.match(frontMatterRegex);

    if (match && match[1]) {
      return match[1].trim();
    }

    return '';
  }

  /**
   * YAML文字列をパース
   * @param yamlString YAML文字列
   * @returns パース結果またはエラー
   */
  parseYaml(yamlString: string): Result<any, ParseError> {
    try {
      const parsed = YAML.parse(yamlString);

      if (parsed === null || parsed === undefined) {
        return {
          ok: false,
          error: {
            type: 'YAML_PARSE_ERROR',
            message: 'YAML parsing returned null or undefined',
          },
        };
      }

      return {
        ok: true,
        value: parsed,
      };
    } catch (error) {
      return {
        ok: false,
        error: {
          type: 'YAML_PARSE_ERROR',
          message:
            error instanceof Error ? error.message : 'Unknown YAML parse error',
        },
      };
    }
  }

  /**
   * 全コマンドメタデータを読み込む
   * @param commandsDir コマンドディレクトリのパス
   * @returns コマンドメタデータのマップまたはエラー
   */
  async loadAllCommands(
    commandsDir: string
  ): Promise<Result<Map<string, CommandMetadata>, ParseError>> {
    try {
      const commands = new Map<string, CommandMetadata>();

      // ディレクトリを再帰的にスキャン
      await this.scanDirectory(commandsDir, commands);

      return {
        ok: true,
        value: commands,
      };
    } catch (error) {
      return {
        ok: false,
        error: {
          type: 'FILE_READ_ERROR',
          path: commandsDir,
        },
      };
    }
  }

  /**
   * ディレクトリを再帰的にスキャン
   * @param dirPath ディレクトリパス
   * @param commands コマンドマップ（出力）
   */
  private async scanDirectory(
    dirPath: string,
    commands: Map<string, CommandMetadata>
  ): Promise<void> {
    try {
      const entries = await fs.readdir(dirPath, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name);

        if (entry.isDirectory()) {
          // サブディレクトリを再帰的にスキャン
          await this.scanDirectory(fullPath, commands);
        } else if (entry.isFile() && entry.name.endsWith('.md')) {
          // マークダウンファイルを解析
          const result = await this.parseCommandMetadata(fullPath);

          if (result.ok) {
            commands.set(result.value.name, result.value);
          }
        }
      }
    } catch (error) {
      // ディレクトリ読み取りエラーは無視（権限エラーなど）
    }
  }
}
