/**
 * インメモリ Redis モック（ローカル開発用）
 *
 * Upstash Redis の互換インターフェースを実装する。
 * USE_MOCKS=true の場合に使用する。
 * TTL・SETEX・DEL・GET・SET・KEYS・EXISTS をサポート。
 */

interface CacheEntry {
  value: unknown;
  expiresAt?: number;
}

export class MemoryRedis {
  private store = new Map<string, CacheEntry>();

  async get<T>(key: string): Promise<T | null> {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt !== undefined && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  async set(key: string, value: unknown, opts?: { ex?: number }): Promise<'OK'> {
    this.store.set(key, {
      value,
      expiresAt: opts?.ex !== undefined ? Date.now() + opts.ex * 1000 : undefined,
    });
    return 'OK';
  }

  async del(...keys: string[]): Promise<number> {
    let count = 0;
    for (const key of keys) {
      if (this.store.delete(key)) count++;
    }
    return count;
  }

  async keys(pattern: string): Promise<string[]> {
    // Redis glob パターン（* のみ対応）を正規表現に変換
    const regex = new RegExp(
      '^' + pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*') + '$',
    );
    const now = Date.now();
    const result: string[] = [];
    for (const [k, v] of this.store.entries()) {
      if (v.expiresAt !== undefined && now > v.expiresAt) {
        this.store.delete(k);
        continue;
      }
      if (regex.test(k)) result.push(k);
    }
    return result;
  }

  async exists(...keys: string[]): Promise<number> {
    return keys.filter((k) => this.store.has(k)).length;
  }

  async expire(key: string, seconds: number): Promise<number> {
    const entry = this.store.get(key);
    if (!entry) return 0;
    entry.expiresAt = Date.now() + seconds * 1000;
    return 1;
  }

  async setnx(key: string, value: unknown): Promise<number> {
    if (this.store.has(key)) return 0;
    this.store.set(key, { value });
    return 1;
  }

  /** テスト用: 全キーをクリア */
  flush(): void {
    this.store.clear();
  }
}
