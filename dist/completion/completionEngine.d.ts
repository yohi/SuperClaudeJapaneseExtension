/**
 * 補完エンジン
 * コマンド、フラグ、引数の補完機能を提供
 */
import type { CommandMetadataLoader } from '../metadata/commandMetadataLoader';
import type { I18nManager } from '../i18n/i18nManager';
import type { CompletionCandidate, CompletionError, Result } from '../types';
/**
 * 補完エンジンクラス
 */
export declare class CompletionEngine {
    private metadataLoader;
    private i18nManager;
    constructor(metadataLoader: CommandMetadataLoader, i18nManager: I18nManager);
    /**
     * コマンド名の補完
     * @param prefix 入力プレフィックス
     * @returns 補完候補リスト
     */
    completeCommand(prefix: string): Result<CompletionCandidate[], CompletionError>;
    /**
     * フラグ補完
     * @param prefix 入力プレフィックス（例: "--p", "p", "uc"）
     * @param commandName コマンド名（フィルタリング用、オプション）
     * @returns 補完候補リスト
     */
    completeFlag(prefix: string, commandName?: string): Result<CompletionCandidate[], CompletionError>;
    /**
     * コマンドスコアの計算
     * @param commandName コマンド名
     * @param prefix 入力プレフィックス
     * @returns スコア（0.0-1.0）
     */
    private calculateCommandScore;
    /**
     * フラグスコアの計算
     * @param flagName フラグ名（--なし）
     * @param prefix 入力プレフィックス（--なし）
     * @param alias エイリアス（オプション）
     * @returns スコア（0.0-1.0）
     */
    private calculateFlagScore;
}
//# sourceMappingURL=completionEngine.d.ts.map