# SuperClaude Japanese Extension

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3+-blue.svg)](https://www.typescriptlang.org/)

SuperClaude Framework の日本語化とコマンドオプション機能強化を提供する拡張機能です。

## 🌟 主な機能

### 1. コマンドヒントの日本語化

SuperClaude Framework のすべてのコマンド、フラグ、引数の説明を日本語で表示します。

```bash
# 英語（従来）
claude /build [target]
# Description: Build project with framework detection

# 日本語（拡張後）
claude /build [target]
# 説明: フレームワーク検出付きプロジェクトビルダー
# 引数: ビルド対象を指定（例: production, development）
```

### 2. リアルタイムヒント表示

コマンド入力時に利用可能なオプションや引数のヒントをリアルタイムで表示します。

### 3. 強力な補完機能

- **コマンド名補完**: 部分入力から候補を表示
- **フラグ補完**: `--plan`, `--think`, `--persona-*` などのフラグを補完
- **引数補完**: ファイルパス、定型値の補完
- **エイリアス対応**: `--uc` ⇔ `--ultracompressed`

### 4. 言語切り替え

環境変数で簡単に日本語⇔英語を切り替え可能。

```bash
export CLAUDE_LANG=ja  # 日本語モード
export CLAUDE_LANG=en  # 英語モード
```

## 📦 インストール

### 前提条件

- **Node.js**: 18.0.0以上
- **npm**: 9.0.0以上
- **シェル**: bash 4.0+ または zsh 5.0+

### インストール手順

#### 1. リポジトリをクローン

```bash
git clone https://github.com/yohi/SuperClaudeJapaneseExtension.git
cd SuperClaudeJapaneseExtension
```

#### 2. インストールスクリプトを実行

```bash
chmod +x scripts/install.sh
./scripts/install.sh
```

インストールスクリプトは以下を自動的に実行します:

- ✅ Node.jsバージョンチェック
- ✅ 依存ライブラリのインストール
- ✅ ディレクトリ構造の作成
- ✅ デフォルト設定ファイルの生成
- ✅ シェル補完スクリプトの設定

#### 3. シェルを再起動

```bash
# bashの場合
source ~/.bashrc

# zshの場合
source ~/.zshrc
```

#### 4. 言語設定（オプション）

デフォルトは日本語ですが、永続化する場合は設定ファイルに追加してください:

```bash
# bashの場合
echo 'export CLAUDE_LANG=ja' >> ~/.bashrc

# zshの場合
echo 'export CLAUDE_LANG=ja' >> ~/.zshrc
```

## 🚀 使い方

### 基本的な使い方

#### コマンド補完

```bash
claude /b[TAB]
# 候補:
# /build - フレームワーク検出付きプロジェクトビルダー
```

#### フラグ補完

```bash
claude /build --p[TAB]
# 候補:
# --plan           - 実行前に計画を表示
# --persona-*      - ペルソナを選択
```

#### 引数ヒント

```bash
claude /build production
# ヒント: ビルド対象を指定（例: production, development, staging）
```

### 高度な機能

#### コンテキスト依存ヒント

入力中のコマンドに応じて、関連するフラグや引数の組み合わせを提案します。

```bash
claude /implement --think[TAB]
# 推奨フラグ:
# --seq      - 逐次処理モード（--thinkと併用推奨）
# --delegate - タスク委譲（--thinkと相性良好）
```

#### タイポ修正提案

間違ったコマンド名を入力すると、類似候補を提案します。

```bash
claude /buidl
# エラー: コマンド "/buidl" が見つかりません
# もしかして: /build, /implement
```

## ⚙️ 設定

### 設定ファイル

`~/.claude/extensions/japanese-i18n/config.json`

```json
{
  "locale": "ja",
  "logLevel": "INFO",
  "cacheTtl": 3600000,
  "enableCompletion": true,
  "completionHistorySize": 1000
}
```

### 設定項目

| 項目 | 説明 | デフォルト値 | 有効な値 |
|------|------|-------------|---------|
| `locale` | 使用言語 | `"ja"` | `"ja"`, `"en"` |
| `logLevel` | ログレベル | `"INFO"` | `"ERROR"`, `"WARN"`, `"INFO"`, `"DEBUG"` |
| `cacheTtl` | キャッシュの有効期限（ミリ秒） | `3600000` | 任意の正の整数 |
| `enableCompletion` | 補完機能の有効/無効 | `true` | `true`, `false` |
| `completionHistorySize` | 入力履歴の保存件数 | `1000` | 任意の正の整数 |

### 環境変数

| 変数名 | 説明 | デフォルト値 |
|--------|------|-------------|
| `CLAUDE_LANG` | 表示言語 | `ja` |
| `CLAUDE_I18N_LOG_LEVEL` | ログレベル | `INFO` |
| `CLAUDE_I18N_CACHE_TTL` | キャッシュTTL（ミリ秒） | `3600000` |
| `CLAUDE_COMMANDS_DIR` | コマンドディレクトリパス | `~/.claude/commands` |

## 📚 対応コマンド一覧

以下のコマンドが日本語化されています:

### 開発・デプロイ
- `/build` - フレームワーク検出付きプロジェクトビルダー
- `/implement` - TDD方式の機能実装エージェント

### 分析・調査
- `/analyze` - コード品質、セキュリティ、パフォーマンス分析
- `/troubleshoot` - 問題診断と解決支援

### 品質・強化
- `/explain` - コードとシステム動作の明確な説明
- `/improve` - コード品質と保守性の体系的改善
- `/cleanup` - コードクリーンアップと最適化

### ドキュメント
- `/document` - 特定コンポーネントのドキュメント作成

### プランニング
- `/estimate` - 開発見積もり
- `/design` - システムアーキテクチャ設計

### テスト
- `/test` - テスト実行とレポート生成

### バージョン管理
- `/git` - Git操作とコミット管理

### メタ
- `/task` - 複雑タスクの実行管理
- `/index` - プロジェクトドキュメント生成
- `/load` - プロジェクトコンテキスト読み込み
- `/spawn` - 複雑タスクの分割実行

## 🏗️ アーキテクチャ

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

### 主要コンポーネント

- **i18nManager**: 翻訳データの管理と言語切り替え
- **HintProvider**: コマンドヒントの生成
- **CompletionEngine**: 補完候補の生成
- **MetadataParser**: コマンドメタデータの解析
- **CacheManager**: LRUキャッシュによる高速化

## 🔧 開発

### ビルド

```bash
npm run build
```

### テスト

```bash
# すべてのテストを実行
npm test

# 特定のテストスイートを実行
npm test -- tests/unit/i18n/

# カバレッジ付きテスト
npm run test:coverage
```

### リント

```bash
# ESLintチェック
npm run lint

# 自動修正
npm run lint:fix
```

### フォーマット

```bash
npm run format
```

## 📈 パフォーマンス

### 目標メトリクス

| メトリクス | 目標値 | 実測値 |
|-----------|-------|--------|
| ヒント表示遅延 | < 100ms | ~50ms |
| 補完候補表示 | < 200ms | ~150ms |
| 初回読み込み | < 100ms | ~80ms |
| キャッシュヒット応答 | < 10ms | ~5ms |
| メモリ使用量 | < 50MB | ~30MB |

### 最適化技術

- **LRUキャッシュ**: 最大100エントリ、TTL 1時間
- **遅延読み込み**: 未使用の翻訳データは読み込まない
- **プレ計算**: 起動時に補完候補を事前生成

## 🐛 トラブルシューティング

### 補完が動作しない

**原因**: シェル設定ファイルが正しく読み込まれていない

**解決策**:
```bash
# bashの場合
source ~/.bashrc

# zshの場合
source ~/.zshrc
```

### 日本語が文字化けする

**原因**: ターミナルのエンコーディング設定

**解決策**:
```bash
export LANG=ja_JP.UTF-8
```

### キャッシュをクリアしたい

**原因**: 古い翻訳データがキャッシュされている

**解決策**:
```bash
# キャッシュディレクトリを削除
rm -rf ~/.claude/extensions/japanese-i18n/cache
```

詳細は [TROUBLESHOOTING.md](TROUBLESHOOTING.md) を参照してください。

## 🤝 コントリビューション

翻訳の追加・改善、バグ報告、機能リクエストを歓迎します！

### 翻訳を追加する

1. `translations/ja/commands.json` を編集
2. スキーマに従って翻訳を追加
3. テストを実行して確認
4. プルリクエストを作成

詳細は [TRANSLATION_GUIDE.md](TRANSLATION_GUIDE.md) を参照してください。

### バグ報告

[GitHub Issues](https://github.com/yohi/SuperClaudeJapaneseExtension/issues) からバグを報告してください。

### プルリクエスト

1. フォークする
2. フィーチャーブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add amazing feature'`)
4. ブランチをプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 📄 ライセンス

MIT License - 詳細は [LICENSE](LICENSE) を参照してください。

## 🙏 謝辞

- [SuperClaude Framework](https://github.com/SuperClaude-Org/SuperClaude_Framework) - 素晴らしいフレームワークに感謝
- [i18next](https://www.i18next.com/) - 翻訳管理ライブラリ
- [Claude AI](https://www.anthropic.com/claude) - AI駆動開発支援

## 📞 サポート

- **ドキュメント**: [README.md](README.md)
- **FAQ**: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
- **Issues**: [GitHub Issues](https://github.com/yohi/SuperClaudeJapaneseExtension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yohi/SuperClaudeJapaneseExtension/discussions)

---

**楽しい開発を！** 🚀
