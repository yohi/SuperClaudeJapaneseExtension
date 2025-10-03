"use strict";
/**
 * メタデータパーサー
 * YAMLフロントマターとマークダウンコマンド定義の解析
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MetadataParser = void 0;
const fs = __importStar(require("fs/promises"));
const path = __importStar(require("path"));
const yaml_1 = __importDefault(require("yaml"));
/**
 * メタデータパーサークラス
 */
class MetadataParser {
    /**
     * コマンドメタデータを解析
     * @param filePath マークダウンファイルのパス
     * @returns コマンドメタデータまたはエラー
     */
    async parseCommandMetadata(filePath) {
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
            const metadata = {
                name: commandName,
                description: yaml.description || '',
                descriptionJa: yaml['description-ja'],
                category: yaml.category,
                argumentHint: yaml['argument-hint'],
                argumentHintJa: yaml['argument-hint-ja'],
                allowedTools: yaml['allowed-tools'],
            };
            return {
                ok: true,
                value: metadata,
            };
        }
        catch (error) {
            if (error.code === 'ENOENT') {
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
    extractFrontMatter(content) {
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
    parseYaml(yamlString) {
        try {
            const parsed = yaml_1.default.parse(yamlString);
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
        }
        catch (error) {
            return {
                ok: false,
                error: {
                    type: 'YAML_PARSE_ERROR',
                    message: error instanceof Error ? error.message : 'Unknown YAML parse error',
                },
            };
        }
    }
    /**
     * 全コマンドメタデータを読み込む
     * @param commandsDir コマンドディレクトリのパス
     * @returns コマンドメタデータのマップまたはエラー
     */
    async loadAllCommands(commandsDir) {
        try {
            const commands = new Map();
            // ディレクトリを再帰的にスキャン
            await this.scanDirectory(commandsDir, commands);
            return {
                ok: true,
                value: commands,
            };
        }
        catch (error) {
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
    async scanDirectory(dirPath, commands) {
        try {
            const entries = await fs.readdir(dirPath, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dirPath, entry.name);
                if (entry.isDirectory()) {
                    // サブディレクトリを再帰的にスキャン
                    await this.scanDirectory(fullPath, commands);
                }
                else if (entry.isFile() && entry.name.endsWith('.md')) {
                    // マークダウンファイルを解析
                    const result = await this.parseCommandMetadata(fullPath);
                    if (result.ok) {
                        commands.set(result.value.name, result.value);
                    }
                }
            }
        }
        catch (error) {
            // ディレクトリ読み取りエラーは無視（権限エラーなど）
        }
    }
}
exports.MetadataParser = MetadataParser;
//# sourceMappingURL=metadataParser.js.map