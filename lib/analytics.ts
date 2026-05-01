"use client";

import posthog from "posthog-js";
import { useEffect, useRef } from "react";

type AnalyticsProps = Record<string, string | number | boolean | null | undefined>;
type AnalyticsEventProps = {
  cta_clicked: AnalyticsProps & {
    cta_name: string;
    location: string;
    target_path?: string;
  };
  demo_action: AnalyticsProps & { action_type: string };
  demo_scene_viewed: AnalyticsProps & { demo_screen: string };
  demo_screen_navigated: AnalyticsProps & {
    from_screen: string;
    target_screen: string;
  };
  demo_started: AnalyticsProps;
  demo_abandoned: AnalyticsProps;
  demo_completed: AnalyticsProps;
  demo_reset: AnalyticsProps;
  faq_opened: AnalyticsProps & { question_id: string };
  help_agent_opened: AnalyticsProps;
  help_agent_closed: AnalyticsProps;
  help_message_sent: AnalyticsProps;
  help_response_completed: AnalyticsProps;
  help_response_failed: AnalyticsProps;
  help_suggestion_clicked: AnalyticsProps;
  hero_phone_changed: AnalyticsProps;
  hero_phone_lightbox_opened: AnalyticsProps;
  hero_phone_lightbox_closed: AnalyticsProps;
  how_it_works_completed: AnalyticsProps;
  how_it_works_phone_swapped: AnalyticsProps;
  how_it_works_step_viewed: AnalyticsProps;
  nav_mobile_menu_toggled: AnalyticsProps & { open: boolean };
  pricing_period_changed: AnalyticsProps & { period: string };
  section_viewed: AnalyticsProps & { section_name: string };
  waitlist_confirmation_viewed: AnalyticsProps;
  waitlist_field_started: AnalyticsProps;
  waitlist_submit_clicked: AnalyticsProps;
  waitlist_submit_failed: AnalyticsProps;
  waitlist_submitted: AnalyticsProps;
  waitlist_viewed: AnalyticsProps;
};

export type AnalyticsEventName = keyof AnalyticsEventProps;

const EVENT_VERSION = 1;
const LANDING_KEY = "tabby:analytics:landing";
const WAITLIST_SOURCE_KEY = "tabby:analytics:waitlist-source";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

function viewportBucket() {
  if (typeof window === "undefined") return "unknown";
  const width = window.innerWidth;
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

function referrerDomain() {
  if (typeof document === "undefined" || !document.referrer) return "";
  try {
    return new URL(document.referrer).hostname;
  } catch {
    return "";
  }
}

function readLandingPath() {
  if (typeof window === "undefined") return "";
  try {
    const existing = window.sessionStorage.getItem(LANDING_KEY);
    if (existing) return existing;
    const landing = `${window.location.pathname}${window.location.search}`;
    window.sessionStorage.setItem(LANDING_KEY, landing);
    return landing;
  } catch {
    return `${window.location.pathname}${window.location.search}`;
  }
}

function utmProps() {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return Object.fromEntries(
    UTM_KEYS.map((key) => [key, params.get(key) || undefined]),
  );
}

function cleanProps(props: AnalyticsProps) {
  return Object.fromEntries(
    Object.entries(props).filter(([, value]) => value !== undefined),
  );
}

export function initAnalyticsSession() {
  if (typeof window === "undefined") return;
  const props = cleanProps({
    landing_path: readLandingPath(),
    referrer_domain: referrerDomain() || undefined,
    viewport_bucket: viewportBucket(),
    ...utmProps(),
  });
  try {
    posthog.register_once(props);
  } catch {}
}

export function track(event: string, props: AnalyticsProps = {}) {
  try {
    if (
      event === "cta_clicked" &&
      typeof window !== "undefined" &&
      String(props.target_path || "").startsWith("/waitlist")
    ) {
      window.sessionStorage.setItem(
        WAITLIST_SOURCE_KEY,
        String(props.location || props.cta_name || "unknown"),
      );
    }
    posthog.capture(
      event,
      cleanProps({
        event_version: EVENT_VERSION,
        current_path:
          typeof window === "undefined"
            ? undefined
            : `${window.location.pathname}${window.location.search}`,
        viewport_bucket: viewportBucket(),
        ...props,
      }),
    );
  } catch {}
}

export function trackEvent<T extends AnalyticsEventName>(
  event: T,
  props: AnalyticsEventProps[T],
) {
  track(event, props);
}

export function waitlistSource() {
  if (typeof window === "undefined") return undefined;
  try {
    return window.sessionStorage.getItem(WAITLIST_SOURCE_KEY) || undefined;
  } catch {
    return undefined;
  }
}

export function lengthBucket(value: string) {
  const length = value.trim().length;
  if (length === 0) return "empty";
  if (length < 20) return "short";
  if (length < 80) return "medium";
  return "long";
}

export function useSectionViewed<T extends HTMLElement = HTMLElement>(sectionName: string) {
  const ref = useRef<T | null>(null);
  const seen = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || seen.current || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || seen.current) return;
        seen.current = true;
        track("section_viewed", { section_name: sectionName });
        observer.disconnect();
      },
      { threshold: 0.35 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [sectionName]);

  return ref;
}
