"use strict";
/**
 * ヒント提供システム
 * コマンド、フラグ、引数のヒントを生成
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HintProvider = void 0;
const chalk_1 = __importDefault(require("chalk"));
/**
 * ヒント提供クラス
 */
class HintProvider {
    i18nManager;
    metadataLoader;
    hintCache;
    /**
     * コンストラクタ
     * @param i18nManager 国際化マネージャー
     * @param metadataLoader メタデータローダー
     */
    constructor(i18nManager, metadataLoader) {
        this.i18nManager = i18nManager;
        this.metadataLoader = metadataLoader;
        this.hintCache = new Map();
    }
    /**
     * コマンドヒントを生成（色付き）
     * @param commandName コマンド名
     * @returns ヒント文字列またはエラー
     */
    generateCommandHint(commandName) {
        // キャッシュをチェック
        const cacheKey = `${commandName}:${this.i18nManager.getCurrentLocale()}`;
        const cached = this.hintCache.get(cacheKey);
        if (cached) {
            return {
                ok: true,
                value: cached,
            };
        }
        // コマンドメタデータを取得
        const metadata = this.metadataLoader.getCommand(commandName);
        if (!metadata) {
            return {
                ok: false,
                error: {
                    type: 'COMMAND_NOT_FOUND',
                    command: commandName,
                },
            };
        }
        // 翻訳を取得（フォールバック付き）
        const description = this.getDescription(commandName, metadata);
        const argumentHint = this.getArgumentHint(commandName, metadata);
        // ヒントを構築
        let hint = '';
        // コマンド名（青色、太字）
        hint += chalk_1.default.bold.blue(`/${commandName}`);
        // 引数ヒント（グレー）
        if (argumentHint) {
            hint += ` ${chalk_1.default.gray(argumentHint)}`;
        }
        hint += '\n';
        // 説明（通常）
        hint += `  ${description}`;
        // カテゴリー（黄色）
        if (metadata.category) {
            hint += `\n  ${chalk_1.default.yellow(`[${metadata.category}]`)}`;
        }
        // キャッシュに保存
        this.hintCache.set(cacheKey, hint);
        return {
            ok: true,
            value: hint,
        };
    }
    /**
     * コマンドヒントを生成（プレーンテキスト）
     * @param commandName コマンド名
     * @returns ヒント文字列またはエラー
     */
    generateCommandHintPlain(commandName) {
        // コマンドメタデータを取得
        const metadata = this.metadataLoader.getCommand(commandName);
        if (!metadata) {
            return {
                ok: false,
                error: {
                    type: 'COMMAND_NOT_FOUND',
                    command: commandName,
                },
            };
        }
        // 翻訳を取得（フォールバック付き）
        const description = this.getDescription(commandName, metadata);
        const argumentHint = this.getArgumentHint(commandName, metadata);
        // ヒントを構築（色なし）
        let hint = '';
        // コマンド名
        hint += `/${commandName}`;
        // 引数ヒント
        if (argumentHint) {
            hint += ` ${argumentHint}`;
        }
        hint += '\n';
        // 説明
        hint += `  ${description}`;
        // カテゴリー
        if (metadata.category) {
            hint += `\n  [${metadata.category}]`;
        }
        return {
            ok: true,
            value: hint,
        };
    }
    /**
     * 説明を取得（フォールバック付き）
     * @param commandName コマンド名
     * @param metadata コマンドメタデータ
     * @returns 説明文字列
     */
    getDescription(commandName, metadata) {
        const locale = this.i18nManager.getCurrentLocale();
        // 1. 翻訳データから取得を試みる
        const translationKey = `commands.${commandName}.description`;
        const translationResult = this.i18nManager.translate(translationKey);
        if (translationResult.ok) {
            return translationResult.value;
        }
        // 2. メタデータの日本語説明を使用
        if (locale === 'ja' && metadata.descriptionJa) {
            return metadata.descriptionJa;
        }
        // 3. メタデータの英語説明を使用（フォールバック）
        if (metadata.description) {
            return metadata.description;
        }
        // 4. デフォルトメッセージ
        return locale === 'ja' ? '説明なし' : 'No description available';
    }
    /**
     * 引数ヒントを取得（フォールバック付き）
     * @param commandName コマンド名
     * @param metadata コマンドメタデータ
     * @returns 引数ヒント文字列
     */
    getArgumentHint(commandName, metadata) {
        const locale = this.i18nManager.getCurrentLocale();
        // 1. 翻訳データから取得を試みる
        const translationKey = `commands.${commandName}.arguments`;
        const translationResult = this.i18nManager.translate(translationKey);
        if (translationResult.ok && translationResult.value) {
            return translationResult.value;
        }
        // 2. メタデータの日本語引数ヒントを使用
        if (locale === 'ja' && metadata.argumentHintJa) {
            return metadata.argumentHintJa;
        }
        // 3. メタデータの英語引数ヒントを使用（フォールバック）
        if (metadata.argumentHint) {
            return metadata.argumentHint;
        }
        return '';
    }
    /**
     * フラグヒントを生成（色付き）
     * @param flagName フラグ名
     * @returns ヒント文字列またはエラー
     */
    generateFlagHint(flagName) {
        // キャッシュをチェック
        const cacheKey = `flag:${flagName}:${this.i18nManager.getCurrentLocale()}`;
        const cached = this.hintCache.get(cacheKey);
        if (cached) {
            return {
                ok: true,
                value: cached,
            };
        }
        // 翻訳を取得
        const flagTranslation = this.getFlagTranslation(flagName);
        if (!flagTranslation) {
            return {
                ok: false,
                error: {
                    type: 'FLAG_NOT_FOUND',
                    flag: flagName,
                },
            };
        }
        // ヒントを構築
        let hint = '';
        // フラグ名（緑色、太字）
        hint += chalk_1.default.bold.green(`--${flagName}`);
        // エイリアス（マゼンタ）
        if (flagTranslation.alias) {
            hint += ` ${chalk_1.default.magenta(`(--${flagTranslation.alias})`)}`;
        }
        hint += '\n';
        // 説明（通常）
        hint += `  ${flagTranslation.description}`;
        // 使用例（シアン）
        if (flagTranslation.example) {
            const locale = this.i18nManager.getCurrentLocale();
            const exampleLabel = locale === 'ja' ? '例:' : 'Example:';
            hint += `\n  ${chalk_1.default.cyan(exampleLabel)} ${chalk_1.default.gray(flagTranslation.example)}`;
        }
        // キャッシュに保存
        this.hintCache.set(cacheKey, hint);
        return {
            ok: true,
            value: hint,
        };
    }
    /**
     * フラグヒントを生成（プレーンテキスト）
     * @param flagName フラグ名
     * @returns ヒント文字列またはエラー
     */
    generateFlagHintPlain(flagName) {
        // 翻訳を取得
        const flagTranslation = this.getFlagTranslation(flagName);
        if (!flagTranslation) {
            return {
                ok: false,
                error: {
                    type: 'FLAG_NOT_FOUND',
                    flag: flagName,
                },
            };
        }
        // ヒントを構築（色なし）
        let hint = '';
        // フラグ名
        hint += `--${flagName}`;
        // エイリアス
        if (flagTranslation.alias) {
            hint += ` (--${flagTranslation.alias})`;
        }
        hint += '\n';
        // 説明
        hint += `  ${flagTranslation.description}`;
        // 使用例
        if (flagTranslation.example) {
            const locale = this.i18nManager.getCurrentLocale();
            const exampleLabel = locale === 'ja' ? '例:' : 'Example:';
            hint += `\n  ${exampleLabel} ${flagTranslation.example}`;
        }
        return {
            ok: true,
            value: hint,
        };
    }
    /**
     * フラグ翻訳を取得（フォールバック付き）
     * @param flagName フラグ名
     * @returns フラグ翻訳またはnull
     */
    getFlagTranslation(flagName) {
        // 個別のキーで取得を試みる
        const descriptionKey = `flags.${flagName}.description`;
        const aliasKey = `flags.${flagName}.alias`;
        const exampleKey = `flags.${flagName}.example`;
        const descriptionResult = this.i18nManager.translate(descriptionKey);
        // 説明が見つからない場合はnullを返す
        if (!descriptionResult.ok) {
            return null;
        }
        const aliasResult = this.i18nManager.translate(aliasKey);
        const exampleResult = this.i18nManager.translate(exampleKey);
        return {
            description: descriptionResult.value,
            alias: aliasResult.ok ? aliasResult.value : undefined,
            example: exampleResult.ok ? exampleResult.value : undefined,
        };
    }
    /**
     * 引数ヒントを生成（色付き）
     * @param commandName コマンド名
     * @param argumentName 引数名（例: "target", "@config.json"）
     * @returns ヒント文字列またはエラー
     */
    generateArgumentHint(commandName, argumentName) {
        // キャッシュをチェック
        const cacheKey = `arg:${commandName}:${argumentName}:${this.i18nManager.getCurrentLocale()}`;
        const cached = this.hintCache.get(cacheKey);
        if (cached) {
            return {
                ok: true,
                value: cached,
            };
        }
        // コマンドメタデータを取得
        const metadata = this.metadataLoader.getCommand(commandName);
        if (!metadata) {
            return {
                ok: false,
                error: {
                    type: 'COMMAND_NOT_FOUND',
                    command: commandName,
                },
            };
        }
        // @<path> 記法の検出
        const isFilePath = argumentName.startsWith('@');
        const cleanArgName = isFilePath
            ? argumentName.substring(1)
            : argumentName;
        // 引数翻訳を取得
        const argumentTranslation = this.getArgumentTranslation(commandName, cleanArgName);
        if (!argumentTranslation && !isFilePath) {
            return {
                ok: false,
                error: {
                    type: 'ARGUMENT_NOT_FOUND',
                    command: commandName,
                    argument: argumentName,
                },
            };
        }
        // ヒントを構築
        let hint = '';
        const locale = this.i18nManager.getCurrentLocale();
        // 引数名（黄色、太字）
        hint += chalk_1.default.bold.yellow(argumentName);
        // @<path> 記法の場合
        if (isFilePath) {
            const filePathLabel = locale === 'ja' ? 'ファイルパス引数' : 'File path argument';
            hint += ` ${chalk_1.default.gray(`(${filePathLabel})`)}`;
        }
        hint += '\n';
        // 説明
        if (argumentTranslation) {
            hint += `  ${argumentTranslation}`;
        }
        else if (isFilePath) {
            const defaultDesc = locale === 'ja'
                ? 'ファイルパスを指定'
                : 'Specify file path';
            hint += `  ${defaultDesc}`;
        }
        // キャッシュに保存
        this.hintCache.set(cacheKey, hint);
        return {
            ok: true,
            value: hint,
        };
    }
    /**
     * 引数ヒントを生成（プレーンテキスト）
     * @param commandName コマンド名
     * @param argumentName 引数名
     * @returns ヒント文字列またはエラー
     */
    generateArgumentHintPlain(commandName, argumentName) {
        // コマンドメタデータを取得
        const metadata = this.metadataLoader.getCommand(commandName);
        if (!metadata) {
            return {
                ok: false,
                error: {
                    type: 'COMMAND_NOT_FOUND',
                    command: commandName,
                },
            };
        }
        // @<path> 記法の検出
        const isFilePath = argumentName.startsWith('@');
        const cleanArgName = isFilePath
            ? argumentName.substring(1)
            : argumentName;
        // 引数翻訳を取得
        const argumentTranslation = this.getArgumentTranslation(commandName, cleanArgName);
        if (!argumentTranslation && !isFilePath) {
            return {
                ok: false,
                error: {
                    type: 'ARGUMENT_NOT_FOUND',
                    command: commandName,
                    argument: argumentName,
                },
            };
        }
        // ヒントを構築（色なし）
        let hint = '';
        const locale = this.i18nManager.getCurrentLocale();
        // 引数名
        hint += argumentName;
        // @<path> 記法の場合
        if (isFilePath) {
            const filePathLabel = locale === 'ja' ? 'ファイルパス引数' : 'File path argument';
            hint += ` (${filePathLabel})`;
        }
        hint += '\n';
        // 説明
        if (argumentTranslation) {
            hint += `  ${argumentTranslation}`;
        }
        else if (isFilePath) {
            const defaultDesc = locale === 'ja'
                ? 'ファイルパスを指定'
                : 'Specify file path';
            hint += `  ${defaultDesc}`;
        }
        return {
            ok: true,
            value: hint,
        };
    }
    /**
     * 引数翻訳を取得（フォールバック付き）
     * @param commandName コマンド名
     * @param argumentName 引数名
     * @returns 引数翻訳またはnull
     */
    getArgumentTranslation(commandName, argumentName) {
        // 翻訳データから取得を試みる
        const translationKey = `commands.${commandName}.arguments.${argumentName}`;
        const translationResult = this.i18nManager.translate(translationKey);
        if (translationResult.ok) {
            return translationResult.value;
        }
        // フォールバック: 翻訳が見つからない場合はnull
        return null;
    }
    /**
     * エラーメッセージをフォーマット（色付き）
     * @param error ヒントエラー
     * @param suggestions 候補リスト（オプション）
     * @returns フォーマット済みエラーメッセージ
     */
    formatError(error, suggestions) {
        const locale = this.i18nManager.getCurrentLocale();
        let message = '';
        // エラータイプに応じたメッセージ取得
        const errorKey = `errors.${error.type}`;
        const errorMessageResult = this.i18nManager.translate(errorKey);
        const errorMessage = errorMessageResult.ok
            ? errorMessageResult.value
            : error.type;
        // エラーアイコン（赤色）
        message += chalk_1.default.red('✗') + ' ';
        // エラーメッセージ（赤色、太字）
        message += chalk_1.default.bold.red(errorMessage);
        message += '\n';
        // 詳細情報
        switch (error.type) {
            case 'COMMAND_NOT_FOUND':
                message += `  ${chalk_1.default.gray(locale === 'ja' ? 'コマンド:' : 'Command:')} ${chalk_1.default.yellow(error.command)}`;
                break;
            case 'FLAG_NOT_FOUND':
                message += `  ${chalk_1.default.gray(locale === 'ja' ? 'フラグ:' : 'Flag:')} ${chalk_1.default.yellow(error.flag)}`;
                break;
            case 'ARGUMENT_NOT_FOUND':
                message += `  ${chalk_1.default.gray(locale === 'ja' ? 'コマンド:' : 'Command:')} ${chalk_1.default.yellow(error.command)}\n`;
                message += `  ${chalk_1.default.gray(locale === 'ja' ? '引数:' : 'Argument:')} ${chalk_1.default.yellow(error.argument)}`;
                break;
            case 'TRANSLATION_UNAVAILABLE':
                message += `  ${chalk_1.default.gray(locale === 'ja' ? 'キー:' : 'Key:')} ${chalk_1.default.yellow(error.key)}`;
                break;
        }
        // 候補サジェスト
        if (suggestions && suggestions.length > 0) {
            message += '\n\n';
            message += `  ${chalk_1.default.cyan(locale === 'ja' ? 'もしかして:' : 'Did you mean:')}`;
            suggestions.slice(0, 3).forEach((suggestion) => {
                message += `\n    ${chalk_1.default.green('•')} ${suggestion}`;
            });
        }
        return message;
    }
    /**
     * エラーメッセージをフォーマット（プレーンテキスト）
     * @param error ヒントエラー
     * @param suggestions 候補リスト（オプション）
     * @returns フォーマット済みエラーメッセージ
     */
    formatErrorPlain(error, suggestions) {
        const locale = this.i18nManager.getCurrentLocale();
        let message = '';
        // エラータイプに応じたメッセージ取得
        const errorKey = `errors.${error.type}`;
        const errorMessageResult = this.i18nManager.translate(errorKey);
        const errorMessage = errorMessageResult.ok
            ? errorMessageResult.value
            : error.type;
        // エラーアイコン
        message += '✗ ';
        // エラーメッセージ
        message += errorMessage;
        message += '\n';
        // 詳細情報
        switch (error.type) {
            case 'COMMAND_NOT_FOUND':
                message += `  ${locale === 'ja' ? 'コマンド:' : 'Command:'} ${error.command}`;
                break;
            case 'FLAG_NOT_FOUND':
                message += `  ${locale === 'ja' ? 'フラグ:' : 'Flag:'} ${error.flag}`;
                break;
            case 'ARGUMENT_NOT_FOUND':
                message += `  ${locale === 'ja' ? 'コマンド:' : 'Command:'} ${error.command}\n`;
                message += `  ${locale === 'ja' ? '引数:' : 'Argument:'} ${error.argument}`;
                break;
            case 'TRANSLATION_UNAVAILABLE':
                message += `  ${locale === 'ja' ? 'キー:' : 'Key:'} ${error.key}`;
                break;
        }
        // 候補サジェスト
        if (suggestions && suggestions.length > 0) {
            message += '\n\n';
            message += `  ${locale === 'ja' ? 'もしかして:' : 'Did you mean:'}`;
            suggestions.slice(0, 3).forEach((suggestion) => {
                message += `\n    • ${suggestion}`;
            });
        }
        return message;
    }
    /**
     * キャッシュをクリア
     */
    clearCache() {
        this.hintCache.clear();
    }
}
exports.HintProvider = HintProvider;
//# sourceMappingURL=hintProvider.js.map