/**
 * 補完ヘルパースクリプト統合テスト
 *
 * シェル補完スクリプトから呼び出されるNode.jsヘルパースクリプトのテスト
 */

import { execSync } from 'child_process';
import * as path from 'path';

describe('CompletionHelper統合テスト', () => {
  const helperScriptPath = path.join(
    __dirname,
    '../../dist/completions/helpers/get-hints.js'
  );

  // テストの前提: distディレクトリにビルド済みファイルが存在
  beforeAll(() => {
    const fs = require('fs');
    if (!fs.existsSync(helperScriptPath)) {
      throw new Error(
        `ヘルパースクリプトがビルドされていません: ${helperScriptPath}\n` +
          'npm run build を実行してください。'
      );
    }
  });

  describe('コマンド補完', () => {
    it('プレフィックスなしでコマンド一覧を返す', () => {
      const result = execSync(`node ${helperScriptPath} command ""`).toString();
      const candidates = result.trim().split(' ');

      expect(candidates.length).toBeGreaterThan(0);
      expect(candidates).toContain('build');
      expect(candidates).toContain('analyze');
    });

    it('プレフィックス "b" でコマンド候補を返す', () => {
      const result = execSync(`node ${helperScriptPath} command "b"`).toString();
      const candidates = result.trim().split(' ');

      expect(candidates).toContain('build');
      expect(candidates.every((cmd) => cmd.startsWith('b'))).toBe(true);
    });

    it('プレフィックス "ana" でコマンド候補を返す', () => {
      const result = execSync(
        `node ${helperScriptPath} command "ana"`
      ).toString();
      const candidates = result.trim().split(' ');

      expect(candidates).toContain('analyze');
    });

    it('一致しないプレフィックスで空文字列を返す', () => {
      const result = execSync(
        `node ${helperScriptPath} command "xyz"`
      ).toString();

      expect(result.trim()).toBe('');
    });
  });

  describe('フラグ補完', () => {
    it('コマンド "build" でフラグ候補を返す', () => {
      const result = execSync(
        `node ${helperScriptPath} flag "build" "--"`
      ).toString();
      const candidates = result.trim().split(' ');

      expect(candidates.length).toBeGreaterThan(0);
      expect(candidates.every((flag) => flag.startsWith('--'))).toBe(true);
    });

    it('プレフィックス "--p" でフラグ候補を返す', () => {
      const result = execSync(
        `node ${helperScriptPath} flag "build" "--p"`
      ).toString();
      const candidates = result.trim().split(' ');

      expect(candidates.length).toBeGreaterThan(0);
      expect(candidates.every((flag) => flag.startsWith('--p'))).toBe(true);
    });

    it('無効なコマンドで空文字列を返す', () => {
      const result = execSync(
        `node ${helperScriptPath} flag "invalid-cmd" "--"`
      ).toString();

      expect(result.trim()).toBe('');
    });
  });

  describe('エラーハンドリング', () => {
    it('引数不足でエラーメッセージを stderr に出力', () => {
      try {
        execSync(`node ${helperScriptPath}`, { stdio: 'pipe' });
        fail('例外が発生するべき');
      } catch (error: any) {
        expect(error.status).not.toBe(0);
      }
    });

    it('不正な補完タイプでエラーメッセージを stderr に出力', () => {
      try {
        execSync(`node ${helperScriptPath} invalid-type ""`, {
          stdio: 'pipe',
        });
        fail('例外が発生するべき');
      } catch (error: any) {
        expect(error.status).not.toBe(0);
      }
    });
  });

  describe('環境変数サポート', () => {
    it('CLAUDE_LANG=ja で日本語説明を返す（今後実装予定）', () => {
      // 将来の拡張: 補完候補に日本語説明を含める
      // const result = execSync(`CLAUDE_LANG=ja node ${helperScriptPath} command ""`).toString();
      // expect(result).toContain('ビルド');
    });
  });

  describe('パフォーマンス', () => {
    it('10回のコマンド補完が5秒以内に完了', () => {
      // 注: 各呼び出しで初期化コストがかかるため、10回のみテスト
      // 環境によって実行時間が変動するため、余裕を持たせた目標値
      const start = Date.now();

      for (let i = 0; i < 10; i++) {
        execSync(`node ${helperScriptPath} command "b"`);
      }

      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(5000); // 10回で5秒以内 = 各呼び出し500ms以内
    });
  });
});
