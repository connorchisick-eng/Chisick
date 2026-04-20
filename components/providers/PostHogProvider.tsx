"use client";
import { useEffect } from "react";
import posthog from "posthog-js";
import { PostHogProvider as PHProvider } from "posthog-js/react";

/**
 * Boots posthog-js once on the client and provides it to the rest of
 * the tree via the official React provider. Key behaviour:
 *
 *  - `api_host: /ingest` — traffic goes through the Next rewrites
 *    defined in `next.config.mjs`, surviving most ad-blockers.
 *  - Autocapture + heatmaps ON — free dev signal on top of the named
 *    events we emit via `lib/analytics.ts`.
 *  - `capture_pageview: 'history_change'` is OFF because App Router
 *    client nav doesn't fire history events the way `posthog-js`
 *    expects; we emit `$pageview` ourselves from `<PageViewTracker />`.
 *  - Global props registered once: `theme`, `prefers_reduced_motion`,
 *    `device_type`, `viewport_w/h`. Every captured event carries them.
 *  - `window.onerror` + `onunhandledrejection` feed into PostHog's
 *    Error Tracking feature via `posthog.captureException`.
 *
 * If the public key isn't set, this component renders children without
 * booting PostHog — the site is fully functional without analytics.
 */
export function PostHogProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (!key) return;

    // Avoid re-initializing on Fast Refresh / Strict-Mode double-mount.
    const w = window as unknown as { __posthog_booted?: boolean };
    if (w.__posthog_booted) return;
    w.__posthog_booted = true;

    posthog.init(key, {
      api_host: "/ingest",
      ui_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.posthog.com",
      capture_pageview: false,
      capture_pageleave: true,
      autocapture: true,
      persistence: "localStorage+cookie",
      session_recording: {
        maskAllInputs: false,
        // `.data-ph-no-capture` selectors on phone inputs + chat textarea
        // keep PII out of recordings without opting every field out.
        maskTextSelector: "[data-ph-no-capture]",
      },
      loaded: (ph) => {
        // Stamp global props so every event is filterable.
        try {
          const theme =
            document.documentElement.getAttribute("data-theme") || "light";
          const reduced = window.matchMedia(
            "(prefers-reduced-motion: reduce)",
          ).matches;
          const width = window.innerWidth;
          const device =
            width < 640 ? "mobile" : width < 1024 ? "tablet" : "desktop";
          ph.register({
            theme,
            prefers_reduced_motion: reduced,
            device_type: device,
            viewport_w: window.innerWidth,
            viewport_h: window.innerHeight,
          });
        } catch {
          /* noop */
        }
      },
    });

    // Make posthog available for the lib/analytics.ts wrapper.
    (window as unknown as { posthog: typeof posthog }).posthog = posthog;

    // Browser-level error capture → PostHog Error Tracking.
    const onErr = (e: ErrorEvent) => {
      try {
        posthog.captureException(e.error ?? new Error(e.message), {
          source: e.filename,
          lineno: e.lineno,
          colno: e.colno,
        });
      } catch {
        /* noop */
      }
    };
    const onRej = (e: PromiseRejectionEvent) => {
      try {
        posthog.captureException(
          e.reason instanceof Error ? e.reason : new Error(String(e.reason)),
          { source: "unhandledrejection" },
        );
      } catch {
        /* noop */
      }
    };
    window.addEventListener("error", onErr);
    window.addEventListener("unhandledrejection", onRej);
    return () => {
      window.removeEventListener("error", onErr);
      window.removeEventListener("unhandledrejection", onRej);
    };
  }, []);

  return <PHProvider client={posthog}>{children}</PHProvider>;
}
