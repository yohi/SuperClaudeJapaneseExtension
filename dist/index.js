"use strict";
/**
 * SuperClaude Japanese Extension
 * エントリーポイント
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_CONFIG = exports.VERSION = exports.TranslationLoader = exports.I18nManager = exports.LogLevel = void 0;
var types_1 = require("./types");
Object.defineProperty(exports, "LogLevel", { enumerable: true, get: function () { return types_1.LogLevel; } });
// i18nコンポーネント
var i18nManager_1 = require("./i18n/i18nManager");
Object.defineProperty(exports, "I18nManager", { enumerable: true, get: function () { return i18nManager_1.I18nManager; } });
var translationLoader_1 = require("./i18n/translationLoader");
Object.defineProperty(exports, "TranslationLoader", { enumerable: true, get: function () { return translationLoader_1.TranslationLoader; } });
// TODO: 他のコンポーネントの実装後に追加
// export { HintProvider } from './hint/hintProvider';
// export { CompletionEngine } from './completion/completionEngine';
// export { MetadataParser } from './metadata/metadataParser';
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