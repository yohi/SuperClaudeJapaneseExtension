#!/bin/bash

# SuperClaude Japanese Extension インストールスクリプト
# このスクリプトは依存ライブラリのインストール、シェル補完の設定、初期設定ファイルの生成を行います。

set -e

# スクリプトディレクトリの取得
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

# カラー定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# インストール先ディレクトリ
INSTALL_DIR="${HOME}/.claude/extensions/japanese-i18n"
CONFIG_FILE="${INSTALL_DIR}/config.json"

# ロゴ表示
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════════════════╗"
echo "║  SuperClaude Japanese Extension Installer        ║"
echo "║  SuperClaude Framework 日本語化拡張               ║"
echo "╚═══════════════════════════════════════════════════╝"
echo -e "${NC}"

# 1. Node.jsバージョンチェック
echo -e "${BLUE}[1/6]${NC} Node.jsバージョンをチェック中..."

if ! command -v node &> /dev/null; then
    echo -e "${RED}エラー: Node.jsがインストールされていません。${NC}"
    echo "Node.js 18.0.0以上をインストールしてください。"
    echo "https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2)
REQUIRED_VERSION="18.0.0"

# バージョン比較関数
version_ge() {
    printf '%s\n%s\n' "$2" "$1" | sort -V -C
}

if ! version_ge "$NODE_VERSION" "$REQUIRED_VERSION"; then
    echo -e "${RED}エラー: Node.js 18.0.0以上が必要です。現在のバージョン: ${NODE_VERSION}${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} Node.js ${NODE_VERSION} が検出されました"

# 2. npmチェック
echo -e "${BLUE}[2/6]${NC} npmの存在確認中..."

if ! command -v npm &> /dev/null; then
    echo -e "${RED}エラー: npmがインストールされていません。${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} npm が利用可能です"

# 3. ディレクトリ構造の作成
echo -e "${BLUE}[3/6]${NC} ディレクトリ構造を作成中..."

mkdir -p "${INSTALL_DIR}"/{dist,translations/{ja,en},completions/{bash,zsh,helpers},logs,schemas}

if [ $? -ne 0 ]; then
    echo -e "${RED}エラー: ディレクトリの作成に失敗しました: ${INSTALL_DIR}${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} ディレクトリ構造を作成しました"

# 4. 依存ライブラリのインストール
echo -e "${BLUE}[4/6]${NC} 依存ライブラリをインストール中..."

# プロジェクトディレクトリでnpm install
if [ -f "package.json" ]; then
    npm install
    echo -e "${GREEN}✓${NC} 依存ライブラリをインストールしました"
else
    echo -e "${YELLOW}警告: package.jsonが見つかりません。依存ライブラリのインストールをスキップします。${NC}"
fi

# 5. 設定ファイルの生成
echo -e "${BLUE}[5/6]${NC} 設定ファイルを生成中..."

if [ -f "$CONFIG_FILE" ]; then
    echo -e "${YELLOW}既存の設定ファイルが見つかりました。上書きしません。${NC}"
else
    cat > "$CONFIG_FILE" << 'EOF'
{
  "locale": "ja",
  "logLevel": "INFO",
  "cacheTtl": 3600000,
  "enableCompletion": true,
  "completionHistorySize": 1000
}
EOF
    echo -e "${GREEN}✓${NC} デフォルト設定ファイルを作成しました: ${CONFIG_FILE}"
fi

# 補完スクリプトのコピー
echo -e "${BLUE}補完スクリプトをコピー中...${NC}"

if [ -d "${REPO_ROOT}/completions" ]; then
    cp -a "${REPO_ROOT}/completions/." "${INSTALL_DIR}/completions/"
    echo -e "${GREEN}✓${NC} 補完スクリプトをコピーしました"
else
    echo -e "${YELLOW}警告: レポジトリ内に completions/ が見つかりません。補完スクリプトの配置をスキップします。${NC}"
fi

# 6. シェル補完スクリプトの設定
echo -e "${BLUE}[6/6]${NC} シェル補完を設定中..."

# bash補完の設定
if [ -n "$BASH_VERSION" ] || [ -f "$HOME/.bashrc" ]; then
    BASHRC="${HOME}/.bashrc"
    BASH_COMPLETION_SOURCE="
# SuperClaude Japanese Extension completion
if [ -f ~/.claude/extensions/japanese-i18n/completions/bash/claude-complete.bash ]; then
  source ~/.claude/extensions/japanese-i18n/completions/bash/claude-complete.bash
fi"

    if ! grep -q "SuperClaude Japanese Extension completion" "$BASHRC" 2>/dev/null; then
        echo "$BASH_COMPLETION_SOURCE" >> "$BASHRC"
        echo -e "${GREEN}✓${NC} bash補完を~/.bashrcに追加しました"
    else
        echo -e "${YELLOW}bash補完は既に設定されています${NC}"
    fi
fi

# zsh補完の設定
if [ -n "$ZSH_VERSION" ] || [ -f "$HOME/.zshrc" ]; then
    ZSHRC="${HOME}/.zshrc"
    ZSH_COMPLETION_FPATH="
# SuperClaude Japanese Extension completion
fpath=(~/.claude/extensions/japanese-i18n/completions/zsh \$fpath)
autoload -Uz compinit && compinit"

    if ! grep -q "SuperClaude Japanese Extension completion" "$ZSHRC" 2>/dev/null; then
        echo "$ZSH_COMPLETION_FPATH" >> "$ZSHRC"
        echo -e "${GREEN}✓${NC} zsh補完を~/.zshrcに追加しました"
    else
        echo -e "${YELLOW}zsh補完は既に設定されています${NC}"
    fi
fi

# インストール完了メッセージ
echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║  ✓ インストールが完了しました！                  ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${BLUE}次のステップ:${NC}"
echo ""
echo "  1. シェルを再起動するか、以下のコマンドを実行してください:"
echo -e "     ${YELLOW}bash:${NC} source ~/.bashrc"
echo -e "     ${YELLOW}zsh:${NC}  source ~/.zshrc"
echo ""
echo "  2. 言語設定を確認してください（デフォルト: 日本語）:"
echo -e "     ${YELLOW}export CLAUDE_LANG=ja${NC}"
echo ""
echo "  3. 環境変数を永続化する場合は、シェル設定ファイルに追加してください:"
echo -e "     ${YELLOW}echo 'export CLAUDE_LANG=ja' >> ~/.bashrc${NC}  # または ~/.zshrc"
echo ""
echo "  4. 動作確認:"
echo -e "     ${YELLOW}claude [TAB]${NC}  # 補完候補が表示されます"
echo ""
echo -e "${BLUE}詳細なドキュメント:${NC}"
echo "  - 使用方法: README.md"
echo "  - 翻訳追加: TRANSLATION_GUIDE.md"
echo "  - トラブルシューティング: TROUBLESHOOTING.md"
echo ""
echo -e "${GREEN}楽しい開発を！${NC}"
echo ""

exit 0
