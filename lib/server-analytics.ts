import { PostHog } from "posthog-node";

/**
 * Server-side PostHog client for API routes. Used for two things:
 *
 *  1. Server-authoritative events (e.g. `waitlist_server_insert_ok`)
 *     that we trust more than the client — they only fire after the
 *     DB write actually succeeded.
 *  2. Feature-flag checks at the edge, so endpoints like /api/chat
 *     can refuse early-access traffic even if the client gate has
 *     been bypassed.
 *
 * posthog-node buffers events, so callers must `await flush()` (or
 * `.shutdown()` on process exit) before returning from a short-lived
 * edge handler — otherwise we lose the event.
 */

type Props = Record<string, unknown>;

let cached: PostHog | null = null;

function getClient(): PostHog | null {
  const key = process.env.POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY;
  if (!key) return null;
  if (cached) return cached;
  cached = new PostHog(key, {
    host: process.env.POSTHOG_HOST || "https://us.i.posthog.com",
    // Short flush intervals so serverless handlers don't have to wait
    // long before returning.
    flushAt: 1,
    flushInterval: 0,
  });
  return cached;
}

/**
 * Exposes the underlying posthog-node client so callers can hand it to
 * `@posthog/ai`'s `withTracing` wrapper. Returns null when PostHog isn't
 * configured, which lets the chat route fall through to the raw model.
 */
export function getPosthogNodeClient(): PostHog | null {
  return getClient();
}

export async function trackServer(
  event: string,
  distinctId: string,
  props?: Props,
): Promise<void> {
  const client = getClient();
  if (!client) return;
  try {
    client.capture({ event, distinctId, properties: props });
    await client.flush();
  } catch {
    /* noop */
  }
}

/**
 * Evaluates a feature flag server-side. If PostHog isn't configured
 * we return `fallback` so the app still runs in local dev without a
 * key.
 */
export async function isFlagEnabledServer(
  flag: string,
  distinctId: string,
  fallback = false,
): Promise<boolean> {
  const client = getClient();
  if (!client) return fallback;
  try {
    const enabled = await client.isFeatureEnabled(flag, distinctId);
    return enabled ?? fallback;
  } catch {
    return fallback;
  }
}

/** Call from a handler `finally` block to make sure buffered events ship. */
export async function flushAnalytics(): Promise<void> {
  if (!cached) return;
  try {
    await cached.flush();
  } catch {
    /* noop */
  }
}
