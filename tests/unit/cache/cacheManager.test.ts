/**
 * CacheManager のユニットテスト
 */

import { CacheManager } from '../../../src/cache/cacheManager';

describe('CacheManager', () => {
  let cache: CacheManager<string>;

  beforeEach(() => {
    cache = new CacheManager<string>({
      maxSize: 3,
      ttl: 1000, // 1秒
    });
  });

  describe('get and set', () => {
    it('should store and retrieve value', () => {
      cache.set('key1', 'value1');
      const result = cache.get('key1');

      expect(result).toBe('value1');
    });

    it('should return null for non-existent key', () => {
      const result = cache.get('nonexistent');

      expect(result).toBeNull();
    });

    it('should overwrite existing key', () => {
      cache.set('key1', 'value1');
      cache.set('key1', 'value2');

      const result = cache.get('key1');

      expect(result).toBe('value2');
    });
  });

  describe('LRU eviction', () => {
    it('should evict least recently used item when maxSize reached', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      // maxSize=3 なので、ここで key1 が削除される
      cache.set('key4', 'value4');

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');
      expect(cache.get('key4')).toBe('value4');
    });

    it('should update access count on get', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      // key1をアクセスして、アクセスカウントを増やす
      cache.get('key1');
      cache.get('key1');

      // key4を追加 → key2が削除される（key1はアクセス頻度が高い）
      cache.set('key4', 'value4');

      expect(cache.get('key1')).toBe('value1'); // 残る
      expect(cache.get('key2')).toBeNull(); // 削除される
      expect(cache.get('key3')).toBe('value3'); // 残る
      expect(cache.get('key4')).toBe('value4'); // 残る
    });
  });

  describe('TTL (Time-To-Live)', () => {
    it('should return null for expired entries', async () => {
      cache.set('key1', 'value1');

      // 1.5秒待機（TTL=1秒なので期限切れ）
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const result = cache.get('key1');

      expect(result).toBeNull();
    });

    it('should return value for non-expired entries', async () => {
      cache.set('key1', 'value1');

      // 500ms待機（TTL=1秒なのでまだ有効）
      await new Promise((resolve) => setTimeout(resolve, 500));

      const result = cache.get('key1');

      expect(result).toBe('value1');
    });
  });

  describe('has', () => {
    it('should return true for existing key', () => {
      cache.set('key1', 'value1');

      expect(cache.has('key1')).toBe(true);
    });

    it('should return false for non-existent key', () => {
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('should return false for expired key', async () => {
      cache.set('key1', 'value1');

      await new Promise((resolve) => setTimeout(resolve, 1500));

      expect(cache.has('key1')).toBe(false);
    });
  });

  describe('clear', () => {
    it('should clear all entries', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      cache.clear();

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
      expect(cache.size()).toBe(0);
    });
  });

  describe('size', () => {
    it('should return correct cache size', () => {
      expect(cache.size()).toBe(0);

      cache.set('key1', 'value1');
      expect(cache.size()).toBe(1);

      cache.set('key2', 'value2');
      expect(cache.size()).toBe(2);
    });

    it('should not exceed maxSize', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');
      cache.set('key4', 'value4');

      expect(cache.size()).toBe(3); // maxSize
    });
  });

  describe('delete', () => {
    it('should delete specific key', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      const deleted = cache.delete('key1');

      expect(deleted).toBe(true);
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBe('value2');
    });

    it('should return false for non-existent key', () => {
      const deleted = cache.delete('nonexistent');

      expect(deleted).toBe(false);
    });
  });
});
