"use client";
import { useEffect } from "react";

type LenisLike = {
  scrollTo: (target: number | Element, opts?: { immediate?: boolean; force?: boolean; offset?: number }) => void;
};

/**
 * Scrolls to `#hash` targets after a hard navigation (e.g. clicking a nav
 * link like /#how-it-works from /waitlist). Browser-native hash scrolling
 * fights with Lenis + GSAP pinned sections, so this resolves it explicitly
 * once the layout has settled.
 */
export function HashScroller() {
  useEffect(() => {
    if (typeof window === "undefined") return;

    const scrollToHash = () => {
      const hash = window.location.hash?.slice(1);
      if (!hash) return;
      const el = document.getElementById(hash);
      if (!el) return;
      // Pinned sections (e.g. #how-it-works) trigger their
      // ScrollTrigger pin at `top top` — landing them 120px below the nav
      // means the pin hasn't engaged yet and the user has to scroll to
      // activate the animation. For these we want section-top at y=0 and
      // let the inverted nav overlap.
      const pinned = el.hasAttribute("data-nav-invert");
      const offset = pinned ? 0 : -120;
      const lenis = (window as unknown as { __lenis?: LenisLike }).__lenis;
      if (lenis) {
        lenis.scrollTo(el, { offset });
      } else {
        const top = el.getBoundingClientRect().top + window.scrollY + offset;
        window.scrollTo({ top, behavior: "smooth" });
      }
    };

    // Multiple attempts — ScrollTrigger pins can shift layout after initial paint.
    const timeouts = [80, 400, 900].map((d) => window.setTimeout(scrollToHash, d));
    window.addEventListener("hashchange", scrollToHash);
    return () => {
      timeouts.forEach(clearTimeout);
      window.removeEventListener("hashchange", scrollToHash);
    };
  }, []);

  return null;
}
