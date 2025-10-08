# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-10-08

### Added
- コマンド説明の自動日本語化スクリプト (`npm run apply`)
- `/sc` コマンド（24個）の日本語翻訳を追加
- `/kiro` コマンド（10個）の日本語翻訳を追加
- `translations/ja/commands.json` に全コマンドの翻訳を追加
- コマンド固有のオプション説明セクションを追加
- 共通オプション説明セクションを追加（全コマンドで使用可能な `--plan`, `--think`, `--uc` など9つのフラグ）
- `translations/ja/flags.json` から共通フラグの日本語説明を自動取得

### Changed
- `~/.claude/commands/` のコマンドファイルの description フィールドを日本語化
- Claude Code 起動時のコマンド一覧表示が日本語で表示されるように改善
- コマンドファイルに「オプション」と「共通オプション」セクションを自動追加

### Technical
- `src/scripts/apply-translations.ts` を追加・拡張
  - コマンド固有オプションの説明生成機能
  - 共通フラグ説明セクション生成機能
  - `flags.json` からの翻訳データ読み込み
- `package.json` に `apply` および `apply-translations` スクリプトを追加
- `translations/ja/commands.json` にコマンド固有オプションの説明を追加

### Documentation
- README.md にオプション説明機能の詳細を追加
  - コマンド固有オプションと共通フラグの説明セクション
  - 生成される内容の具体例を追加
- TRANSLATION_GUIDE.md を拡張
  - `commands.json` の `options` フィールドの説明を追加
  - `flags.json` による共通オプションセクション自動生成の説明を追加
  - オプション翻訳の適用方法と適用例を追加

## [Unreleased]

### Added
- プロジェクト基盤とインフラストラクチャのセットアップ
- TypeScript プロジェクト構成
- テスト環境（Jest）の構築
- リント・フォーマット設定（ESLint、Prettier）
- 基本的な型定義（types.ts）

### Changed

### Deprecated

### Removed

### Fixed

### Security

---

## [1.0.0] - 未リリース

### Planned Features

#### 翻訳システム
- [ ] i18nマネージャーの実装
- [ ] 翻訳ローダーの実装
- [ ] 日本語翻訳データの作成（主要コマンド30個）

#### ヒント表示
- [ ] コマンドヒント生成機能
- [ ] フラグヒント生成機能
- [ ] 引数ヒント生成機能
- [ ] エラーメッセージの日本語化

#### 補完機能
- [ ] コマンド名補完
- [ ] フラグ補完
- [ ] 引数補完
- [ ] bash/zsh補完スクリプト

#### パフォーマンス
- [ ] LRUキャッシュ実装
- [ ] ヒント表示100ms以内達成
- [ ] 補完候補表示200ms以内達成

---

## Release Strategy

### Phase 1: Alpha Release (Internal Testing)
- 対象: 開発チーム内
- 期間: 2週間
- 目標: 基本機能の動作確認

### Phase 2: Beta Release (Limited Public)
- 対象: SuperClaude コミュニティ（先着50名）
- 期間: 1ヶ月
- 目標: フィードバック収集、パフォーマンス検証

### Phase 3: Official Release (v1.0.0)
- 対象: 一般公開
- 目標: 全主要コマンドの日本語化、完全ドキュメント

---

[Unreleased]: https://github.com/SuperClaude-Org/SuperClaudeJapaneseExtension/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/SuperClaude-Org/SuperClaudeJapaneseExtension/releases/tag/v1.0.0
