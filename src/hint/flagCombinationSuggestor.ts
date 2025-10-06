import { I18nManager } from '../i18n/i18nManager';
import { Result, FlagSuggestion, FlagConflict } from '../types';

/**
 * フラグ組み合わせサジェスター
 * フラグ間の関連性定義と競合検出を行う
 */
export class FlagCombinationSuggestor {
  private i18nManager: I18nManager;

  /**
   * フラグの関連性マップ
   * キー: フラグ名, 値: 関連するフラグと理由のリスト
   */
  private readonly flagRelations: Map<string, Array<{ flag: string; reason: string }>> = new Map([
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
  private readonly flagConflicts: Array<[string, string, 'error' | 'warning', string]> = [
    ['--no-mcp', '--seq', 'error', 'conflicts.no_mcp_with_mcp_flag'],
    ['--no-mcp', '--c7', 'error', 'conflicts.no_mcp_with_mcp_flag'],
    ['--no-mcp', '--magic', 'error', 'conflicts.no_mcp_with_mcp_flag'],
    ['--no-mcp', '--play', 'error', 'conflicts.no_mcp_with_mcp_flag'],
    ['--uc', '--verbose', 'warning', 'conflicts.uc_with_verbose'],
    ['--answer-only', '--plan', 'warning', 'conflicts.answer_only_with_plan'],
  ];

  constructor(i18nManager: I18nManager) {
    this.i18nManager = i18nManager;
  }

  /**
   * 関連するフラグを提案する
   * @param flag 対象フラグ
   * @returns 関連フラグのサジェストリスト
   */
  suggestRelatedFlags(flag: string): Result<FlagSuggestion[], never> {
    const relations = this.flagRelations.get(flag);
    if (!relations) {
      return { ok: true, value: [] };
    }

    const suggestions: FlagSuggestion[] = relations.map(({ flag: relatedFlag, reason }) => {
      const descKey = `flag_suggestions.${reason}`;
      const exampleKey = `flag_examples.${flag}_${relatedFlag}`;

      return {
        flag: relatedFlag,
        reason,
        description: this.i18nManager.translate(descKey, { defaultValue: reason }).ok
          ? this.i18nManager.translate(descKey).ok
            ? (this.i18nManager.translate(descKey) as { ok: true; value: string }).value
            : reason
          : reason,
        example: this.i18nManager.translate(exampleKey).ok
          ? (this.i18nManager.translate(exampleKey) as { ok: true; value: string }).value
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
  detectConflicts(flags: string[]): Result<FlagConflict[], never> {
    const conflicts: FlagConflict[] = [];

    for (const [flag1, flag2, severity, messageKey] of this.flagConflicts) {
      if (flags.includes(flag1) && flags.includes(flag2)) {
        const message = this.i18nManager.translate(messageKey).ok
          ? (this.i18nManager.translate(messageKey) as { ok: true; value: string }).value
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
  getSuggestionWithExample(
    currentFlag: string,
    suggestedFlag: string
  ): Result<{ suggestion: string; example: string; description: string }, never> {
    const reasonKey = this.flagRelations.get(currentFlag)?.find(r => r.flag === suggestedFlag)?.reason || '';
    const descKey = `flag_suggestions.${reasonKey}`;
    const exampleKey = `flag_examples.${currentFlag}_${suggestedFlag}`;

    const description = this.i18nManager.translate(descKey).ok
      ? (this.i18nManager.translate(descKey) as { ok: true; value: string }).value
      : reasonKey;

    const example = this.i18nManager.translate(exampleKey).ok
      ? (this.i18nManager.translate(exampleKey) as { ok: true; value: string }).value
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
