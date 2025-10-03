/**
 * メタデータパーサー
 * YAMLフロントマターとマークダウンコマンド定義の解析
 */
import type { Result, CommandMetadata, ParseError } from '../types';
/**
 * メタデータパーサークラス
 */
export declare class MetadataParser {
    /**
     * コマンドメタデータを解析
     * @param filePath マークダウンファイルのパス
     * @returns コマンドメタデータまたはエラー
     */
    parseCommandMetadata(filePath: string): Promise<Result<CommandMetadata, ParseError>>;
    /**
     * マークダウンコンテンツからYAMLフロントマターを抽出
     * @param content マークダウンコンテンツ
     * @returns YAMLフロントマター文字列
     */
    extractFrontMatter(content: string): string;
    /**
     * YAML文字列をパース
     * @param yamlString YAML文字列
     * @returns パース結果またはエラー
     */
    parseYaml(yamlString: string): Result<any, ParseError>;
    /**
     * 全コマンドメタデータを読み込む
     * @param commandsDir コマンドディレクトリのパス
     * @returns コマンドメタデータのマップまたはエラー
     */
    loadAllCommands(commandsDir: string): Promise<Result<Map<string, CommandMetadata>, ParseError>>;
    /**
     * ディレクトリを再帰的にスキャン
     * @param dirPath ディレクトリパス
     * @param commands コマンドマップ（出力）
     */
    private scanDirectory;
}
//# sourceMappingURL=metadataParser.d.ts.map