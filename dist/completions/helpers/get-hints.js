#!/usr/bin/env node
"use strict";
/**
 * シェル補完ヘルパースクリプト
 *
 * 使用方法:
 *   node get-hints.js command <prefix>
 *   node get-hints.js flag <command> <prefix>
 *
 * 出力: スペース区切りの補完候補リスト
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
const completionEngine_1 = require("../../completion/completionEngine");
const i18nManager_1 = require("../../i18n/i18nManager");
const commandMetadataLoader_1 = require("../../metadata/commandMetadataLoader");
const path = __importStar(require("path"));
/**
 * メイン処理
 */
async function main() {
    try {
        const args = process.argv.slice(2);
        // 引数チェック
        if (args.length < 2) {
            // 引数不足の場合は何も出力しない
            process.exit(0);
        }
        const completionType = args[0];
        const locale = process.env.CLAUDE_LANG || 'ja';
        // i18nManagerの初期化
        // 実行時のパス: dist/completions/helpers/get-hints.js
        // translationsディレクトリ: プロジェクトルート/translations
        const translationsDir = path.join(__dirname, '../../../translations');
        const i18nManager = new i18nManager_1.I18nManager(translationsDir);
        const initResult = await i18nManager.initialize(locale);
        if (!initResult.ok) {
            // 初期化失敗時は何も出力しない
            process.exit(0);
        }
        // CommandMetadataLoaderの初期化
        const metadataLoader = new commandMetadataLoader_1.CommandMetadataLoader({
            maxCacheSize: 100,
            cacheTTL: 3600000, // 1 hour
        });
        // ダミーのコマンドメタデータを登録（テスト用）
        // 実際の実装では、コマンドディレクトリから読み込む
        metadataLoader.registerCommand({
            name: 'build',
            description: 'Framework-detecting project builder',
            category: 'Development',
            flags: [
                {
                    name: 'think',
                    description: 'Enable thinking mode',
                },
                {
                    name: 'plan',
                    description: 'Enable planning mode',
                },
            ],
        });
        metadataLoader.registerCommand({
            name: 'implement',
            description: 'Feature and code implementation',
            category: 'Development',
        });
        metadataLoader.registerCommand({
            name: 'analyze',
            description: 'Code quality and security analysis',
            category: 'Analysis',
        });
        // CompletionEngineの初期化
        const completionEngine = new completionEngine_1.CompletionEngine(metadataLoader, i18nManager);
        let candidates = [];
        if (completionType === 'command') {
            // コマンド名補完
            const prefix = args[1];
            const result = completionEngine.completeCommand(prefix);
            if (result.ok) {
                candidates = result.value.map((item) => item.name);
            }
        }
        else if (completionType === 'flag') {
            // フラグ補完
            if (args.length < 3) {
                process.exit(0);
            }
            const commandName = args[1];
            const prefix = args[2];
            const result = completionEngine.completeFlag(prefix, commandName);
            if (result.ok) {
                candidates = result.value.map((item) => item.name);
            }
        }
        // スペース区切りで出力
        console.log(candidates.join(' '));
    }
    catch (error) {
        // エラー時は何も出力しない（シェルでエラーにならないように）
        process.exit(0);
    }
}
// スクリプト実行
main();
//# sourceMappingURL=get-hints.js.map