/**
 * LRUキャッシュマネージャー
 * 最近使用されていないエントリを自動削除
 */
/**
 * キャッシュ設定
 */
export interface CacheConfig {
    maxSize: number;
    ttl: number;
}
/**
 * LRUキャッシュマネージャークラス
 */
export declare class CacheManager<T> {
    private cache;
    private maxSize;
    private ttl;
    /**
     * コンストラクタ
     * @param config キャッシュ設定
     */
    constructor(config: CacheConfig);
    /**
     * 値を取得
     * @param key キー
     * @returns 値またはnull
     */
    get(key: string): T | null;
    /**
     * 値を設定
     * @param key キー
     * @param value 値
     */
    set(key: string, value: T): void;
    /**
     * キーが存在するか確認
     * @param key キー
     * @returns 存在するか
     */
    has(key: string): boolean;
    /**
     * エントリを削除
     * @param key キー
     * @returns 削除されたか
     */
    delete(key: string): boolean;
    /**
     * すべてのエントリをクリア
     */
    clear(): void;
    /**
     * キャッシュサイズを取得
     * @returns エントリ数
     */
    size(): number;
    /**
     * LRUアルゴリズムでエントリを削除
     */
    private evictLRU;
}
//# sourceMappingURL=cacheManager.d.ts.map