/**
 * Jest テストセットアップファイル
 * すべてのテストファイルの実行前に実行される
 */

// テストタイムアウトを設定（必要に応じて）
jest.setTimeout(10000);

// グローバルな beforeAll
beforeAll(() => {
  // テスト環境のセットアップ
  process.env.NODE_ENV = 'test';
  process.env.CLAUDE_LANG = 'ja';
});

// グローバルな afterAll
afterAll(() => {
  // クリーンアップ処理
});

// console.error のモック化（不要なエラーログを抑制）
global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
