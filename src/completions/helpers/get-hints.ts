#!/usr/bin/env node
/**
 * シェル補完ヘルパースクリプト
 *
 * 使用方法:
 *   node get-hints.js command <prefix>
 *   node get-hints.js flag <command> <prefix>
 *
 * 出力: スペース区切りの補完候補リスト
 */

import { CompletionEngine } from '../../completion/completionEngine';
import { I18nManager } from '../../i18n/i18nManager';
import { CommandMetadataLoader } from '../../metadata/commandMetadataLoader';
import * as path from 'path';

/**
 * メイン処理
 */
async function main(): Promise<void> {
  try {
    const args = process.argv.slice(2);

    // 引数チェック
    if (args.length < 2) {
      // 引数不足の場合は何も出力しない
      process.exit(0);
    }

    const completionType = args[0];
    const locale = (process.env.CLAUDE_LANG as 'ja' | 'en') || 'ja';

    // i18nManagerの初期化
    // 実行時のパス: dist/completions/helpers/get-hints.js
    // translationsディレクトリ: プロジェクトルート/translations
    const translationsDir = path.join(__dirname, '../../../translations');
    const i18nManager = new I18nManager(translationsDir);
    const initResult = await i18nManager.initialize(locale);

    if (!initResult.ok) {
      // 初期化失敗時は何も出力しない
      process.exit(0);
    }

    // CommandMetadataLoaderの初期化
    const metadataLoader = new CommandMetadataLoader({
      maxCacheSize: 100,
      cacheTTL: 3600000, // 1 hour
    });

    // ダミーのコマンドメタデータを登録（テスト用）
    // 実際の実装では、コマンドディレクトリから読み込む
    metadataLoader.registerCommand({
      name: 'build',
      description: 'Framework-detecting project builder',
      category: 'Development',
      flags: [
        {
          name: 'think',
          description: 'Enable thinking mode',
        },
        {
          name: 'plan',
          description: 'Enable planning mode',
        },
      ],
    });

    metadataLoader.registerCommand({
      name: 'implement',
      description: 'Feature and code implementation',
      category: 'Development',
    });

    metadataLoader.registerCommand({
      name: 'analyze',
      description: 'Code quality and security analysis',
      category: 'Analysis',
    });

    // CompletionEngineの初期化
    const completionEngine = new CompletionEngine(
      metadataLoader,
      i18nManager
    );

    let candidates: string[] = [];

    if (completionType === 'command') {
      // コマンド名補完
      const prefix = args[1];
      const result = completionEngine.completeCommand(prefix);

      if (result.ok) {
        candidates = result.value.map((item) => item.name);
      }
    } else if (completionType === 'flag') {
      // フラグ補完
      if (args.length < 3) {
        process.exit(0);
      }

      const commandName = args[1];
      const prefix = args[2];
      const result = completionEngine.completeFlag(prefix, commandName);

      if (result.ok) {
        candidates = result.value.map((item) => item.name);
      }
    }

    // スペース区切りで出力
    console.log(candidates.join(' '));
  } catch (error) {
    // エラー時は何も出力しない（シェルでエラーにならないように）
    process.exit(0);
  }
}

// スクリプト実行
main();
