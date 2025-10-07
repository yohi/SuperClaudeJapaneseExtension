import { I18nManager } from '../i18n/i18nManager';
import { CommandMetadataLoader } from '../metadata/commandMetadataLoader';
import { FlagCombinationSuggestor } from './flagCombinationSuggestor';
import { Result, CommandContext, ContextualHint } from '../types';
/**
 * コマンドコンテキスト解析器
 * 現在のコマンド入力状態を解析し、適切なヒントを生成
 */
export declare class CommandContextAnalyzer {
    private i18nManager;
    private metadataLoader;
    private flagSuggestor;
    constructor(i18nManager: I18nManager, metadataLoader: CommandMetadataLoader, flagSuggestor: FlagCombinationSuggestor);
    /**
     * コマンドコンテキストを解析
     * @param input ユーザー入力（例: "/build --plan production"）
     * @returns コマンドコンテキスト
     */
    analyzeContext(input: string): Result<CommandContext, never>;
    /**
     * コンテキストに応じたヒントを生成
     * @param input ユーザー入力
     * @returns コンテキスト依存ヒント
     */
    getContextualHint(input: string): Result<ContextualHint, never>;
    /**
     * 動的ヒントを生成（入力に応じて変化）
     * @param input ユーザー入力
     * @returns ヒント文字列
     */
    getDynamicHint(input: string): Result<string, never>;
    /**
     * フラグ翻訳のヘルパー
     */
    private translateFlag;
}
//# sourceMappingURL=commandContextAnalyzer.d.ts.map