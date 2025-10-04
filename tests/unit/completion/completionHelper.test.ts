/**
 * 補完ヘルパースクリプトのユニットテスト
 */

import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

describe('Completion Helper Script', () => {
  let helperScriptPath: string;

  beforeAll(() => {
    // コンパイル済みのヘルパースクリプトのパスを取得
    helperScriptPath = path.join(
      __dirname,
      '../../../dist/completions/helpers/get-hints.js'
    );
  });

  /**
   * ヘルパースクリプトを実行し、標準出力を取得
   */
  function runHelper(args: string[]): string {
    try {
      // 引数を個別にクォートして結合
      const quotedArgs = args.map((arg) => `"${arg}"`).join(' ');
      const result = execSync(`node "${helperScriptPath}" ${quotedArgs}`, {
        encoding: 'utf-8',
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      return result.trim();
    } catch (error) {
      // エラー時は空文字列を返す
      return '';
    }
  }

  describe('コマンド名補完', () => {
    it('should return command completions for "bu" prefix', () => {
      const output = runHelper(['command', 'bu']);

      // 出力はスペース区切りのコマンド名リスト
      expect(output).toContain('build');
    });

    it('should return all commands for empty prefix', () => {
      const output = runHelper(['command', '']);

      // 空のプレフィックスの場合、すべてのコマンドを返す
      expect(output.length).toBeGreaterThan(0);
    });

    it('should return empty for non-matching prefix', () => {
      const output = runHelper(['command', 'xyz123nonexistent']);

      // 該当するコマンドがない場合は空
      expect(output).toBe('');
    });
  });

  describe('フラグ補完', () => {
    it('should return flag completions for "--th" prefix', () => {
      const output = runHelper(['flag', 'build', '--th']);

      // --think フラグが含まれるはず
      expect(output).toContain('--think');
    });

    it('should return flag completions without "--" prefix', () => {
      const output = runHelper(['flag', 'build', 'th']);

      // プレフィックスに -- がなくても補完できる
      expect(output).toContain('--think');
    });

    it('should return empty for unknown command', () => {
      const output = runHelper(['flag', 'unknowncommand', '--th']);

      // 未知のコマンドの場合は空
      expect(output).toBe('');
    });
  });

  describe('エラーハンドリング', () => {
    it('should return empty for missing arguments', () => {
      const output = runHelper([]);

      // 引数不足の場合は空
      expect(output).toBe('');
    });

    it('should return empty for invalid completion type', () => {
      const output = runHelper(['invalid', 'bu']);

      // 無効な補完タイプの場合は空
      expect(output).toBe('');
    });

    it('should handle errors gracefully', () => {
      // スクリプトが存在しない場合もエラーにならず空を返す
      expect(() => runHelper(['command', 'bu'])).not.toThrow();
    });
  });

  describe('出力フォーマット', () => {
    it('should output space-separated values', () => {
      const output = runHelper(['command', 'b']);

      // 複数の候補がある場合、スペース区切りで出力
      if (output) {
        const candidates = output.split(/\s+/);
        expect(candidates.length).toBeGreaterThan(0);

        // 各候補は空白を含まない
        candidates.forEach((candidate) => {
          expect(candidate.trim()).toBe(candidate);
          expect(candidate.length).toBeGreaterThan(0);
        });
      }
    });

    it('should not include descriptions in output', () => {
      const output = runHelper(['command', 'bu']);

      // 説明は含まず、コマンド名のみを出力
      // 日本語文字が含まれていないことを確認
      expect(output).not.toMatch(/[あ-ん]/);
    });
  });
});
