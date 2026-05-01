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
 * The trick that makes this section feel intentional rather than floating:
 * every time the luxury word flips, a hand-drawn strikethrough scribbles
 * across it — visually "crossing it off your tab." The strike is keyed to
 * the same `idx` that drives the WordFlip, so the two stay in lockstep.
 *
 * Surrounding chrome (eyebrow chapter mark, hairline rules, ghost quote
 * glyph, pair counter, signature line, ledger-paper backdrop) gives the
 * spread a magazine-pull-quote density without crowding the headline.
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
        { y: 26, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.95,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: { trigger: ref.current, start: "top 78%", once: true },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  const dark = variant === "dark";
  const pair = idx % LUXURY.length;

  return (
    <section
      ref={ref}
      className={clsx(
        "relative overflow-hidden",
        dark ? "bg-ink text-cream" : "bg-surface-alt text-body",
      )}
    >
      {dark && <div className="noise" />}

      {/* Ledger-paper hairlines — vertical pinstripes that suggest accounting
          stationery without being literal. Stops short of the headline area
          via mask so they don't fight the type. Hidden when reduced. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: dark
            ? "repeating-linear-gradient(90deg, rgba(248,244,240,0.9) 0 1px, transparent 1px 7%)"
            : "repeating-linear-gradient(90deg, rgba(14,14,14,0.9) 0 1px, transparent 1px 7%)",
          maskImage:
            "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 32%, black 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 32%, black 70%)",
        }}
      />

      {/* Oversized ghost quote glyph — single accent " stamp behind the
          headline. Reinforces the "this is a principle / pull-quote" frame
          without literal quotation marks around the live text. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 -translate-x-1/2 select-none"
        style={{
          top: "calc(50% - 0.05em)",
          transform: "translate(-50%, -50%)",
          fontFamily: "'Cabinet Grotesk', sans-serif",
          fontStyle: "italic",
          fontWeight: 700,
          fontSize: "clamp(14rem, 36vw, 36rem)",
          lineHeight: 1,
          color: dark
            ? "rgba(255, 124, 97, 0.07)"
            : "rgba(255, 124, 97, 0.085)",
          letterSpacing: "-0.05em",
        }}
      >
        &ldquo;
      </div>

      <div
        className={clsx(
          "relative mx-auto max-w-[1440px] px-6 lg:px-10",
          dark ? "pt-12 lg:pt-16 pb-20 lg:pb-28" : "pt-20 lg:pt-28 pb-20 lg:pb-28",
        )}
      >
        {/* Eyebrow chapter mark — same stylistic family as Showcase's
            ChapterMark. Anchors the section as "§ — The Principle." */}
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
              "font-grotesk font-bold tabular-nums text-[0.7rem] sm:text-[0.74rem] uppercase tracking-[0.32em]",
              dark ? "text-cream/55" : "text-body/55",
            )}
          >
            §
          </span>
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

        {/* Headline frame — top + bottom hairlines that read as a torn
            receipt slip. The headline sits inside, centered. */}
        <div className="relative mt-10 sm:mt-14 lg:mt-16">
          <div
            aria-hidden
            className={clsx(
              "fs-rise absolute top-0 left-1/2 -translate-x-1/2 h-px",
              dark ? "bg-cream/12" : "bg-body/15",
            )}
            style={{ width: "min(640px, 90%)" }}
          />

          <h2
            className={clsx(
              "fs-rise font-grotesk font-bold leading-[1.2] text-center mx-auto py-10 sm:py-12 lg:py-16",
              "tracking-[-0.025em]",
              dark ? "text-cream" : "text-body",
            )}
            style={{ fontSize: "clamp(1.95rem, 6vw, 6.25rem)" }}
          >
            <div className="md:whitespace-nowrap">
              Don&apos;t pay for their{" "}
              {/* Luxury word — Strike is rendered as an overlay INSIDE the
                  active word's motion span so it sizes to the visible glyphs,
                  not the locked cell width. */}
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
                {/* Period passes through `suffix` so it hugs the active word
                    inside the locked cell instead of floating at the cell's
                    right edge. */}
                <WordFlip
                  words={HUMBLE}
                  index={idx}
                  suffix={<span className="text-accent">.</span>}
                />
              </span>
            </div>
          </h2>

          <div
            aria-hidden
            className={clsx(
              "fs-rise absolute bottom-0 left-1/2 -translate-x-1/2 h-px",
              dark ? "bg-cream/12" : "bg-body/15",
            )}
            style={{ width: "min(640px, 90%)" }}
          />
        </div>

        {/* Footer row — pair counter on the left, signature on the right.
            Stacks centered on mobile so the spacing stays balanced. */}
        <div className="fs-rise mt-8 sm:mt-10 lg:mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-6">
          {/* Pair pip counter — six dots, the active one widens to a hairline. */}
          <div className="flex items-center gap-3">
            <span
              className={clsx(
                "font-grotesk font-bold tabular-nums text-[0.7rem] tracking-[0.18em] uppercase",
                dark ? "text-cream/55" : "text-body/45",
              )}
            >
              {String(pair + 1).padStart(2, "0")}
              <span className={clsx("mx-1.5", dark ? "text-cream/25" : "text-body/25")}>/</span>
              {String(LUXURY.length).padStart(2, "0")}
            </span>
            <div className="flex items-center gap-1.5">
              {LUXURY.map((_, i) => (
                <span
                  key={i}
                  className={clsx(
                    "h-1.5 rounded-full transition-all duration-500 ease-out",
                    i === pair
                      ? "w-5 bg-accent"
                      : dark
                      ? "w-1.5 bg-cream/20"
                      : "w-1.5 bg-body/15",
                  )}
                />
              ))}
            </div>
          </div>

          <span
            className={clsx(
              "font-grotesk italic font-medium text-[0.85rem] sm:text-[0.95rem]",
              dark ? "text-cream/55" : "text-body/55",
            )}
          >
            — the Tabby principle
          </span>
        </div>
      </div>
    </section>
  );
}

