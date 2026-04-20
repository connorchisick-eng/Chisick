"use client";
import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { track } from "@/lib/analytics";

/**
 * Two signals in one helper:
 *  - `section_viewed`: once per page-view, when a named section
 *    crosses 40% of the viewport (IntersectionObserver).
 *  - `scroll_depth_reached`: global scroll-depth marks at 25/50/75/100%,
 *    each fired at most once per page-view.
 *
 * Scroll-depth is only activated when the component mounts the first
 * time (it latches via a module-level `Set`), so dropping multiple
 * `<SectionTracker />` instances on one page doesn't multiply events.
 */

type Props = {
  /** Machine-readable section identifier, e.g. "hero", "pricing". */
  name: string;
  /** Element to observe. If omitted, the tracker does nothing — the
   *  consumer is expected to pass the section root once it mounts. */
  target?: HTMLElement | null;
};

const seenSections = new Set<string>();
let scrollDepthActivated = false;
const seenDepths = new Set<number>();

function activateScrollDepth() {
  if (scrollDepthActivated) return;
  if (typeof window === "undefined") return;
  scrollDepthActivated = true;

  let ticking = false;
  const thresholds = [25, 50, 75, 100];
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      ticking = false;
      const doc = document.documentElement;
      const max = Math.max(1, doc.scrollHeight - window.innerHeight);
      const pct = Math.min(100, Math.round((window.scrollY / max) * 100));
      for (const t of thresholds) {
        if (pct >= t && !seenDepths.has(t)) {
          seenDepths.add(t);
          track("scroll_depth_reached", { depth: t });
        }
      }
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

export function SectionTracker({ name, target }: Props) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;
    activateScrollDepth();

    if (!target) return;
    if (seenSections.has(name)) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.4) {
            if (seenSections.has(name)) return;
            seenSections.add(name);
            track("section_viewed", { section: name });
            io.disconnect();
            return;
          }
        }
      },
      { threshold: [0.4] },
    );
    io.observe(target);
    return () => io.disconnect();
  }, [name, target]);

  return null;
}

/**
 * Convenience wrapper — drops a `<section>` and watches its own root.
 * The ref state pump is so the `SectionTracker` re-runs once the DOM
 * node exists on mount.
 */
export function TrackedSection({
  name,
  children,
  ...rest
}: React.HTMLAttributes<HTMLElement> & { name: string }) {
  const ref = useRef<HTMLElement | null>(null);
  const [el, setEl] = useState<HTMLElement | null>(null);
  return (
    <>
      <section
        {...rest}
        ref={(node) => {
          ref.current = node;
          setEl(node);
        }}
      >
        {children}
      </section>
      <SectionTracker name={name} target={el} />
    </>
  );
}
