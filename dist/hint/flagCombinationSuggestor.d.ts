import { I18nManager } from '../i18n/i18nManager';
import { Result, FlagSuggestion, FlagConflict } from '../types';
/**
 * フラグ組み合わせサジェスター
 * フラグ間の関連性定義と競合検出を行う
 */
export declare class FlagCombinationSuggestor {
    private i18nManager;
    /**
     * フラグの関連性マップ
     * キー: フラグ名, 値: 関連するフラグと理由のリスト
     */
    private readonly flagRelations;
    /**
     * フラグの競合定義
     * [フラグ1, フラグ2, 重要度, メッセージキー]
     */
    private readonly flagConflicts;
    constructor(i18nManager: I18nManager);
    /**
     * 関連するフラグを提案する
     * @param flag 対象フラグ
     * @returns 関連フラグのサジェストリスト
     */
    suggestRelatedFlags(flag: string): Result<FlagSuggestion[], never>;
    /**
     * フラグ間の競合を検出する
     * @param flags フラグリスト
     * @returns 競合リスト
     */
    detectConflicts(flags: string[]): Result<FlagConflict[], never>;
    /**
     * 使用例付きサジェストを取得する
     * @param currentFlag 現在のフラグ
     * @param suggestedFlag 提案されるフラグ
     * @returns サジェスト情報
     */
    getSuggestionWithExample(currentFlag: string, suggestedFlag: string): Result<{
        suggestion: string;
        example: string;
        description: string;
    }, never>;
}
//# sourceMappingURL=flagCombinationSuggestor.d.ts.map