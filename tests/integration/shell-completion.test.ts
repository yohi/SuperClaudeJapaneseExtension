/**
 * シェル補完スクリプトの統合テスト
 */

import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

describe('Shell Completion Scripts', () => {
  const bashScriptPath = path.join(
    __dirname,
    '../../completions/bash/claude-complete.bash'
  );
  const zshScriptPath = path.join(
    __dirname,
    '../../completions/zsh/_claude'
  );
  const helperScriptPath = path.join(
    __dirname,
    '../../dist/completions/helpers/get-hints.js'
  );

  describe('bash補完スクリプト', () => {
    it('should exist and be executable', () => {
      expect(fs.existsSync(bashScriptPath)).toBe(true);

      const stats = fs.statSync(bashScriptPath);
      expect(stats.mode & fs.constants.S_IXUSR).toBeTruthy();
    });

    it('should contain _claude_completion function', () => {
      const content = fs.readFileSync(bashScriptPath, 'utf-8');
      expect(content).toContain('_claude_completion()');
    });

    it('should register completion with complete command', () => {
      const content = fs.readFileSync(bashScriptPath, 'utf-8');
      expect(content).toContain('complete -F _claude_completion claude');
    });

    it('should reference helper script', () => {
      const content = fs.readFileSync(bashScriptPath, 'utf-8');
      expect(content).toContain('CLAUDE_HELPER_SCRIPT');
      expect(content).toContain('get-hints.js');
    });

    it('should have proper shebang', () => {
      const content = fs.readFileSync(bashScriptPath, 'utf-8');
      expect(content.startsWith('#!/usr/bin/env bash')).toBe(true);
    });

    it('should handle command completion', () => {
      const content = fs.readFileSync(bashScriptPath, 'utf-8');
      // コマンド補完のロジックが含まれていることを確認
      expect(content).toContain('command');
      expect(content).toContain('COMP_CWORD');
    });

    it('should handle flag completion', () => {
      const content = fs.readFileSync(bashScriptPath, 'utf-8');
      // フラグ補完のロジックが含まれていることを確認
      expect(content).toContain('flag');
      expect(content).toContain('-*');
    });
  });

  describe('zsh補完スクリプト', () => {
    it('should exist and be executable', () => {
      expect(fs.existsSync(zshScriptPath)).toBe(true);

      const stats = fs.statSync(zshScriptPath);
      expect(stats.mode & fs.constants.S_IXUSR).toBeTruthy();
    });

    it('should have #compdef directive', () => {
      const content = fs.readFileSync(zshScriptPath, 'utf-8');
      expect(content).toContain('#compdef claude');
    });

    it('should contain _claude function', () => {
      const content = fs.readFileSync(zshScriptPath, 'utf-8');
      expect(content).toContain('_claude()');
    });

    it('should contain _claude_commands function', () => {
      const content = fs.readFileSync(zshScriptPath, 'utf-8');
      expect(content).toContain('_claude_commands()');
    });

    it('should contain _claude_flags function', () => {
      const content = fs.readFileSync(zshScriptPath, 'utf-8');
      expect(content).toContain('_claude_flags()');
    });

    it('should reference helper script', () => {
      const content = fs.readFileSync(zshScriptPath, 'utf-8');
      expect(content).toContain('helper_script');
      expect(content).toContain('get-hints.js');
    });

    it('should use _describe for completion', () => {
      const content = fs.readFileSync(zshScriptPath, 'utf-8');
      expect(content).toContain('_describe');
    });

    it('should use _arguments for parsing', () => {
      const content = fs.readFileSync(zshScriptPath, 'utf-8');
      expect(content).toContain('_arguments');
    });
  });

  describe('ヘルパースクリプト統合', () => {
    it('should have compiled helper script', () => {
      expect(fs.existsSync(helperScriptPath)).toBe(true);
    });

    it('should be callable from bash script', () => {
      // bash スクリプトで参照されるパスが正しいことを確認
      const bashContent = fs.readFileSync(bashScriptPath, 'utf-8');
      expect(bashContent).toContain('node "${CLAUDE_HELPER_SCRIPT}"');
    });

    it('should be callable from zsh script', () => {
      // zsh スクリプトで参照されるパスが正しいことを確認
      const zshContent = fs.readFileSync(zshScriptPath, 'utf-8');
      expect(zshContent).toContain('node "${helper_script}"');
    });
  });

  describe('エラーハンドリング', () => {
    it('bash script should handle missing helper gracefully', () => {
      const content = fs.readFileSync(bashScriptPath, 'utf-8');
      // ヘルパースクリプトが存在しない場合のチェックがあることを確認
      expect(content).toContain('if [[ ! -f "${CLAUDE_HELPER_SCRIPT}" ]]');
      expect(content).toContain('return 0');
    });

    it('zsh script should handle missing helper gracefully', () => {
      const content = fs.readFileSync(zshScriptPath, 'utf-8');
      // ヘルパースクリプトが存在しない場合のチェックがあることを確認
      expect(content).toContain('if [[ ! -f "${helper_script}" ]]');
      expect(content).toContain('return 0');
    });

    it('bash script should suppress errors with 2>/dev/null', () => {
      const content = fs.readFileSync(bashScriptPath, 'utf-8');
      expect(content).toContain('2>/dev/null');
    });

    it('zsh script should suppress errors with 2>/dev/null', () => {
      const content = fs.readFileSync(zshScriptPath, 'utf-8');
      expect(content).toContain('2>/dev/null');
    });
  });

  describe('環境変数サポート', () => {
    it('bash script should support CLAUDE_HELPER_SCRIPT override', () => {
      const content = fs.readFileSync(bashScriptPath, 'utf-8');
      expect(content).toContain('CLAUDE_HELPER_SCRIPT="${CLAUDE_HELPER_SCRIPT:-');
    });

    it('zsh script should support CLAUDE_HELPER_SCRIPT override', () => {
      const content = fs.readFileSync(zshScriptPath, 'utf-8');
      expect(content).toContain('${CLAUDE_HELPER_SCRIPT:-');
    });
  });
});
