"use strict";
/**
 * i18nマネージャー
 * 翻訳データの初期化、キャッシュ、言語切り替えを管理
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.I18nManager = void 0;
const translationLoader_1 = require("./translationLoader");
/**
 * i18nマネージャークラス
 */
class I18nManager {
    loader;
    currentLocale = 'en';
    translations = new Map();
    initialized = false;
    /**
     * コンストラクタ
     * @param translationsDir 翻訳ファイルのディレクトリパス
     */
    constructor(translationsDir) {
        this.loader = new translationLoader_1.TranslationLoader(translationsDir);
    }
    /**
     * 初期化
     * @param locale 初期言語ロケール
     * @returns 初期化結果
     */
    async initialize(locale) {
        try {
            const result = await this.loader.loadTranslations(locale);
            if (!result.ok) {
                return {
                    ok: false,
                    error: {
                        type: 'RESOURCE_NOT_FOUND',
                        locale,
                    },
                };
            }
            this.translations.set(locale, result.value);
            this.currentLocale = locale;
            this.initialized = true;
            return {
                ok: true,
                value: undefined,
            };
        }
        catch (error) {
            return {
                ok: false,
                error: {
                    type: 'INIT_FAILED',
                    message: error instanceof Error ? error.message : 'Unknown error occurred',
                },
            };
        }
    }
    /**
     * 翻訳を取得
     * @param key 翻訳キー（例: "commands.build.description"）
     * @param options オプション
     * @returns 翻訳文字列またはエラー
     */
    translate(key, options) {
        if (!this.initialized) {
            return {
                ok: false,
                error: {
                    type: 'TRANSLATION_NOT_FOUND',
                    key,
                    locale: this.currentLocale,
                },
            };
        }
        const translation = this.translations.get(this.currentLocale);
        if (!translation) {
            if (options?.defaultValue) {
                return {
                    ok: true,
                    value: options.defaultValue,
                };
            }
            return {
                ok: false,
                error: {
                    type: 'TRANSLATION_NOT_FOUND',
                    key,
                    locale: this.currentLocale,
                },
            };
        }
        // キーを分解してネストされた値を取得
        const value = this.getNestedValue(translation, key);
        if (value === undefined) {
            if (options?.defaultValue) {
                return {
                    ok: true,
                    value: options.defaultValue,
                };
            }
            return {
                ok: false,
                error: {
                    type: 'TRANSLATION_NOT_FOUND',
                    key,
                    locale: this.currentLocale,
                },
            };
        }
        // 補間処理
        let result = value;
        if (options?.interpolation) {
            result = this.interpolate(value, options.interpolation);
        }
        return {
            ok: true,
            value: result,
        };
    }
    /**
     * 言語を切り替える
     * @param locale 新しい言語ロケール
     * @returns 切り替え結果
     */
    async changeLanguage(locale) {
        // キャッシュにある場合はそれを使用
        if (this.translations.has(locale)) {
            this.currentLocale = locale;
            return {
                ok: true,
                value: undefined,
            };
        }
        // キャッシュにない場合は読み込む
        const result = await this.loader.loadTranslations(locale);
        if (!result.ok) {
            return {
                ok: false,
                error: {
                    type: 'RESOURCE_NOT_FOUND',
                    locale,
                },
            };
        }
        this.translations.set(locale, result.value);
        this.currentLocale = locale;
        return {
            ok: true,
            value: undefined,
        };
    }
    /**
     * 現在の言語を取得
     * @returns 現在の言語ロケール
     */
    getCurrentLocale() {
        return this.currentLocale;
    }
    /**
     * 初期化済みかどうかを確認
     * @returns 初期化済みならtrue
     */
    isInitialized() {
        return this.initialized;
    }
    /**
     * ネストされた値を取得
     * @param obj オブジェクト
     * @param path パス（例: "commands.build.description"）
     * @returns 値またはundefined
     */
    getNestedValue(obj, path) {
        const keys = path.split('.');
        let current = obj;
        for (const key of keys) {
            if (current && typeof current === 'object' && key in current) {
                current = current[key];
            }
            else {
                return undefined;
            }
        }
        return typeof current === 'string' ? current : undefined;
    }
    /**
     * 文字列の補間処理
     * @param text テキスト
     * @param values 補間する値
     * @returns 補間後のテキスト
     */
    interpolate(text, values) {
        let result = text;
        for (const [key, value] of Object.entries(values)) {
            const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
            result = result.replace(placeholder, String(value));
        }
        return result;
    }
}
exports.I18nManager = I18nManager;
//# sourceMappingURL=i18nManager.js.map