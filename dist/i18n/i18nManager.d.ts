/**
 * i18nマネージャー
 * 翻訳データの初期化、キャッシュ、言語切り替えを管理
 */
import type { Result, SupportedLocale, TranslateOptions, I18nError, TranslationNotFoundError } from '../types';
/**
 * i18nマネージャークラス
 */
export declare class I18nManager {
    private loader;
    private currentLocale;
    private translations;
    private initialized;
    /**
     * コンストラクタ
     * @param translationsDir 翻訳ファイルのディレクトリパス
     */
    constructor(translationsDir: string);
    /**
     * 初期化
     * @param locale 初期言語ロケール
     * @returns 初期化結果
     */
    initialize(locale: SupportedLocale): Promise<Result<void, I18nError>>;
    /**
     * 翻訳を取得
     * @param key 翻訳キー（例: "commands.build.description"）
     * @param options オプション
     * @returns 翻訳文字列またはエラー
     */
    translate(key: string, options?: TranslateOptions): Result<string, TranslationNotFoundError>;
    /**
     * 言語を切り替える
     * @param locale 新しい言語ロケール
     * @returns 切り替え結果
     */
    changeLanguage(locale: SupportedLocale): Promise<Result<void, I18nError>>;
    /**
     * 現在の言語を取得
     * @returns 現在の言語ロケール
     */
    getCurrentLocale(): SupportedLocale;
    /**
     * 初期化済みかどうかを確認
     * @returns 初期化済みならtrue
     */
    isInitialized(): boolean;
    /**
     * ネストされた値を取得
     * @param obj オブジェクト
     * @param path パス（例: "commands.build.description"）
     * @returns 値またはundefined
     */
    private getNestedValue;
    /**
     * 文字列の補間処理
     * @param text テキスト
     * @param values 補間する値
     * @returns 補間後のテキスト
     */
    private interpolate;
}
//# sourceMappingURL=i18nManager.d.ts.map