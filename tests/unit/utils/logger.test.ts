import { Logger } from '../../../src/utils/logger';
import * as fs from 'fs';
import * as path from 'path';

// Mock fs module
jest.mock('fs');

describe('Logger', () => {
  let logger: Logger;
  const mockLogFile = '/tmp/test-i18n.log';

  beforeEach(() => {
    jest.clearAllMocks();
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
    (fs.appendFileSync as jest.Mock).mockReturnValue(undefined);
    (fs.statSync as jest.Mock).mockReturnValue({ size: 0 });
    (fs.readdirSync as jest.Mock).mockReturnValue([]);
    (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);
    (fs.renameSync as jest.Mock).mockReturnValue(undefined);

    logger = new Logger({
      logFile: mockLogFile,
      level: 'DEBUG',
      maxFileSize: 10 * 1024 * 1024, // 10MB
      maxFiles: 5,
    });
  });

  describe('初期化', () => {
    it('ログディレクトリが存在しない場合、作成する', () => {
      jest.clearAllMocks();
      (fs.existsSync as jest.Mock).mockReturnValue(false);

      new Logger({
        logFile: '/tmp/logs/test.log',
        level: 'INFO',
      });

      expect(fs.mkdirSync).toHaveBeenCalledWith('/tmp/logs', { recursive: true });
    });

    it('ログディレクトリが存在する場合、作成しない', () => {
      jest.clearAllMocks();
      (fs.existsSync as jest.Mock).mockReturnValue(true);

      new Logger({
        logFile: '/tmp/logs/test.log',
        level: 'INFO',
      });

      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('ログ出力', () => {
    it('ERRORレベルのログを出力する', () => {
      logger.error('Test error message');

      expect(fs.appendFileSync).toHaveBeenCalledWith(
        mockLogFile,
        expect.stringContaining('"level":"ERROR"')
      );
      expect(fs.appendFileSync).toHaveBeenCalledWith(
        mockLogFile,
        expect.stringContaining('"message":"Test error message"')
      );
    });

    it('WARNレベルのログを出力する', () => {
      logger.warn('Test warning message');

      expect(fs.appendFileSync).toHaveBeenCalledWith(
        mockLogFile,
        expect.stringContaining('"level":"WARN"')
      );
    });

    it('INFOレベルのログを出力する', () => {
      logger.info('Test info message');

      expect(fs.appendFileSync).toHaveBeenCalledWith(
        mockLogFile,
        expect.stringContaining('"level":"INFO"')
      );
    });

    it('DEBUGレベルのログを出力する', () => {
      logger.debug('Test debug message');

      expect(fs.appendFileSync).toHaveBeenCalledWith(
        mockLogFile,
        expect.stringContaining('"level":"DEBUG"')
      );
    });

    it('メタデータ付きでログを出力する', () => {
      logger.error('Test error', { userId: '123', operation: 'translate' });

      expect(fs.appendFileSync).toHaveBeenCalledWith(
        mockLogFile,
        expect.stringContaining('"userId":"123"')
      );
      expect(fs.appendFileSync).toHaveBeenCalledWith(
        mockLogFile,
        expect.stringContaining('"operation":"translate"')
      );
    });

    it('タイムスタンプを含むログを出力する', () => {
      const beforeTime = new Date().toISOString();
      logger.info('Test message');
      const afterTime = new Date().toISOString();

      const call = (fs.appendFileSync as jest.Mock).mock.calls[0][1];
      const logEntry = JSON.parse(call);

      expect(logEntry.timestamp).toBeDefined();
      expect(logEntry.timestamp >= beforeTime).toBe(true);
      expect(logEntry.timestamp <= afterTime).toBe(true);
    });
  });

  describe('ログレベルフィルタリング', () => {
    it('設定レベルより低いログは出力しない（ERROR設定時）', () => {
      const errorLogger = new Logger({
        logFile: mockLogFile,
        level: 'ERROR',
      });

      errorLogger.warn('Warning message');
      errorLogger.info('Info message');
      errorLogger.debug('Debug message');

      expect(fs.appendFileSync).not.toHaveBeenCalled();
    });

    it('設定レベルより低いログは出力しない（WARN設定時）', () => {
      const warnLogger = new Logger({
        logFile: mockLogFile,
        level: 'WARN',
      });

      warnLogger.info('Info message');
      warnLogger.debug('Debug message');

      expect(fs.appendFileSync).not.toHaveBeenCalled();
    });

    it('設定レベル以上のログは出力する', () => {
      const infoLogger = new Logger({
        logFile: mockLogFile,
        level: 'INFO',
      });

      infoLogger.error('Error message');
      infoLogger.warn('Warning message');
      infoLogger.info('Info message');

      expect(fs.appendFileSync).toHaveBeenCalledTimes(3);
    });
  });

  describe('ログローテーション', () => {
    it('ファイルサイズが上限を超えた場合、ローテーションする', () => {
      const largeSize = 11 * 1024 * 1024; // 11MB
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue({ size: largeSize });
      (fs.readdirSync as jest.Mock).mockReturnValue([]);

      logger.error('Test message');

      // ローテーション処理が実行される
      expect(fs.renameSync).toHaveBeenCalled();
    });

    it('古いログファイルを削除する（maxFiles超過時）', () => {
      const largeSize = 11 * 1024 * 1024;
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue({ size: largeSize });
      (fs.readdirSync as jest.Mock).mockReturnValue([
        'test-i18n.log.1',
        'test-i18n.log.2',
        'test-i18n.log.3',
        'test-i18n.log.4',
        'test-i18n.log.5',
      ]);

      logger.error('Test message');

      // 最も古いファイルが削除される
      expect(fs.unlinkSync).toHaveBeenCalled();
    });

    it('ローテーション後、既存のログ番号をインクリメントする', () => {
      const largeSize = 11 * 1024 * 1024;
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue({ size: largeSize });
      (fs.readdirSync as jest.Mock).mockReturnValue([
        'test-i18n.log.1',
        'test-i18n.log.2',
      ]);

      logger.error('Test message');

      // .2 → .3, .1 → .2 にリネーム
      expect(fs.renameSync).toHaveBeenCalledWith(
        expect.stringContaining('.2'),
        expect.stringContaining('.3')
      );
      expect(fs.renameSync).toHaveBeenCalledWith(
        expect.stringContaining('.1'),
        expect.stringContaining('.2')
      );
    });
  });

  describe('エラーハンドリング', () => {
    it('ファイル書き込みエラー時、コンソールにエラーを出力', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (fs.appendFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('Write error');
      });

      logger.error('Test message');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to write log'),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });

    it('ローテーションエラー時、コンソールにエラーを出力', () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.statSync as jest.Mock).mockReturnValue({ size: 11 * 1024 * 1024 });
      (fs.readdirSync as jest.Mock).mockImplementation(() => {
        throw new Error('Rotation error');
      });

      logger.error('Test message');

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to rotate log'),
        expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });

  describe('パフォーマンスメトリクス', () => {
    it('ログ書き込み時間を記録する', () => {
      const startTime = Date.now();
      logger.info('Performance test');
      const endTime = Date.now();

      const duration = endTime - startTime;
      expect(duration).toBeLessThan(100); // 100ms以内
    });

    it('大量のログを高速に書き込む', () => {
      const startTime = Date.now();

      for (let i = 0; i < 1000; i++) {
        logger.debug(`Test message ${i}`);
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(1000); // 1秒以内に1000件
    });
  });
});
