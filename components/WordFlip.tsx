"use client";
import { useEffect, useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";

type Props = {
  words: string[];
  /** Externally-controlled index. If omitted, cycles on its own timer. */
  index?: number;
  interval?: number;
  className?: string;
  /**
   * Element rendered immediately after the active word, inside the locked
   * cell. Use for trailing punctuation that should hug the word (e.g. an
   * accent-colored period). Included in the ghost stack so its width is
   * counted toward the locked cell size.
   */
  suffix?: ReactNode;
  /**
   * Element rendered as a child of the active word's motion.span — sized
   * to the visible word, not to the locked cell. Use for word-relative
   * decorations like a strike-through that should match the actual glyph
   * width rather than the widest possible word.
   */
  renderOverlay?: () => ReactNode;
};

const ENTER_EASE = [0.22, 1, 0.36, 1] as const;
const EXIT_EASE = [0.55, 0, 0.45, 1] as const;

/**
 * Cycles through `words` with a width-locked, in-place crossfade.
 *
 * **Width is locked** to the widest word in the array (plus optional suffix)
 * — every word renders as an invisible ghost in the same CSS grid cell, so
 * the cell sizes to the widest one and never breathes left/right when the
 * active word changes. The surrounding sentence stays put.
 *
 * **Word is left-aligned** in the cell so it sits adjacent to the preceding
 * static text. Trailing whitespace appears at the cell's right edge — fine
 * when there's nothing after, and absorbed by `suffix` when there is.
 *
 * **Swap is sequential** — `mode="wait"` lets the old word finish its exit
 * before the new word enters, so they never overlap mid-transition.
 */
export function WordFlip({
  words,
  index,
  interval = 1800,
  className,
  suffix,
  renderOverlay,
}: Props) {
  const [auto, setAuto] = useState(0);
  useEffect(() => {
    if (index !== undefined) return;
    const t = setInterval(() => setAuto((i) => (i + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [index, interval, words.length]);

  const active = (index ?? auto) % words.length;
  const word = words[active];

  return (
    <span
      className={clsx(
        "relative inline-grid align-baseline whitespace-nowrap",
        className,
      )}
      style={{ paddingBottom: "0.04em" }}
    >
      {/* Ghost stack — every possible word + suffix rendered invisibly in
          the same grid cell. The cell sizes to the widest ghost, locking
          width across all states. `color: transparent` + `visibility: hidden`
          belt-and-suspenders so no glyph leaks through regardless of
          inherited italic/color styling. */}
      {words.map((w) => (
        <span
          key={`ghost-${w}`}
          aria-hidden
          className="col-start-1 row-start-1 pointer-events-none select-none"
          style={{ visibility: "hidden", color: "transparent" }}
        >
          {w}
          {suffix}
        </span>
      ))}

      {/* Visible cell — word + suffix left-aligned so the glyph sits flush
          against the preceding text; trailing whitespace fills the gap on
          the right. AnimatePresence in `wait` mode = only one word visible
          at any moment, so the in-place crossfade looks like a single word
          morphing rather than two stacking. */}
      <span className="col-start-1 row-start-1 inline-flex items-baseline justify-start">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={word}
            initial={{ opacity: 0, filter: "blur(6px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            exit={{
              opacity: 0,
              filter: "blur(4px)",
              transition: { duration: 0.22, ease: EXIT_EASE },
            }}
            transition={{
              opacity: { duration: 0.34, ease: ENTER_EASE },
              filter: { duration: 0.38, ease: "easeOut" },
            }}
            // Relative so any overlay rendered inside this span (e.g. a
            // strike-through SVG) is positioned against the visible glyph
            // rect, not the locked cell width.
            className="relative inline-block will-change-[opacity,filter]"
          >
            {word}
            {renderOverlay?.()}
          </motion.span>
        </AnimatePresence>
        {suffix}
      </span>
    </span>
  );
}
