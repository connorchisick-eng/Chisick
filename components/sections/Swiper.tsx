"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Arrow } from "@/components/icons";
import { Phone } from "@/components/Phone";
import type { ScreenVariant } from "@/components/Screen";

type Slide = {
  num: string;
  eyebrow: string;
  headline: [string, string];
  caption: string;
  bg: string;
  text: string;
  accent: string;
  variant?: ScreenVariant;
  align: "left" | "right";
};

/**
 * Marvis-style horizontal scroll-swipe. Vertical scroll drives horizontal
 * track translation while section is pinned. Each slide is a bold brand-color
 * panel with editorial type — no stock photos.
 */
const INK = "rgb(14, 14, 14)";
const CREAM = "rgb(248, 244, 240)";
const ACCENT = "rgb(255, 124, 97)";

const SLIDES: Slide[] = [
  {
    num: "01",
    eyebrow: "Scan",
    headline: ["Two seconds,", "whole receipt."],
    caption: "",
    bg: INK,
    text: CREAM,
    accent: ACCENT,
    variant: "scan" as ScreenVariant,
    align: "left",
  },
  {
    num: "02",
    eyebrow: "Claim",
    headline: ["Tap what", "you had."],
    caption: "",
    bg: ACCENT,
    text: INK,
    accent: INK,
    variant: "claim" as ScreenVariant,
    align: "right",
  },
  {
    num: "03",
    eyebrow: "Settle",
    headline: ["One tap.", "Done."],
    caption: "",
    bg: INK,
    text: CREAM,
    accent: ACCENT,
    variant: "card" as ScreenVariant,
    align: "left",
  },
];

