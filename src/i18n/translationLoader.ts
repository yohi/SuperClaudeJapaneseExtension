/**
 * 翻訳ローダー
 * 翻訳JSONファイルの読み込みとバリデーションを担当
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import type {
  Result,
  SupportedLocale,
  TranslationResource,
  LoadError,
  ValidationError,
} from '../types';

/**
 * 翻訳ローダークラス
 */
export class TranslationLoader {
  private translationsDir: string;

  /**
   * コンストラクタ
   * @param translationsDir 翻訳ファイルのディレクトリパス
   */
  constructor(translationsDir: string) {
    this.translationsDir = translationsDir;
  }

  /**
   * 翻訳データを読み込む
   * @param locale 言語ロケール
   * @returns 翻訳リソースまたはエラー
   */
  async loadTranslations(
    locale: SupportedLocale
  ): Promise<Result<TranslationResource, LoadError>> {
    try {
      // 各名前空間のファイルを読み込む
      const commandsPath = this.getTranslationPath(locale, 'commands');
      const flagsPath = this.getTranslationPath(locale, 'flags');
      const errorsPath = this.getTranslationPath(locale, 'errors');

      // ファイルの存在確認
      const filesExist = await Promise.all([
        this.fileExists(commandsPath),
        this.fileExists(flagsPath),
        this.fileExists(errorsPath),
      ]);

      if (!filesExist.every((exists) => exists)) {
        return {
          ok: false,
          error: {
            type: 'FILE_NOT_FOUND',
            path: this.getTranslationPath(locale, 'commands'),
          },
        };
      }

      // ファイルを読み込む
      const [commandsData, flagsData, errorsData] = await Promise.all([
        this.readJsonFile(commandsPath),
        this.readJsonFile(flagsPath),
        this.readJsonFile(errorsPath),
      ]);

      // 翻訳リソースを統合
      const resource: TranslationResource = {
        version: commandsData.version || '1.0.0',
        commands: commandsData.commands || {},
        flags: flagsData.flags || {},
        errors: errorsData.errors || {},
      };

      // バリデーション
      const validationResult = this.validateSchema(resource);
      if (!validationResult.ok) {
        return {
          ok: false,
          error: {
            type: 'PARSE_ERROR',
            message: 'Schema validation failed',
          },
        };
      }

      return {
        ok: true,
        value: resource,
      };
    } catch (error) {
      return {
        ok: false,
        error: {
          type: 'PARSE_ERROR',
          message:
            error instanceof Error ? error.message : 'Unknown error occurred',
        },
      };
    }
  }

  /**
   * スキーマバリデーション
   * @param data 検証するデータ
   * @returns バリデーション結果
   */
  validateSchema(
    data: unknown
  ): Result<TranslationResource, ValidationError> {
    try {
      // 基本的な型チェック
      if (typeof data !== 'object' || data === null) {
        return {
          ok: false,
          error: {
            type: 'SCHEMA_VALIDATION_FAILED',
            errors: [{ field: 'root', message: 'Data must be an object' }],
          },
        };
      }

      const resource = data as TranslationResource;

      // 必須フィールドの検証
      const errors: Array<{ field: string; message: string }> = [];

      if (!resource.version) {
        errors.push({ field: 'version', message: 'Version is required' });
      } else if (!/^\d+\.\d+\.\d+$/.test(resource.version)) {
        errors.push({
          field: 'version',
          message: 'Version must follow semantic versioning (x.y.z)',
        });
      }

      if (!resource.commands || typeof resource.commands !== 'object') {
        errors.push({
          field: 'commands',
          message: 'Commands must be an object',
        });
      }

      if (!resource.flags || typeof resource.flags !== 'object') {
        errors.push({ field: 'flags', message: 'Flags must be an object' });
      }

      if (!resource.errors || typeof resource.errors !== 'object') {
        errors.push({ field: 'errors', message: 'Errors must be an object' });
      }

      if (errors.length > 0) {
        return {
          ok: false,
          error: {
            type: 'SCHEMA_VALIDATION_FAILED',
            errors,
          },
        };
      }

      return {
        ok: true,
        value: resource,
      };
    } catch (error) {
      return {
        ok: false,
        error: {
          type: 'SCHEMA_VALIDATION_FAILED',
          errors: [
            {
              field: 'unknown',
              message:
                error instanceof Error
                  ? error.message
                  : 'Unknown validation error',
            },
          ],
        },
      };
    }
  }

  /**
   * 翻訳ファイルのパスを取得
   * @param locale 言語ロケール
   * @param namespace 名前空間（commands, flags, errors）
   * @returns ファイルパス
   */
  getTranslationPath(locale: SupportedLocale, namespace: string): string {
    return path.join(this.translationsDir, locale, `${namespace}.json`);
  }

  /**
   * JSONファイルを読み込む
   * @param filePath ファイルパス
   * @returns パースされたJSON
   */
  private async readJsonFile(filePath: string): Promise<any> {
    const content = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(content);
  }

  /**
   * ファイルの存在を確認
   * @param filePath ファイルパス
   * @returns ファイルが存在するか
   */
  private async fileExists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
