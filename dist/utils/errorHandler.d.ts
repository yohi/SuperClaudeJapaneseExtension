import { Result, UserError, SystemError, BusinessLogicError, ErrorHandlerResult } from './types';
import { I18nManager } from '../i18n/i18nManager';
/**
 * エラーハンドリングクラス
 * ユーザーエラー、システムエラー、ビジネスロジックエラーを処理します
 */
export declare class ErrorHandler {
    private i18nManager;
    private readonly knownCommands;
    private readonly knownFlags;
    constructor(i18nManager: I18nManager);
    /**
     * ユーザーエラーを処理します
     */
    handleUserError(error: UserError): Result<ErrorHandlerResult, never>;
    /**
     * システムエラーを処理します
     */
    handleSystemError(error: SystemError): Result<ErrorHandlerResult, never>;
    /**
     * ビジネスロジックエラーを処理します
     */
    handleBusinessLogicError(error: BusinessLogicError): Result<ErrorHandlerResult, never>;
    /**
     * コマンドの候補を生成します（Levenshtein距離を使用）
     */
    findCommandSuggestions(input: string): string[];
    /**
     * フラグの候補を生成します（Levenshtein距離を使用）
     */
    findFlagSuggestions(input: string): string[];
    /**
     * エラーメッセージをフォーマットします（色付き）
     */
    formatErrorMessage(result: ErrorHandlerResult): string;
    /**
     * エラーメッセージをフォーマットします（プレーンテキスト）
     */
    formatErrorMessagePlain(result: ErrorHandlerResult): string;
}
//# sourceMappingURL=errorHandler.d.ts.map