# プロジェクト構造定義

## プロジェクト概要

**プロジェクト名**: SuperClaude Japanese Extension
**目的**: SuperClaude Framework の日本語化とコマンドオプション機能強化
**タイプ**: TypeScript/Node.js ライブラリ（CLIツール拡張）

## ディレクトリ構造

```
SuperClaudeJapaneseExtension/
├── .kiro/                          # Kiro仕様管理
│   ├── specs/                      # 機能仕様
│   │   └── superclaud-japanese-i18n/
│   │       ├── requirements.md
│   │       ├── design.md
│   │       ├── tasks.md
│   │       └── spec.json
│   └── steering/                   # ステアリングファイル
│       ├── structure.md            # このファイル
│       ├── tech.md
│       └── product.md
│
├── src/                            # TypeScriptソースコード
│   ├── i18n/                       # 翻訳管理レイヤー
│   │   ├── i18nManager.ts          # 翻訳マネージャー
│   │   ├── translationLoader.ts   # 翻訳ローダー
│   │   └── types.ts                # 型定義
│   │
│   ├── metadata/                   # メタデータ管理レイヤー
│   │   ├── metadataParser.ts      # YAMLフロントマターパーサー
│   │   ├── commandMetadata.ts     # コマンドメタデータキャッシュ
│   │   └── types.ts
│   │
│   ├── hint/                       # ヒント提供レイヤー
│   │   ├── hintProvider.ts        # ヒント生成エンジン
│   │   ├── commandHint.ts         # コマンドヒント
│   │   ├── flagHint.ts            # フラグヒント
│   │   └── argumentHint.ts        # 引数ヒント
│   │
│   ├── completion/                 # 補完システムレイヤー
│   │   ├── completionEngine.ts    # 補完エンジン
│   │   ├── commandCompletion.ts   # コマンド名補完
│   │   ├── flagCompletion.ts      # フラグ補完
│   │   ├── argumentCompletion.ts  # 引数補完
│   │   └── historyManager.ts      # 入力履歴管理
│   │
│   ├── cache/                      # キャッシュシステム
│   │   ├── cacheManager.ts        # LRUキャッシュ実装
│   │   └── types.ts
│   │
│   ├── utils/                      # ユーティリティ
│   │   ├── logger.ts              # ロギングシステム
│   │   ├── errorHandler.ts        # エラーハンドリング
│   │   ├── validator.ts           # バリデーション
│   │   └── performance.ts         # パフォーマンス測定
│   │
│   └── index.ts                    # エントリーポイント
│
├── translations/                   # 翻訳データ
│   ├── ja/                         # 日本語翻訳
│   │   ├── commands.json
│   │   ├── flags.json
│   │   └── errors.json
│   │
│   └── en/                         # 英語翻訳（フォールバック）
│       ├── commands.json
│       ├── flags.json
│       └── errors.json
│
├── completions/                    # シェル補完スクリプト
│   ├── bash/
│   │   └── claude-complete.bash   # bash補完スクリプト
│   │
│   ├── zsh/
│   │   └── _claude                # zsh補完スクリプト
│   │
│   └── helpers/
│       └── get-hints.js           # Node.jsヘルパースクリプト
│
├── schemas/                        # JSONスキーマ定義
│   ├── command-translation.schema.json
│   ├── flag-translation.schema.json
│   └── error-translation.schema.json
│
├── tests/                          # テストファイル
│   ├── unit/                       # ユニットテスト
│   │   ├── i18n/
│   │   ├── metadata/
│   │   ├── hint/
│   │   ├── completion/
│   │   └── cache/
│   │
│   ├── integration/                # 統合テスト
│   │   ├── translation-flow.test.ts
│   │   ├── hint-display.test.ts
│   │   └── shell-completion.test.ts
│   │
│   ├── e2e/                        # E2Eテスト
│   │   └── user-workflow.test.ts
│   │
│   └── performance/                # パフォーマンステスト
│       └── benchmarks.test.ts
│
├── scripts/                        # ビルド・セットアップスクリプト
│   ├── install.sh                  # インストールスクリプト
│   ├── setup-completions.sh        # 補完設定スクリプト
│   └── generate-schemas.ts         # スキーマ生成スクリプト
│
├── dist/                           # コンパイル済みJavaScript（gitignore）
├── logs/                           # ログファイル（gitignore）
├── node_modules/                   # 依存ライブラリ（gitignore）
│
├── package.json                    # NPMパッケージ設定
├── tsconfig.json                   # TypeScript設定
├── jest.config.js                  # Jestテスト設定
├── .gitignore
├── README.md                       # プロジェクトドキュメント
├── CHANGELOG.md                    # 変更履歴
└── LICENSE                         # ライセンス

```

## ファイル命名規則

### TypeScriptファイル
- **PascalCase**: クラス定義ファイル（例: `I18nManager.ts` → `i18nManager.ts`）
- **camelCase**: 関数・変数（例: `translationLoader.ts`）
- **kebab-case**: マルチワードファイル（例: `command-hint.ts`）

