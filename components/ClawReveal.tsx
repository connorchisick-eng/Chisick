"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

/**
 * Hero headline with CAT-CLAW SCRATCH MARKS — two decisive diagonal
 * swipes slashing across the headline area. Each swipe is a cluster of 4
 * close parallel near-straight lines (like claws dragged across paper).
 *
 * Scratches draw in once on load and stay permanent (no hover fade).
 * Text reveals alongside the scratches like it's being torn into view.
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

    // After scratches have been visible for ~1.8s, gracefully fade them out
    if (svg) {
      tl.to(
        svg,
        { opacity: 0, duration: 1.1, ease: "power2.inOut" },
        2.8,
      );
    }

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
      {/* Headline text — centered */}
      <div className="relative z-10 text-center">
        <span
          ref={line1Ref}
          className="block font-grotesk font-bold text-ink text-hero leading-[0.9]"
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

      {/* Two diagonal cat-claw swipes, each 4 parallel near-straight slashes */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-20 overflow-visible"
        viewBox="0 0 1000 500"
        preserveAspectRatio="none"
        aria-hidden
      >
        {/* Swipe 1 — diagonal across "Enjoy the meal," from upper-left, angling down-right */}
        <g className="swipe-1">
          <path className="claw-path" d="M -20 10 Q 120 18, 280 40 T 600 120" stroke="rgb(255, 124, 97)" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.85" />
          <path className="claw-path" d="M -20 38 Q 120 46, 280 70 T 600 160" stroke="rgb(255, 124, 97)" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.95" />
          <path className="claw-path" d="M -20 68 Q 120 76, 280 102 T 600 200" stroke="rgb(255, 124, 97)" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.95" />
          <path className="claw-path" d="M -20 100 Q 120 108, 280 136 T 600 240" stroke="rgb(255, 124, 97)" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.85" />
        </g>

        {/* Swipe 2 — diagonal across "not the math." from left-middle to bottom-right */}
        <g className="swipe-2">
          <path className="claw-path" d="M 380 300 Q 560 320, 760 362 T 1030 428" stroke="rgb(255, 124, 97)" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.85" />
          <path className="claw-path" d="M 380 332 Q 560 354, 760 398 T 1030 466" stroke="rgb(255, 124, 97)" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.95" />
          <path className="claw-path" d="M 380 366 Q 560 390, 760 436 T 1030 506" stroke="rgb(255, 124, 97)" strokeWidth="8" strokeLinecap="round" fill="none" opacity="0.95" />
          <path className="claw-path" d="M 380 402 Q 560 428, 760 476 T 1030 548" stroke="rgb(255, 124, 97)" strokeWidth="5" strokeLinecap="round" fill="none" opacity="0.85" />
        </g>
      </svg>
    </div>
  );
}
