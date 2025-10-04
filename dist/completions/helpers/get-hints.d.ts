#!/usr/bin/env node
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
import { CompletionEngine } from '../../completion/completionEngine';
/**
 * CompletionEngineインスタンスを初期化
 */
declare function initializeCompletionEngine(): Promise<CompletionEngine>;
/**
 * コマンド名補完を処理
 */
declare function handleCommandCompletion(prefix: string, engine: CompletionEngine): Promise<string>;
/**
 * フラグ補完を処理
 */
declare function handleFlagCompletion(command: string, prefix: string, engine: CompletionEngine): Promise<string>;
export { handleCommandCompletion, handleFlagCompletion, initializeCompletionEngine };
//# sourceMappingURL=get-hints.d.ts.map