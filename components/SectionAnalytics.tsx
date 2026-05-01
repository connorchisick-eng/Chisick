"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";

const SECTIONS = [
  { selector: "#how-it-works", name: "how_it_works" },
  { selector: "#features", name: "showcase" },
  { selector: "#faq", name: "faq" },
  { selector: "[data-analytics-section='final_cta']", name: "final_cta" },
] as const;

export function SectionAnalytics() {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;

    const seen = new Set<string>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const name = (entry.target as HTMLElement).dataset.analyticsName;
          if (!entry.isIntersecting || !name || seen.has(name)) return;
          seen.add(name);
          track("section_viewed", { section_name: name });
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.35 },
    );

    SECTIONS.forEach(({ selector, name }) => {
      const el = document.querySelector<HTMLElement>(selector);
      if (!el) return;
      el.dataset.analyticsName = name;
      observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  return null;
}
