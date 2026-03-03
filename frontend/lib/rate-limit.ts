interface RateLimitBucket {
    count: number;
    resetAt: number;
}

export interface RateLimitResult {
    allowed: boolean;
    remaining: number;
    retryAfterSeconds: number;
    resetAt: number;
}

const buckets = new Map<string, RateLimitBucket>();
const SWEEP_INTERVAL_MS = 30_000;
const MAX_BUCKETS = 5000;
let lastSweepAt = Date.now();

function sweepExpiredBuckets(now: number) {
    const shouldSweep = now - lastSweepAt >= SWEEP_INTERVAL_MS || buckets.size > MAX_BUCKETS;
    if (!shouldSweep) {
        return;
    }

    for (const [key, bucket] of buckets.entries()) {
        if (bucket.resetAt <= now) {
            buckets.delete(key);
        }
    }
    lastSweepAt = now;
}

export function consumeRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
    const now = Date.now();
    sweepExpiredBuckets(now);

    const existing = buckets.get(key);
    if (!existing || existing.resetAt <= now) {
        const resetAt = now + windowMs;
        buckets.set(key, { count: 1, resetAt });
        return {
            allowed: true,
            remaining: Math.max(0, limit - 1),
            retryAfterSeconds: Math.ceil(windowMs / 1000),
            resetAt,
        };
    }

    if (existing.count >= limit) {
        return {
            allowed: false,
            remaining: 0,
            retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
            resetAt: existing.resetAt,
        };
    }

    existing.count += 1;
    buckets.set(key, existing);
    return {
        allowed: true,
        remaining: Math.max(0, limit - existing.count),
        retryAfterSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
        resetAt: existing.resetAt,
    };
}
