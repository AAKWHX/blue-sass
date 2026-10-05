import "server-only";

type Entry = { count: number; resetAt: number };
const buckets = new Map<string, Entry>();

/**
 * A lightweight backstop for server actions. For multi-region or high-volume
 * traffic, replace this with a shared store (for example Vercel KV).
 */
export function takeRateLimit(key: string, limit = 5, windowMs = 60_000) {
  const now = Date.now();
  if (buckets.size >= 10_000) {
    for (const [bucketKey, entry] of buckets) {
      if (entry.resetAt <= now) buckets.delete(bucketKey);
    }
    // Fail closed for new identities instead of allowing unbounded memory use.
    if (buckets.size >= 10_000 && !buckets.has(key)) return false;
  }
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (current.count >= limit) return false;
  current.count += 1;
  return true;
}
