---
description: Clean up code and remove dead code
description-ja: コードのクリーンアップと不要コードの削除
argument-hint: "[scope]"
argument-hint-ja: "クリーンアップ範囲（例: unused-imports, dead-code）"
allowed-tools:
  - read_file
  - write_file
category: 品質・強化
---

# Cleanup Command

Clean up code by removing dead code and improving organization.

## Usage

```
/cleanup [scope]
```

## Examples

```
/cleanup unused-imports
/cleanup dead-code
```
