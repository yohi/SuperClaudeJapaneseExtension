"use strict";
/**
 * SuperClaude Japanese Extension
 * エントリーポイント
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONFIG = exports.VERSION = exports.CacheManager = exports.CompletionEngine = exports.HintProvider = exports.CommandMetadataLoader = exports.MetadataParser = exports.TranslationLoader = exports.I18nManager = exports.LogLevel = void 0;
var types_1 = require("./types");
Object.defineProperty(exports, "LogLevel", { enumerable: true, get: function () { return types_1.LogLevel; } });
// i18nコンポーネント
var i18nManager_1 = require("./i18n/i18nManager");
Object.defineProperty(exports, "I18nManager", { enumerable: true, get: function () { return i18nManager_1.I18nManager; } });
var translationLoader_1 = require("./i18n/translationLoader");
Object.defineProperty(exports, "TranslationLoader", { enumerable: true, get: function () { return translationLoader_1.TranslationLoader; } });
// メタデータコンポーネント
var metadataParser_1 = require("./metadata/metadataParser");
Object.defineProperty(exports, "MetadataParser", { enumerable: true, get: function () { return metadataParser_1.MetadataParser; } });
var commandMetadataLoader_1 = require("./metadata/commandMetadataLoader");
Object.defineProperty(exports, "CommandMetadataLoader", { enumerable: true, get: function () { return commandMetadataLoader_1.CommandMetadataLoader; } });
// ヒントコンポーネント
var hintProvider_1 = require("./hint/hintProvider");
Object.defineProperty(exports, "HintProvider", { enumerable: true, get: function () { return hintProvider_1.HintProvider; } });
// 補完コンポーネント
var completionEngine_1 = require("./completion/completionEngine");
Object.defineProperty(exports, "CompletionEngine", { enumerable: true, get: function () { return completionEngine_1.CompletionEngine; } });
// キャッシュコンポーネント
var cacheManager_1 = require("./cache/cacheManager");
Object.defineProperty(exports, "CacheManager", { enumerable: true, get: function () { return cacheManager_1.CacheManager; } });
/**
 * バージョン情報
 */
exports.VERSION = '1.0.0';
/**
 * デフォルト設定
 */
exports.DEFAULT_CONFIG = {
    locale: 'ja',
    cacheTtl: 3600000, // 1時間
    maxCacheSize: 100,
    logLevel: 'INFO',
};
//# sourceMappingURL=index.js.map