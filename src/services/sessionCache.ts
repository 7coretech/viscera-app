/**
 * Session Cache Utility (In-Memory SWR Pattern)
 * Persists data across screen transitions during an active app session.
 * Eliminates blank screens and loading spinners when navigating between tabs/pages.
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

class SessionCache {
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTTL = 5 * 60 * 1000; // 5 minutes default TTL

  /**
   * Store data in cache with a TTL
   */
  set<T>(key: string, data: T, ttl: number = this.defaultTTL): void {
    if (data === undefined || data === null) return;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  /**
   * Retrieve cached data if valid
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check TTL expiration
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Check if a valid cache entry exists
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Invalidate specific key or prefix
   */
  invalidate(keyOrPrefix?: string): void {
    if (!keyOrPrefix) {
      this.cache.clear();
      return;
    }
    for (const key of this.cache.keys()) {
      if (key === keyOrPrefix || key.startsWith(keyOrPrefix)) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear entire session cache (e.g. on logout)
   */
  clear(): void {
    this.cache.clear();
  }
}

export const sessionCache = new SessionCache();
