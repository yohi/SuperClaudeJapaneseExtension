"use strict";
/**
 * コマンドメタデータローダー
 * コマンドメタデータの読み込みとキャッシュ管理
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandMetadataLoader = void 0;
const metadataParser_1 = require("./metadataParser");
const cacheManager_1 = require("../cache/cacheManager");
/**
 * コマンドメタデータローダークラス
 */
class CommandMetadataLoader {
    parser;
    cache;
    commands;
    /**
     * コンストラクタ
     * @param config ローダー設定
     */
    constructor(config) {
        this.parser = new metadataParser_1.MetadataParser();
        this.cache = new cacheManager_1.CacheManager({
            maxSize: config.maxCacheSize,
            ttl: config.cacheTTL,
        });
        this.commands = new Map();
    }
    /**
     * コマンドメタデータを読み込む
     * @param filePath コマンドファイルのパス
     * @returns コマンドメタデータまたはエラー
     */
    async loadCommand(filePath) {
        // キャッシュをチェック
        const cached = this.cache.get(filePath);
        if (cached) {
            return {
                ok: true,
                value: cached,
            };
        }
        // ファイルを解析
        const result = await this.parser.parseCommandMetadata(filePath);
        if (result.ok) {
            // キャッシュに保存
            this.cache.set(filePath, result.value);
            // コマンドマップに追加
            this.commands.set(result.value.name, result.value);
        }
        return result;
    }
    /**
     * ディレクトリから全コマンドメタデータを読み込む
     * @param dirPath ディレクトリパス
     * @returns コマンドメタデータのマップまたはエラー
     */
    async loadCommandsFromDirectory(dirPath) {
        const result = await this.parser.loadAllCommands(dirPath);
        if (result.ok) {
            // コマンドマップを更新
            for (const [name, metadata] of result.value.entries()) {
                this.commands.set(name, metadata);
            }
        }
        return result;
    }
    /**
     * コマンドメタデータを取得
     * @param commandName コマンド名
     * @returns コマンドメタデータまたはnull
     */
    getCommand(commandName) {
        return this.commands.get(commandName) || null;
    }
    /**
     * 全コマンドメタデータを取得
     * @returns コマンドメタデータのマップ
     */
    getAllCommands() {
        return new Map(this.commands);
    }
    /**
     * コマンドが存在するか確認
     * @param commandName コマンド名
     * @returns 存在するか
     */
    hasCommand(commandName) {
        return this.commands.has(commandName);
    }
    /**
     * キャッシュをクリア
     */
    clearCache() {
        this.cache.clear();
        this.commands.clear();
    }
}
exports.CommandMetadataLoader = CommandMetadataLoader;
//# sourceMappingURL=commandMetadataLoader.js.map