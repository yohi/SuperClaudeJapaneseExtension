# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# SuperClaude Japanese Extension

SuperClaude Framework の日本語化拡張プロジェクト

## 開発ガイドライン
- 思考は英語、回答の生成は日本語で行う

## 開発コマンド

### ビルド
```bash
npm run build
```
TypeScriptコードを `dist/` ディレクトリにコンパイルします。型定義ファイル（.d.ts）とソースマップも生成されます。

### テスト
```bash
# すべてのテストを実行
npm test

# 特定のテストスイートを実行（例: i18nユニットテスト）
npm test -- tests/unit/i18n/

# 特定のテストファイルを実行
npm test -- tests/e2e/success-criteria.test.ts

# テスト名でフィルタリング
npm test -- -t "日本語ヒントが表示されること"

# カバレッジレポート付きで実行
npm test -- --coverage
```

### リント・フォーマット
```bash
# ESLintチェック（設定されている場合）
npm run lint

# 自動修正
npm run lint:fix

# Prettierフォーマット（設定されている場合）
npm run format
```

## アーキテクチャ概要

### レイヤー構成

プロジェクトは以下の4層アーキテクチャで構成されています:

1. **CLI / Shell Integration Layer** (`src/completions/helpers/`)
   - bash/zsh補完スクリプトとの統合
   - `get-hints.ts`: シェル補完用CLIエントリーポイント

2. **Application Layer** (`src/index.ts`)
   - パブリックAPIのエクスポート
   - すべての主要コンポーネントの型定義とインスタンス化インターフェース

3. **Domain Layer** (機能コンポーネント)
   - `src/i18n/`: 翻訳管理（I18nManager, TranslationLoader）
   - `src/hint/`: コマンドヒント生成（HintProvider）
   - `src/completion/`: 補完エンジン（CompletionEngine）
   - `src/metadata/`: コマンドメタデータ解析（MetadataParser, CommandMetadataLoader）

4. **Infrastructure Layer** (インフラコンポーネント)
   - `src/cache/`: LRUキャッシュ（CacheManager）
   - `src/utils/`: ロガー、エラーハンドラー、メトリクス収集

### データフロー

```
Shell (bash/zsh)
  ↓
get-hints.ts (CLIヘルパー)
  ↓
CompletionEngine / HintProvider
  ↓
I18nManager ← TranslationLoader (translations/ja/*.json)
  ↓
MetadataLoader ← MetadataParser (tests/fixtures/commands/*.md)
  ↓
CacheManager (LRU cache, TTL: 1h)
```

### 重要な設計パターン

**Result型パターン**: すべての主要APIは `Result<T, E>` 型を返します
```typescript
type Result<T, E = Error> =
  | { ok: true; value: T }
  | { ok: false; error: E };
```
エラーハンドリングは常に `result.ok` でチェックしてから `result.value` または `result.error` にアクセスします。

**依存性注入**: コンポーネントは依存関係をコンストラクタで受け取ります
```typescript
const hintProvider = new HintProvider(i18nManager, metadataLoader);
const completionEngine = new CompletionEngine(metadataLoader, i18nManager);
```

**キャッシュ戦略**: LRUキャッシュ（最大100エントリ、TTL 1時間）により、翻訳データとメタデータ解析結果を高速化

## テストデータとフィクスチャ

### テストフィクスチャの場所
- `tests/fixtures/commands/`: コマンドメタデータのMarkdownファイル
  - 各コマンドは `<command-name>.md` 形式で定義
  - YAMLフロントマターでメタデータを記述

### フィクスチャフォーマット例
```markdown
---
description: English description
description-ja: 日本語の説明
argument-hint: "[arg]"
argument-hint-ja: "引数の説明"
category: 開発・デプロイ
allowed-tools:
  - read_file
  - write_file
---

# Command Body
```

### カテゴリ名の標準
- `開発・デプロイ`: build, implement, test
- `分析・調査`: analyze, troubleshoot, explain
- `品質・強化`: improve, cleanup

## コーディング規約

### コマンドメタデータの追加手順

1. `tests/fixtures/commands/` に `<command-name>.md` を作成
2. YAMLフロントマターに必須フィールドを記述:
   - `description`: 英語説明
   - `description-ja`: 日本語説明
   - `category`: カテゴリ名（日本語）
3. `src/completions/helpers/get-hints.ts` に `registerCommand()` を追加
4. E2Eテスト（`tests/e2e/success-criteria.test.ts`）で動作確認

### 翻訳データの追加
- `translations/ja/commands.json`: コマンド翻訳
- `translations/ja/flags.json`: フラグ翻訳
- `translations/ja/errors.json`: エラーメッセージ翻訳

## アクティブな仕様

- `superclaud-japanese-i18n` - SuperClaude Framework の日本語化とコマンドオプション機能強化
  - フェーズ: requirements_generated（要件承認待ち）
  - パス: `.kiro/specs/superclaud-japanese-i18n/`
