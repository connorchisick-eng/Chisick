"use client";
import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ClawReveal } from "@/components/ClawReveal";
import { Phone } from "@/components/Phone";
import { Arrow } from "@/components/icons";
import { Magnetic } from "@/components/Magnetic";
import { PHONE_VARIANTS, PREMIUM_VARIANTS } from "@/lib/images";
import { track } from "@/lib/analytics";

const START_PHONE = 9;
// The carousel renders three back-to-back copies of PHONE_VARIANTS so we
// can always navigate in either direction without hitting an edge. The
// active index lives in the *middle* copy; once it drifts into the
// leading or trailing copy we silently teleport it back after the visible
// transition settles. From the user's perspective the track is infinite.
const COPIES = 3;

export function Hero() {
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const viewportRef = useRef<HTMLDivElement>(null); // outer overflow-hidden box
  const trackRef = useRef<HTMLDivElement>(null);    // inner flex track
  const phonesRef = useRef<(HTMLDivElement | null)[]>([]);

  const n = PHONE_VARIANTS.length;
  const rendered = useMemo(
    () => Array.from({ length: COPIES }, () => PHONE_VARIANTS).flat(),
    [],
  );

  const [activeIdx, setActiveIdx] = useState(n + START_PHONE); // middle copy
  const [offset, setOffset] = useState(0);
  const [paused, setPaused] = useState(false);
  // When true, the track transitions smoothly. Flipped off for one frame
  // during the seamless-loop teleport so the snap isn't visible.
  const [animate, setAnimate] = useState(true);

  const baseIdx = ((activeIdx % n) + n) % n;

  /**
   * Single choke-point for advancing the carousel. Every user-triggered
   * path (prev/next/drag/wheel/dot/tap/auto) routes through here so we
   * get a single `hero_carousel_advanced` event stream with a uniform
   * `via` property and accurate from/to indices.
   */
  const advance = (delta: number, via: string) => {
    setActiveIdx((prev) => {
      const next = prev + delta;
      track("hero_carousel_advanced", {
        via,
        from_idx: prev,
        to_idx: next,
        base_to_idx: ((next % n) + n) % n,
        direction: delta > 0 ? "forward" : delta < 0 ? "backward" : "none",
      });
      return next;
    });
  };

  const goToVariant = (variantIdx: number, via: string) => {
    setActiveIdx((prev) => {
      const next = n + variantIdx;
      track("hero_carousel_advanced", {
        via,
        from_idx: prev,
        to_idx: next,
        base_to_idx: variantIdx,
        direction: next > prev ? "forward" : next < prev ? "backward" : "none",
      });
      return next;
    });
  };

  // Hero entrance fade-ins — wait for the claw swipes to finish drawing so
  // the CTA doesn't clash with the headline animation.
  useEffect(() => {
    const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
    if (subRef.current)
      tl.fromTo(subRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 1.3);
    if (ctaRef.current)
      tl.fromTo(ctaRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9 }, 1.6);
  }, []);

  // Compute the translateX needed to center phone `idx` inside the viewport
  const computeOffset = (idx: number) => {
    const viewport = viewportRef.current;
    const phone = phonesRef.current[idx];
    if (!viewport || !phone) return 0;
    const viewportCenter = viewport.clientWidth / 2;
    const phoneCenter = phone.offsetLeft + phone.offsetWidth / 2;
    return Math.round(viewportCenter - phoneCenter);
  };

  // Re-center when activeIdx changes or on resize
  useLayoutEffect(() => {
    setOffset(computeOffset(activeIdx));
  }, [activeIdx]);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const onResize = () => setOffset(computeOffset(activeIdx));
    const ro = new ResizeObserver(onResize);
    ro.observe(viewport);
    return () => ro.disconnect();
  }, [activeIdx]);

  // Seamless-loop teleport: once activeIdx drifts outside the middle
  // copy, wait for the visible transition to finish, then silently shift
  // activeIdx by ±n so the user never reaches an edge. `animate` is
  // disabled for the teleport frame so the jump isn't animated.
  useEffect(() => {
    if (activeIdx >= n && activeIdx < 2 * n) return;
    const shift = activeIdx < n ? n : -n;
    const timer = setTimeout(() => {
      // The silent teleport itself: not a user-visible advance, but a
      // useful signal for "are users actually circling the loop?"
      track("hero_carousel_wrapped", {
        from_idx: activeIdx,
        shift,
        base_idx: ((activeIdx % n) + n) % n,
      });
      setAnimate(false);
      setActiveIdx((i) => i + shift);
      // Next two rAFs: one to let React commit the non-animated position,
      // the second to re-enable animation for the user's next interaction.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimate(true));
      });
    }, 720);
    return () => clearTimeout(timer);
  }, [activeIdx, n]);

  // Auto-advance every 3.5s, pause on hover/drag/interaction
  useEffect(() => {
    if (paused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      advance(1, "auto");
    }, 3500);
    return () => clearInterval(id);
  }, [paused]);

  // Drag-to-swipe: click + drag more than 40px → advance or rewind
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    let isDown = false;
    let startX = 0;
    let draggedDistance = 0;

    const onDown = (e: PointerEvent) => {
      isDown = true;
      startX = e.clientX;
      draggedDistance = 0;
      viewport.setPointerCapture?.(e.pointerId);
      viewport.style.cursor = "grabbing";
      setPaused(true);
    };
    const onMove = (e: PointerEvent) => {
      if (!isDown) return;
      draggedDistance = e.clientX - startX;
      // Live visual feedback during drag — offset adds the drag distance
      setOffset(computeOffset(activeIdx) + draggedDistance);
    };
    const onUp = (e: PointerEvent) => {
      if (!isDown) return;
      isDown = false;
      viewport.releasePointerCapture?.(e.pointerId);
      viewport.style.cursor = "";
      const THRESHOLD = 40;
      if (Math.abs(draggedDistance) > THRESHOLD) {
        advance(draggedDistance < 0 ? 1 : -1, "drag");
      } else {
        // Snap back
        setOffset(computeOffset(activeIdx));
      }
    };
    viewport.addEventListener("pointerdown", onDown);
    viewport.addEventListener("pointermove", onMove);
    viewport.addEventListener("pointerup", onUp);
    viewport.addEventListener("pointercancel", onUp);
    viewport.addEventListener("pointerleave", onUp);
    return () => {
      viewport.removeEventListener("pointerdown", onDown);
      viewport.removeEventListener("pointermove", onMove);
      viewport.removeEventListener("pointerup", onUp);
      viewport.removeEventListener("pointercancel", onUp);
      viewport.removeEventListener("pointerleave", onUp);
    };
  }, [activeIdx]);

  // Wheel → change active phone (accumulate deltas to avoid hair-trigger)
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    let acc = 0;
    let cooldown = false;
    const onWheel = (e: WheelEvent) => {
      const d = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (d === 0) return;
      e.preventDefault();
      if (cooldown) return;
      acc += d;
      if (Math.abs(acc) > 45) {
        advance(acc > 0 ? 1 : -1, "wheel");
        acc = 0;
        cooldown = true;
        setPaused(true);
        setTimeout(() => {
          cooldown = false;
        }, 400);
      }
    };
    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, []);

  const prev = () => {
    setPaused(true);
    advance(-1, "prev");
  };
  const next = () => {
    setPaused(true);
    advance(1, "next");
  };
  // Dot click: jump to the equivalent position in the middle copy so the
  // teleport never triggers from a direct selection.
  const jumpTo = (variantIdx: number) => {
    setPaused(true);
    goToVariant(variantIdx, "dot");
  };

  return (
    <section
      data-section="hero"
      className="relative bg-canvas pt-24 lg:pt-28 pb-16 lg:pb-24 overflow-hidden"
      aria-label="Hero"
    >
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10 relative">
        <h1 className="mt-2 lg:mt-4">
          <ClawReveal />
        </h1>

        <div className="mt-8 lg:mt-10 flex flex-col items-center text-center gap-7">
          <p ref={subRef} className="text-lg md:text-xl text-fg/60 max-w-md leading-[1.55]">
            Scan the receipt. Claim your items. Settle before you leave.
          </p>

          <div ref={ctaRef} className="flex flex-col items-center w-full sm:w-auto max-w-[340px] sm:max-w-none">
            <Magnetic strength={0.3} className="w-full sm:w-auto">
              <Link
                href="/waitlist"
                onClick={() =>
                  track("cta_join_waitlist_clicked", { surface: "hero" })
                }
                className="btn-primary justify-center whitespace-nowrap w-full sm:w-[18rem] text-[1.05rem]! py-[1.2rem]! px-[2.1rem]!"
              >
                Join the Waitlist
                <Arrow className="arrow" />
              </Link>
            </Magnetic>
          </div>
        </div>
      </div>

      {/* Phone carousel — infinite loop via tripled track + silent teleport */}
      <div className="mt-14 lg:mt-20 relative">
        {/* Prev / Next chevrons — no longer disabled at boundaries */}
        <button
          onClick={prev}
          aria-label="Previous screen"
          className="hidden md:flex absolute left-4 lg:left-10 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-fg text-canvas items-center justify-center shadow-lg hover:scale-110 hover:bg-accent hover:text-white transition-all duration-300"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M9.5 2 L4 7 L9.5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={next}
          aria-label="Next screen"
          className="hidden md:flex absolute right-4 lg:right-10 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-fg text-canvas items-center justify-center shadow-lg hover:scale-110 hover:bg-accent hover:text-white transition-all duration-300"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M4.5 2 L10 7 L4.5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Viewport — overflow hidden, pointer events captured here for drag */}
        <div
          ref={viewportRef}
          className="overflow-hidden cursor-grab select-none touch-pan-y"
          style={{ touchAction: "pan-y" }}
          onMouseEnter={() => {
            setPaused(true);
            track("hero_carousel_paused", { reason: "hover" });
          }}
          onMouseLeave={() => {
            setPaused(false);
            track("hero_carousel_resumed", { reason: "hover" });
          }}
        >
          <div
            ref={trackRef}
            className="flex items-start gap-5 lg:gap-6 py-4"
            style={{
              transform: `translate3d(${offset}px, 0, 0)`,
              transition: animate
                ? "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)"
                : "none",
              willChange: "transform",
            }}
          >
            {rendered.map((variant, i) => {
              const isActive = i === activeIdx;
              const isPremium = PREMIUM_VARIANTS.has(variant);
              return (
                <div
                  key={i}
                  ref={(el) => {
                    phonesRef.current[i] = el;
                  }}
                  onClick={() => {
                    setPaused(true);
                    setActiveIdx((prev) => {
                      track("hero_carousel_advanced", {
                        via: "tap",
                        from_idx: prev,
                        to_idx: i,
                        base_to_idx: ((i % n) + n) % n,
                        direction:
                          i > prev ? "forward" : i < prev ? "backward" : "none",
                      });
                      return i;
                    });
                  }}
                  className="relative shrink-0 cursor-pointer"
                  style={{
                    width: "clamp(175px, 15vw, 215px)",
                    opacity: isActive ? 1 : 0.4,
                    transition: "opacity 0.5s ease",
                  }}
                  aria-hidden={!isActive}
                >
                  {isPremium && (
                    <span
                      aria-hidden
                      className="absolute -inset-[6px] rounded-[2.1rem] pointer-events-none z-0"
                      style={{
                        border: "1.5px dashed rgba(255,124,97,0.55)",
                        boxShadow:
                          "0 0 0 3px rgba(255,124,97,0.07), 0 10px 32px -12px rgba(255,124,97,0.35)",
                      }}
                    />
                  )}
                  <Phone variant={variant} tilt={isActive} />
                  {isPremium && (
                    <span className="absolute -top-2 -right-2 z-10 bg-accent text-white text-[0.58rem] uppercase tracking-[0.24em] font-bold px-2 py-[5px] rounded-full shadow-[0_4px_10px_rgba(255,124,97,0.35)] select-none">
                      Pro
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mx-auto max-w-[1440px] px-6 lg:px-10 mt-10 flex flex-col md:flex-row items-center md:justify-between gap-4 md:gap-6 text-[0.72rem] uppercase tracking-[0.28em] text-fg/40 font-semibold">
          <span className="hidden md:inline order-1">Drag, wheel, or click ←→</span>
          <div
            className="flex items-center gap-2 flex-wrap justify-center max-w-full order-2"
            role="tablist"
            aria-label="Screens"
          >
            {PHONE_VARIANTS.map((_, i) => (
              <button
                key={i}
                onClick={() => jumpTo(i)}
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: i === baseIdx ? 28 : 6,
                  background: i === baseIdx ? "rgb(255,124,97)" : "var(--line-strong)",
                }}
                aria-label={`Jump to screen ${i + 1}`}
                aria-selected={i === baseIdx}
                role="tab"
              />
            ))}
          </div>
          <span className="order-3">
            {(baseIdx + 1).toString().padStart(2, "0")} /{" "}
            {n.toString().padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}
