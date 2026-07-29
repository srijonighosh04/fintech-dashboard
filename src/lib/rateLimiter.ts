// Simple in-memory sliding window rate limiter

interface RateLimitBucket {
  count: number;
  resetTime: number;
}

const tracker = new Map<string, RateLimitBucket>();

// Cleanup stale tracker keys every 5 minutes to prevent memory leaks
if (typeof global !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of tracker.entries()) {
      if (now > bucket.resetTime) {
        tracker.delete(key);
      }
    }
  }, 5 * 60 * 1000);
}

/**
 * Checks if a specific key (e.g. IP Address or User ID) has exceeded request limits.
 * Default: Max 60 requests per 1-minute window.
 */
export function isRateLimited(
  key: string,
  limit: number = 60,
  windowMs: number = 60 * 1000
): boolean {
  const now = Date.now();
  const bucket = tracker.get(key);

  if (!bucket || now > bucket.resetTime) {
    tracker.set(key, {
      count: 1,
      resetTime: now + windowMs,
    });
    return false;
  }

  bucket.count += 1;
  if (bucket.count > limit) {
    return true;
  }

  return false;
}
