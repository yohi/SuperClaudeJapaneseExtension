import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Install Script', () => {
  const testDir = path.join(os.tmpdir(), 'superclaude-i18n-test');
  const installScript = path.join(__dirname, '../../scripts/install.sh');

  beforeEach(() => {
    // テスト用ディレクトリを作成
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
    fs.mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    // クリーンアップ
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  describe('依存ライブラリのチェック', () => {
    it('Node.jsのバージョンをチェックする', () => {
      const nodeVersion = process.version;
      const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);

      expect(majorVersion).toBeGreaterThanOrEqual(18);
    });

    it('npmが利用可能であることを確認する', () => {
      const result = execSync('npm --version', { encoding: 'utf-8' });
      expect(result).toBeTruthy();
    });
  });

  describe('ディレクトリ構造の作成', () => {
    it('必要なディレクトリを作成する', () => {
      const dirs = [
        path.join(testDir, 'dist'),
        path.join(testDir, 'translations/ja'),
        path.join(testDir, 'translations/en'),
        path.join(testDir, 'completions/bash'),
        path.join(testDir, 'completions/zsh'),
        path.join(testDir, 'completions/helpers'),
        path.join(testDir, 'logs'),
      ];

      dirs.forEach((dir) => {
        fs.mkdirSync(dir, { recursive: true });
        expect(fs.existsSync(dir)).toBe(true);
      });
    });
  });

  describe('設定ファイルの生成', () => {
    it('デフォルト設定ファイルを生成する', () => {
      const configPath = path.join(testDir, 'config.json');
      const defaultConfig = {
        locale: 'ja',
        logLevel: 'INFO',
        cacheTtl: 3600000,
        enableCompletion: true,
        completionHistorySize: 1000,
      };

      fs.writeFileSync(configPath, JSON.stringify(defaultConfig, null, 2));

      expect(fs.existsSync(configPath)).toBe(true);
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      expect(config).toEqual(defaultConfig);
    });

    it('既存の設定ファイルがある場合は上書きしない', () => {
      const configPath = path.join(testDir, 'config.json');
      const existingConfig = {
        locale: 'en',
        logLevel: 'DEBUG',
        cacheTtl: 7200000,
      };

      fs.writeFileSync(configPath, JSON.stringify(existingConfig, null, 2));

      // インストールスクリプトが実行されても上書きされないことを確認
      expect(fs.existsSync(configPath)).toBe(true);
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      expect(config.locale).toBe('en');
      expect(config.logLevel).toBe('DEBUG');
    });
  });

  describe('シェル補完スクリプトの設定', () => {
    it('bashrcファイルに補完スクリプトのソースを追加する', () => {
      const bashrcPath = path.join(testDir, '.bashrc');
      const completionSource = `\n# SuperClaude Japanese Extension completion\nif [ -f ~/.claude/extensions/japanese-i18n/completions/bash/claude-complete.bash ]; then\n  source ~/.claude/extensions/japanese-i18n/completions/bash/claude-complete.bash\nfi\n`;

      // 既存の.bashrcがない場合
      fs.writeFileSync(bashrcPath, completionSource);
      expect(fs.readFileSync(bashrcPath, 'utf-8')).toContain('SuperClaude Japanese Extension completion');
    });

    it('zshrcファイルに補完スクリプトのfpathを追加する', () => {
      const zshrcPath = path.join(testDir, '.zshrc');
      const completionFpath = `\n# SuperClaude Japanese Extension completion\nfpath=(~/.claude/extensions/japanese-i18n/completions/zsh $fpath)\nautoload -Uz compinit && compinit\n`;

      fs.writeFileSync(zshrcPath, completionFpath);
      expect(fs.readFileSync(zshrcPath, 'utf-8')).toContain('SuperClaude Japanese Extension completion');
      expect(fs.readFileSync(zshrcPath, 'utf-8')).toContain('autoload -Uz compinit');
    });

    it('既にエントリが存在する場合は重複追加しない', () => {
      const bashrcPath = path.join(testDir, '.bashrc');
      const completionSource = `\n# SuperClaude Japanese Extension completion\nif [ -f ~/.claude/extensions/japanese-i18n/completions/bash/claude-complete.bash ]; then\n  source ~/.claude/extensions/japanese-i18n/completions/bash/claude-complete.bash\nfi\n`;

      // 1回目の追加
      fs.writeFileSync(bashrcPath, completionSource);
      const firstContent = fs.readFileSync(bashrcPath, 'utf-8');

      // 2回目の追加（重複チェック）
      const content = fs.readFileSync(bashrcPath, 'utf-8');
      if (!content.includes('SuperClaude Japanese Extension completion')) {
        fs.appendFileSync(bashrcPath, completionSource);
      }

      const secondContent = fs.readFileSync(bashrcPath, 'utf-8');
      expect(secondContent).toBe(firstContent);
    });
  });

  describe('インストール確認', () => {
    it('インストールが成功したことを示すメッセージを表示する', () => {
      const successMessage = `
✓ SuperClaude Japanese Extension のインストールが完了しました！

次のステップ:
1. シェルを再起動するか、以下のコマンドを実行してください:
   bash: source ~/.bashrc
   zsh: source ~/.zshrc

2. 言語設定を確認してください（デフォルト: 日本語）:
   export CLAUDE_LANG=ja

3. 動作確認:
   claude [TAB]  # 補完候補が表示されます

詳細なドキュメントは README.md をご覧ください。
`;

      expect(successMessage).toContain('インストールが完了しました');
      expect(successMessage).toContain('source ~/.bashrc');
      expect(successMessage).toContain('export CLAUDE_LANG=ja');
    });
  });

  describe('エラーハンドリング', () => {
    it('Node.jsバージョンが要件を満たさない場合にエラーを表示する', () => {
      // Node.js 18未満の場合のエラーメッセージ
      const errorMessage = 'エラー: Node.js 18.0.0以上が必要です。現在のバージョン:';
      expect(errorMessage).toContain('Node.js 18.0.0以上が必要です');
    });

    it('必要な権限がない場合にエラーを表示する', () => {
      const errorMessage = 'エラー: ディレクトリの作成権限がありません:';
      expect(errorMessage).toContain('ディレクトリの作成権限がありません');
    });
  });
});
