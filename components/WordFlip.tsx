"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { clsx } from "clsx";

type Props = {
  words: string[];
  /** Externally-controlled index. If omitted, cycles on its own timer. */
  index?: number;
  interval?: number;
  className?: string;
};

const ENTER_EASE = [0.22, 1, 0.36, 1] as const;
const EXIT_EASE = [0.76, 0, 0.24, 1] as const;

/**
 * Cycles through `words` with a layout-aware swap. The wrapper auto-animates
 * its width when the new word is wider/narrower (motion's `layout` prop), and
 * the word itself rises in with a soft blur+fade and exits faster than it
 * enters — the asymmetry keeps the flip feeling responsive instead of slow.
 *
 * `popLayout` removes the exiting word from layout flow so it doesn't fight
 * the incoming word for width during the transition.
 */
export function WordFlip({
  words,
  index,
  interval = 1800,
  className,
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
    <motion.span
      layout
      transition={{ layout: { duration: 0.55, ease: ENTER_EASE } }}
      className={clsx(
        "relative inline-flex align-baseline whitespace-nowrap",
        className,
      )}
      style={{ paddingBottom: "0.04em" }}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={word}
          initial={{ y: "0.55em", opacity: 0, filter: "blur(6px)" }}
          animate={{ y: "0em", opacity: 1, filter: "blur(0px)" }}
          exit={{
            y: "-0.4em",
            opacity: 0,
            filter: "blur(4px)",
            transition: { duration: 0.34, ease: EXIT_EASE },
          }}
          transition={{
            y: { duration: 0.62, ease: ENTER_EASE },
            opacity: { duration: 0.46, ease: "easeOut" },
            filter: { duration: 0.5, ease: "easeOut" },
          }}
          className="inline-block will-change-transform"
        >
          {word}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}
