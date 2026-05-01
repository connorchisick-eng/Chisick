"use client";
import { useLayoutEffect } from "react";

type LenisLike = {
  scrollTo: (target: number, opts?: { immediate?: boolean; force?: boolean; lock?: boolean }) => void;
  stop?: () => void;
  start?: () => void;
};

/**
 * Forces the viewport to the top on mount. Needed because Lenis smooth
 * scroll otherwise preserves the previous page's scroll position across
 * client-side navigation — landing on /waitlist from mid-page looked like
 * the page "opened in the middle." We also schedule additional resets on
 * the next few frames because Lenis can re-apply the old scroll position
 * after the route paints (scroll restoration race).
 */
export function ScrollToTop() {
  useLayoutEffect(() => {
    const force = () => {
      const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
      if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    };

    // Stop browser from restoring the previous scroll position for this nav.
    const prevRestoration = history.scrollRestoration;
    try {
      history.scrollRestoration = "manual";
    } catch {
      // no-op
    }

    force();

    // Re-force on the next few animation frames — Lenis/ScrollTrigger can
    // recompute layout after the route paints and snap us back. 4 frames
    // of nail-it-down covers the race reliably without being perceptible.
    let frames = 0;
    let rafId = 0;
    const tick = () => {
      force();
      if (++frames < 4) {
        rafId = requestAnimationFrame(tick);
      }
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      try {
        history.scrollRestoration = prevRestoration;
      } catch {
        // no-op
      }
    };
  }, []);
  return null;
}