/**
 * Hand-drawn strikethrough rendered as an overlay inside the active word's
 * motion span. Sized via `preserveAspectRatio="none"` to whatever width the
 * visible glyph stretches the parent to — no JS measurement needed.
 *
 * The Strike is mounted fresh every word change (because WordFlip's
 * AnimatePresence remounts the motion.span per word), so the path's
 * `initial → animate` transition runs naturally on each mount. No inner
 * AnimatePresence needed — exit is handled by the parent motion.span's
 * fade, which carries the Strike out with it.
 *
 * Reduced-motion: static stroke, no draw animation.
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
        className="pointer-events-none absolute inset-x-[-3%] top-[55%] -translate-y-1/2 h-[0.42em] w-[106%]"
        fill="none"
      >
        <path
          d="M 1 5 Q 25 2, 50 5 T 99 5"
          stroke={stroke}
          strokeWidth="2.4"
          strokeLinecap="round"
          opacity={targetOpacity}
        />
      </svg>
    );
  }

  // The strike is delayed so it lands AFTER the new word has fully faded
  // in. During that pre-draw window the path itself must be hidden — at
  // pathLength: 0 a `strokeLinecap="round"` cap still renders as a visible
  // dot at the path's start, which looks like a typo. We gate the path's
  // opacity on the same delay so the stroke only becomes visible at the
  // exact moment it begins drawing.
  //
  // WordFlip exit (0.22s) + enter (0.34s opacity) = ~0.56s before the new
  // word is fully visible. Strike delay matches.
  const drawDelay = 0.56;
  const drawDuration = 0.5;

  return (
    <motion.svg
      key={idx}
      aria-hidden
      viewBox="0 0 100 10"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-[-3%] top-[55%] -translate-y-1/2 h-[0.42em] w-[106%]"
      fill="none"
    >
      <motion.path
        d="M 1 5 Q 25 2.5, 50 5 T 99 4.5"
        stroke={stroke}
        strokeWidth="2.4"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: targetOpacity }}
        transition={{
          pathLength: {
            delay: drawDelay,
            duration: drawDuration,
            ease: [0.65, 0, 0.35, 1],
          },
          // Snap opacity on at the exact moment the draw starts so the
          // round-cap dot doesn't appear during the pre-draw delay.
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
