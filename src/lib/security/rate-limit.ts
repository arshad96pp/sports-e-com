/**
 * Best-effort in-memory rate limiter for a single server instance. Not shared
 * across serverless isolates, but it stops unlimited-volume abuse from one
 * client the same way /api/contact and /api/auth/welcome-email already do.
 */

const buckets = new Map<string, Map<string, number[]>>();

export function isRateLimited(namespace: string, key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  let hits = buckets.get(namespace);
  if (!hits) {
    hits = new Map();
    buckets.set(namespace, hits);
  }

  const timestamps = (hits.get(key) ?? []).filter((ts) => now - ts < windowMs);
  if (timestamps.length >= max) {
    hits.set(key, timestamps);
    return true;
  }
  timestamps.push(now);
  hits.set(key, timestamps);
  return false;
}
