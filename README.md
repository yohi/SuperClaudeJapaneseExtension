# SuperClaude Japanese Extension

SuperClaude Framework の日本語化とコマンドオプション機能強化

## 概要

このプロジェクトは、[SuperClaude Framework](https://github.com/SuperClaude-Org/SuperClaude_Framework) の日本語ユーザー向けに、以下の機能を提供します：

- **コマンドヒントの日本語化**: すべてのコマンド、フラグ、引数の説明を日本語で表示
- **リアルタイムヒント表示**: コマンド入力時に即座にヒントを表示
- **補完機能**: bash/zsh でのコマンド名、フラグ、引数の自動補完
- **タイポ修正提案**: タイプミス時に正しい候補を提案

## 特徴

- ✅ **非侵襲的設計**: SuperClaude Framework のコア機能を変更せず、拡張レイヤーとして動作
- ✅ **高速応答**: ヒント表示100ms以内、補完候補表示200ms以内
- ✅ **簡単インストール**: 数コマンドでセットアップ完了
- ✅ **オプトイン/アウト**: 環境変数で簡単に有効/無効を切り替え可能

## インストール

### 前提条件

- Node.js 18.x 以上
- bash 4.0+ または zsh 5.0+
- SuperClaude Framework がインストール済み

### インストール手順

```bash
# リポジトリのクローン
git clone https://github.com/SuperClaude-Org/SuperClaudeJapaneseExtension.git
cd SuperClaudeJapaneseExtension

# 依存関係のインストール
npm install

# ビルド
npm run build

# シェル補完のセットアップ（オプション）
./scripts/setup-completions.sh
```

## 使い方

### 基本的な使用

```bash
# 言語を日本語に設定
export CLAUDE_LANG=ja

# SuperClaude コマンドを通常通り使用
claude /build production
```

### 補完機能

```bash
# コマンド名の補完（TABキーを押す）
claude /bu[TAB]
# → /build, /implement などの候補が表示

# フラグの補完
claude /build --p[TAB]
# → --plan, --persona-* などの候補が表示
```

## 開発

### 開発環境のセットアップ

```bash
npm install
npm run build
```

### テストの実行

```bash
# 全テストの実行
npm test

# カバレッジレポート付き
npm run test:coverage

# ウォッチモード
npm run test:watch
```

### コード品質チェック

```bash
# リント
npm run lint

# フォーマット
npm run format

# リントとフォーマットの自動修正
npm run lint:fix
```

## プロジェクト構造

```
SuperClaudeJapaneseExtension/
├── src/                    # TypeScriptソースコード
│   ├── i18n/              # 翻訳管理
│   ├── metadata/          # メタデータ解析
│   ├── hint/              # ヒント提供
│   ├── completion/        # 補完機能
│   ├── cache/             # キャッシュシステム
│   └── utils/             # ユーティリティ
├── translations/          # 翻訳データ
│   ├── ja/               # 日本語翻訳
│   └── en/               # 英語翻訳
├── completions/           # シェル補完スクリプト
├── tests/                 # テストファイル
└── dist/                  # ビルド成果物
```

## 技術スタック

- **TypeScript 5.3+**: 型安全な実装
- **i18next 23.15+**: 翻訳管理
- **Jest 29.7+**: テストフレームワーク
- **ESLint & Prettier**: コード品質・フォーマット

## 貢献

プルリクエストを歓迎します！詳細は [CONTRIBUTING.md](CONTRIBUTING.md) をご覧ください。

### 翻訳の追加

新しいコマンドやフラグの翻訳を追加したい場合は、`translations/ja/` 配下のJSONファイルを編集してください。詳細は [TRANSLATION_GUIDE.md](docs/TRANSLATION_GUIDE.md) を参照。

## ライセンス

MIT License - 詳細は [LICENSE](LICENSE) ファイルを参照

## リンク

- [SuperClaude Framework](https://github.com/SuperClaude-Org/SuperClaude_Framework)
- [ドキュメント](docs/)
- [Issue Tracker](https://github.com/SuperClaude-Org/SuperClaudeJapaneseExtension/issues)

## 変更履歴

詳細は [CHANGELOG.md](CHANGELOG.md) を参照

---

**Made with ❤️ by SuperClaude Community**
