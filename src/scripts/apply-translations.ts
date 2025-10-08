#!/usr/bin/env node

/**
 * apply-translations.ts
 *
 * Claude Code コマンドファイルの description を日本語化するスクリプト
 */

import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface CommandTranslation {
  description: string;
  category?: string;
  arguments?: Record<string, string>;
  options?: Record<string, string>;
}

interface TranslationsData {
  version: string;
  commands: Record<string, CommandTranslation>;
}

interface FlagTranslation {
  description: string;
  alias?: string;
  example?: string;
}

interface FlagsData {
  version: string;
  flags: Record<string, FlagTranslation>;
}

const COMMANDS_DIR = path.join(os.homedir(), '.claude', 'commands');
const TRANSLATIONS_FILE = path.join(__dirname, '..', '..', 'translations', 'ja', 'commands.json');
const FLAGS_FILE = path.join(__dirname, '..', '..', 'translations', 'ja', 'flags.json');

/**
 * 翻訳データを読み込む
 */
function loadTranslations(): TranslationsData {
  const content = fs.readFileSync(TRANSLATIONS_FILE, 'utf-8');
  return JSON.parse(content);
}

/**
 * フラグ翻訳データを読み込む
 */
function loadFlags(): FlagsData {
  const content = fs.readFileSync(FLAGS_FILE, 'utf-8');
  return JSON.parse(content);
}

/**
 * オプション説明セクションを生成
 */
function generateOptionsSection(options: Record<string, string>): string {
  const optionsList = Object.entries(options)
    .map(([flag, desc]) => `- \`${flag}\` - ${desc}`)
    .join('\n');

  return `\n## オプション\n\n${optionsList}\n`;
}

/**
 * 共通フラグ説明セクションを生成
 */
function generateCommonFlagsSection(flags: FlagsData): string {
  const commonFlags = [
    'plan',
    'think',
    'think-hard',
    'uc',
    'verbose',
    'validate',
    'c7',
    'seq',
    'play'
  ];

  const flagsList = commonFlags
    .filter(flag => flags.flags[flag])
    .map(flag => {
      const info = flags.flags[flag];
      const alias = info.alias ? ` (${info.alias})` : '';
      return `- \`--${flag}\`${alias} - ${info.description}`;
    })
    .join('\n');

  return `\n## 共通オプション\n\nすべての /sc コマンドで使用できる共通オプション：\n\n${flagsList}\n`;
}

/**
 * コマンドファイルの description を更新し、オプション説明を追加する
 */
function updateCommandFile(
  filePath: string,
  description: string,
  options?: Record<string, string>,
  flags?: FlagsData
): void {
  let content = fs.readFileSync(filePath, 'utf-8');

  // YAML frontmatter の description を置き換える
  content = content.replace(
    /^description:\s*(?:"[^"]*"|'[^']*'|.*)$/m,
    `description: "${description}"`
  );

  // 既存のオプションセクションと共通オプションセクションを削除
  content = content.replace(/\n## オプション\n\n[\s\S]*?(?=\n## [^オ]|\n---|\n```|$)/m, '');
  content = content.replace(/\n## 共通オプション\n\n[\s\S]*?(?=\n## |\n---|\n```|$)/m, '');

  // オプション説明セクションを追加
  if (options && Object.keys(options).length > 0) {
    const optionsSection = generateOptionsSection(options);

    // Usage セクションの後にオプションセクションを挿入
    if (content.includes('## Usage')) {
      // Usage セクションの終わり（次の ## または ``` の前）を見つけて挿入
      content = content.replace(
        /(## Usage[\s\S]*?```[\s\S]*?```)/,
        `$1${optionsSection}`
      );
    } else {
      // Usage セクションがない場合は、最初の ## の前に挿入
      content = content.replace(
        /(---\n\n#[^\n]+\n)/,
        `$1${optionsSection}`
      );
    }
  }

  // 共通フラグ説明セクションを追加
  if (flags) {
    const commonFlagsSection = generateCommonFlagsSection(flags);

    // Behavioral Flow セクションの前に共通オプションセクションを挿入
    if (content.includes('## Behavioral Flow')) {
      content = content.replace(
        /(\n## Behavioral Flow)/,
        `${commonFlagsSection}$1`
      );
    } else if (content.includes('## オプション')) {
      // オプションセクションの後に挿入
      content = content.replace(
        /(## オプション\n\n(?:- `[^\n]+\n)+)\n/,
        `$1${commonFlagsSection}\n`
      );
    } else if (content.includes('## Triggers')) {
      // Triggersセクションの後に挿入（Usage セクションがない場合）
      content = content.replace(
        /(## Triggers[\s\S]*?)\n\n(## |$)/,
        `$1\n${commonFlagsSection}\n$2`
      );
    }
  }

  fs.writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ Updated: ${path.basename(filePath)}`);
}

/**
 * コマンドディレクトリ内のファイルを処理
 */
function processCommandDirectory(
  dirPath: string,
  translations: TranslationsData,
  flags: FlagsData
): void {
  if (!fs.existsSync(dirPath)) {
    console.warn(`⚠️  Directory not found: ${dirPath}`);
    return;
  }

  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    if (!file.endsWith('.md')) continue;

    const commandName = file.replace('.md', '');
    const filePath = path.join(dirPath, file);

    // 翻訳データを検索
    const translation = translations.commands[commandName];

    if (translation && translation.description) {
      updateCommandFile(filePath, translation.description, translation.options, flags);
    } else {
      console.warn(`⚠️  No translation found for: ${commandName}`);
    }
  }
}

/**
 * メイン処理
 */
function main(): void {
  console.log('🚀 Starting command translation application...\n');

  // 翻訳データを読み込む
  console.log(`📖 Loading translations from: ${TRANSLATIONS_FILE}`);
  const translations = loadTranslations();
  console.log(`✅ Loaded ${Object.keys(translations.commands).length} translations\n`);

  // フラグ翻訳データを読み込む
  console.log(`📖 Loading flags from: ${FLAGS_FILE}`);
  const flags = loadFlags();
  console.log(`✅ Loaded ${Object.keys(flags.flags).length} flag translations\n`);

  // /sc コマンドを処理
  const scCommandsDir = path.join(COMMANDS_DIR, 'sc');
  console.log(`📂 Processing /sc commands in: ${scCommandsDir}`);
  processCommandDirectory(scCommandsDir, translations, flags);
  console.log('');

  // /kiro コマンドを処理
  const kiroCommandsDir = path.join(COMMANDS_DIR, 'kiro');
  console.log(`📂 Processing /kiro commands in: ${kiroCommandsDir}`);
  processCommandDirectory(kiroCommandsDir, translations, flags);
  console.log('');

  console.log('✨ Translation application completed!');
}

// スクリプト実行
if (require.main === module) {
  try {
    main();
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}