export function Swiper() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const [activeIdx, setActiveIdx] = useState(0);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    const track = trackRef.current;
    if (!section || !track) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isMobile = window.matchMedia("(max-width: 767px)").matches;

    const ctx = gsap.context(() => {
      if (reduced || isMobile) {
        const scroller = scrollRef.current;
        if (scroller) {
          scroller.style.overflowX = "auto";
          scroller.style.overflowY = "hidden";
          (scroller.style as CSSStyleDeclaration & { scrollSnapType: string }).scrollSnapType =
            "x mandatory";
          (scroller.style as CSSStyleDeclaration & { scrollbarWidth: string }).scrollbarWidth =
            "none";
          const onScroll = () => {
            const idx = Math.round(
              scroller.scrollLeft / scroller.clientWidth,
            );
            setActiveIdx(Math.max(0, Math.min(SLIDES.length - 1, idx)));
            if (progRef.current) {
              const maxScroll = scroller.scrollWidth - scroller.clientWidth;
              const progress = maxScroll > 0 ? scroller.scrollLeft / maxScroll : 0;
              progRef.current.style.transform = `scaleX(${progress})`;
            }
          };
          scroller.addEventListener("scroll", onScroll, { passive: true });
        }
        track.querySelectorAll<HTMLElement>(".swiper-slide").forEach((el) => {
          (el.style as CSSStyleDeclaration & { scrollSnapAlign: string }).scrollSnapAlign =
            "center";
        });
        return;
      }

      const n = SLIDES.length;
      // Main slide traversal takes (n-1) units, then a 0.6-unit dwell so the
      // final slide stays on screen briefly before the pin releases. Without
      // this, progress hits 1.0 exactly when slide 03 lands and the section
      // immediately unpins — the user never gets to read the last panel.
      const mainUnits = n - 1;
      const dwellUnits = 0.6;
      const totalUnits = mainUnits + dwellUnits;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: () => "+=" + window.innerHeight * totalUnits,
          pin: true,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progRef.current) {
              progRef.current.style.transform = `scaleX(${self.progress})`;
            }
            const mainProgress = Math.min(
              1,
              (self.progress * totalUnits) / mainUnits,
            );
            const idx = Math.min(
              n - 1,
              Math.floor(mainProgress * n * 0.999),
            );
            setActiveIdx(idx);
          },
        },
      });

      tl.to(track, {
        xPercent: -((n - 1) / n) * 100,
        ease: "none",
        duration: mainUnits,
      });
      // empty dwell — timeline keeps scrubbing but track stays put on slide 03
      tl.to({}, { duration: dwellUnits });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="scenes"
      data-section="swiper"
      ref={sectionRef}
      className="relative h-svh overflow-hidden bg-ink text-cream no-scrollbar"
    >
      <div ref={scrollRef} className="h-full no-scrollbar">
      <div
        ref={trackRef}
        className="flex h-full will-change-transform"
        style={{ width: `${SLIDES.length * 100}vw` }}
      >
        {SLIDES.map((slide, i) => (
          <div
            key={i}
            className="swiper-slide w-screen h-full relative shrink-0 overflow-hidden pb-[72px] md:pb-0"
            style={{ background: slide.bg, color: slide.text }}
          >
            {/* ghost number — bleeds off the far corner */}
            <span
              aria-hidden
              className="pointer-events-none select-none absolute font-grotesk font-bold leading-none tracking-[-0.06em]"
              style={{
                fontSize: "clamp(18rem, 42vw, 52rem)",
                opacity: 0.07,
                color: slide.text,
                bottom: "-8vw",
                [slide.align === "left" ? "right" : "left"]: "-2vw",
              }}
            >
              {slide.num}
            </span>

            <div className="relative h-full w-full flex flex-col md:block">
              <div
                className={`flex flex-col gap-6 md:gap-0 md:justify-between md:h-full w-full md:w-[min(720px,62vw)] px-6 md:px-8 lg:px-16 pt-14 pb-0 md:pt-24 md:pb-28 lg:py-28 relative z-10 items-center md:items-start text-center md:text-left ${
                  slide.align === "right" ? "md:ml-auto" : "md:mr-auto"
                }`}
              >
                {/* top — chapter + label */}
                <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-6">
                  <span
                    className="font-grotesk font-bold leading-none tracking-[-0.04em]"
                    style={{
                      fontSize: "clamp(4rem, 12vw, 12rem)",
                      color: slide.accent,
                    }}
                  >
                    {slide.num}
                  </span>
                  <div className="md:pt-5 flex flex-col items-center md:items-start">
                    <div className="text-[0.72rem] uppercase tracking-[0.28em] font-semibold opacity-60">
                      Scene / {slide.num}
                    </div>
                    <div
                      className="mt-2 text-sm font-semibold uppercase tracking-[0.22em]"
                      style={{ color: slide.text }}
                    >
                      {slide.eyebrow}
                    </div>
                  </div>
                </div>

                {/* bottom — headline + caption */}
                <div>
                  <h3
                    className="font-grotesk font-bold leading-[0.94]"
                    style={{ fontSize: "clamp(2.25rem, 7.8vw, 8rem)", color: slide.text }}
                  >
                    {slide.headline[0]}
                    <br />
                    <span
                      className="italic font-medium"
                      style={{ color: slide.accent }}
                    >
                      {slide.headline[1]}
                    </span>
                  </h3>
                  {slide.caption && (
                    <p
                      className="mt-6 text-[0.72rem] uppercase tracking-[0.28em] font-semibold"
                      style={{ color: slide.text, opacity: 0.55 }}
                    >
                      {slide.caption}
                    </p>
                  )}
                </div>
              </div>

              {/* phone mockup — sits mid-right on desktop, bottom-right
                  on mobile so the scene is visible without the text
                  overlapping it. */}
              {slide.variant && (
                <>
                  {/* Desktop position — side-mid */}
                  <div
                    className={`absolute hidden md:block ${
                      slide.align === "left" ? "right-[9%]" : "left-[9%]"
                    } top-1/2 -translate-y-1/2`}
                    style={{ width: "min(300px, 22%)" }}
                  >
                    <Phone variant={slide.variant} />
                  </div>
                  {/* Mobile position — under the text in normal flow, centered */}
                  <div
                    className="md:hidden mx-auto mt-4 pointer-events-none"
                    style={{ width: "min(155px, 42%)" }}
                  >
                    <Phone variant={slide.variant} />
                  </div>
                </>
              )}

            </div>
          </div>
        ))}
      </div>
      </div>

      {/* top info bar — colors match the current slide */}
      <div
        className="absolute top-0 left-0 right-0 z-30 px-6 lg:px-10 pt-6 pb-3 flex items-center justify-between text-[0.72rem] uppercase tracking-[0.28em] font-semibold pointer-events-none transition-colors duration-500"
        style={{ color: SLIDES[activeIdx].text }}
      >
        <span className="flex items-center gap-3">
          <span
            className="w-1.5 h-1.5 rounded-full animate-pulse"
            style={{ backgroundColor: SLIDES[activeIdx].accent }}
          />
          Scenes · 3
        </span>
        <span className="hidden md:flex items-center gap-3">
          Scroll to swipe
          <Arrow stroke="currentColor" />
        </span>
      </div>

      {/* bottom counter + progress — colors match the current slide */}
      <div
        className="absolute bottom-0 left-0 right-0 z-50 transition-colors duration-500"
        style={{
          color: SLIDES[activeIdx].text,
          backgroundColor: `${SLIDES[activeIdx].bg === INK ? "rgba(14,14,14,0.6)" : "rgba(255,124,97,0.6)"}`,
          backdropFilter: "blur(12px)",
          borderTop: `1px solid ${SLIDES[activeIdx].bg === INK ? "rgba(255,255,255,0.1)" : "rgba(14,14,14,0.1)"}`,
        }}
      >
        <div className="h-[2px] w-full" style={{ backgroundColor: `${SLIDES[activeIdx].text}20` }}>
          <div
            ref={progRef}
            className="h-full origin-left"
            style={{
              transform: `scaleX(${activeIdx === 0 ? 0.02 : activeIdx / (SLIDES.length - 1)})`,
              backgroundColor: SLIDES[activeIdx].accent,
            }}
          />
        </div>
        <div className="px-6 lg:px-10 py-5 flex items-center justify-between text-[0.72rem] uppercase tracking-[0.28em] font-semibold">
          <span className="flex items-center gap-3 opacity-75">
            <Arrow className="rotate-180" stroke="currentColor" />
            Previous
          </span>
          <span className="tabular-nums">
            {(activeIdx + 1).toString().padStart(2, "0")} / {SLIDES.length.toString().padStart(2, "0")}
          </span>
          <span className="flex items-center gap-3 opacity-75">
            Next
            <Arrow stroke="currentColor" />
          </span>
        </div>
      </div>
    </section>
  );
}
