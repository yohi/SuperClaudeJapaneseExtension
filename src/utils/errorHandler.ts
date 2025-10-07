import chalk from 'chalk';
import Levenshtein from 'fast-levenshtein';
import {
  Result,
  UserError,
  SystemError,
  BusinessLogicError,
  ErrorHandlerResult,
} from './types';
import { I18nManager } from '../i18n/i18nManager';

/**
 * エラーハンドリングクラス
 * ユーザーエラー、システムエラー、ビジネスロジックエラーを処理します
 */
export class ErrorHandler {
  private i18nManager: I18nManager;

  // 既知のコマンド一覧（候補生成用）
  private readonly knownCommands = [
    'build',
    'implement',
    'analyze',
    'troubleshoot',
    'explain',
    'improve',
    'cleanup',
    'document',
    'estimate',
    'task',
    'test',
    'git',
    'design',
    'index',
    'load',
    'spawn',
  ];

  // 既知のフラグ一覧（候補生成用）
  private readonly knownFlags = [
    '--plan',
    '--think',
    '--think-hard',
    '--ultrathink',
    '--uc',
    '--ultracompressed',
    '--validate',
    '--safe-mode',
    '--verbose',
    '--c7',
    '--context7',
    '--seq',
    '--sequential',
    '--magic',
    '--play',
    '--playwright',
    '--all-mcp',
    '--no-mcp',
    '--delegate',
    '--concurrency',
    '--wave-mode',
    '--wave-strategy',
    '--scope',
    '--focus',
    '--loop',
    '--iterations',
    '--interactive',
    '--introspect',
    '--introspection',
    '--persona-general',
    '--persona-system-architect',
    '--persona-socratic-mentor',
    '--persona-quality-engineer',
    '--persona-root-cause-analyst',
    '--persona-business-panel-experts',
    '--persona-performance-engineer',
    '--persona-python-expert',
    '--persona-devops-architect',
    '--persona-backend-architect',
    '--persona-refactoring-expert',
    '--persona-security-engineer',
    '--persona-learning-guide',
    '--persona-requirements-analyst',
    '--persona-frontend-architect',
    '--persona-technical-writer',
  ];

  constructor(i18nManager: I18nManager) {
    this.i18nManager = i18nManager;
  }

  /**
   * ユーザーエラーを処理します
   */
  handleUserError(error: UserError): Result<ErrorHandlerResult, never> {
    let message: string;
    let suggestions: string[] = [];

    switch (error.type) {
      case 'COMMAND_NOT_FOUND': {
        const translationResult = this.i18nManager.translate(
          'errors.COMMAND_NOT_FOUND',
          { interpolation: { command: error.command } }
        );
        message = translationResult.ok
          ? translationResult.value
          : `Command "${error.command}" not found`;
        suggestions = this.findCommandSuggestions(error.command);
        break;
      }

      case 'FLAG_NOT_FOUND': {
        const translationResult = this.i18nManager.translate(
          'errors.FLAG_NOT_FOUND',
          { interpolation: { flag: error.flag } }
        );
        message = translationResult.ok
          ? translationResult.value
          : `Flag "${error.flag}" is not available`;
        suggestions = this.findFlagSuggestions(error.flag);
        break;
      }

      case 'ARGUMENT_NOT_FOUND': {
        const translationResult = this.i18nManager.translate(
          'errors.ARGUMENT_NOT_FOUND',
          { interpolation: { argument: error.argument, command: error.command } }
        );
        message = translationResult.ok
          ? translationResult.value
          : `Argument "${error.argument}" not found for command "${error.command}"`;
        // 引数の候補生成は実装されていないため、空配列
        suggestions = [];
        break;
      }
    }

    return {
      ok: true,
      value: {
        message,
        suggestions,
        logLevel: 'WARN',
      },
    };
  }

