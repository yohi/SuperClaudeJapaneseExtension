import { execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

describe('Install Script', () => {
  const testDir = path.join(os.tmpdir(), 'superclaude-i18n-test');
  const installScript = path.join(__dirname, '../../scripts/install.sh');
  let originalHome: string;

  beforeEach(() => {
    // 元のHOMEを保存
    originalHome = process.env.HOME || '';

    // テスト用ディレクトリを作成
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
    fs.mkdirSync(testDir, { recursive: true });

    // インストール先をサンドボックス化
    process.env.HOME = testDir;
  });

  afterEach(() => {
    // HOME環境変数を復元
    process.env.HOME = originalHome;

    // クリーンアップ
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  describe('インストールスクリプトの実行', () => {
    it('install.sh を実行して期待アーティファクトが生成される', () => {
      // スクリプトを実行
      execSync(`bash "${installScript}"`, {
        stdio: 'inherit',
        env: { ...process.env, HOME: testDir },
      });

      // インストール先のベースディレクトリ
      const base = path.join(testDir, '.claude/extensions/japanese-i18n');

      // ディレクトリ構造の検証
      expect(fs.existsSync(path.join(base, 'dist'))).toBe(true);
      expect(fs.existsSync(path.join(base, 'translations/ja'))).toBe(true);
      expect(fs.existsSync(path.join(base, 'translations/en'))).toBe(true);
      expect(fs.existsSync(path.join(base, 'completions/bash'))).toBe(true);
      expect(fs.existsSync(path.join(base, 'completions/zsh'))).toBe(true);
      expect(fs.existsSync(path.join(base, 'completions/helpers'))).toBe(true);
      expect(fs.existsSync(path.join(base, 'logs'))).toBe(true);
      expect(fs.existsSync(path.join(base, 'schemas'))).toBe(true);

      // 設定ファイルの検証
      const configPath = path.join(base, 'config.json');
      expect(fs.existsSync(configPath)).toBe(true);

      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      expect(config.locale).toBe('ja');
      expect(config.logLevel).toBe('INFO');
      expect(config.cacheTtl).toBe(3600000);
      expect(config.enableCompletion).toBe(true);
      expect(config.completionHistorySize).toBe(1000);

      // シェル設定ファイルの検証
      const bashrcPath = path.join(testDir, '.bashrc');
      const zshrcPath = path.join(testDir, '.zshrc');

      if (fs.existsSync(bashrcPath)) {
        const bashrcContent = fs.readFileSync(bashrcPath, 'utf-8');
        expect(bashrcContent).toContain('SuperClaude Japanese Extension completion');
        expect(bashrcContent).toContain('claude-complete.bash');
      }

      if (fs.existsSync(zshrcPath)) {
        const zshrcContent = fs.readFileSync(zshrcPath, 'utf-8');
        expect(zshrcContent).toContain('SuperClaude Japanese Extension completion');
        expect(zshrcContent).toContain('autoload -Uz compinit');
      }
    });

    it('既存の設定ファイルがある場合は上書きしない', () => {
      // 先に設定ファイルを作成
      const base = path.join(testDir, '.claude/extensions/japanese-i18n');
      fs.mkdirSync(base, { recursive: true });

      const configPath = path.join(base, 'config.json');
      const existingConfig = {
        locale: 'en',
        logLevel: 'DEBUG',
        cacheTtl: 7200000,
        enableCompletion: false,
        completionHistorySize: 500,
      };
      fs.writeFileSync(configPath, JSON.stringify(existingConfig, null, 2));

      // インストールスクリプトを実行
      execSync(`bash "${installScript}"`, {
        stdio: 'inherit',
        env: { ...process.env, HOME: testDir },
      });

      // 設定ファイルが上書きされていないことを確認
      const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      expect(config.locale).toBe('en');
      expect(config.logLevel).toBe('DEBUG');
      expect(config.cacheTtl).toBe(7200000);
      expect(config.enableCompletion).toBe(false);
      expect(config.completionHistorySize).toBe(500);
    });

    it('重複してインストールしても補完設定が重複追加されない', () => {
      // 1回目のインストール
      execSync(`bash "${installScript}"`, {
        stdio: 'inherit',
        env: { ...process.env, HOME: testDir },
      });

      const bashrcPath = path.join(testDir, '.bashrc');
      const zshrcPath = path.join(testDir, '.zshrc');

      let firstBashrcContent = '';
      let firstZshrcContent = '';

      if (fs.existsSync(bashrcPath)) {
        firstBashrcContent = fs.readFileSync(bashrcPath, 'utf-8');
      }

      if (fs.existsSync(zshrcPath)) {
        firstZshrcContent = fs.readFileSync(zshrcPath, 'utf-8');
      }

      // 2回目のインストール
      execSync(`bash "${installScript}"`, {
        stdio: 'inherit',
        env: { ...process.env, HOME: testDir },
      });

      // 補完設定が重複していないことを確認
      if (fs.existsSync(bashrcPath)) {
        const secondBashrcContent = fs.readFileSync(bashrcPath, 'utf-8');
        expect(secondBashrcContent).toBe(firstBashrcContent);

        // "SuperClaude Japanese Extension completion"が1回だけ出現することを確認
        const matches = secondBashrcContent.match(/SuperClaude Japanese Extension completion/g);
        expect(matches?.length).toBe(1);
      }

      if (fs.existsSync(zshrcPath)) {
        const secondZshrcContent = fs.readFileSync(zshrcPath, 'utf-8');
        expect(secondZshrcContent).toBe(firstZshrcContent);

        // "SuperClaude Japanese Extension completion"が1回だけ出現することを確認
        const matches = secondZshrcContent.match(/SuperClaude Japanese Extension completion/g);
        expect(matches?.length).toBe(1);
      }
    });
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
});
