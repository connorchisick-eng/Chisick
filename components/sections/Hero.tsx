"use client";
import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { AnimatePresence, motion } from "framer-motion";
import { ClawReveal } from "@/components/ClawReveal";
import { Phone } from "@/components/Phone";
import { Arrow } from "@/components/icons";
import { Magnetic } from "@/components/Magnetic";
import { PHONE_VARIANTS, PREMIUM_VARIANTS } from "@/lib/images";
import type { ScreenVariant } from "@/components/Screen";
import { Screen } from "@/components/Screen";

const CODED_VARIANTS = new Set<ScreenVariant>();

const START_PHONE = 8;

export function Hero() {
  const subRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  const viewportRef = useRef<HTMLDivElement>(null); // outer overflow-hidden box
  const trackRef = useRef<HTMLDivElement>(null);    // inner flex track
  const phonesRef = useRef<(HTMLDivElement | null)[]>([]);
  const [activeIdx, setActiveIdx] = useState(START_PHONE);
  const [offset, setOffset] = useState(0);
  const [lightbox, setLightbox] = useState<ScreenVariant | null>(null);

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

  // Drag-to-swipe: click + drag more than 40px → advance or rewind.
  // A short tap (<40px) is treated as a click — expand the active phone,
  // or center the tapped one. Click detection lives here because the
  // viewport uses setPointerCapture, which would otherwise swallow the
  // native click events on the inner phone elements.
  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    let isDown = false;
    let startX = 0;
    let draggedDistance = 0;
    let downTarget: HTMLElement | null = null;

    const onDown = (e: PointerEvent) => {
      isDown = true;
      startX = e.clientX;
      draggedDistance = 0;
      // Record the real target before setPointerCapture redirects events.
      downTarget = e.target as HTMLElement;
      viewport.setPointerCapture?.(e.pointerId);
      viewport.style.cursor = "grabbing";
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
        return;
      }
      // Snap back from any tiny drag
      setOffset(computeOffset(activeIdx));
      // Tap → expand or center. Use the target captured on pointerdown
      // (setPointerCapture rewrites e.target on the way up).
      const phoneEl = downTarget?.closest(
        "[data-phone-idx]",
      ) as HTMLElement | null;
      downTarget = null;
      if (!phoneEl) return;
      const idx = Number(phoneEl.dataset.phoneIdx);
      if (Number.isNaN(idx)) return;
      if (idx === activeIdx) {
        setLightbox(PHONE_VARIANTS[idx]);
      } else {
        goTo(idx);
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
        setTimeout(() => {
          cooldown = false;
        }, 400);
      }
    };
    viewport.addEventListener("wheel", onWheel, { passive: false });
    return () => viewport.removeEventListener("wheel", onWheel);
  }, []);

  const goTo = (i: number) => {
    setActiveIdx(Math.max(0, Math.min(PHONE_VARIANTS.length - 1, i)));
  };
  const prev = () => goTo(activeIdx - 1);
  const next = () => goTo(activeIdx + 1);

  // Lightbox: lock scroll and wire Escape-to-close while open
  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightbox]);

  return (
    <section className="relative bg-surface pt-24 lg:pt-28 pb-16 lg:pb-24 overflow-hidden">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-10 relative">
        <h1 className="mt-2 lg:mt-4">
          <ClawReveal />
        </h1>

        <div className="mt-8 lg:mt-10 flex flex-col items-center text-center gap-7">
          <p ref={subRef} className="text-lg md:text-xl text-body/70 max-w-md leading-[1.5]">
            Split the check and pay it in one app. No chasing payments after
            the meal.
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
          className="hidden md:flex absolute left-4 lg:left-10 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-body text-surface items-center justify-center shadow-lg hover:scale-110 hover:bg-accent hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-body disabled:hover:scale-100"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M9.5 2 L4 7 L9.5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <button
          onClick={next}
          disabled={activeIdx === PHONE_VARIANTS.length - 1}
          aria-label="Next screen"
          className="hidden md:flex absolute right-4 lg:right-10 top-1/2 -translate-y-1/2 z-20 w-12 h-12 rounded-full bg-body text-surface items-center justify-center shadow-lg hover:scale-110 hover:bg-accent hover:text-white transition-all duration-300 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-body disabled:hover:scale-100"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
            <path d="M4.5 2 L10 7 L4.5 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {/* Viewport — only horizontal overflow is clipped so the phone's
            hover-lift can escape vertically without being cropped. */}
        <div
          ref={viewportRef}
          className="overflow-x-hidden cursor-grab select-none touch-pan-y"
          style={{ touchAction: "pan-y", overflowY: "visible" }}
        >
          <div
            ref={trackRef}
            className="flex items-start gap-5 lg:gap-6 py-6 md:py-8"
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
                  data-phone-idx={i}
                  aria-label={isActive ? `Expand ${variant} screen` : `Show ${variant} screen`}
                  className="relative flex-shrink-0"
                  style={{
                    width: "clamp(175px, 15vw, 215px)",
                    opacity: isActive ? 1 : 0.4,
                    transition: "opacity 0.5s ease",
                    cursor: isActive ? "zoom-in" : "pointer",
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
                  <Phone variant={variant} />
                  {isPremium && (
                    <span className="absolute -top-2 -right-2 z-10 bg-accent text-white text-[0.58rem] uppercase tracking-[0.22em] font-bold px-2.5 py-[5px] rounded-full shadow-[0_4px_10px_rgba(255,124,97,0.35)] select-none whitespace-nowrap">
                      Pro · Coming later
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mx-auto max-w-[1440px] px-6 lg:px-10 mt-10 flex flex-col md:flex-row items-center md:justify-between gap-4 md:gap-6 text-[0.72rem] uppercase tracking-[0.28em] text-body/40 font-semibold">
          <span className="hidden md:inline order-1">Drag, wheel, click · tap to zoom</span>
          <div className="flex items-center gap-2 flex-wrap justify-center max-w-full order-2">
            {PHONE_VARIANTS.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="h-1.5 rounded-full transition-all duration-500"
                style={{
                  width: i === activeIdx ? 28 : 6,
                  background: i === activeIdx ? "rgb(255,124,97)" : "rgb(var(--line) / 0.2)",
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

      <AnimatePresence>
        {lightbox && (
          <motion.div
            key="phone-lightbox"
            role="dialog"
            aria-modal="true"
            aria-label={`${lightbox} screen, expanded`}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            onClick={() => setLightbox(null)}
            style={{
              backgroundColor: "rgba(14,14,14,0.82)",
              backdropFilter: "blur(10px)",
              WebkitBackdropFilter: "blur(10px)",
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 12 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.92, opacity: 0, y: 8 }}
              transition={{ type: "spring", stiffness: 240, damping: 26 }}
              className="relative"
              onClick={(e) => e.stopPropagation()}
            >
              {CODED_VARIANTS.has(lightbox) ? (
                <div
                  className="bg-white rounded-[2rem] shadow-[0_60px_120px_-40px_rgba(14,14,14,0.75)] overflow-hidden"
                  style={{
                    width: "min(86vw, calc(86vh * 9 / 19.5))",
                    aspectRatio: "9 / 19.5",
                  }}
                >
                  <Screen variant={lightbox} />
                </div>
              ) : (
                <img
                  src={`/screens/${lightbox}.png`}
                  alt={`Tabby ${lightbox} screen`}
                  draggable={false}
                  className="block max-h-[86vh] max-w-[86vw] w-auto h-auto rounded-[2rem] shadow-[0_60px_120px_-40px_rgba(14,14,14,0.75)] select-none"
                />
              )}
              <button
                type="button"
                onClick={() => setLightbox(null)}
                aria-label="Close"
                className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-white text-ink flex items-center justify-center shadow-[0_10px_24px_-8px_rgba(14,14,14,0.5)] hover:scale-110 transition-transform"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
                  <path d="M2 2 L12 12 M12 2 L2 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