  /**
   * システムエラーを処理します
   */
  handleSystemError(error: SystemError): Result<ErrorHandlerResult, never> {
    let message: string;
    const currentLocale = this.i18nManager.getCurrentLocale();
    const fallback = currentLocale === 'ja' ? 'en' : 'ja';

    switch (error.type) {
      case 'FILE_NOT_FOUND': {
        const translationResult = this.i18nManager.translate(
          'errors.FILE_NOT_FOUND',
          { interpolation: { path: error.path } }
        );
        message = translationResult.ok
          ? translationResult.value
          : `File not found: ${error.path}`;
        break;
      }

      case 'PARSE_ERROR': {
        const translationResult = this.i18nManager.translate(
          'errors.PARSE_ERROR',
          { interpolation: { message: error.message } }
        );
        message = translationResult.ok
          ? translationResult.value
          : `Parse error: ${error.message}`;
        return {
          ok: true,
          value: {
            message,
            recovery: 'display_original',
            logLevel: 'ERROR',
          },
        };
      }

      case 'INIT_FAILED': {
        const translationResult = this.i18nManager.translate(
          'errors.INIT_FAILED',
          { interpolation: { message: error.message } }
        );
        message = translationResult.ok
          ? translationResult.value
          : `Initialization failed: ${error.message}`;
        break;
      }

      case 'RESOURCE_NOT_FOUND': {
        const translationResult = this.i18nManager.translate(
          'errors.RESOURCE_NOT_FOUND',
          { interpolation: { locale: error.locale } }
        );
        message = translationResult.ok
          ? translationResult.value
          : `Resource not found for locale: ${error.locale}`;
        break;
      }
    }

    return {
      ok: true,
      value: {
        message,
        fallback,
        logLevel: 'ERROR',
      },
    };
  }

  /**
   * ビジネスロジックエラーを処理します
   */
  handleBusinessLogicError(
    error: BusinessLogicError
  ): Result<ErrorHandlerResult, never> {
    let message: string;
    let defaultValue: string | undefined;
    let logLevel: 'ERROR' | 'WARN' | 'INFO' | 'DEBUG';

    switch (error.type) {
      case 'TRANSLATION_NOT_FOUND': {
        message = `Translation not found for key: ${error.key} (locale: ${error.locale})`;
        defaultValue = error.key;
        logLevel = 'WARN';
        break;
      }

      case 'TRANSLATION_UNAVAILABLE': {
        message = `Translation unavailable for key: ${error.key}`;
        logLevel = 'WARN';
        break;
      }

      case 'INVALID_COMMAND': {
        message = `Invalid command: ${error.command}`;
        logLevel = 'WARN';
        break;
      }

      case 'NO_CANDIDATES_FOUND': {
        message = '候補が見つかりません';
        logLevel = 'INFO';
        break;
      }
    }

    return {
      ok: true,
      value: {
        message,
        defaultValue,
        logLevel,
      },
    };
  }

  /**
   * コマンドの候補を生成します（Levenshtein距離を使用）
   */
  findCommandSuggestions(input: string): string[] {
    const MAX_SUGGESTIONS = 3;
    const MAX_DISTANCE = 3;

    const candidates = this.knownCommands
      .map((command) => ({
        command,
        distance: Levenshtein.get(input, command),
      }))
      .filter((item) => item.distance <= MAX_DISTANCE)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, MAX_SUGGESTIONS)
      .map((item) => item.command);

    return candidates;
  }

  /**
   * フラグの候補を生成します（Levenshtein距離を使用）
   */
  findFlagSuggestions(input: string): string[] {
    const MAX_SUGGESTIONS = 3;
    const MAX_DISTANCE = 3;

    const candidates = this.knownFlags
      .map((flag) => ({
        flag,
        distance: Levenshtein.get(input, flag),
      }))
      .filter((item) => item.distance <= MAX_DISTANCE)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, MAX_SUGGESTIONS)
      .map((item) => item.flag);

    return candidates;
  }

  /**
   * エラーメッセージをフォーマットします（色付き）
   */
  formatErrorMessage(result: ErrorHandlerResult): string {
    let formatted = chalk.red.bold('Error: ') + chalk.red(result.message);

    if (result.suggestions && result.suggestions.length > 0) {
      formatted += '\n\n' + chalk.yellow('候補:');
      result.suggestions.forEach((suggestion) => {
        formatted += '\n  ' + chalk.green(suggestion);
      });
    }

    return formatted;
  }

  /**
   * エラーメッセージをフォーマットします（プレーンテキスト）
   */
  formatErrorMessagePlain(result: ErrorHandlerResult): string {
    let formatted = 'Error: ' + result.message;

    if (result.suggestions && result.suggestions.length > 0) {
      formatted += '\n\n候補:';
      result.suggestions.forEach((suggestion) => {
        formatted += '\n  ' + suggestion;
      });
    }

    return formatted;
  }
}
