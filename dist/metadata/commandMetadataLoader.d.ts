/**
 * コマンドメタデータローダー
 * コマンドメタデータの読み込みとキャッシュ管理
 */
import type { Result, CommandMetadata, ParseError } from '../types';
/**
 * ローダー設定
 */
export interface LoaderConfig {
    maxCacheSize: number;
    cacheTTL: number;
}
/**
 * コマンドメタデータローダークラス
 */
export declare class CommandMetadataLoader {
    private parser;
    private cache;
    private commands;
    /**
     * コンストラクタ
     * @param config ローダー設定
     */
    constructor(config: LoaderConfig);
    /**
     * コマンドメタデータを読み込む
     * @param filePath コマンドファイルのパス
     * @returns コマンドメタデータまたはエラー
     */
    loadCommand(filePath: string): Promise<Result<CommandMetadata, ParseError>>;
    /**
     * ディレクトリから全コマンドメタデータを読み込む
     * @param dirPath ディレクトリパス
     * @returns コマンドメタデータのマップまたはエラー
     */
    loadCommandsFromDirectory(dirPath: string): Promise<Result<Map<string, CommandMetadata>, ParseError>>;
    /**
     * コマンドメタデータを取得
     * @param commandName コマンド名
     * @returns コマンドメタデータまたはnull
     */
    getCommand(commandName: string): CommandMetadata | null;
    /**
     * 全コマンドメタデータを取得
     * @returns コマンドメタデータのマップ
     */
    getAllCommands(): Map<string, CommandMetadata>;
    /**
     * コマンドが存在するか確認
     * @param commandName コマンド名
     * @returns 存在するか
     */
    hasCommand(commandName: string): boolean;
    /**
     * キャッシュをクリア
     */
    clearCache(): void;
}
//# sourceMappingURL=commandMetadataLoader.d.ts.map