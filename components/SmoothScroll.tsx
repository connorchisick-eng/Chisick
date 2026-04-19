"use client";
import { useEffect } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let greeted = false;
function greetDevs() {
  if (greeted) return;
  greeted = true;
  const art = [
    "",
    "   /\\_/\\     tabby.",
    "  ( o.o )    enjoy the meal, not the math.",
    "   > ^ <     launching Q4 2026.",
    "",
  ].join("\n");
  const title = "%ctabby.";
  const body = "%cPoking around? We're building something fun.";
  const hire = "%cLike crafting interfaces like this? We're building the team.";
  /* eslint-disable no-console */
  console.log(
    `${title}\n${art}\n${body}\n${hire}`,
    "color:#FF7C61;font-weight:700;font-size:24px;font-style:italic;",
    "color:#0E0E0E;font-size:12px;line-height:1.4;",
    "color:#0E0E0E;font-size:12px;",
    "color:#FF7C61;font-size:12px;font-weight:600;",
  );
  /* eslint-enable no-console */
}

export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    greetDevs();
    gsap.registerPlugin(ScrollTrigger);

    // iOS Safari shows/hides its URL bar on scroll, which fires a resize event
    // that makes ScrollTrigger recalculate pinned sections mid-gesture. This
    // kills the jitter at pin boundaries.
    ScrollTrigger.config({ ignoreMobileResize: true });

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lenis = new Lenis({
      // lerp-based smoothing tracks the wheel more responsively than the
      // duration-based mode and feels less "laggy" when entering pinned
      // sections. 0.09 per frame is smooth without feeling floaty.
      lerp: reduced ? 1 : 0.09,
      smoothWheel: !reduced,
      wheelMultiplier: 1,
      touchMultiplier: 1.6,
    });

    // Expose for imperative resets (e.g. ScrollToTop on client-side nav).
    (window as unknown as { __lenis?: Lenis }).__lenis = lenis;

    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const onLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onLoad);

    return () => {
      gsap.ticker.remove(raf);
      lenis.destroy();
      delete (window as unknown as { __lenis?: Lenis }).__lenis;
      window.removeEventListener("load", onLoad);
    };
  }, []);
  return null;
}
