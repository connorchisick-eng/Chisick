"use client";
import { useEffect, useState } from "react";
import { clsx } from "clsx";

type Props = {
  words: string[];
  /** Externally-controlled index. If omitted, cycles on its own timer. */
  index?: number;
  interval?: number;
  className?: string;
};

/**
 * Cycles through `words` with a crossfade transition. The ACTIVE word
 * occupies the normal document flow (sizing the slot to its own width and
 * height), so adjacent elements (like a trailing period) shift with the
 * current word. All other words sit on top of the active word absolutely
 * positioned, faded out. No overflow clipping — descenders always visible.
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

  return (
    <span className={clsx("relative inline-block align-baseline", className)}>
      {words.map((w, i) => {
        const isActive = i === active;
        return (
          <span
            key={i}
            aria-hidden={!isActive}
            className="whitespace-nowrap"
            style={{
              // Active word: normal flow (sizes the container).
              // Others: absolute so they overlay without affecting layout.
              position: isActive ? "relative" : "absolute",
              left: 0,
              top: 0,
              opacity: isActive ? 1 : 0,
              transition: "opacity 0.45s cubic-bezier(0.22, 1, 0.36, 1)",
              pointerEvents: isActive ? "auto" : "none",
            }}
          >
            {w}
          </span>
        );
      })}
    </span>
  );
}
