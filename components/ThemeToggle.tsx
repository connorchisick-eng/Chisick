"use client";
import { useEffect, useState } from "react";
import { track } from "@/lib/analytics";

type Theme = "light" | "dark";

function readTheme(): Theme {
  if (typeof document === "undefined") return "light";
  return (document.documentElement.getAttribute("data-theme") as Theme) || "light";
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("light");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setTheme(readTheme());
    setMounted(true);
  }, []);

  const flip = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const apply = () => {
      document.documentElement.setAttribute("data-theme", next);
      try {
        localStorage.setItem("tabby-theme", next);
      } catch {}
      setTheme(next);
    };
    // Use the View Transitions API where available for a cross-fade
    // between themes; otherwise apply instantly.
    const d = document as Document & {
      startViewTransition?: (cb: () => void) => { finished: Promise<void> };
    };
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const viaVt = Boolean(d.startViewTransition) && !reduced;
    track("theme_toggled", {
      from: theme,
      to: next,
      via_view_transition: viaVt,
    });
    if (viaVt) d.startViewTransition!(apply);
    else apply();
  };

  return (
    <button
      type="button"
      onClick={flip}
      className="theme-toggle"
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      aria-pressed={theme === "dark"}
      title={mounted ? `Theme: ${theme}` : undefined}
    >
      <span className="sun" aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.2 5.2l1.55 1.55M17.25 17.25l1.55 1.55M5.2 18.8l1.55-1.55M17.25 6.75l1.55-1.55" />
        </svg>
      </span>
      <span className="moon" aria-hidden>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 14.5A8 8 0 0 1 9.5 4a.6.6 0 0 0-.85-.6A9 9 0 1 0 20.6 15.35.6.6 0 0 0 20 14.5Z" />
        </svg>
      </span>
    </button>
  );
}
