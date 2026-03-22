export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  reset: number;
}

const memoryStore = new Map<string, { count: number; reset: number }>();

export function rateLimit(identifier: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const record = memoryStore.get(identifier);

  if (!record || now > record.reset) {
    const newRecord = { count: 1, reset: now + windowMs };
    memoryStore.set(identifier, newRecord);
    return {
      success: true,
      limit,
      remaining: limit - 1,
      reset: newRecord.reset,
    };
  }

  record.count++;
  const remaining = Math.max(0, limit - record.count);

  if (record.count > limit) {
    return {
      success: false,
      limit,
      remaining: 0,
      reset: record.reset,
    };
  }

  return {
    success: true,
    limit,
    remaining,
    reset: record.reset,
  };
}
