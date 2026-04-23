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
  bg: string;
  text: string;
  accent: string;
  variants?: ScreenVariant[]; // 1 or 2 phones per slide
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
    eyebrow: "Invite",
    headline: ["Bring your", "people in."],
    bg: ACCENT,
    text: INK,
    accent: INK,
    variants: ["friends", "groups"],
    align: "right",
  },
  {
    num: "02",
    eyebrow: "Scan",
    headline: ["Whole receipt,", "in a split second."],
    bg: INK,
    text: CREAM,
    accent: ACCENT,
    variants: ["scan", "claim"],
    align: "left",
  },
  {
    num: "03",
    eyebrow: "Claim",
    headline: ["Tap what", "you had."],
    bg: ACCENT,
    text: INK,
    accent: INK,
    variants: ["claim-expanded", "tip"],
    align: "right",
  },
  {
    num: "04",
    eyebrow: "Settle",
    headline: ["One tap.", "Done."],
    bg: INK,
    text: CREAM,
    accent: ACCENT,
    variants: ["settle", "card"],
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
  // Per-slide: which variant index is currently in front. Defaults to the
  // last variant (so the "destination" screen reads first).
  const [frontPerSlide, setFrontPerSlide] = useState<number[]>(() =>
    SLIDES.map((s) => Math.max(0, (s.variants?.length ?? 1) - 1)),
  );
  const setFrontFor = (slideIdx: number, variantIdx: number) =>
    setFrontPerSlide((prev) => {
      if (prev[slideIdx] === variantIdx) return prev;
      const next = [...prev];
      next[slideIdx] = variantIdx;
      return next;
    });

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
      id="how-it-works"
      ref={sectionRef}
      data-nav-invert
      className="relative h-[100svh] overflow-hidden bg-ink text-cream no-scrollbar"
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
            className="swiper-slide w-screen h-full relative flex-shrink-0 overflow-hidden pb-[64px] md:pt-[56px] md:pb-[44px]"
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

            {/* Scene layout — two-column on desktop: text + framed phone.
                The phone reads clearly at ~300px and gets a small framed
                "device display" treatment so it feels intentional, not
                floating. Detail chips point at what matters on screen. */}
            <div className="relative h-full w-full flex flex-col md:grid md:grid-cols-12 md:gap-8 lg:gap-12 md:items-center">
              <div
                className={`flex flex-col gap-6 md:gap-7 w-full px-6 md:px-8 lg:px-16 pt-14 pb-0 md:py-6 lg:py-10 relative z-10 items-center md:items-start text-center md:text-left ${
                  slide.align === "right"
                    ? "md:col-span-7 md:col-start-6 md:order-2"
                    : "md:col-span-7 md:col-start-1 md:order-1"
                }`}
              >
                <div className="flex flex-col md:flex-row items-center md:items-start gap-2 md:gap-6">
                  <span
                    className="font-grotesk font-bold leading-none tracking-[-0.04em]"
                    style={{
                      fontSize: "clamp(3.5rem, 10vw, 10rem)",
                      color: slide.accent,
                    }}
                  >
                    {slide.num}
                  </span>
                  <div className="md:pt-4 flex flex-col items-center md:items-start">
                    <div className="text-[0.72rem] uppercase tracking-[0.28em] font-semibold opacity-60">
                      Step / {slide.num}
                    </div>
                    <div
                      className="mt-2 text-sm font-semibold uppercase tracking-[0.22em]"
                      style={{ color: slide.text }}
                    >
                      {slide.eyebrow}
                    </div>
                  </div>
                </div>

                <div>
                  <h3
                    className="font-grotesk font-bold leading-[0.94]"
                    style={{ fontSize: "clamp(2.25rem, 5.5vw, 6rem)", color: slide.text }}
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
                </div>
              </div>

              {/* Phones — up to 2 per slide. Two phones overlap with a
                  slight stagger to look like one held behind the other.
                  Sized off viewport height so the section never overflows when
                  pinned: phone fits inside the remaining space after top bar +
                  bottom ribbon + slide padding. */}
              {slide.variants && slide.variants.length > 0 && (
                <div
                  className={`hidden md:flex md:col-span-5 relative items-center justify-center py-2 ${
                    slide.align === "left" ? "md:order-2" : "md:order-1"
                  }`}
                >
                  <div
                    className="relative"
                    style={{
                      // Phone aspect ~9:19.5. Cap height to remaining viewport
                      // (subtract top bar + bottom ribbon + slide padding ≈ 140px)
                      // and derive width from the height so it stays in proportion.
                      height: "min(880px, calc(100vh - 140px))",
                      width: "min(520px, calc((100vh - 140px) * 0.46))",
                    }}
                  >
                    {/* radial glow backdrop */}
                    <div
                      aria-hidden
                      className="absolute -inset-16 rounded-full blur-3xl pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at 50% 40%, ${
                          slide.accent === INK
                            ? "rgba(14,14,14,0.45)"
                            : "rgba(255,124,97,0.38)"
                        }, transparent 65%)`,
                      }}
                    />
                    {slide.variants.map((v, vi) => {
                      const total = slide.variants!.length;
                      const isFront = vi === frontPerSlide[i];
                      // Stack: front phone centered & full size; back phone
                      // offset behind and slightly smaller. Click a back
                      // phone to bring it to the front.
                      const offsetX = total === 1 ? 0 : isFront ? 14 : -14;
                      const offsetY = total === 1 ? 0 : isFront ? 6 : -6;
                      const scale = isFront ? 1 : 0.88;
                      const rot = total === 1 ? 0 : isFront ? 4 : -6;
                      return (
                        <button
                          key={`${v}-${vi}`}
                          type="button"
                          onClick={() => setFrontFor(i, vi)}
                          aria-label={`Bring ${v} screen to front`}
                          className="absolute left-1/2 top-1/2 cursor-pointer"
                          style={{
                            width: "82%",
                            transform: `translate(-50%, -50%) translate(${offsetX}%, ${offsetY}%) rotate(${rot}deg) scale(${scale})`,
                            zIndex: isFront ? 2 : 1,
                            transition:
                              "transform 0.55s cubic-bezier(0.22,1,0.36,1)",
                          }}
                        >
                          <Phone variant={v} />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Mobile — staggered 2-phone stack sized so the full phone
                   (plus headline + step meta) fits within the 100svh slide
                   viewport on common mobile sizes. Height-based sizing so
                   the phones never overflow and get clipped. */}
              {slide.variants && slide.variants.length > 0 && (
                <div
                  className="md:hidden mx-auto mt-4 relative aspect-[9/19.5]"
                  style={{
                    // Fit remaining viewport after top bar (56px slide top +
                    // ~200px of step number / eyebrow / headline above) and
                    // bottom ribbon (~64px + 44px pill). Derive width from
                    // the phone aspect ratio so nothing clips.
                    height: "min(calc(100svh - 360px), 520px)",
                    width: "calc(min(calc(100svh - 360px), 520px) * 9 / 19.5)",
                  }}
                >
                  <div
                    aria-hidden
                    className="absolute -inset-8 rounded-full blur-3xl pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 50% 40%, ${
                        slide.accent === INK
                          ? "rgba(14,14,14,0.3)"
                          : "rgba(255,124,97,0.32)"
                      }, transparent 65%)`,
                    }}
                  />
                  {slide.variants.map((v, vi) => {
                    const total = slide.variants!.length;
                    const isFront = vi === frontPerSlide[i];
                    const offsetX = total === 1 ? 0 : isFront ? 12 : -12;
                    const offsetY = total === 1 ? 0 : isFront ? 5 : -5;
                    const scale = isFront ? 1 : 0.88;
                    const rot = total === 1 ? 0 : isFront ? 3 : -5;
                    return (
                      <button
                        key={`${v}-${vi}`}
                        type="button"
                        onClick={() => setFrontFor(i, vi)}
                        aria-label={`Bring ${v} screen to front`}
                        className="absolute left-1/2 top-1/2 cursor-pointer"
                        style={{
                          width: "82%",
                          transform: `translate(-50%, -50%) translate(${offsetX}%, ${offsetY}%) rotate(${rot}deg) scale(${scale})`,
                          zIndex: isFront ? 2 : 1,
                          transition:
                            "transform 0.55s cubic-bezier(0.22,1,0.36,1)",
                        }}
                      >
                        <Phone variant={v} />
                      </button>
                    );
                  })}
                </div>
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
        <span />{/* counter removed — slide number is already huge in the body */}
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
        <div className="px-6 lg:px-10 py-2.5 flex items-center justify-between text-[0.62rem] uppercase tracking-[0.24em] font-semibold">
          <span className="flex items-center gap-2 opacity-65">
            <Arrow className="rotate-180" stroke="currentColor" />
            Previous
          </span>
          <span className="flex items-center gap-2 opacity-65">
            Next
            <Arrow stroke="currentColor" />
          </span>
        </div>
      </div>
    </section>
  );
}
