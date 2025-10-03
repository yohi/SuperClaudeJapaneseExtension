"use strict";
/**
 * LRUキャッシュマネージャー
 * 最近使用されていないエントリを自動削除
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheManager = void 0;
/**
 * LRUキャッシュマネージャークラス
 */
class CacheManager {
    cache;
    maxSize;
    ttl;
    /**
     * コンストラクタ
     * @param config キャッシュ設定
     */
    constructor(config) {
        this.cache = new Map();
        this.maxSize = config.maxSize;
        this.ttl = config.ttl;
    }
    /**
     * 値を取得
     * @param key キー
     * @returns 値またはnull
     */
    get(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return null;
        }
        // TTLチェック
        if (Date.now() - entry.timestamp > this.ttl) {
            this.cache.delete(key);
            return null;
        }
        // アクセスカウントを更新
        entry.accessCount++;
        return entry.value;
    }
    /**
     * 値を設定
     * @param key キー
     * @param value 値
     */
    set(key, value) {
        // 既存のエントリを更新
        if (this.cache.has(key)) {
            this.cache.set(key, {
                value,
                timestamp: Date.now(),
                accessCount: 1,
            });
            return;
        }
        // maxSizeに達している場合、LRUアルゴリズムで削除
        if (this.cache.size >= this.maxSize) {
            this.evictLRU();
        }
        // 新しいエントリを追加
        this.cache.set(key, {
            value,
            timestamp: Date.now(),
            accessCount: 1,
        });
    }
    /**
     * キーが存在するか確認
     * @param key キー
     * @returns 存在するか
     */
    has(key) {
        const entry = this.cache.get(key);
        if (!entry) {
            return false;
        }
        // TTLチェック
        if (Date.now() - entry.timestamp > this.ttl) {
            this.cache.delete(key);
            return false;
        }
        return true;
    }
    /**
     * エントリを削除
     * @param key キー
     * @returns 削除されたか
     */
    delete(key) {
        return this.cache.delete(key);
    }
    /**
     * すべてのエントリをクリア
     */
    clear() {
        this.cache.clear();
    }
    /**
     * キャッシュサイズを取得
     * @returns エントリ数
     */
    size() {
        return this.cache.size;
    }
    /**
     * LRUアルゴリズムでエントリを削除
     */
    evictLRU() {
        let lruKey = null;
        let minAccessCount = Infinity;
        // 最もアクセス頻度が低いエントリを見つける
        for (const [key, entry] of this.cache.entries()) {
            if (entry.accessCount < minAccessCount) {
                minAccessCount = entry.accessCount;
                lruKey = key;
            }
        }
        // 最も使用されていないエントリを削除
        if (lruKey) {
            this.cache.delete(lruKey);
        }
    }
}
exports.CacheManager = CacheManager;
//# sourceMappingURL=cacheManager.js.map