# 技術スタック定義

## プログラミング言語

### TypeScript 5.3+

**選定理由**:
- 型安全性によるバグ削減とリファクタリングの容易性
- エディタの補完機能による開発効率向上
- Node.js環境との親和性
- SuperClaude FrameworkのClaude Code統合との整合性

**設定（tsconfig.json）**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "moduleResolution": "node",
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

## ランタイム環境

### Node.js 18.x LTS（最小バージョン）

**選定理由**:
- Claude Codeの実行環境に準拠
- LTSサポートによる長期安定性
- ES Modules、Top-level await、Performance APIなどの必要機能サポート

**互換性**:
- Node.js 18.x, 20.x, 22.x でテスト
- package.json engines指定: `"node": ">=18.0.0"`

## コア依存ライブラリ

### i18next (v23.15+)

**用途**: 翻訳管理システムの基盤
**選定理由**:
- 業界標準の国際化ライブラリ
- 軽量（約30KB minified）
- メモリキャッシュ内蔵
- 名前空間分離機能
- フォールバック言語サポート

**設定例**:
```typescript
import i18next from 'i18next';
import Backend from 'i18next-fs-backend';

i18next
  .use(Backend)
  .init({
    lng: 'ja',
    fallbackLng: 'en',
    ns: ['commands', 'flags', 'errors'],
    defaultNS: 'commands',
    backend: {
      loadPath: './translations/{{lng}}/{{ns}}.json'
    },
    interpolation: {
      escapeValue: false
    },
    initImmediate: false
  });
```

### yaml (v2.4+)

**用途**: YAMLフロントマターの解析
**選定理由**:
- 公式YAML 1.2仕様準拠
- TypeScript型定義完備
- 高速パース（JSON並み）
- エラーメッセージが詳細

**使用例**:
```typescript
import YAML from 'yaml';

const doc = YAML.parse(yamlString);
const metadata = doc as CommandMetadata;
```

### chalk (v5.3+)

**用途**: ターミナル出力の色付け
**選定理由**:
- 軽量（約5KB）
- クロスプラットフォーム対応
- チェーン可能なAPI
- 256色サポート

**使用例**:
```typescript
import chalk from 'chalk';

console.log(chalk.blue.bold('コマンド: /build'));
console.log(chalk.gray('説明: プロジェクトをビルド'));
```

### fast-levenshtein (v3.0+)

**用途**: タイポ修正提案（Levenshtein距離計算）
**選定理由**:
- 最速のLevenshtein距離実装（C++バインディング不要）
- 純粋なJavaScript実装
- シンプルなAPI

**使用例**:
```typescript
import levenshtein from 'fast-levenshtein';

const distance = levenshtein.get('buidl', 'build'); // 2
```

## 開発依存ライブラリ

### Jest (v29.7+)

**用途**: ユニット・統合テスト
**設定（jest.config.js）**:
```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  testMatch: ['**/*.test.ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/types.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### ESLint (v8.57+) + Prettier (v3.3+)

**用途**: コード品質・スタイル統一
**ESLint設定（.eslintrc.js）**:
```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier'
  ],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    'no-console': ['warn', { allow: ['error', 'warn'] }]
  }
};
```

**Prettier設定（.prettierrc.json）**:
```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 80,
  "tabWidth": 2
}
```

### ts-node (v10.9+)

**用途**: TypeScriptスクリプトの直接実行
**使用例**:
```bash
npx ts-node scripts/generate-schemas.ts
```

## ビルドツール

### TypeScript Compiler (tsc)

**ビルドコマンド**:
```json
{
  "scripts": {
    "build": "tsc",
    "build:watch": "tsc --watch",
    "build:clean": "rm -rf dist && tsc"
  }
}
```

### npm scripts

**主要スクリプト**:
```json
{
  "scripts": {
    "dev": "ts-node src/index.ts",
    "build": "tsc",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "lint": "eslint src/**/*.ts",
    "lint:fix": "eslint src/**/*.ts --fix",
    "format": "prettier --write 'src/**/*.ts'",
    "prepare": "npm run build",
    "prepublishOnly": "npm test && npm run lint"
  }
}
```

## データフォーマット

### JSON

**用途**: 翻訳データ、設定ファイル、キャッシュデータ
**スキーマ検証**: JSON Schema Draft-07

**翻訳データ例**:
```json
{
  "version": "1.0.0",
  "commands": {
    "build": {
      "description": "フレームワーク検出付きプロジェクトビルダー",
      "category": "開発",
      "arguments": {
        "target": "ビルド対象（例: production, development）"
      }
    }
  }
}
```

### YAML

**用途**: コマンド定義のフロントマター（既存）
**拡張フィールド**:
- `description-ja`: 日本語説明
- `argument-hint-ja`: 日本語引数ヒント

## シェルスクリプト環境

### bash 4.0+

**補完スクリプト実装**: `complete` コマンド使用

**スクリプト例**:
```bash
_claude_completion() {
  local cur="${COMP_WORDS[COMP_CWORD]}"
  local cmd="${COMP_WORDS[1]}"

  local hints=$(node ~/.claude/extensions/japanese-i18n/completions/helpers/get-hints.js "$cmd" "$cur")
  COMPREPLY=($(compgen -W "$hints" -- "$cur"))
}

complete -F _claude_completion claude
```

### zsh 5.0+

**補完スクリプト実装**: `compdef` と `_describe` 使用

**スクリプト例**:
```zsh
#compdef claude

_claude() {
  local -a commands
  commands=(${(f)"$(node ~/.claude/extensions/japanese-i18n/completions/helpers/get-hints.js commands)"})

  _describe 'commands' commands
}

