/**
 * In-memory LRU cache for frequently read, rarely changing data.
 * Keeps school config, dashboard stats, and class lists out of Supabase on every request.
 * TTL is intentionally short (30–120s) so data never goes badly stale.
 */

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

class Cache {
  private store = new Map<string, CacheEntry<unknown>>()
  private maxSize: number

  constructor(maxSize = 1000) {
    this.maxSize = maxSize
    // Evict expired entries every 60 s
    setInterval(() => this.evict(), 60_000).unref()
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key)
    if (!entry) return null
    if (Date.now() > entry.expiresAt) { this.store.delete(key); return null }
    return entry.value as T
  }

  set<T>(key: string, value: T, ttlMs = 30_000): void {
    // Simple eviction: if at capacity, drop the oldest 10 %
    if (this.store.size >= this.maxSize) {
      const toDelete = Math.ceil(this.maxSize * 0.1)
      let count = 0
      for (const k of this.store.keys()) {
        if (count++ >= toDelete) break
        this.store.delete(k)
      }
    }
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs })
  }

  del(pattern: string): void {
    for (const k of this.store.keys()) {
      if (k.startsWith(pattern)) this.store.delete(k)
    }
  }

  private evict() {
    const now = Date.now()
    for (const [k, v] of this.store.entries()) {
      if (now > v.expiresAt) this.store.delete(k)
    }
  }
}

export const cache = new Cache()

/** Wrap any async fn with cache — key, loader, ttl in ms */
export async function cached<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
  const hit = cache.get<T>(key)
  if (hit !== null) return hit
  const value = await loader()
  cache.set(key, value, ttlMs)
  return value
}
