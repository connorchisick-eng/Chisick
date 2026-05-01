"use client";
import { useEffect, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";
import { PostHogProvider as BasePostHogProvider } from "posthog-js/react";
import { initAnalyticsSession } from "@/lib/analytics";

// Initialize PostHog once, on the client. Guarded by the env var so builds
// without a token (local dev / preview) don't spam errors to the console.
if (typeof window !== "undefined") {
  const token =
    process.env.NEXT_PUBLIC_POSTHOG_PROJECT_TOKEN ||
    process.env.NEXT_PUBLIC_POSTHOG_TOKEN ||
    process.env.NEXT_PUBLIC_POSTHOG_KEY;
  // Route events through our own /ingest proxy (see next.config.mjs
  // rewrites) so ad-blockers can't strip analytics. ui_host keeps dashboard
  // links in PostHog pointing at posthog.com.
  const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST || "/ingest";
  if (token && !posthog.__loaded) {
    posthog.init(token, {
      api_host: apiHost,
      ui_host: "https://us.posthog.com",
      defaults: "2026-01-30",
      // Next.js App Router triggers SPA-style navigations — we capture
      // pageviews manually via <PostHogPageview/> so they fire with the
      // correct new URL instead of the initial one.
      capture_pageview: false,
      capture_pageleave: true,
      person_profiles: "identified_only",
      persistence: "localStorage+cookie",
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") ph.debug(false);
      },
    });
  }
}

export function PostHogProvider({ children }: { children: React.ReactNode }) {
  return (
    <BasePostHogProvider client={posthog}>
      <Suspense fallback={null}>
        <PostHogPageview />
      </Suspense>
      {children}
    </BasePostHogProvider>
  );
}

// Captures a $pageview on every client-side route change. Do NOT gate on
// posthog.__loaded — posthog-js automatically buffers capture() calls that
// happen before boot completes and flushes them once the SDK is ready.
// Gating here would drop the initial pageview on first load.
function PostHogPageview() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    initAnalyticsSession();
  }, []);

  useEffect(() => {
    if (!pathname || typeof window === "undefined") return;
    const qs = searchParams?.toString();
    const url = qs
      ? `${window.location.origin}${pathname}?${qs}`
      : `${window.location.origin}${pathname}`;
    posthog.capture("$pageview", { $current_url: url });
  }, [pathname, searchParams]);

  return null;
}
