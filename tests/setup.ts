jest.setTimeout(10000);

beforeAll(() => {
  process.env.NODE_ENV = 'test';
  process.env.CLAUDE_LANG = 'ja';
});

global.console = {
  ...console,
  error: jest.fn(),
  warn: jest.fn(),
};
