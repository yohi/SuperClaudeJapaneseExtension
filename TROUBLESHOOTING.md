# トラブルシューティングガイド

SuperClaude Japanese Extension の使用時によくある問題と解決方法をまとめています。

## 目次

- [インストール関連](#インストール関連)
- [翻訳適用の問題](#翻訳適用の問題)
- [補完機能の問題](#補完機能の問題)
- [表示・文字化け](#表示文字化け)
- [パフォーマンス](#パフォーマンス)
- [その他の問題](#その他の問題)

## インストール関連

### Node.jsバージョンエラー

**症状**: インストール時に「Node.js version 18.0.0 or higher is required」と表示される

**原因**: Node.jsのバージョンが古い

**解決策**:
```bash
# Node.jsのバージョンを確認
node --version

# nvmを使用している場合
nvm install 18
nvm use 18

# または最新のLTS版をインストール
nvm install --lts
nvm use --lts
```

### インストールスクリプトが失敗する

**症状**: `./scripts/install.sh` を実行しても正常に完了しない

**原因**: 実行権限がない、または依存関係のインストールエラー

**解決策**:
```bash
# 実行権限を確認・付与
chmod +x scripts/install.sh

# npm のキャッシュをクリア
npm cache clean --force

# 再度インストールを試行
./scripts/install.sh
```

## 翻訳適用の問題

### `npm run apply` が失敗する

**症状**: `npm run apply` を実行してもエラーが発生する

**原因**: TypeScript コンパイルエラー、または翻訳ファイルのJSON構文エラー

**解決策**:
```bash
# TypeScript をビルド
npm run build

# ビルドエラーがある場合は詳細を確認
# エラーメッセージに従って修正

# 翻訳ファイルのJSON構文をチェック
jq . translations/ja/commands.json
jq . translations/ja/flags.json

# 構文エラーがある場合は修正後、再度実行
npm run apply
```

### オプション説明が追加されない

**症状**: `npm run apply` を実行してもコマンドファイルにオプション説明が追加されない

**原因**: `translations/ja/commands.json` の `options` フィールドが正しく設定されていない

**解決策**:
```bash
# commands.json の該当コマンドを確認
cat translations/ja/commands.json | jq '.commands.build'

# options フィールドが存在し、正しい形式か確認
# 正しい形式の例:
# "options": {
#   "--type <value>": "ビルドタイプを指定（dev/prod/test）",
#   "--clean": "ビルド前にクリーンアップを実行"
# }

# 修正後、再度適用
npm run apply
```

### 共通オプション説明が表示されない

**症状**: コマンドファイルに「共通オプション」セクションが追加されない

**原因**: `translations/ja/flags.json` が読み込めていない、または構文エラー

**解決策**:
```bash
# flags.json の存在と構文を確認
ls -la translations/ja/flags.json
jq . translations/ja/flags.json

# ファイルが存在しない場合は再インストール
git checkout translations/ja/flags.json

# 再度適用
npm run apply
```

### オプション説明が重複して表示される

**症状**: コマンドファイルに同じオプション説明が複数回表示される

**原因**: `npm run apply` を複数回実行した際の削除処理が不完全

**解決策**:
```bash
# 該当コマンドファイルを確認
cat ~/.claude/commands/sc/build.md

# 重複している場合は手動で削除するか、
# コマンドファイルを元に戻してから再適用
# （元のコマンドファイルがある場合）

# または、スクリプトを修正してから再実行
npm run apply
```

### 翻訳が適用されているか確認したい

**症状**: 翻訳が正しく適用されたか分からない

**原因**: 確認方法が不明

**解決策**:
```bash
# コマンドファイルの description を確認
head -15 ~/.claude/commands/sc/build.md

# オプションセクションを確認
grep -A 20 "## オプション" ~/.claude/commands/sc/build.md

# 共通オプションセクションを確認
grep -A 50 "## 共通オプション" ~/.claude/commands/sc/build.md

# Claude Code を起動してコマンド一覧を確認
# 日本語で表示されていれば成功
```

## 補完機能の問題

### 補完が動作しない

**症状**: タブキーを押しても補完候補が表示されない

**原因**: シェル設定ファイルが正しく読み込まれていない

**解決策**:
```bash
# bashの場合
source ~/.bashrc

# zshの場合
source ~/.zshrc

# 設定が読み込まれているか確認
echo $CLAUDE_LANG
```

### 補完候補が古い

**症状**: コマンドを追加・変更したのに補完候補に反映されない

**原因**: キャッシュが更新されていない

**解決策**:
```bash
# キャッシュディレクトリを削除
rm -rf ~/.claude/extensions/japanese-i18n/cache

# シェルを再起動
exec $SHELL
```

### 一部のコマンドだけ補完されない

**症状**: 特定のコマンドのみ補完が動作しない

**原因**: コマンドメタデータの読み込みエラー、または翻訳データの欠損

**解決策**:
```bash
# デバッグモードで実行
export CLAUDE_I18N_LOG_LEVEL=DEBUG
claude /[問題のあるコマンド]

# ログを確認
tail -f ~/.claude/extensions/japanese-i18n/logs/debug.log
```

## 表示・文字化け

### 日本語が文字化けする

**症状**: ヒントやメッセージが文字化けして表示される

**原因**: ターミナルのエンコーディング設定が正しくない

**解決策**:
```bash
# ロケールを確認
locale

# UTF-8に設定
export LANG=ja_JP.UTF-8
export LC_ALL=ja_JP.UTF-8

# 永続化する場合
echo 'export LANG=ja_JP.UTF-8' >> ~/.bashrc
# または
echo 'export LANG=ja_JP.UTF-8' >> ~/.zshrc
```

### 英語で表示される

**症状**: 設定を日本語にしているのに英語で表示される

**原因**: 環境変数または設定ファイルの言語設定が反映されていない

**解決策**:
```bash
# 環境変数を確認
echo $CLAUDE_LANG

# 日本語に設定
export CLAUDE_LANG=ja

# 設定ファイルを確認
cat ~/.claude/extensions/japanese-i18n/config.json

# 必要に応じて修正
{
  "locale": "ja",
  ...
}
```

### ヒントが表示されない

**症状**: コマンド入力時にヒントが全く表示されない

**原因**: ヒント機能が無効化されているか、設定エラー

**解決策**:
```bash
# 設定ファイルを確認
cat ~/.claude/extensions/japanese-i18n/config.json

# enableCompletionがtrueになっているか確認
{
  ...
  "enableCompletion": true,
  ...
}
```

## パフォーマンス

### 補完表示が遅い

**症状**: タブキーを押してから補完候補が表示されるまでに時間がかかる

**原因**: キャッシュが無効、またはコマンド数が多すぎる

**解決策**:
```bash
# キャッシュが有効か確認
cat ~/.claude/extensions/japanese-i18n/config.json

# cacheTtlを調整（デフォルト: 3600000ミリ秒 = 1時間）
{
  ...
  "cacheTtl": 3600000,
  ...
}

# キャッシュを再構築
rm -rf ~/.claude/extensions/japanese-i18n/cache
```

### メモリ使用量が多い

**症状**: 拡張機能がメモリを大量に消費する

**原因**: 入力履歴のサイズが大きすぎる

**解決策**:
```bash
# 設定ファイルで履歴サイズを調整
cat ~/.claude/extensions/japanese-i18n/config.json

# completionHistorySizeを減らす（デフォルト: 1000）
{
  ...
  "completionHistorySize": 500,
  ...
}
```

## その他の問題

### キャッシュをクリアしたい

**症状**: 古い翻訳データや補完候補がキャッシュされている

**原因**: キャッシュの有効期限が長い、または強制的にクリアが必要

**解決策**:
```bash
# キャッシュディレクトリを削除
rm -rf ~/.claude/extensions/japanese-i18n/cache

# ログもクリアする場合
rm -rf ~/.claude/extensions/japanese-i18n/logs

# シェルを再起動
exec $SHELL
```

### 設定ファイルをリセットしたい

**症状**: 設定を変更しすぎて元に戻したい

**原因**: 設定ファイルの内容が不正、または初期状態に戻したい

**解決策**:
```bash
# 設定ファイルをバックアップ
cp ~/.claude/extensions/japanese-i18n/config.json ~/.claude/extensions/japanese-i18n/config.json.bak

# デフォルト設定で上書き
cat > ~/.claude/extensions/japanese-i18n/config.json << 'EOF'
{
  "locale": "ja",
  "logLevel": "INFO",
  "cacheTtl": 3600000,
  "enableCompletion": true,
  "completionHistorySize": 1000
}
EOF
```

### ログを確認したい

**症状**: エラーの詳細を確認したい

**原因**: デバッグ情報が必要

**解決策**:
```bash
# ログレベルをDEBUGに設定
export CLAUDE_I18N_LOG_LEVEL=DEBUG

# または設定ファイルで設定
{
  ...
  "logLevel": "DEBUG",
  ...
}

# ログファイルを確認
tail -f ~/.claude/extensions/japanese-i18n/logs/debug.log
```

### アンインストールしたい

**症状**: 拡張機能を完全に削除したい

**原因**: 不要になった、または再インストールが必要

**解決策**:
```bash
# 拡張機能ディレクトリを削除
rm -rf ~/.claude/extensions/japanese-i18n

# シェル設定ファイルから関連する環境変数を削除
# ~/.bashrc または ~/.zshrc を編集して以下の行を削除:
# export CLAUDE_LANG=ja
# source ~/.claude/extensions/japanese-i18n/completion.sh

# シェルを再起動
exec $SHELL
```

## FAQ

### Q: 複数の言語を切り替えて使用できますか？

A: はい、環境変数 `CLAUDE_LANG` を変更することで切り替えられます。

```bash
# 日本語
export CLAUDE_LANG=ja

# 英語
export CLAUDE_LANG=en
```

### Q: カスタム翻訳を追加できますか？

A: はい、`translations/ja/commands.json` を編集して翻訳を追加できます。詳細は [TRANSLATION_GUIDE.md](TRANSLATION_GUIDE.md) を参照してください。

### Q: 特定のコマンドだけ英語で表示したい

A: 現在の実装では、言語は全体で統一されます。個別のコマンドごとに言語を変更することはできません。

### Q: Windowsでも使用できますか？

A: このプロジェクトは主にLinux/macOSのbash/zshを想定しています。Windows上でWSL2やGit Bashを使用すれば動作する可能性がありますが、公式にはサポートしていません。

## さらなるサポート

上記の解決策で問題が解決しない場合:

1. **GitHub Issues を確認**: [既存の issue](https://github.com/yohi/SuperClaudeJapaneseExtension/issues) で同様の問題が報告されていないか確認
2. **新しい issue を作成**: 問題の詳細、エラーメッセージ、環境情報を含めて報告
3. **Discussions で質問**: [GitHub Discussions](https://github.com/yohi/SuperClaudeJapaneseExtension/discussions) でコミュニティに質問

### Issue 報告時に含める情報

```bash
# システム情報
uname -a
node --version
npm --version
echo $SHELL

# 設定情報
cat ~/.claude/extensions/japanese-i18n/config.json
echo $CLAUDE_LANG

# エラーログ（該当部分のみ）
tail -20 ~/.claude/extensions/japanese-i18n/logs/debug.log
```

---

**最終更新**: 2025-10-08 (v1.1.0)
