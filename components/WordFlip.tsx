"use client";
import { useEffect, useRef, useState, type ReactNode } from "react";
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
   * Element rendered as a child of the active word's span — sized to the
   * visible word, not to the locked cell.
   */
  renderOverlay?: () => ReactNode;
};

const TYPE_MS = 70;
const BACKSPACE_MS = 38;
const HOLD_MS = 220;

/**
 * Typewriter cycler — backspaces the current word, then types the next.
 *
 * Width is locked to the widest word (+ suffix) via an invisible ghost
 * stack so the surrounding sentence never reflows. The visible cell
 * shows the in-progress string with a blinking caret on the trailing edge.
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
  const target = words[active];

  // Typewriter state — `displayed` is what's rendered; `phase` drives the
  // backspace → type sequence. We start the first word fully typed so the
  // section reads cleanly on first paint.
  const [displayed, setDisplayed] = useState(target);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const firstRun = useRef(true);

  useEffect(() => {
    if (firstRun.current) {
      firstRun.current = false;
      setDisplayed(target);
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);

    let cancelled = false;
    const tick = (next: () => void, ms: number) => {
      timerRef.current = setTimeout(() => {
        if (!cancelled) next();
      }, ms);
    };

    const typeForward = (current: string) => {
      if (current === target) return;
      const nextStr = target.slice(0, current.length + 1);
      setDisplayed(nextStr);
      tick(() => typeForward(nextStr), TYPE_MS);
    };

    const backspace = (current: string) => {
      if (current.length === 0) {
        tick(() => typeForward(""), HOLD_MS);
        return;
      }
      const nextStr = current.slice(0, -1);
      setDisplayed(nextStr);
      tick(() => backspace(nextStr), BACKSPACE_MS);
    };

    backspace(displayed);

    return () => {
      cancelled = true;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return (
    <span
      className={clsx(
        "relative inline-grid align-baseline whitespace-nowrap",
        className,
      )}
      style={{ paddingBottom: "0.04em" }}
    >
      {/* Ghost stack — locks the cell width to the widest word + suffix so
          the surrounding sentence never reflows as letters appear/disappear. */}
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

      <span className="col-start-1 row-start-1 inline-flex items-baseline justify-start">
        <span className="relative inline-block">
          {displayed}
          <span
            aria-hidden
            className="wf-caret inline-block align-baseline"
            style={{
              width: "0.06em",
              height: "0.95em",
              marginLeft: "0.04em",
              transform: "translateY(0.12em)",
              backgroundColor: "currentColor",
              opacity: 0.85,
            }}
          />
          {renderOverlay?.()}
        </span>
        {suffix}
      </span>

      <style jsx>{`
        .wf-caret {
          animation: wf-blink 1s steps(1, end) infinite;
        }
        @keyframes wf-blink {
          0%,
          50% {
            opacity: 0.85;
          }
          50.01%,
          100% {
            opacity: 0;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .wf-caret {
            animation: none;
            opacity: 0.6;
          }
        }
      `}</style>
    </span>
  );
}
