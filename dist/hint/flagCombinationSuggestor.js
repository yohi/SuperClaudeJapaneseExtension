"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FlagCombinationSuggestor = void 0;
/**
 * フラグ組み合わせサジェスター
 * フラグ間の関連性定義と競合検出を行う
 */
class FlagCombinationSuggestor {
    i18nManager;
    /**
     * フラグの関連性マップ
     * キー: フラグ名, 値: 関連するフラグと理由のリスト
     */
    flagRelations = new Map([
        ['--think', [
                { flag: '--seq', reason: 'complex_analysis' },
                { flag: '--persona-analyzer', reason: 'root_cause_analysis' },
            ]],
        ['--think-hard', [
                { flag: '--seq', reason: 'deep_analysis' },
                { flag: '--c7', reason: 'pattern_research' },
                { flag: '--persona-architect', reason: 'architectural_analysis' },
            ]],
        ['--ultrathink', [
                { flag: '--seq', reason: 'critical_analysis' },
                { flag: '--c7', reason: 'comprehensive_research' },
                { flag: '--all-mcp', reason: 'maximum_capability' },
            ]],
        ['--magic', [
                { flag: '--persona-frontend', reason: 'ui_development' },
                { flag: '--c7', reason: 'component_patterns' },
            ]],
        ['--play', [
                { flag: '--persona-qa', reason: 'testing_workflow' },
                { flag: '--seq', reason: 'test_planning' },
            ]],
        ['--uc', [
                { flag: '--think', reason: 'token_optimization' },
            ]],
    ]);
    /**
     * フラグの競合定義
     * [フラグ1, フラグ2, 重要度, メッセージキー]
     */
    flagConflicts = [
        ['--no-mcp', '--seq', 'error', 'conflicts.no_mcp_with_mcp_flag'],
        ['--no-mcp', '--c7', 'error', 'conflicts.no_mcp_with_mcp_flag'],
        ['--no-mcp', '--magic', 'error', 'conflicts.no_mcp_with_mcp_flag'],
        ['--no-mcp', '--play', 'error', 'conflicts.no_mcp_with_mcp_flag'],
        ['--uc', '--verbose', 'warning', 'conflicts.uc_with_verbose'],
        ['--answer-only', '--plan', 'warning', 'conflicts.answer_only_with_plan'],
    ];
    constructor(i18nManager) {
        this.i18nManager = i18nManager;
    }
    /**
     * 関連するフラグを提案する
     * @param flag 対象フラグ
     * @returns 関連フラグのサジェストリスト
     */
    suggestRelatedFlags(flag) {
        const relations = this.flagRelations.get(flag);
        if (!relations) {
            return { ok: true, value: [] };
        }
        const suggestions = relations.map(({ flag: relatedFlag, reason }) => {
            const descKey = `flag_suggestions.${reason}`;
            const exampleKey = `flag_examples.${flag}_${relatedFlag}`;
            return {
                flag: relatedFlag,
                reason,
                description: this.i18nManager.translate(descKey, { defaultValue: reason }).ok
                    ? this.i18nManager.translate(descKey).ok
                        ? this.i18nManager.translate(descKey).value
                        : reason
                    : reason,
                example: this.i18nManager.translate(exampleKey).ok
                    ? this.i18nManager.translate(exampleKey).value
                    : undefined,
            };
        });
        return { ok: true, value: suggestions };
    }
    /**
     * フラグ間の競合を検出する
     * @param flags フラグリスト
     * @returns 競合リスト
     */
    detectConflicts(flags) {
        const conflicts = [];
        for (const [flag1, flag2, severity, messageKey] of this.flagConflicts) {
            if (flags.includes(flag1) && flags.includes(flag2)) {
                const message = this.i18nManager.translate(messageKey).ok
                    ? this.i18nManager.translate(messageKey).value
                    : `Conflict between ${flag1} and ${flag2}`;
                conflicts.push({
                    flags: [flag1, flag2],
                    severity,
                    message,
                });
            }
        }
        return { ok: true, value: conflicts };
    }
    /**
     * 使用例付きサジェストを取得する
     * @param currentFlag 現在のフラグ
     * @param suggestedFlag 提案されるフラグ
     * @returns サジェスト情報
     */
    getSuggestionWithExample(currentFlag, suggestedFlag) {
        const reasonKey = this.flagRelations.get(currentFlag)?.find(r => r.flag === suggestedFlag)?.reason || '';
        const descKey = `flag_suggestions.${reasonKey}`;
        const exampleKey = `flag_examples.${currentFlag}_${suggestedFlag}`;
        const description = this.i18nManager.translate(descKey).ok
            ? this.i18nManager.translate(descKey).value
            : reasonKey;
        const example = this.i18nManager.translate(exampleKey).ok
            ? this.i18nManager.translate(exampleKey).value
            : `${currentFlag} ${suggestedFlag}`;
        return {
            ok: true,
            value: {
                suggestion: suggestedFlag,
                example,
                description,
            },
        };
    }
}
exports.FlagCombinationSuggestor = FlagCombinationSuggestor;
//# sourceMappingURL=flagCombinationSuggestor.js.map