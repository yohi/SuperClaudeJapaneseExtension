/**
 * 入力履歴管理
 * コマンド入力履歴の保存、読み込み、スコア計算を管理
 */
import type { HistoryEntry, HistoryManagerOptions, HistoryError, Result } from '../types';
/**
 * 履歴マネージャークラス
 *
 * 注意: このクラスは内部的にミューテックスを使用して、
 * 並行呼び出しに対してMap操作を直列化します。
 */
export declare class HistoryManager {
    private historyFile;
    private history;
    private maxHistorySize;
    private mutex;
    /**
     * コンストラクタ
     * @param historyFile 履歴ファイルのパス
     * @param options オプション
     */
    constructor(historyFile: string, options?: HistoryManagerOptions);
    /**
     * コマンドを履歴に記録
     *
     * 並行性保護: このメソッドはミューテックスで保護されており、
     * 複数の並行呼び出しが直列化されます。
     *
     * @param command コマンド名
     * @returns 記録結果
     */
    recordCommand(command: string): Promise<Result<void, HistoryError>>;
    /**
     * 履歴を取得
     * @returns 履歴エントリのリスト
     */
    getHistory(): HistoryEntry[];
    /**
     * コマンドのスコアを取得
     * @param command コマンド名
     * @returns スコア（0.0-1.0）
     */
    getCommandScore(command: string): number;
    /**
     * 履歴をファイルに保存
     *
     * 並行性保護: このメソッドはミューテックスで保護されており、
     * 保存中の履歴読み取りの一貫性を保証します。
     *
     * @returns 保存結果
     */
    save(): Promise<Result<void, HistoryError>>;
    /**
     * 履歴をファイルから読み込み
     *
     * 並行性保護: このメソッドはミューテックスで保護されており、
     * 読み込み中の履歴変更（clear/set）の一貫性を保証します。
     *
     * @returns 読み込み結果
     */
    load(): Promise<Result<void, HistoryError>>;
    /**
     * 最も古いエントリを削除
     * @private
     */
    private evictOldestEntry;
}
//# sourceMappingURL=historyManager.d.ts.map