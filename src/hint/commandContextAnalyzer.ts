import { I18nManager } from '../i18n/i18nManager';
import { CommandMetadataLoader } from '../metadata/commandMetadataLoader';
import { FlagCombinationSuggestor } from './flagCombinationSuggestor';
import { Result, CommandContext, ContextualHint, FlagSuggestion } from '../types';

/**
 * コマンドコンテキスト解析器
 * 現在のコマンド入力状態を解析し、適切なヒントを生成
 */
export class CommandContextAnalyzer {
  private i18nManager: I18nManager;
  private metadataLoader: CommandMetadataLoader;
  private flagSuggestor: FlagCombinationSuggestor;

  constructor(
    i18nManager: I18nManager,
    metadataLoader: CommandMetadataLoader,
    flagSuggestor: FlagCombinationSuggestor
  ) {
    this.i18nManager = i18nManager;
    this.metadataLoader = metadataLoader;
    this.flagSuggestor = flagSuggestor;
  }

  /**
   * コマンドコンテキストを解析
   * @param input ユーザー入力（例: "/build --plan production"）
   * @returns コマンドコンテキスト
   */
  analyzeContext(input: string): Result<CommandContext, never> {
    // 先頭の空白のみを削除し、末尾の空白は保持してステージ検出に使用
    const hasTrailingSpace = input.endsWith(' ');
    const trimmedInput = input.trimStart();
    const parts = trimmedInput.split(/\s+/);

    // 末尾スペースがある場合、空トークンを追加してステージ遷移を検出
    if (hasTrailingSpace && trimmedInput.length > 0) {
      parts.push('');
    }

    const command = parts[0]?.replace(/^\//, '') || '';
    const flags: string[] = [];
    const args: string[] = [];

    for (let i = 1; i < parts.length; i++) {
      if (parts[i].startsWith('--')) {
        flags.push(parts[i]);
      } else if (parts[i] !== '') {
        // 空トークン以外を引数として追加
        args.push(parts[i]);
      }
    }

    // 現在の入力ステージを判定
    let stage: 'command' | 'flags' | 'arguments' = 'command';

    // 末尾に空トークンがある場合、次のステージへ遷移
    if (parts[parts.length - 1] === '') {
      if (flags.length > 0) {
        // フラグの後の空トークン -> 引数ステージ
        stage = 'arguments';
      } else if (command.length > 0) {
        // コマンドの後の空トークン -> フラグステージ
        stage = 'flags';
      }
    } else {
      // 通常のステージ判定
      if (flags.length > 0) {
        stage = 'flags';
      }
      if (args.length > 0) {
        stage = 'arguments';
      }
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
      const suggestions: FlagSuggestion[] = [];

      // 1. コマンドメタデータからフラグ定義を取得
      const commandMetadata = this.metadataLoader.getCommand(context.command);
      const commandFlags = commandMetadata?.flags || [];

      // 2. 既存のフラグセットを作成
      const existingFlags = new Set(context.flags);

      // 3. 入力されているフラグと競合するフラグを特定
      const conflictingFlags = new Set<string>();
      // FlagCombinationSuggestorから競合定義を取得
      // 既存フラグそれぞれについて競合フラグをチェック
      for (const existingFlag of context.flags) {
        // 全ての競合ペアをチェック
        const allConflicts = (this.flagSuggestor as any).flagConflicts as Array<
          [string, string, 'error' | 'warning', string]
        >;
        for (const [flag1, flag2] of allConflicts) {
          if (existingFlag === flag1) {
            conflictingFlags.add(flag2);
          } else if (existingFlag === flag2) {
            conflictingFlags.add(flag1);
          }
        }
      }

      // 4. 利用可能なフラグをフィルタリングしてマッピング
      for (const flagMeta of commandFlags) {
        const flagName = flagMeta.name.startsWith('--')
          ? flagMeta.name
          : `--${flagMeta.name}`;

        // 既に入力されているフラグと競合フラグを除外
        if (existingFlags.has(flagName) || conflictingFlags.has(flagName)) {
          continue;
        }

        // FlagSuggestionにマッピング
        const flagKey = flagName.replace(/^--/, '');
        suggestions.push({
          flag: flagName,
          reason: flagMeta.description || 'flag_option',
          description: this.translateFlag(flagKey),
        });
      }

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
