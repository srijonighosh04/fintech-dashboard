// Production caching interface with memory fallback parameters

interface CacheEntry {
  value: string;
  expiry: number;
}

const memoryCache = new Map<string, CacheEntry>();

/**
 * Retrieve cached JSON details for a specific key.
 */
export async function getCache(key: string): Promise<string | null> {
  const now = Date.now();
  const entry = memoryCache.get(key);

  if (!entry) return null;

  if (now > entry.expiry) {
    memoryCache.delete(key);
    return null;
  }

  return entry.value;
}

/**
 * Store a key-value payload in the cache.
 * Default: 5-minute TTL (300 seconds).
 */
export async function setCache(
  key: string,
  value: string,
  ttlSeconds: number = 300
): Promise<void> {
  const now = Date.now();
  memoryCache.set(key, {
    value,
    expiry: now + ttlSeconds * 1000,
  });
}

/**
 * Invalidate a specific cache key.
 */
export async function deleteCache(key: string): Promise<void> {
  memoryCache.delete(key);
}
