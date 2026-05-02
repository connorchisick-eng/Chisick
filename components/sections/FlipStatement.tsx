"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "motion/react";
import { WordFlip } from "@/components/WordFlip";
import { clsx } from "clsx";

const LUXURY = ["wagyu", "caviar", "truffle", "lobster", "oysters", "dry-aged"];
const HUMBLE = ["water", "salad", "bread", "fries", "a Coke", "tap water"];

type Props = {
  variant?: "light" | "dark";
  interval?: number;
};

/**
 * FlipStatement — "The Principle." Editorial pull-quote that anchors the
 * page philosophy between the Hero and How-It-Works sections.
 *
 * Stripped-down version: just the eyebrow, the headline with the word
 * flip + a clean strikethrough on the luxury word, and breathing room.
 * No ledger pinstripes, ghost quote glyph, pip counter, or signature
 * line — the headline is the moment; everything else was noise.
 */
export function FlipStatement({ variant = "light", interval = 2200 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => setIdx((i) => i + 1), interval);
    return () => clearInterval(t);
  }, [interval, inView]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".fs-rise",
        { y: 22, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: { trigger: ref.current, start: "top 78%", once: true },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  const dark = variant === "dark";

  return (
    <section
      ref={ref}
      className={clsx(
        "relative overflow-hidden",
        dark ? "bg-ink text-cream" : "bg-surface-alt text-body",
      )}
    >
      {dark && <div className="noise" />}

      <div
        className={clsx(
          "relative mx-auto max-w-[1280px] px-6 lg:px-10",
          dark ? "pt-16 lg:pt-20 pb-20 lg:pb-24" : "pt-24 lg:pt-32 pb-24 lg:pb-32",
        )}
      >
        <div className="fs-rise flex items-center justify-center gap-3 sm:gap-4">
          <span
            aria-hidden
            className={clsx(
              "h-px w-10 sm:w-14",
              dark ? "bg-cream/30" : "bg-body/25",
            )}
          />
          <span
            className={clsx(
              "text-[0.66rem] sm:text-[0.72rem] uppercase tracking-[0.32em] font-semibold",
              dark ? "text-cream" : "text-body",
            )}
          >
            The Principle
          </span>
          <span
            aria-hidden
            className={clsx(
              "h-px w-10 sm:w-14",
              dark ? "bg-cream/30" : "bg-body/25",
            )}
          />
        </div>

        <h2
          className={clsx(
            "fs-rise font-grotesk font-bold leading-[1.2] text-center mx-auto mt-10 sm:mt-14 lg:mt-16",
            "tracking-[-0.025em]",
            dark ? "text-cream" : "text-body",
          )}
          style={{ fontSize: "clamp(1.95rem, 6vw, 6.25rem)" }}
        >
          <div className="md:whitespace-nowrap">
            Don&apos;t pay for their{" "}
            <span className="italic font-medium text-accent">
              <WordFlip
                words={LUXURY}
                index={idx}
                renderOverlay={() => <Strike idx={idx} dark={dark} />}
              />
            </span>
          </div>
          <div className="mt-1 sm:mt-2 md:whitespace-nowrap">
            when you had{" "}
            <span
              className={clsx(
                "italic font-medium",
                dark ? "text-cream/70" : "text-body/75",
              )}
            >
              <WordFlip
                words={HUMBLE}
                index={idx}
                suffix={<span className="text-accent">.</span>}
              />
            </span>
          </div>
        </h2>
      </div>
    </section>
  );
}

/**
 * Clean strikethrough overlay. Single straight stroke (no scribble),
 * draws once per word change, sized to the visible glyphs via the
 * parent motion.span. Reduced-motion shows a static stroke.
 */
function Strike({ idx, dark }: { idx: number; dark: boolean }) {
  const reduced =
    typeof window !== "undefined"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const stroke = "rgb(255, 124, 97)";
  const targetOpacity = dark ? 0.85 : 0.9;

  if (reduced) {
    return (
      <svg
        key={idx}
        aria-hidden
        viewBox="0 0 100 10"
        preserveAspectRatio="none"
        className="pointer-events-none absolute inset-x-[-2%] top-[55%] -translate-y-1/2 h-[0.32em] w-[104%]"
        fill="none"
      >
        <path
          d="M 1 5 L 99 5"
          stroke={stroke}
          strokeWidth="2.2"
          strokeLinecap="round"
          opacity={targetOpacity}
        />
      </svg>
    );
  }

  // Strike is delayed so it lands AFTER the new word fades in. During
  // that pre-draw window the path is hidden — at pathLength: 0 a
  // round-cap still renders as a dot at the start, which reads as a
  // typo. Opacity is gated on the same delay so the stroke only
  // becomes visible at the exact moment it begins drawing.
  const drawDelay = 0.56;
  const drawDuration = 0.45;

  return (
    <motion.svg
      key={idx}
      aria-hidden
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-[-2%] top-[55%] -translate-y-1/2 h-[0.32em] w-[104%]"
      fill="none"
    >
      <motion.path
        d="M 1 5 L 99 5"
        stroke={stroke}
        strokeWidth="2.2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: targetOpacity }}
        transition={{
          pathLength: {
            delay: drawDelay,
            duration: drawDuration,
            ease: [0.65, 0, 0.35, 1],
          },
          opacity: {
            delay: drawDelay,
            duration: 0.08,
            ease: "linear",
          },
        }}
      />
    </motion.svg>
  );
}
