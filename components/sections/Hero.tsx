"use client";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ClawReveal } from "@/components/ClawReveal";
import { Phone } from "@/components/Phone";
import { Arrow } from "@/components/icons";
import { Magnetic } from "@/components/Magnetic";
import { PHONE_VARIANTS, PREMIUM_VARIANTS } from "@/lib/images";

const START_PHONE = 9;

export function Hero() {
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const viewportRef = useRef<HTMLDivElement>(null); // outer overflow-hidden box
  const trackRef = useRef<HTMLDivElement>(null);    // inner flex track
  const phonesRef = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIdx, setActiveIdx] = useState(START_PHONE);
  const [offset, setOffset] = useState(0);
  const [paused, setPaused] = useState(false);

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

  // Auto-advance every 3.5s, pause on hover/drag/interaction
  useEffect(() => {
    if (paused) return;
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => {
      setActiveIdx((i) => (i + 1) % PHONE_VARIANTS.length);
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
        if (draggedDistance < 0) {
          setActiveIdx((i) => Math.min(i + 1, PHONE_VARIANTS.length - 1));
        } else {
          setActiveIdx((i) => Math.max(i - 1, 0));
        }
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
        if (acc > 0) setActiveIdx((i) => Math.min(i + 1, PHONE_VARIANTS.length - 1));
        else setActiveIdx((i) => Math.max(i - 1, 0));
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

  const goTo = (i: number) => {
    setPaused(true);
    setActiveIdx(Math.max(0, Math.min(PHONE_VARIANTS.length - 1, i)));
  };
  const prev = () => goTo(activeIdx - 1);
  const next = () => goTo(activeIdx + 1);

  return (
    <section className="relative bg-white pt-24 lg:pt-28 pb-16 lg:pb-24 overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10 relative">
        <h1 className="mt-2 lg:mt-4">
          <ClawReveal />
        </h1>

        <div className="mt-8 lg:mt-10 flex flex-col items-center text-center gap-7">
          <p ref={subRef} className="text-lg md:text-xl text-ink/60 max-w-md leading-[1.55]">
            Scan the receipt. Claim your items. Settle before you leave.
          </p>

          <div ref={ctaRef} className="flex items-stretch sm:items-center w-full sm:w-auto max-w-[340px] sm:max-w-none">
            <Magnetic strength={0.3} className="w-full sm:w-auto">
              <Link
                href="/waitlist"
                className="btn-primary justify-center whitespace-nowrap w-full sm:w-[18rem] !text-[1.05rem] !py-[1.2rem] !px-[2.1rem]"
              >
                Join the Waitlist
                <Arrow className="arrow" />
              </Link>
            </Magnetic>
          </div>
        </div>
      </div>

      {/* Phone carousel — deterministic transform-based */}
      <div className="mt-14 lg:mt-20 relative">
        {/* Prev / Next chevrons */}
        <button
          onClick={prev}
          disabled={activeIdx === 0}
          aria-label="Previous screen"
          className="hidden md:flex absolute left-4 lg:left-10 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-ink text-white items-center justify-center shadow-lg hover:scale-110 hover:bg-accent transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-ink disabled:hover:scale-100"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M9.5 2 L4 7 L9.5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={next}
          disabled={activeIdx === PHONE_VARIANTS.length - 1}
          aria-label="Next screen"
          className="hidden md:flex absolute right-4 lg:right-10 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-ink text-white items-center justify-center shadow-lg hover:scale-110 hover:bg-accent transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-ink disabled:hover:scale-100"
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
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div
            ref={trackRef}
            className="flex items-start gap-5 lg:gap-6 py-4"
            style={{
              transform: `translate3d(${offset}px, 0, 0)`,
              transition: "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)",
              willChange: "transform",
            }}
          >
            {PHONE_VARIANTS.map((variant, i) => {
              const isActive = i === activeIdx;
              const isPremium = PREMIUM_VARIANTS.has(variant);
              return (
                <div
                  key={i}
                  ref={(el) => {
                    phonesRef.current[i] = el;
                  }}
                  onClick={() => goTo(i)}
                  className="relative flex-shrink-0 cursor-pointer"
                  style={{
                    width: "clamp(175px, 15vw, 215px)",
                    opacity: isActive ? 1 : 0.4,
                    transition: "opacity 0.5s ease",
                  }}
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

        <div className="mx-auto max-w-[1440px] px-6 lg:px-10 mt-10 flex flex-col md:flex-row items-center md:justify-between gap-4 md:gap-6 text-[0.72rem] uppercase tracking-[0.28em] text-ink/40 font-semibold">
          <span className="hidden md:inline order-1">Drag, wheel, or click ←→</span>
          <div className="flex items-center gap-2 flex-wrap justify-center max-w-full order-2">
            {PHONE_VARIANTS.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: i === activeIdx ? 28 : 6,
                  background: i === activeIdx ? "rgb(255,124,97)" : "rgba(14,14,14,0.2)",
                }}
                aria-label={`Jump to screen ${i + 1}`}
              />
            ))}
          </div>
          <span className="order-3">
            {(activeIdx + 1).toString().padStart(2, "0")} /{" "}
            {PHONE_VARIANTS.length.toString().padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}