_claude "$@"
```

## パフォーマンス監視

### Node.js Performance Hooks

**測定対象**:
- 翻訳データ読み込み時間
- キャッシュヒット/ミス率
- ヒント生成時間
- 補完候補生成時間

**実装例**:
```typescript
import { performance, PerformanceObserver } from 'perf_hooks';

performance.mark('translation-start');
// 翻訳処理
performance.mark('translation-end');
performance.measure('translation', 'translation-start', 'translation-end');

const obs = new PerformanceObserver((list) => {
  const entry = list.getEntries()[0];
  console.log(`Translation time: ${entry.duration}ms`);
});
obs.observe({ entryTypes: ['measure'] });
```

## ロギングシステム

### カスタムロガー実装

**ログレベル**: ERROR, WARN, INFO, DEBUG
**出力先**: ファイル（`~/.claude/extensions/japanese-i18n/logs/i18n.log`）
**ローテーション**: 10MB/ファイル、最大5ファイル

**実装**:
```typescript
class Logger {
  private logFile: string;
  private level: LogLevel;

  log(level: LogLevel, message: string, meta?: any): void {
    if (this.shouldLog(level)) {
      const entry = {
        timestamp: new Date().toISOString(),
        level,
        message,
        ...meta
      };
      fs.appendFileSync(this.logFile, JSON.stringify(entry) + '\n');
    }
  }
}
```

## キャッシュシステム

### LRUキャッシュ実装

**アルゴリズム**: Least Recently Used
**最大サイズ**: 100エントリ
**TTL**: 1時間（3600000ms）

**実装**:
```typescript
interface CacheEntry<T> {
  key: string;
  value: T;
  timestamp: number;
  accessCount: number;
}

class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private ttl: number;

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    entry.accessCount++;
    return entry.value;
  }

  set(key: string, value: T): void {
    if (this.cache.size >= this.maxSize) {
      this.evictLRU();
    }

    this.cache.set(key, {
      key,
      value,
      timestamp: Date.now(),
      accessCount: 0
    });
  }

  private evictLRU(): void {
    let lruKey: string | null = null;
    let minAccessCount = Infinity;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.accessCount < minAccessCount) {
        minAccessCount = entry.accessCount;
        lruKey = key;
      }
    }

    if (lruKey) {
      this.cache.delete(lruKey);
    }
  }
}
```

## エラーハンドリングパターン

### Result型パターン

**型定義**:
```typescript
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };

function wrapResult<T, E = Error>(fn: () => T): Result<T, E> {
  try {
    return { ok: true, value: fn() };
  } catch (error) {
    return { ok: false, error: error as E };
  }
}
```

## バージョン管理

### Git

**ブランチ戦略**: Git Flow
- `main`: 本番リリース
- `develop`: 開発統合
- `feature/*`: 機能開発
- `release/*`: リリース準備
- `hotfix/*`: 緊急修正

**コミットメッセージ規約**: Conventional Commits

```
<type>(<scope>): <subject>

<body>

<footer>
```

**type**:
- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメント
- `style`: フォーマット
- `refactor`: リファクタリング
- `test`: テスト
- `chore`: 雑務

## CI/CD

### GitHub Actions（推奨）

**ワークフロー**:
```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [18.x, 20.x, 22.x]

    steps:
      - uses: actions/checkout@v4
      - name: Use Node.js ${{ matrix.node-version }}
        uses: actions/setup-node@v4
        with:
          node-version: ${{ matrix.node-version }}
      - run: npm ci
      - run: npm run build
      - run: npm test
      - run: npm run lint
```

## パッケージ管理

### npm

**package.json必須フィールド**:
```json
{
  "name": "@superclaude/japanese-extension",
  "version": "1.0.0",
  "description": "SuperClaude Framework の日本語化拡張",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "engines": {
    "node": ">=18.0.0"
  },
  "files": [
    "dist",
    "translations",
    "completions",
    "schemas"
  ],
  "keywords": [
    "superclaude",
    "i18n",
    "japanese",
    "cli",
    "completion"
  ],
  "license": "MIT"
}
```

## セキュリティ

### 依存ライブラリ監査

**定期実行**:
```bash
npm audit
npm audit fix
```

### 脆弱性スキャン

**GitHub Dependabot**: 有効化
**npm audit**: CI/CDパイプラインに統合

## ドキュメント生成

### TypeDoc（オプション）

**API リファレンス自動生成**:
```bash
npm install --save-dev typedoc
npx typedoc --out docs/api src/index.ts
```

## 互換性マトリクス

| 環境    | バージョン    | テスト状況     |
| ------- | ------------- | -------------- |
| Node.js | 18.x          | ✅ 必須         |
| Node.js | 20.x          | ✅ 推奨         |
| Node.js | 22.x          | ✅ サポート     |
| bash    | 4.0+          | ✅ 必須         |
| zsh     | 5.0+          | ✅ 必須         |
| macOS   | 12+           | ✅ サポート     |
| Linux   | Ubuntu 20.04+ | ✅ サポート     |
| Windows | WSL2          | ⚠️ 限定サポート |

## パフォーマンス目標

| メトリクス       | 目標値  | 測定方法                 |
| ---------------- | ------- | ------------------------ |
| ヒント表示遅延   | < 100ms | performance.now()        |
| 補完候補表示     | < 200ms | シェルスクリプト実行時間 |
| 初回読み込み     | < 100ms | アプリ起動タイマー       |
| キャッシュヒット | < 10ms  | i18next内部メトリクス    |
| メモリ使用量     | < 50MB  | process.memoryUsage()    |