### 翻訳データファイル
- **kebab-case.json**: `commands.json`, `flags.json`, `errors.json`

### テストファイル
- **[対象ファイル名].test.ts**: `i18nManager.test.ts`
- **[機能名]-flow.test.ts**: 統合テスト

### スクリプトファイル
- **kebab-case.sh**: シェルスクリプト
- **kebab-case.ts**: TypeScriptスクリプト

## モジュール構成

### レイヤー構造

```
┌─────────────────────────────────────────────┐
│          CLI / Shell Integration            │ ← bash/zsh補完スクリプト
├─────────────────────────────────────────────┤
│       Application Layer (Public API)        │ ← index.ts（エクスポート）
├─────────────────────────────────────────────┤
│  ┌──────────────┐  ┌────────────────────┐  │
│  │ Hint Provider│  │ Completion Engine  │  │ ← 機能レイヤー
│  └──────────────┘  └────────────────────┘  │
├─────────────────────────────────────────────┤
│  ┌──────────────┐  ┌────────────────────┐  │
│  │ I18n Manager │  │ Metadata Parser    │  │ ← データ管理レイヤー
│  └──────────────┘  └────────────────────┘  │
├─────────────────────────────────────────────┤
│  ┌──────────────────────────────────────┐  │
│  │    Cache Manager / Logger / Utils    │  │ ← インフラレイヤー
│  └──────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
```

### 依存関係ルール

1. **上位レイヤーは下位レイヤーに依存可能**（逆は禁止）
2. **同一レイヤー内のモジュール間依存は最小化**
3. **インターフェースを通じた疎結合を維持**

## エントリーポイント

### Public API（index.ts）

```typescript
// エクスポートされる主要インターフェース
export { I18nManager } from './i18n/i18nManager';
export { HintProvider } from './hint/hintProvider';
export { CompletionEngine } from './completion/completionEngine';
export { MetadataParser } from './metadata/metadataParser';

// 型定義
export type {
  SupportedLocale,
  TranslationResource,
  CommandMetadata,
  HintOutput,
  CompletionItem
} from './types';
```

### CLIエントリーポイント（補完ヘルパー）

```javascript
// completions/helpers/get-hints.js
const { CompletionEngine } = require('../../dist/index');
// コマンドライン引数を解析して補完候補を返す
```

## ビルド成果物

### npm パッケージ構成

```
dist/
├── index.js              # メインエントリーポイント
├── index.d.ts            # TypeScript型定義
├── i18n/
├── metadata/
├── hint/
├── completion/
├── cache/
└── utils/
```

### 配布ファイル

- **NPMパッケージ**: `@superclaude/japanese-extension`
- **補完スクリプト**: `completions/` ディレクトリ全体を含む
- **翻訳データ**: `translations/` ディレクトリ全体を含む

## インストール後の構造

ユーザー環境では以下の構成となる:

```
~/.claude/
├── commands/               # 既存のSuperClaude Framework
├── CLAUDE.md
├── COMMANDS.md
├── FLAGS.md
└── extensions/             # 拡張機能（新規）
    └── japanese-i18n/
        ├── dist/           # コンパイル済みコード
        ├── translations/   # 翻訳データ
        ├── completions/    # 補完スクリプト
        └── logs/           # ログファイル
```

## データフロー

```
ユーザー入力
    ↓
シェル補完スクリプト
    ↓
Node.jsヘルパー（get-hints.js）
    ↓
CompletionEngine
    ↓
MetadataParser → I18nManager
    ↓
HintProvider
    ↓
フォーマット済みヒント
    ↓
シェル表示
```

## 設定ファイル

### 環境変数

- `CLAUDE_LANG`: 言語設定（`en` | `ja`、デフォルト: `ja`）
- `CLAUDE_I18N_LOG_LEVEL`: ログレベル（`ERROR` | `WARN` | `INFO` | `DEBUG`）
- `CLAUDE_I18N_CACHE_TTL`: キャッシュTTL（ミリ秒、デフォルト: 3600000）

### ユーザー設定ファイル（オプション）

```
~/.claude/extensions/japanese-i18n/config.json
{
  "locale": "ja",
  "logLevel": "INFO",
  "cacheTtl": 3600000,
  "enableCompletion": true,
  "completionHistorySize": 1000
}
```

## バージョン管理

- **セマンティックバージョニング**: MAJOR.MINOR.PATCH
- **MAJOR**: 破壊的変更（APIの非互換変更）
- **MINOR**: 機能追加（後方互換性あり）
- **PATCH**: バグ修正（後方互換性あり）

初期バージョン: `1.0.0`

## ドキュメント構成

```
docs/
├── README.md               # プロジェクト概要
├── INSTALLATION.md         # インストールガイド
├── USAGE.md                # 使用方法
├── TRANSLATION_GUIDE.md   # 翻訳追加ガイド
├── API.md                  # API リファレンス
├── TROUBLESHOOTING.md      # トラブルシューティング
└── CONTRIBUTING.md         # 貢献ガイド
```
