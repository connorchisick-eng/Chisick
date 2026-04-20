"use client";
import { useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import posthog from "posthog-js";

/**
 * Emits a $pageview whenever the App Router navigates client-side.
 * PostHog's auto pageview relies on `popstate` / `pushState`
 * observation, which Next's client router can short-circuit, so we
 * own this explicitly.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!pathname) return;
    if (typeof window === "undefined") return;
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

    const qs = searchParams?.toString();
    const url = qs ? `${pathname}?${qs}` : pathname;
    try {
      posthog.capture("$pageview", {
        $current_url: window.location.origin + url,
        $pathname: pathname,
      });
    } catch {
      /* noop */
    }
  }, [pathname, searchParams]);

  return null;
}
