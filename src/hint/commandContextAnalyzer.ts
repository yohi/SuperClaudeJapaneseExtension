import { I18nManager } from '../i18n/i18nManager';
import { CommandMetadataLoader } from '../metadata/commandMetadataLoader';
import { Result, CommandContext, ContextualHint, FlagSuggestion } from '../types';

/**
 * コマンドコンテキスト解析器
 * 現在のコマンド入力状態を解析し、適切なヒントを生成
 */
export class CommandContextAnalyzer {
  private i18nManager: I18nManager;
  private metadataLoader: CommandMetadataLoader;

  constructor(i18nManager: I18nManager, metadataLoader: CommandMetadataLoader) {
    this.i18nManager = i18nManager;
    this.metadataLoader = metadataLoader;
  }

  /**
   * コマンドコンテキストを解析
   * @param input ユーザー入力（例: "/build --plan production"）
   * @returns コマンドコンテキスト
   */
  analyzeContext(input: string): Result<CommandContext, never> {
    const parts = input.trim().split(/\s+/);
    const command = parts[0]?.replace(/^\//, '') || '';
    const flags: string[] = [];
    const args: string[] = [];

    for (let i = 1; i < parts.length; i++) {
      if (parts[i].startsWith('--')) {
        flags.push(parts[i]);
      } else {
        args.push(parts[i]);
      }
    }

    // 現在の入力ステージを判定
    let stage: 'command' | 'flags' | 'arguments' = 'command';
    if (flags.length > 0) {
      stage = 'flags';
    }
    if (args.length > 0) {
      stage = 'arguments';
    }

    return {
      ok: true,
      value: {
        command,
        flags,
        arguments: args,
        stage,
      },
    };
  }

  /**
   * コンテキストに応じたヒントを生成
   * @param input ユーザー入力
   * @returns コンテキスト依存ヒント
   */
  getContextualHint(input: string): Result<ContextualHint, never> {
    const contextResult = this.analyzeContext(input);
    if (!contextResult.ok) {
      return {
        ok: true,
        value: {
          hint: '',
          type: 'command_description',
          suggestions: [],
        },
      };
    }

    const context = contextResult.value;

    // コマンドステージ: コマンド説明を表示
    if (context.stage === 'command') {
      const descKey = `commands.${context.command}.description`;
      const description = this.i18nManager.translate(descKey).ok
        ? (this.i18nManager.translate(descKey) as { ok: true; value: string }).value
        : `Command: ${context.command}`;

      return {
        ok: true,
        value: {
          hint: description,
          type: 'command_description',
          suggestions: [],
        },
      };
    }

    // フラグステージ: フラグサジェストを表示
    if (context.stage === 'flags' || input.endsWith('--')) {
      const suggestions: FlagSuggestion[] = [
        { flag: '--plan', reason: 'show_plan', description: this.translateFlag('plan') },
        { flag: '--think', reason: 'show_thinking', description: this.translateFlag('think') },
        { flag: '--uc', reason: 'compress_output', description: this.translateFlag('uc') },
      ];

      return {
        ok: true,
        value: {
          hint: '利用可能なフラグ:',
          type: 'flag_suggestions',
          suggestions,
        },
      };
    }

    // 引数ステージ: 引数ヒントを表示
    const argKey = `commands.${context.command}.arguments`;
    const argHint = this.i18nManager.translate(argKey).ok
      ? (this.i18nManager.translate(argKey) as { ok: true; value: string }).value
      : 'Enter argument';

    return {
      ok: true,
      value: {
        hint: argHint,
        type: 'argument_hint',
        suggestions: [],
      },
    };
  }

  /**
   * 動的ヒントを生成（入力に応じて変化）
   * @param input ユーザー入力
   * @returns ヒント文字列
   */
  getDynamicHint(input: string): Result<string, never> {
    const contextResult = this.analyzeContext(input);
    if (!contextResult.ok) {
      return { ok: true, value: '' };
    }

    const context = contextResult.value;
    const parts: string[] = [];

    // コマンド情報
    if (context.command) {
      const descKey = `commands.${context.command}.description`;
      const desc = this.i18nManager.translate(descKey).ok
        ? (this.i18nManager.translate(descKey) as { ok: true; value: string }).value
        : context.command;
      parts.push(`コマンド: ${desc}`);
    }

    // フラグ情報
    if (context.flags.length > 0) {
      const flagDescs = context.flags.map(flag => {
        const flagName = flag.replace(/^--/, '');
        return this.translateFlag(flagName);
      });
      parts.push(`フラグ: ${flagDescs.join(', ')}`);
    }

    // 引数情報
    if (context.arguments.length > 0) {
      parts.push(`引数: ${context.arguments.join(', ')}`);
    }

    return { ok: true, value: parts.join(' | ') };
  }

  /**
   * フラグ翻訳のヘルパー
   */
  private translateFlag(flagName: string): string {
    const key = `flags.${flagName}.description`;
    const result = this.i18nManager.translate(key);
    return result.ok ? (result as { ok: true; value: string }).value : flagName;
  }
}
