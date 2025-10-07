---
description: Build project with framework detection
description-ja: フレームワーク検出付きプロジェクトビルダー
argument-hint: "[target]"
argument-hint-ja: "ビルド対象を指定（例: production, development）"
allowed-tools:
  - read_file
  - write_file
  - run_terminal_cmd
category: 開発・デプロイ
---

# Build Command

This command builds your project with automatic framework detection.

## Usage

```
/build [target]
```

## Examples

```
/build production
/build development
```
