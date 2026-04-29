"use client";
import { useEffect, useState } from "react";
import posthog from "posthog-js";
import { Swiper } from "./Swiper";
import { StickyStack } from "./StickyStack";

type Variant = "swipe" | "sticky";
const STORAGE_KEY = "tabby:hiw-variant";
const QUERY_KEY = "hiw";
const FLAG_KEY = "how_it_works_variant";

// Hard production guard. The sticky variant is ONLY ever rendered when
// `NEXT_PUBLIC_DEV_MODE=true` is set in the build env, OR when running
// `next dev` locally. Otherwise the resolver short-circuits and serves the
// existing Swiper for everyone, regardless of query param / localStorage /
// PostHog flag. This keeps the experiment from leaking into production
// before we're ready to ship it.
const STICKY_ENABLED =
  process.env.NEXT_PUBLIC_DEV_MODE === "true" ||
  process.env.NODE_ENV === "development";

function isVariant(v: unknown): v is Variant {
  return v === "swipe" || v === "sticky";
}

function readQueryOrStorage(): Variant | null {
  if (typeof window === "undefined") return null;
  const url = new URL(window.location.href);
  const q = url.searchParams.get(QUERY_KEY);
  if (isVariant(q)) {
    try {
      window.localStorage.setItem(STORAGE_KEY, q);
    } catch {}
    return q;
  }
  try {
    const ls = window.localStorage.getItem(STORAGE_KEY);
    if (isVariant(ls)) return ls;
  } catch {}
  return null;
}

/**
 * A/B chooser between the original Marvis-style horizontal Swiper (control)
 * and the new sticky-stack vertical layout (variant). Resolution priority:
 *
 *   1. ?hiw=swipe|sticky query param  (also pinned to localStorage)
 *   2. localStorage["tabby:hiw-variant"]
 *   3. PostHog feature flag "how_it_works_variant"
 *   4. Default: "swipe"
 *
 * SSR always renders the control (Swiper) so there's no hydration drift; on
 * mount the client may swap to "sticky" without triggering a layout flash
 * (different sections, same vertical position).
 *
 * In development a small floating toggle appears bottom-left so you can
 * switch variants without reloading.
 */
export function HowItWorks() {
  // Production short-circuit: render the Swiper directly with no resolver,
  // no placeholder flash, no DevToggle. The compiler dead-strips this entire
  // branch when STICKY_ENABLED is false at build time.
  if (!STICKY_ENABLED) {
    return <Swiper />;
  }

  return <HowItWorksResolver />;
}

function HowItWorksResolver() {
  // Variant stays null until the client-side resolver finishes. SSR and the
  // first client render both produce the same placeholder, so there's no
  // hydration mismatch — and we never mount/unmount the Swiper just to swap
  // it for the StickyStack (GSAP's pinning makes that unsafe in React 19).
  const [variant, setVariant] = useState<Variant | null>(null);

  useEffect(() => {
    const override = readQueryOrStorage();
    if (override) {
      setVariant(override);
      return;
    }

    if (typeof window !== "undefined" && posthog?.onFeatureFlags) {
      let done = false;
      posthog.onFeatureFlags(() => {
        if (done) return;
        done = true;
        const flag = posthog.getFeatureFlag(FLAG_KEY);
        setVariant(isVariant(flag) ? flag : "swipe");
      });
      const timeout = setTimeout(() => {
        if (done) return;
        done = true;
        setVariant("swipe");
      }, 1500);
      return () => clearTimeout(timeout);
    }
    setVariant("swipe");
  }, []);

  useEffect(() => {
    if (!variant) return;
    try {
      posthog?.capture?.("how_it_works_variant_shown", { variant });
    } catch {}
  }, [variant]);

  // Switching variants in-place is risky: the Swiper pins via GSAP
  // ScrollTrigger which wraps its <section> in a pin-spacer, and React 19
  // throws NotFoundError when it tries to unmount a node GSAP has moved.
  // A full reload after persisting is the safest path.
  const setAndReload = (v: Variant) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, v);
    } catch {}
    window.location.reload();
  };

  return (
    <>
      {variant === null ? (
        <section
          aria-hidden
          id="how-it-works"
          data-nav-invert
          className="relative bg-ink min-h-[100svh]"
        />
      ) : variant === "sticky" ? (
        <StickyStack />
      ) : (
        <Swiper />
      )}
      {process.env.NODE_ENV === "development" && (
        <DevToggle current={variant ?? "swipe"} onChange={setAndReload} />
      )}
    </>
  );
}

function DevToggle({
  current,
  onChange,
}: {
  current: Variant;
  onChange: (v: Variant) => void;
}) {
  const [collapsed, setCollapsed] = useState(true);

  return (
    <div
      className="fixed left-3 z-[70] font-mono text-[10px]"
      style={{ bottom: "max(0.75rem, env(safe-area-inset-bottom, 0px))" }}
    >
      {collapsed ? (
        <button
          onClick={() => setCollapsed(false)}
          className="flex items-center gap-2 px-2.5 py-1.5 rounded-full bg-ink/85 text-cream border border-cream/15 backdrop-blur-md shadow-lg hover:bg-ink"
          title="A/B variant toggle (dev only)"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
          A/B · {current}
        </button>
      ) : (
        <div className="flex items-center gap-1 px-1.5 py-1 rounded-full bg-ink/90 text-cream border border-cream/15 backdrop-blur-md shadow-lg">
          <span className="px-2 text-cream/55 uppercase tracking-[0.18em]">
            A/B
          </span>
          <button
            onClick={() => onChange("swipe")}
            className={`px-2.5 py-1 rounded-full transition ${
              current === "swipe"
                ? "bg-accent text-ink font-semibold"
                : "text-cream/70 hover:text-cream"
            }`}
          >
            swipe
          </button>
          <button
            onClick={() => onChange("sticky")}
            className={`px-2.5 py-1 rounded-full transition ${
              current === "sticky"
                ? "bg-accent text-ink font-semibold"
                : "text-cream/70 hover:text-cream"
            }`}
          >
            sticky
          </button>
          <button
            onClick={() => {
              try {
                window.localStorage.removeItem(STORAGE_KEY);
              } catch {}
              window.location.reload();
            }}
            className="px-2 text-cream/45 hover:text-cream"
            title="Clear override and reload"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
