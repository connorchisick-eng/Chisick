"use client";
import { useEffect } from "react";
import { track } from "@/lib/analytics";

/**
 * Single IntersectionObserver that fires `section_viewed` once per
 * `[data-section="..."]` element on the home page. Way cheaper than
 * threading refs through every section component, and dropping a new
 * section only requires adding the attribute. Latches per-name so
 * re-renders don't double-fire; re-initializes if the attribute list
 * changes (shouldn't on a marketing page, but safe).
 */
export function HomeSectionTracker() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return;

    const seen = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting || entry.intersectionRatio < 0.35) continue;
          const name = (entry.target as HTMLElement).dataset.section;
          if (!name || seen.has(name)) continue;
          seen.add(name);
          track("section_viewed", { section: name });
          io.unobserve(entry.target);
        }
      },
      { threshold: [0.35] },
    );
    const els = document.querySelectorAll<HTMLElement>("[data-section]");
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return null;
}
