#!/usr/bin/env bash
# Claude Code bash補完スクリプト
#
# インストール:
#   echo 'source /path/to/claude-complete.bash' >> ~/.bashrc
#
# 使用方法:
#   claude <TAB>       # コマンド補完
#   claude build --<TAB> # フラグ補完

# ヘルパースクリプトのパス
# 本番環境: ~/.claude/extensions/japanese-i18n/dist/completions/helpers/get-hints.js
# 開発環境: プロジェクトルート/dist/completions/helpers/get-hints.js
CLAUDE_HELPER_SCRIPT="${CLAUDE_HELPER_SCRIPT:-$HOME/.claude/extensions/japanese-i18n/dist/completions/helpers/get-hints.js}"

# Claude補完関数
_claude_completion() {
  local cur prev words cword

  # bash-completionが利用可能な場合は使用
  if declare -F _init_completion > /dev/null; then
    _init_completion || return
  else
    # 手動で初期化
    cur="${COMP_WORDS[COMP_CWORD]}"
    prev="${COMP_WORDS[COMP_CWORD-1]}"
  fi

  # コマンド名（claude の次の単語）
  local cmd=""
  if [[ ${COMP_CWORD} -ge 2 ]]; then
    cmd="${COMP_WORDS[1]}"
  fi

  # ヘルパースクリプトが存在しない場合は何もしない
  if [[ ! -f "${CLAUDE_HELPER_SCRIPT}" ]]; then
    return 0
  fi

  # 補完候補を取得
  local candidates=""

  if [[ ${COMP_CWORD} -eq 1 ]]; then
    # コマンド名補完
    candidates=$(node "${CLAUDE_HELPER_SCRIPT}" command "${cur}" 2>/dev/null)
  elif [[ ${cur} == -* ]]; then
    # フラグ補完（現在の入力が - で始まる場合）
    candidates=$(node "${CLAUDE_HELPER_SCRIPT}" flag "${cmd}" "${cur}" 2>/dev/null)
  fi

  # 補完候補を設定
  if [[ -n "${candidates}" ]]; then
    COMPREPLY=($(compgen -W "${candidates}" -- "${cur}"))
  else
    COMPREPLY=()
  fi

  return 0
}

# claude コマンドに補完を登録
complete -F _claude_completion claude
