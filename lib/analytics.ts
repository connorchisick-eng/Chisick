import type { PostHog } from "posthog-js";

/**
 * Typed analytics wrapper. Every component imports `track` / `identify`
 * from here; nothing imports `posthog-js` directly. That keeps event
 * names strongly-typed, gives us one place to no-op when the key isn't
 * set, and makes swapping/augmenting the sink (Sentry, Segment, ...)
 * a one-file change later.
 */

export type AnalyticsEvent =
  // Waitlist funnel
  | "waitlist_form_viewed"
  | "waitlist_form_started"
  | "waitlist_form_field_blurred"
  | "waitlist_form_submitted"
  | "waitlist_form_succeeded"
  | "waitlist_form_failed"
  // Help agent (AI chat)
  | "help_agent_opened"
  | "help_agent_closed"
  | "help_agent_suggestion_clicked"
  | "help_agent_message_sent"
  | "help_agent_response_streamed"
  | "help_agent_errored"
  // Hero carousel
  | "hero_carousel_advanced"
  | "hero_carousel_wrapped"
  | "hero_carousel_paused"
  | "hero_carousel_resumed"
  // Nav / theme / scroll
  | "nav_link_clicked"
  | "nav_logo_clicked"
  | "mobile_menu_toggled"
  | "theme_toggled"
  | "scroll_depth_reached"
  // Sections
  | "section_viewed"
  // Pricing + FAQ
  | "pricing_period_toggled"
  | "pricing_cta_clicked"
  | "faq_item_toggled"
  // Primary CTA
  | "cta_join_waitlist_clicked"
  | "footer_link_clicked";

type Props = Record<string, unknown>;

function getPosthog(): PostHog | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { posthog?: PostHog };
  return w.posthog ?? null;
}

/**
 * Safe no-op when PostHog isn't loaded yet (SSR, ad-blocker, missing
 * key). Consumers never need to null-check.
 */
export function track(event: AnalyticsEvent, props?: Props): void {
  const ph = getPosthog();
  if (!ph) return;
  try {
    ph.capture(event, props);
  } catch {
    // Swallow — analytics must never break the product.
  }
}

export function identify(distinctId: string, props?: Props): void {
  const ph = getPosthog();
  if (!ph) return;
  try {
    ph.identify(distinctId, props);
  } catch {
    /* noop */
  }
}

export function reset(): void {
  const ph = getPosthog();
  if (!ph) return;
  try {
    ph.reset();
  } catch {
    /* noop */
  }
}

export function getDistinctId(): string | null {
  const ph = getPosthog();
  if (!ph) return null;
  try {
    return ph.get_distinct_id() ?? null;
  } catch {
    return null;
  }
}

/**
 * Returns a stable SHA-256 hex digest of the input. Used so a person's
 * raw phone number never becomes their PostHog distinct_id; we identify
 * on `sha256(e164_phone)` instead.
 */
export async function sha256Hex(input: string): Promise<string> {
  const bytes = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Rough E.164 normalizer: keep digits + optional leading +, nothing else. */
export function normalizePhoneE164(raw: string): string {
  const plus = raw.trim().startsWith("+");
  const digits = raw.replace(/\D/g, "");
  return plus ? `+${digits}` : digits;
}
