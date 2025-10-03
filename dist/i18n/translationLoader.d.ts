/**
 * 翻訳ローダー
 * 翻訳JSONファイルの読み込みとバリデーションを担当
 */
import type { Result, SupportedLocale, TranslationResource, LoadError, ValidationError } from '../types';
/**
 * 翻訳ローダークラス
 */
export declare class TranslationLoader {
    private translationsDir;
    /**
     * コンストラクタ
     * @param translationsDir 翻訳ファイルのディレクトリパス
     */
    constructor(translationsDir: string);
    /**
     * 翻訳データを読み込む
     * @param locale 言語ロケール
     * @returns 翻訳リソースまたはエラー
     */
    loadTranslations(locale: SupportedLocale): Promise<Result<TranslationResource, LoadError>>;
    /**
     * スキーマバリデーション
     * @param data 検証するデータ
     * @returns バリデーション結果
     */
    validateSchema(data: unknown): Result<TranslationResource, ValidationError>;
    /**
     * 翻訳ファイルのパスを取得
     * @param locale 言語ロケール
     * @param namespace 名前空間（commands, flags, errors）
     * @returns ファイルパス
     */
    getTranslationPath(locale: SupportedLocale, namespace: string): string;
    /**
     * JSONファイルを読み込む
     * @param filePath ファイルパス
     * @returns パースされたJSON
     */
    private readJsonFile;
    /**
     * ファイルの存在を確認
     * @param filePath ファイルパス
     * @returns ファイルが存在するか
     */
    private fileExists;
}
//# sourceMappingURL=translationLoader.d.ts.map