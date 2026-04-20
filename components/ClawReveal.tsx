"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Hero headline with CAT-CLAW SCRATCH MARKS — two decisive diagonal
 * swipes slashing across the headline area. Each swipe is a cluster of 4
 * close parallel near-straight lines (like claws dragged across paper).
 *
 * The scratches draw in once on load and stay behind the text as a
 * permanent design element — the SVG sits at z-0 and the headline at
 * z-10, so the letterforms always punch cleanly through the slashes.
 */
export function ClawReveal() {
  const svgRef = useRef<SVGSVGElement>(null);
  const line1Ref = useRef<HTMLSpanElement>(null);
  const line2Ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const paths = svg.querySelectorAll<SVGPathElement>(".claw-path");

    // Measure each path's real length for stroke-dashoffset animation
    paths.forEach((p) => {
      const len = p.getTotalLength();
      p.style.strokeDasharray = `${len}`;
      p.style.strokeDashoffset = `${len}`;
    });

    // Initial text state
    [line1Ref.current, line2Ref.current].forEach((el) => {
      if (!el) return;
      el.style.opacity = "0";
      el.style.transform = "translateY(16px)";
    });

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // Two decisive claw swipes, each a cluster of 4 parallel claws
    const swipe1 = svg.querySelectorAll(".swipe-1 .claw-path");
    const swipe2 = svg.querySelectorAll(".swipe-2 .claw-path");

    tl.to(swipe1, { strokeDashoffset: 0, duration: 0.38, stagger: 0.03 }, 0.1);
    tl.to(swipe2, { strokeDashoffset: 0, duration: 0.38, stagger: 0.03 }, 0.42);

    // The scratches stay — they're part of the design, not a transient
    // reveal. Text reads cleanly because the letterforms sit above the SVG.

    // Text slides up / fades as the claws drag across
    if (line1Ref.current) {
      tl.to(
        line1Ref.current,
        { opacity: 1, y: 0, duration: 0.7, ease: "expo.out" },
        0.28,
      );
    }
    if (line2Ref.current) {
      tl.to(
        line2Ref.current,
        { opacity: 1, y: 0, duration: 0.8, ease: "expo.out" },
        0.52,
      );
    }

    return () => {
      tl.kill();
    };
  }, []);

  return (
    <div className="relative w-full">
      {/* Headline text — centered, above the scratches */}
      <div className="relative z-10 text-center">
        <span
          ref={line1Ref}
          className="block font-grotesk font-bold text-fg text-hero leading-[0.9]"
          style={{ opacity: 0, transform: "translateY(16px)" }}
        >
          Enjoy the meal,
        </span>
        <span
          ref={line2Ref}
          className="block font-grotesk italic font-medium text-accent text-hero leading-[0.9]"
          style={{ opacity: 0, transform: "translateY(16px)" }}
        >
          not the math.
        </span>
      </div>

      {/* Two diagonal cat-claw swipes, each 4 parallel near-straight slashes.
          Pinned to z-0 so the headline (z-10) always sits on top.

          Color logic: swipe-1 slashes across "Enjoy the meal," — which is
          neutral (cream in dark / near-black in light) — so accent orange
          reads cleanly there. Swipe-2 crosses "not the math." which is
          itself accent orange, so orange-on-orange clashed. Swipe-2 now
          uses `currentColor` → `text-fg/30` so it renders as a muted
          neutral tone that lets the orange italic text punch through in
          both themes. */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-visible"
        viewBox="0 0 1000 500"
        preserveAspectRatio="none"
        aria-hidden
      >
        {/* Swipe 1 — across "Enjoy the meal," (neutral text → accent works) */}
        <g className="swipe-1">
          <path className="claw-path" d="M -20 10 Q 120 18, 280 40 T 600 120" stroke="rgb(255, 124, 97)" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.55" />
          <path className="claw-path" d="M -20 38 Q 120 46, 280 70 T 600 160" stroke="rgb(255, 124, 97)" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.7" />
          <path className="claw-path" d="M -20 68 Q 120 76, 280 102 T 600 200" stroke="rgb(255, 124, 97)" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.7" />
          <path className="claw-path" d="M -20 100 Q 120 108, 280 136 T 600 240" stroke="rgb(255, 124, 97)" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.55" />
        </g>

        {/* Swipe 2 — across "not the math." (orange text → neutral claws so
            the accent pops instead of clashing). currentColor resolves to
            text-fg on the <g>, which flips with the theme. */}
        <g className="swipe-2 text-fg">
          <path className="claw-path" d="M 380 300 Q 560 320, 760 362 T 1030 428" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.22" />
          <path className="claw-path" d="M 380 332 Q 560 354, 760 398 T 1030 466" stroke="currentColor" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.30" />
          <path className="claw-path" d="M 380 366 Q 560 390, 760 436 T 1030 506" stroke="currentColor" strokeWidth="7" strokeLinecap="round" fill="none" opacity="0.30" />
          <path className="claw-path" d="M 380 402 Q 560 428, 760 476 T 1030 548" stroke="currentColor" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.22" />
        </g>
      </svg>
    </div>
  );
}
