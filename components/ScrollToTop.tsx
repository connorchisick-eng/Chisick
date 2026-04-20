"use client";
import { useLayoutEffect } from "react";

type LenisLike = {
  scrollTo: (target: number, opts?: { immediate?: boolean; force?: boolean }) => void;
  stop?: () => void;
  start?: () => void;
};

/**
 * Forces the viewport to the top on mount. Needed because Lenis smooth
 * scroll otherwise preserves the previous page's scroll position across
 * client-side navigation — landing on /waitlist from mid-page looked like
 * the page "opened in the middle."
 */
export function ScrollToTop() {
  useLayoutEffect(() => {
    const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
    if (lenis) {
      lenis.scrollTo(0, { immediate: true, force: true });
    }
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const id = requestAnimationFrame(() => {
      const l = (window as unknown as { __lenis?: LenisLike }).__lenis;
      if (l) l.scrollTo(0, { immediate: true, force: true });
      window.scrollTo(0, 0);
    });
    return () => cancelAnimationFrame(id);
  }, []);
  return null;
}
