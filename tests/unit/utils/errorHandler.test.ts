import { ErrorHandler } from '../../../src/utils/errorHandler';
import { I18nManager } from '../../../src/i18n/i18nManager';

// Mock I18nManager
jest.mock('../../../src/i18n/i18nManager');

describe('ErrorHandler', () => {
  let errorHandler: ErrorHandler;
  let mockI18nManager: jest.Mocked<I18nManager>;

  beforeEach(() => {
    mockI18nManager = {
      translate: jest.fn(),
      getCurrentLocale: jest.fn().mockReturnValue('ja'),
    } as any;

    errorHandler = new ErrorHandler(mockI18nManager);
  });

  describe('handleUserError', () => {
    it('COMMAND_NOT_FOUNDエラーを処理して候補を返す', () => {
      mockI18nManager.translate.mockReturnValue({
        ok: true,
        value: 'コマンド "buidl" が見つかりません',
      });

      const result = errorHandler.handleUserError({
        type: 'COMMAND_NOT_FOUND',
        command: 'buidl',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.message).toContain('buidl');
        expect(result.value.suggestions).toContain('build');
      }
    });

    it('FLAG_NOT_FOUNDエラーを処理して候補を返す', () => {
      mockI18nManager.translate.mockReturnValue({
        ok: true,
        value: 'フラグ "--plann" は利用できません',
      });

      const result = errorHandler.handleUserError({
        type: 'FLAG_NOT_FOUND',
        flag: '--plann',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.message).toContain('--plann');
        expect(result.value.suggestions).toContain('--plan');
      }
    });

    it('ARGUMENT_NOT_FOUNDエラーを処理して候補を返す', () => {
      mockI18nManager.translate.mockReturnValue({
        ok: true,
        value: '引数 "taget" が見つかりません',
      });

      const result = errorHandler.handleUserError({
        type: 'ARGUMENT_NOT_FOUND',
        argument: 'taget',
        command: 'build',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.message).toContain('taget');
        expect(result.value.suggestions).toEqual([]);
      }
    });

    it('候補が見つからない場合、空の配列を返す', () => {
      mockI18nManager.translate.mockReturnValue({
        ok: true,
        value: 'コマンド "xxxxxxxxx" が見つかりません',
      });

      const result = errorHandler.handleUserError({
        type: 'COMMAND_NOT_FOUND',
        command: 'xxxxxxxxx',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.suggestions).toEqual([]);
      }
    });

    it('翻訳が利用できない場合、フォールバックメッセージを返す', () => {
      mockI18nManager.translate.mockReturnValue({
        ok: false,
        error: { type: 'TRANSLATION_NOT_FOUND', key: 'errors.COMMAND_NOT_FOUND', locale: 'ja' },
      });

      const result = errorHandler.handleUserError({
        type: 'COMMAND_NOT_FOUND',
        command: 'buidl',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.message).toContain('Command "buidl" not found');
      }
    });
  });

  describe('handleSystemError', () => {
    it('FILE_NOT_FOUNDエラーを処理してフォールバックする', () => {
      mockI18nManager.translate.mockReturnValue({
        ok: true,
        value: 'ファイルが見つかりません: /path/to/file.json',
      });
      mockI18nManager.getCurrentLocale.mockReturnValue('ja');

      const result = errorHandler.handleSystemError({
        type: 'FILE_NOT_FOUND',
        path: '/path/to/file.json',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.message).toContain('/path/to/file.json');
        expect(result.value.fallback).toBe('en');
      }
    });

    it('PARSE_ERRORエラーを処理して詳細を返す', () => {
      mockI18nManager.translate.mockReturnValue({
        ok: true,
        value: '解析エラー: Invalid YAML syntax at line 5',
      });

      const result = errorHandler.handleSystemError({
        type: 'PARSE_ERROR',
        message: 'Invalid YAML syntax at line 5',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.message).toContain('Invalid YAML syntax at line 5');
        expect(result.value.recovery).toBe('display_original');
      }
    });

    it('INIT_FAILEDエラーを処理してフォールバックする', () => {
      mockI18nManager.translate.mockReturnValue({
        ok: true,
        value: '初期化に失敗しました: i18next initialization failed',
      });

      const result = errorHandler.handleSystemError({
        type: 'INIT_FAILED',
        message: 'i18next initialization failed',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.message).toContain('i18next initialization failed');
        expect(result.value.fallback).toBe('en');
      }
    });

    it('RESOURCE_NOT_FOUNDエラーを処理してフォールバックする', () => {
      mockI18nManager.translate.mockReturnValue({
        ok: true,
        value: 'リソースが見つかりません: ja',
      });

      const result = errorHandler.handleSystemError({
        type: 'RESOURCE_NOT_FOUND',
        locale: 'ja',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.message).toContain('ja');
        expect(result.value.fallback).toBe('en');
      }
    });
  });

  describe('handleBusinessLogicError', () => {
    it('TRANSLATION_NOT_FOUNDエラーを処理してデフォルト値を使用', () => {
      const result = errorHandler.handleBusinessLogicError({
        type: 'TRANSLATION_NOT_FOUND',
        key: 'commands.new-command.description',
        locale: 'ja',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.message).toContain('commands.new-command.description');
        expect(result.value.defaultValue).toBeDefined();
      }
    });

    it('TRANSLATION_UNAVAILABLEエラーを処理して警告を返す', () => {
      const result = errorHandler.handleBusinessLogicError({
        type: 'TRANSLATION_UNAVAILABLE',
        key: 'flags.new-flag.description',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.message).toContain('flags.new-flag.description');
        expect(result.value.logLevel).toBe('WARN');
      }
    });

    it('INVALID_COMMANDエラーを処理して警告を返す', () => {
      const result = errorHandler.handleBusinessLogicError({
        type: 'INVALID_COMMAND',
        command: 'invalid',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.message).toContain('invalid');
        expect(result.value.logLevel).toBe('WARN');
      }
    });

    it('NO_CANDIDATES_FOUNDエラーを処理して情報を返す', () => {
      const result = errorHandler.handleBusinessLogicError({
        type: 'NO_CANDIDATES_FOUND',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.message).toContain('候補が見つかりません');
        expect(result.value.logLevel).toBe('INFO');
      }
    });
  });

  describe('findSuggestions', () => {
    it('Levenshtein距離を使用してコマンド候補を生成', () => {
      const suggestions = errorHandler.findCommandSuggestions('buidl');

      expect(suggestions).toContain('build');
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });

    it('Levenshtein距離を使用してフラグ候補を生成', () => {
      const suggestions = errorHandler.findFlagSuggestions('--plann');

      expect(suggestions).toContain('--plan');
      expect(suggestions.length).toBeLessThanOrEqual(3);
    });

    it('距離が遠すぎる場合、候補を返さない', () => {
      const suggestions = errorHandler.findCommandSuggestions('xxxxxxxxx');

      expect(suggestions).toEqual([]);
    });

    it('最大3つの候補を返す', () => {
      const suggestions = errorHandler.findCommandSuggestions('buil');

      expect(suggestions.length).toBeLessThanOrEqual(3);
    });
  });

  describe('formatErrorMessage', () => {
    it('色付きエラーメッセージをフォーマット', () => {
      const formatted = errorHandler.formatErrorMessage({
        message: 'Error occurred',
        suggestions: ['suggestion1', 'suggestion2'],
        logLevel: 'ERROR',
      });

      expect(formatted).toContain('Error occurred');
      expect(formatted).toContain('suggestion1');
      expect(formatted).toContain('suggestion2');
    });

    it('候補がない場合、候補セクションを表示しない', () => {
      const formatted = errorHandler.formatErrorMessage({
        message: 'Error occurred',
        suggestions: [],
        logLevel: 'ERROR',
      });

      expect(formatted).toContain('Error occurred');
      expect(formatted).not.toContain('候補:');
    });

    it('プレーンテキストでエラーメッセージをフォーマット', () => {
      const formatted = errorHandler.formatErrorMessagePlain({
        message: 'Error occurred',
        suggestions: ['suggestion1'],
        logLevel: 'ERROR',
      });

      expect(formatted).toContain('Error occurred');
      expect(formatted).toContain('suggestion1');
      expect(formatted).not.toContain('\x1b['); // ANSIエスケープコードが含まれていないこと
    });
  });
});
