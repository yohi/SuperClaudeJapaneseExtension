#!/usr/bin/env node
"use strict";
/**
 * Claude Code 補完ヘルパースクリプト
 *
 * シェル補完スクリプト（bash/zsh）から呼び出され、
 * CompletionEngineを使用して補完候補を返すCLIツール
 *
 * 使用方法:
 *   node get-hints.js command <prefix>         # コマンド名補完
 *   node get-hints.js flag <command> <prefix>  # フラグ補完
 *
 * 出力形式:
 *   スペース区切りの候補リスト（標準出力）
 *   エラーメッセージ（標準エラー出力）
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
exports.handleCommandCompletion = handleCommandCompletion;
exports.handleFlagCompletion = handleFlagCompletion;
exports.initializeCompletionEngine = initializeCompletionEngine;
const completionEngine_1 = require("../../completion/completionEngine");
const i18nManager_1 = require("../../i18n/i18nManager");
const commandMetadataLoader_1 = require("../../metadata/commandMetadataLoader");
const path = __importStar(require("path"));
const os = __importStar(require("os"));
/**
 * 環境変数から設定を取得
 */
function getConfig() {
    return {
        locale: (process.env.CLAUDE_LANG || 'ja'),
        commandsDir: process.env.CLAUDE_COMMANDS_DIR ||
            path.join(os.homedir(), '.claude', 'commands'),
        translationsDir: process.env.CLAUDE_I18N_DIR ||
            path.join(__dirname, '../../../translations'),
    };
}
/**
 * CompletionEngineインスタンスを初期化
 */
async function initializeCompletionEngine() {
    const config = getConfig();
    // 依存コンポーネントの初期化
    const i18nManager = new i18nManager_1.I18nManager(config.translationsDir);
    await i18nManager.initialize(config.locale);
    const metadataLoader = new commandMetadataLoader_1.CommandMetadataLoader({
        maxCacheSize: 100,
        cacheTTL: 3600000, // 1時間
    });
    // TODO: コマンドメタデータを実際のコマンドディレクトリから読み込む
    // 現時点ではダミーデータを使用
    metadataLoader.registerCommand({
        name: 'build',
        description: 'Framework-detecting project builder',
        category: 'Development',
        flags: [
            { name: 'think', description: 'Enable thinking mode' },
            { name: 'plan', description: 'Enable planning mode' },
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
    const completionEngine = new completionEngine_1.CompletionEngine(metadataLoader, i18nManager);
    return completionEngine;
}
/**
 * コマンド名補完を処理
 */
async function handleCommandCompletion(prefix, engine) {
    const result = engine.completeCommand(prefix);
    if (!result.ok) {
        return '';
    }
    // 候補をスペース区切りで返す（シェル補完形式）
    return result.value.map((item) => item.name).join(' ');
}
/**
 * フラグ補完を処理
 */
async function handleFlagCompletion(command, prefix, engine) {
    const result = engine.completeFlag(command, prefix);
    if (!result.ok) {
        return '';
    }
    // 候補をスペース区切りで返す（シェル補完形式）
    return result.value.map((item) => item.name).join(' ');
}
/**
 * メイン処理
 */
async function main() {
    const args = process.argv.slice(2);
    // 引数チェック
    if (args.length < 2) {
        console.error('Usage: node get-hints.js <type> <args...>\n' +
            '  type: command | flag\n' +
            '  Examples:\n' +
            '    node get-hints.js command "b"\n' +
            '    node get-hints.js flag "build" "--p"');
        process.exit(1);
    }
    const [type, ...rest] = args;
    try {
        const engine = await initializeCompletionEngine();
        let output = '';
        switch (type) {
            case 'command': {
                const prefix = rest[0] || '';
                output = await handleCommandCompletion(prefix, engine);
                break;
            }
            case 'flag': {
                if (rest.length < 2) {
                    console.error('Error: flag補完にはコマンド名とプレフィックスが必要です');
                    process.exit(1);
                }
                const [command, prefix] = rest;
                output = await handleFlagCompletion(command, prefix, engine);
                break;
            }
            default:
                console.error(`Error: 不正な補完タイプ: ${type}`);
                console.error('有効なタイプ: command, flag');
                process.exit(1);
        }
        // 結果を標準出力に出力（シェル補完スクリプトが読み取る）
        console.log(output);
        process.exit(0);
    }
    catch (error) {
        console.error('Error: 補完候補の取得に失敗しました', error);
        // エラー時は空文字を出力（シェル補完が失敗しないように）
        console.log('');
        process.exit(0);
    }
}
// スクリプトとして実行された場合のみmainを呼び出す
if (require.main === module) {
    main().catch((error) => {
        console.error('Fatal error:', error);
        process.exit(1);
    });
}
//# sourceMappingURL=get-hints.js.map