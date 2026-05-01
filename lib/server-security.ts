type RateBucket = { count: number; resetAt: number };

type RateLimitOptions<T> = {
  buckets: Map<string, RateBucket>;
  windowMs: number;
  max: number;
  request: Request;
  onLimited: (retryAfter: string) => T;
};

export function clientIp(req: Request) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    req.headers.get("cf-connecting-ip") ||
    "unknown"
  );
}

export function sameOrigin(req: Request) {
  const origin = req.headers.get("origin");
  if (!origin) return true;

  try {
    const originUrl = new URL(origin);
    const requestUrl = new URL(req.url);
    return originUrl.host === req.headers.get("host") || originUrl.host === requestUrl.host;
  } catch {
    return false;
  }
}

export function isJsonRequest(req: Request) {
  return req.headers.get("content-type")?.includes("application/json") ?? false;
}

export function bodyTooLarge(req: Request, maxBytes: number) {
  return Number(req.headers.get("content-length") || 0) > maxBytes;
}

export function rateLimit<T>({
  buckets,
  windowMs,
  max,
  request,
  onLimited,
}: RateLimitOptions<T>) {
  const now = Date.now();
  const key = clientIp(request);
  const existing = buckets.get(key);
  const bucket =
    existing && existing.resetAt > now
      ? existing
      : { count: 0, resetAt: now + windowMs };

  bucket.count += 1;
  buckets.set(key, bucket);

  if (buckets.size > 10_000) {
    for (const [bucketKey, value] of buckets) {
      if (value.resetAt <= now) buckets.delete(bucketKey);
    }
  }

  if (bucket.count > max) {
    return onLimited(Math.ceil((bucket.resetAt - now) / 1000).toString());
  }

  return null;
}
