"use strict";
/**
 * 翻訳ローダー
 * 翻訳JSONファイルの読み込みとバリデーションを担当
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationLoader = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
/**
 * 翻訳ローダークラス
 */
class TranslationLoader {
    translationsDir;
    /**
     * コンストラクタ
     * @param translationsDir 翻訳ファイルのディレクトリパス
     */
    constructor(translationsDir) {
        this.translationsDir = translationsDir;
    }
    /**
     * 翻訳データを読み込む
     * @param locale 言語ロケール
     * @returns 翻訳リソースまたはエラー
     */
    async loadTranslations(locale) {
        try {
            // 各名前空間のファイルを読み込む
            const commandsPath = this.getTranslationPath(locale, 'commands');
            const flagsPath = this.getTranslationPath(locale, 'flags');
            const errorsPath = this.getTranslationPath(locale, 'errors');
            const argumentsPath = this.getTranslationPath(locale, 'arguments');
            // ファイルの存在確認（argumentsはオプショナル）
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
            // argumentsファイルはオプショナル
            let argumentsData = {};
            const argumentsExists = await this.fileExists(argumentsPath);
            if (argumentsExists) {
                argumentsData = await this.readJsonFile(argumentsPath);
            }
            // 翻訳リソースを統合
            const resource = {
                version: commandsData.version || '1.0.0',
                commands: commandsData.commands || {},
                flags: flagsData.flags || {},
                errors: errorsData.errors || {},
                arguments: argumentsData,
                flag_suggestions: flagsData.flag_suggestions,
                flag_examples: flagsData.flag_examples,
                conflicts: flagsData.conflicts,
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
        }
        catch (error) {
            return {
                ok: false,
                error: {
                    type: 'PARSE_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown error occurred',
                },
            };
        }
    }
    /**
     * スキーマバリデーション
     * @param data 検証するデータ
     * @returns バリデーション結果
     */
    validateSchema(data) {
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
            const resource = data;
            // 必須フィールドの検証
            const errors = [];
            if (!resource.version) {
                errors.push({ field: 'version', message: 'Version is required' });
            }
            else if (!/^\d+\.\d+\.\d+$/.test(resource.version)) {
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
        }
        catch (error) {
            return {
                ok: false,
                error: {
                    type: 'SCHEMA_VALIDATION_FAILED',
                    errors: [
                        {
                            field: 'unknown',
                            message: error instanceof Error
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
    getTranslationPath(locale, namespace) {
        return path.join(this.translationsDir, locale, `${namespace}.json`);
    }
    /**
     * JSONファイルを読み込む
     * @param filePath ファイルパス
     * @returns パースされたJSON
     */
    async readJsonFile(filePath) {
        const content = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(content);
    }
    /**
     * ファイルの存在を確認
     * @param filePath ファイルパス
     * @returns ファイルが存在するか
     */
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        }
        catch {
            return false;
        }
    }
}
exports.TranslationLoader = TranslationLoader;
//# sourceMappingURL=translationLoader.js.map