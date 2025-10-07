/**
 * 成功基準検証テスト
 *
 * このテストスイートは、タスク12.1の成功基準を検証します：
 * - SC-6.1.1: 日本語ユーザーがコマンドの意味を理解できること
 * - SC-6.1.2: コマンド入力の学習曲線を短縮できること
 * - SC-6.1.3: タイポによるエラーを削減できること
 * - SC-6.2.1: すべての主要コマンドで日本語ヒントが表示されること
 * - SC-6.2.2: すべての主要フラグで補完が機能すること
 * - SC-6.2.3: 言語切り替えが即座に反映されること
 */

import { I18nManager } from '../../src/i18n/i18nManager';
import { HintProvider } from '../../src/hint/hintProvider';
import { CompletionEngine } from '../../src/completion/completionEngine';
import { ErrorHandler } from '../../src/utils/errorHandler';
import { MetadataParser } from '../../src/metadata/metadataParser';
import { CommandMetadataLoader } from '../../src/metadata/commandMetadataLoader';
import { CacheManager } from '../../src/cache/cacheManager';
import type { CommandMetadata } from '../../src/types';
import path from 'path';

describe('成功基準検証テスト (SC-6.x)', () => {
  let i18nManager: I18nManager;
  let hintProvider: HintProvider;
  let completionEngine: CompletionEngine;
  let errorHandler: ErrorHandler;
  let translationsPath: string;

  beforeAll(async () => {
    translationsPath = path.join(__dirname, '../../translations');
    const fixturesDir = path.join(__dirname, '../fixtures/commands');

    i18nManager = new I18nManager(translationsPath);
    await i18nManager.initialize('ja');

    const metadataLoader = new CommandMetadataLoader({
      maxCacheSize: 100,
      cacheTTL: 3600000,
    });

    // テストデータのロード（fixturesディレクトリから）
    await metadataLoader.loadCommandsFromDirectory(fixturesDir);

    hintProvider = new HintProvider(i18nManager, metadataLoader);
    completionEngine = new CompletionEngine(metadataLoader, i18nManager);
    errorHandler = new ErrorHandler(i18nManager);
  });

  describe('SC-6.1.1: 日本語ユーザーがコマンドの意味を理解できること', () => {
    it('主要コマンド「build」の日本語説明が理解可能であること', () => {
      const hint = hintProvider.generateCommandHintPlain('build');

      expect(hint.ok).toBe(true);
      if (hint.ok) {
        expect(hint.value).toContain('ビルド');
        expect(hint.value.length).toBeGreaterThan(10);
        // 日本語の自然さを確認（句読点の存在など）
        expect(hint.value).toMatch(/[。、]/);
      }
    });

    it('複雑なコマンド「implement」の日本語説明が詳細であること', () => {
      const hint = hintProvider.generateCommandHintPlain('implement');

      expect(hint.ok).toBe(true);
      if (hint.ok) {
        expect(hint.value).toContain('実装');
        expect(hint.value.length).toBeGreaterThan(20);
        // 実装に関する具体的なキーワードが含まれること
        expect(hint.value).toMatch(/コード|機能|開発/);
      }
    });

    it('全16コマンドの日本語説明が存在すること', () => {
      const commands = [
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

      for (const command of commands) {
        const hint = hintProvider.generateCommandHintPlain(command);
        expect(hint.ok).toBe(true);
        if (hint.ok) {
          expect(hint.value).toBeTruthy();
          expect(hint.value.length).toBeGreaterThan(5);
        }
      }
    });
  });

  describe('SC-6.1.2: コマンド入力の学習曲線を短縮できること', () => {
    it('補完候補に日本語説明が付与されていること', () => {
      const result = completionEngine.completeCommand('bu');

      expect(result.ok).toBe(true);
      if (result.ok) {
        const buildCandidate = result.value.find((c) => c.name === 'build');
        expect(buildCandidate).toBeDefined();
        expect(buildCandidate!.description).toBeTruthy();
        expect(buildCandidate!.description).not.toContain('undefined');
      }
    });

    it('フラグ補完候補に使用例が含まれていること', () => {
      const result = completionEngine.completeFlag(undefined, 'th');

      expect(result.ok).toBe(true);
      if (result.ok) {
        const thinkCandidate = result.value.find((c) => c.name === '--think');
        expect(thinkCandidate).toBeDefined();
        expect(thinkCandidate!.description).toBeTruthy();
      }
    });

    it('初回ユーザーがコマンド一覧を把握できること', () => {
      const result = completionEngine.completeCommand('');

      expect(result.ok).toBe(true);
      if (result.ok) {
        // 主要コマンドがすべて表示されること
        expect(result.value.length).toBeGreaterThan(10);
        // カテゴリー情報が含まれていること
        const categorizedCommands = result.value.filter((c) => c.category);
        expect(categorizedCommands.length).toBeGreaterThan(5);
      }
    });
  });

  describe('SC-6.1.3: タイポによるエラーを削減できること', () => {
    it('タイポ「buidl」に対して候補「build」が提案されること', () => {
      const result = errorHandler.handleUserError({
        type: 'COMMAND_NOT_FOUND',
        command: 'buidl',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.suggestions).toBeDefined();
        expect(result.value.suggestions).toContain('build');
      }
    });

    it('タイポ「implment」に対して候補「implement」が提案されること', () => {
      const result = errorHandler.handleUserError({
        type: 'COMMAND_NOT_FOUND',
        command: 'implment',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.suggestions).toContain('implement');
      }
    });

    it('フラグのタイポ「--plann」に対して候補「--plan」が提案されること', () => {
      const result = errorHandler.handleUserError({
        type: 'FLAG_NOT_FOUND',
        flag: '--plann',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.suggestions).toBeDefined();
        expect(result.value.suggestions).toContain('--plan');
      }
    });

    it('エラーメッセージが日本語で表示されること', () => {
      const result = errorHandler.handleUserError({
        type: 'COMMAND_NOT_FOUND',
        command: 'unknown',
      });

      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.value.message).toContain('見つかりません');
        expect(result.value.message).not.toMatch(/not found/i);
      }
    });
  });

  describe('SC-6.2.1: すべての主要コマンドで日本語ヒントが表示されること', () => {
    it('開発カテゴリーのコマンドで日本語ヒントが表示されること', () => {
      const developmentCommands = ['build', 'implement', 'test'];

      for (const command of developmentCommands) {
        const hint = hintProvider.generateCommandHintPlain(command);
        expect(hint.ok).toBe(true);
        if (hint.ok) {
          expect(hint.value).toBeTruthy();
          expect(hint.value).toContain('開発・デプロイ');
        }
      }
    });

    it('分析カテゴリーのコマンドで日本語ヒントが表示されること', () => {
      const analysisCommands = ['analyze', 'troubleshoot', 'explain'];

      for (const command of analysisCommands) {
        const hint = hintProvider.generateCommandHintPlain(command);
        expect(hint.ok).toBe(true);
        if (hint.ok) {
          expect(hint.value).toBeTruthy();
          expect(hint.value).toContain('分析・調査');
        }
      }
    });

    it('品質カテゴリーのコマンドで日本語ヒントが表示されること', () => {
      const qualityCommands = ['improve', 'cleanup'];

      for (const command of qualityCommands) {
        const hint = hintProvider.generateCommandHintPlain(command);
        expect(hint.ok).toBe(true);
        if (hint.ok) {
          expect(hint.value).toBeTruthy();
          expect(hint.value).toContain('品質・強化');
        }
      }
    });
  });

  describe('SC-6.2.2: すべての主要フラグで補完が機能すること', () => {
    it('思考系フラグ（--think系）が補完されること', () => {
      const result = completionEngine.completeFlag(undefined, '--th');

      expect(result.ok).toBe(true);
      if (result.ok) {
        const thinkFlags = result.value.filter(
          (c) => c.name.startsWith('--think') || c.name.startsWith('--ultrathink')
        );
        expect(thinkFlags.length).toBeGreaterThan(2);
      }
    });

    it('MCP制御系フラグが補完されること', () => {
      const result = completionEngine.completeFlag(undefined, '--');

      expect(result.ok).toBe(true);
      if (result.ok) {
        const mcpFlags = result.value.filter(
          (c) =>
            c.name === '--c7' ||
            c.name === '--seq' ||
            c.name === '--magic' ||
            c.name === '--play'
        );
        expect(mcpFlags.length).toBe(4);
      }
    });

    it('ペルソナフラグが補完されること', () => {
      const result = completionEngine.completeFlag(undefined, '--persona');

      expect(result.ok).toBe(true);
      if (result.ok) {
        const personaFlags = result.value.filter((c) =>
          c.name.startsWith('--persona-')
        );
        expect(personaFlags.length).toBeGreaterThan(10);
      }
    });

    it('エイリアス付きフラグが両方補完されること', () => {
      const ucResult = completionEngine.completeFlag(undefined, '--uc');
      expect(ucResult.ok).toBe(true);
      if (ucResult.ok) {
        const ucFlag = ucResult.value.find((c) => c.name === '--uc');
        expect(ucFlag).toBeDefined();
      }

      const ultracompressedResult = completionEngine.completeFlag(
        undefined,
        '--ultracomp'
      );
      expect(ultracompressedResult.ok).toBe(true);
      if (ultracompressedResult.ok) {
        const ultracompressedFlag = ultracompressedResult.value.find(
          (c) => c.name === '--ultracompressed'
        );
        expect(ultracompressedFlag).toBeDefined();
      }
    });
  });

  describe('SC-6.2.3: 言語切り替えが即座に反映されること', () => {
    it('日本語から英語への切り替えが即座に反映されること', async () => {
      // 日本語で確認
      const jaHint = hintProvider.generateCommandHintPlain('build');
      expect(jaHint.ok).toBe(true);
      if (jaHint.ok) {
        expect(jaHint.value).toContain('ビルド');
      }

      // 英語に切り替え
      await i18nManager.changeLanguage('en');

      // 英語で確認
      const enHint = hintProvider.generateCommandHintPlain('build');
      expect(enHint.ok).toBe(true);
      if (enHint.ok) {
        expect(enHint.value).toContain('Build');
        expect(enHint.value).not.toContain('ビルド');
      }

      // 日本語に戻す
      await i18nManager.changeLanguage('ja');
    });

    it('言語切り替え後の補完候補が正しい言語で表示されること', async () => {
      // 日本語補完
      const jaResult = completionEngine.completeCommand('bu');
      expect(jaResult.ok).toBe(true);
      if (jaResult.ok) {
        const buildCandidate = jaResult.value.find((c) => c.name === 'build');
        expect(buildCandidate!.description).toMatch(/ビルド|プロジェクト/);
      }

      // 英語に切り替え
      await i18nManager.changeLanguage('en');

      // 英語補完
      const enResult = completionEngine.completeCommand('bu');
      expect(enResult.ok).toBe(true);
      if (enResult.ok) {
        const buildCandidate = enResult.value.find((c) => c.name === 'build');
        expect(buildCandidate!.description).toMatch(/Build|project/);
      }

      // 日本語に戻す
      await i18nManager.changeLanguage('ja');
    });

    it('言語切り替え時間が150ms以内であること', async () => {
      const startTime = performance.now();

      await i18nManager.changeLanguage('en');
      await i18nManager.changeLanguage('ja');

      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(duration).toBeLessThan(150);
    });
  });

  describe('統合シナリオ: 日本語ユーザーの典型的なワークフロー', () => {
    it('シナリオ1: 初回ユーザーがbuildコマンドを発見して実行する', () => {
      // Step 1: コマンド一覧を表示
      const allCommands = completionEngine.completeCommand('');
      expect(allCommands.ok).toBe(true);

      // Step 2: 'bu' と入力して補完候補を取得
      const buCommands = completionEngine.completeCommand('bu');
      expect(buCommands.ok).toBe(true);
      if (buCommands.ok) {
        const buildCandidate = buCommands.value.find((c) => c.name === 'build');
        expect(buildCandidate).toBeDefined();
        expect(buildCandidate!.description).toBeTruthy();
      }

      // Step 3: buildコマンドのヒントを確認
      const hint = hintProvider.generateCommandHintPlain('build');
      expect(hint.ok).toBe(true);
      if (hint.ok) {
        expect(hint.value).toContain('ビルド');
      }
    });

    it('シナリオ2: タイポした際に候補から正しいコマンドを選択する', () => {
      // Step 1: タイポして入力
      const error = errorHandler.handleUserError({
        type: 'COMMAND_NOT_FOUND',
        command: 'implment',
      });

      expect(error.ok).toBe(true);
      if (error.ok) {
        // Step 2: エラーメッセージが日本語であること
        expect(error.value.message).toContain('見つかりません');

        // Step 3: 候補が提案されること
        expect(error.value.suggestions).toBeDefined();
        expect(error.value.suggestions).toContain('implement');
      }
    });

    it('シナリオ3: フラグを探索して選択する', () => {
      // Step 1: フラグの部分入力
      const thinkFlags = completionEngine.completeFlag(undefined, '--th');
      expect(thinkFlags.ok).toBe(true);

      // Step 2: 候補の中から選択
      if (thinkFlags.ok) {
        const thinkFlag = thinkFlags.value.find((c) => c.name === '--think');
        expect(thinkFlag).toBeDefined();
        expect(thinkFlag!.description).toBeTruthy();
      }
    });
  });

  describe('品質メトリクス検証', () => {
    it('全コマンドの翻訳カバレッジが100%であること', () => {
      const commands = [
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

      let translatedCount = 0;
      for (const command of commands) {
        const hint = hintProvider.generateCommandHintPlain(command);
        if (hint.ok && hint.value) {
          translatedCount++;
        }
      }

      const coverage = (translatedCount / commands.length) * 100;
      expect(coverage).toBe(100);
    });

    it('主要フラグの翻訳カバレッジが90%以上であること', () => {
      const flags = [
        'plan',
        'think',
        'think-hard',
        'ultrathink',
        'uc',
        'validate',
        'safe-mode',
        'verbose',
        'c7',
        'seq',
        'magic',
        'play',
      ];

      let translatedCount = 0;
      for (const flag of flags) {
        const hint = hintProvider.generateFlagHintPlain(flag);
        if (hint.ok && hint.value) {
          translatedCount++;
        }
      }

      const coverage = (translatedCount / flags.length) * 100;
      expect(coverage).toBeGreaterThanOrEqual(90);
    });

    it('エラーメッセージの翻訳カバレッジが100%であること', () => {
      const errorTypes = [
        'COMMAND_NOT_FOUND',
        'FLAG_NOT_FOUND',
        'ARGUMENT_NOT_FOUND',
        'TRANSLATION_NOT_FOUND',
        'TRANSLATION_UNAVAILABLE',
        'FILE_NOT_FOUND',
        'PARSE_ERROR',
        'INIT_FAILED',
        'RESOURCE_NOT_FOUND',
        'INVALID_COMMAND',
        'NO_CANDIDATES_FOUND',
      ];

      let translatedCount = 0;
      for (const errorType of errorTypes) {
        const result = i18nManager.translate(`errors.${errorType}`);
        if (result.ok && result.value) {
          translatedCount++;
        }
      }

      const coverage = (translatedCount / errorTypes.length) * 100;
      expect(coverage).toBe(100);
    });
  });
});
