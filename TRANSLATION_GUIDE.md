# 翻訳追加ガイド

このガイドでは、SuperClaude Japanese Extension に新しい翻訳を追加する方法を説明します。

## 📚 目次

1. [翻訳データの構造](#翻訳データの構造)
2. [新規コマンドの翻訳追加](#新規コマンドの翻訳追加)
3. [新規フラグの翻訳追加](#新規フラグの翻訳追加)
4. [エラーメッセージの翻訳追加](#エラーメッセージの翻訳追加)
5. [バリデーションとテスト](#バリデーションとテスト)
6. [ベストプラクティス](#ベストプラクティス)
7. [トラブルシューティング](#トラブルシューティング)

---

## 翻訳データの構造

翻訳データは `translations/` ディレクトリ配下に、言語ごとに分かれています。

```
translations/
├── ja/                     # 日本語翻訳
│   ├── commands.json      # コマンド翻訳
│   ├── flags.json         # フラグ翻訳
│   ├── arguments.json     # 引数翻訳
│   └── errors.json        # エラーメッセージ翻訳
└── en/                     # 英語翻訳（フォールバック）
    ├── commands.json
    ├── flags.json
    ├── arguments.json
    └── errors.json
```

### ファイル形式

すべての翻訳ファイルはJSON形式で、以下の基本構造を持ちます:

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-10-08",
  "<カテゴリー>": {
    "<キー>": {
      "description": "説明テキスト",
      "category": "カテゴリー（オプション）",
      "example": "使用例（オプション）"
    }
  }
}
```

---

## 新規コマンドの翻訳追加

### 手順

#### 1. commands.jsonを編集

`translations/ja/commands.json` を開きます。

#### 2. 新しいコマンドのエントリを追加

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-10-08",
  "commands": {
    "your-new-command": {
      "description": "コマンドの日本語説明",
      "category": "カテゴリー名",
      "arguments": {
        "argument1": "引数1の説明",
        "argument2": "引数2の説明"
      },
      "example": "使用例: claude /your-new-command [argument1] --flag"
    }
  }
}
```

#### 3. 英語フォールバックを追加（オプションだが推奨）

`translations/en/commands.json` にも同様のエントリを追加します。

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-10-08",
  "commands": {
    "your-new-command": {
      "description": "English description of the command",
      "category": "Category name",
      "arguments": {
        "argument1": "Description of argument 1",
        "argument2": "Description of argument 2"
      },
      "example": "Usage: claude /your-new-command [argument1] --flag"
    }
  }
}
```

### カテゴリー一覧

| カテゴリー | 説明 |
|-----------|------|
| `開発・デプロイ` | ビルド、実装などの開発関連コマンド |
| `分析・調査` | コード分析、トラブルシューティング |
| `品質・強化` | コード改善、説明、クリーンアップ |
| `ドキュメント` | ドキュメント生成 |
| `プランニング` | 見積もり、設計 |
| `テスト` | テスト実行、レポート |
| `バージョン管理` | Git操作 |
| `メタ` | タスク管理、インデックス生成 |

### 例: buildコマンドの翻訳

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-10-08",
  "commands": {
    "build": {
      "description": "フレームワーク検出付きプロジェクトビルダー - 自動的にビルドツールを検知して実行",
      "category": "開発・デプロイ",
      "arguments": {
        "target": "ビルド対象を指定（例: production, development, staging）"
      },
      "example": "使用例: claude /build production --plan"
    }
  }
}
```

---

## 新規フラグの翻訳追加

### 手順

#### 1. flags.jsonを編集

`translations/ja/flags.json` を開きます。

#### 2. 新しいフラグのエントリを追加

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-10-08",
  "flags": {
    "your-new-flag": {
      "description": "フラグの日本語説明",
      "alias": "エイリアス（オプション）",
      "example": "使用例: --your-new-flag",
      "category": "カテゴリー"
    }
  }
}
```

### フラグカテゴリー

| カテゴリー | 説明 | 例 |
|-----------|------|-----|
| `実行制御` | 実行方法の制御 | `--plan`, `--think` |
| `トークン最適化` | トークン使用量の削減 | `--uc`, `--ultracompressed` |
| `検証・安全性` | バリデーション関連 | `--validate`, `--safe-mode` |
| `MCP制御` | MCPサーバー制御 | `--c7`, `--seq`, `--play` |
| `委譲・並行処理` | タスク委譲と並行処理 | `--delegate`, `--concurrency` |
| `スコープ制御` | 処理範囲の制限 | `--scope`, `--focus` |
| `ループ・繰り返し` | 反復処理 | `--loop`, `--iterations` |
| `ペルソナ` | AIペルソナ選択 | `--persona-*` |
| `内省・可視化` | 内部状態の表示 | `--introspect` |

### 例: planフラグの翻訳

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-10-08",
  "flags": {
    "plan": {
      "description": "実行前に計画を表示 - コード変更前に実行内容を確認",
      "example": "使用例: claude /build --plan",
      "category": "実行制御"
    }
  }
}
```

### エイリアス付きフラグの例

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-10-08",
  "flags": {
    "ultracompressed": {
      "description": "トークン使用を30-50%削減 - 応答を極限まで圧縮",
      "alias": "uc",
      "example": "使用例: claude /analyze --uc",
      "category": "トークン最適化"
    }
  }
}
```

---

## エラーメッセージの翻訳追加

### 手順

#### 1. errors.jsonを編集

`translations/ja/errors.json` を開きます。

#### 2. 新しいエラーメッセージのエントリを追加

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-10-08",
  "errors": {
    "ERROR_CODE": "エラーメッセージの日本語訳"
  }
}
```

### 既存のエラーコード

| エラーコード | 説明 |
|-------------|------|
| `COMMAND_NOT_FOUND` | コマンドが見つからない |
| `FLAG_NOT_FOUND` | フラグが見つからない |
| `ARGUMENT_NOT_FOUND` | 引数が見つからない |
| `TRANSLATION_NOT_FOUND` | 翻訳が見つからない |
| `TRANSLATION_UNAVAILABLE` | 翻訳が利用不可 |
| `FILE_NOT_FOUND` | ファイルが見つからない |
| `PARSE_ERROR` | パースエラー |
| `INIT_FAILED` | 初期化失敗 |
| `RESOURCE_NOT_FOUND` | リソースが見つからない |
| `INVALID_COMMAND` | 無効なコマンド |
| `NO_CANDIDATES_FOUND` | 候補が見つからない |

### 例: エラーメッセージの翻訳

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-10-08",
  "errors": {
    "COMMAND_NOT_FOUND": "コマンド \"{{command}}\" が見つかりません",
    "FLAG_NOT_FOUND": "フラグ \"{{flag}}\" は利用できません",
    "NO_CANDIDATES_FOUND": "候補が見つかりませんでした"
  }
}
```

**注意**: `{{variable}}` 記法は動的な値の挿入に使用されます。

---

## バリデーションとテスト

### 1. JSONスキーマバリデーション

翻訳データはJSONスキーマで検証されます。スキーマファイルは `schemas/` ディレクトリにあります。

```bash
# バリデーションツールを実行（将来実装予定）
npm run validate:translations
```

### 2. ユニットテストの実行

翻訳追加後は、必ずテストを実行してください。

```bash
# 翻訳関連のテストを実行
npm test -- tests/unit/i18n/

# すべてのテストを実行
npm test
```

### 3. 統合テストの実行

```bash
# 統合テストを実行
npm test -- tests/integration/
```

### 4. 手動確認

実際にコマンドを実行して、翻訳が正しく表示されることを確認します。

```bash
# 言語を日本語に設定
export CLAUDE_LANG=ja

# コマンドを実行して翻訳を確認
claude /your-new-command --help
```

---

## ベストプラクティス

### 1. 翻訳の品質

#### ✅ 良い翻訳の例

```json
{
  "build": {
    "description": "フレームワーク検出付きプロジェクトビルダー - 自動的にビルドツールを検知して実行",
    "category": "開発・デプロイ"
  }
}
```

- **明確**: 何をするコマンドか一目で分かる
- **簡潔**: 1-2文で説明
- **具体的**: 「フレームワーク検出付き」など具体的な機能を記載

#### ❌ 避けるべき翻訳の例

```json
{
  "build": {
    "description": "ビルドする",  // 不十分
    "category": "開発・デプロイ"
  }
}
```

### 2. 用語の統一

以下の用語を統一して使用してください:

| 英語 | 日本語 |
|------|--------|
| Command | コマンド |
| Flag | フラグ |
| Argument | 引数 |
| Option | オプション |
| Token | トークン |
| Persona | ペルソナ |
| Validation | 検証 |
| Debug | デバッグ |

### 3. 使用例の提供

可能な限り、具体的な使用例を提供してください。

```json
{
  "implement": {
    "description": "TDD方式の機能実装エージェント",
    "example": "使用例: claude /implement user-authentication --think --validate"
  }
}
```

### 4. バージョン管理

翻訳ファイルを更新したら、必ず `lastUpdated` フィールドを更新してください。

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-10-08",  // ← 更新日を記録
  "commands": {
    // ...
  }
}
```

### 5. 英語フォールバックの維持

日本語翻訳を追加したら、必ず対応する英語翻訳も追加してください。

---

## トラブルシューティング

### 翻訳が表示されない

**原因1**: キャッシュが古い

**解決策**:
```bash
# キャッシュをクリア
rm -rf ~/.claude/extensions/japanese-i18n/cache

# アプリケーションを再起動
```

**原因2**: JSONフォーマットエラー

**解決策**:
```bash
# JSONファイルの構文チェック
npm run lint:json  # 将来実装予定

# または手動でJSONファイルをバリデート
jq . translations/ja/commands.json
```

**原因3**: 翻訳キーの不一致

**解決策**:
- コマンド名、フラグ名と翻訳キーが一致しているか確認
- 大文字小文字、ハイフンの有無に注意

### 文字化けする

**原因**: ファイルのエンコーディング

**解決策**:
```bash
# ファイルをUTF-8で保存
file translations/ja/commands.json
# → UTF-8 Unicode text であることを確認
```

### テストが失敗する

**原因**: スキーマバリデーションエラー

**解決策**:
1. エラーメッセージを確認
2. JSONスキーマ定義（`schemas/` ディレクトリ）と照合
3. 必須フィールドがすべて含まれているか確認

---

## 貢献方法

### プルリクエストの作成

1. フォークする
2. フィーチャーブランチを作成
   ```bash
   git checkout -b translation/add-new-command
   ```
3. 翻訳を追加
4. テストを実行
   ```bash
   npm test
   ```
5. コミット
   ```bash
   git commit -m "feat: add Japanese translation for /new-command"
   ```
6. プッシュ
   ```bash
   git push origin translation/add-new-command
   ```
7. プルリクエストを作成

### コミットメッセージ規約

翻訳関連のコミットは以下の形式で記述してください:

```
feat: add Japanese translation for /command-name
fix: correct translation for --flag-name
docs: update translation guide
```

---

## サポート

質問や問題がある場合は、以下をご利用ください:

- **ドキュメント**: [README.md](README.md)
- **Issues**: [GitHub Issues](https://github.com/yohi/SuperClaudeJapaneseExtension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yohi/SuperClaudeJapaneseExtension/discussions)

---

**翻訳の貢献、ありがとうございます！** 🙏
