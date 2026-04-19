"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Phone } from "@/components/Phone";
import type { ScreenVariant } from "@/components/Screen";

const STEPS: { num: string; word: string; title: string; body: string; variant: ScreenVariant }[] = [
  {
    num: "01",
    word: "SCAN.",
    title: "Scan the receipt",
    body: "Point your camera at the bill. Tabby reads every line item, tax, and tip in under two seconds.",
    variant: "scan",
  },
  {
    num: "02",
    word: "CLAIM.",
    title: "Claim your items",
    body: "Everyone taps what they ordered. Shared plates split automatically between whoever had some.",
    variant: "claim",
  },
  {
    num: "03",
    word: "SETTLE.",
    title: "Settle up",
    body: "One tap to pay — Apple Pay, card, or bank transfer. No IOUs, no Venmo requests.",
    variant: "progress",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const textsRef = useRef<(HTMLDivElement | null)[]>([]);
  const numsRef = useRef<(HTMLDivElement | null)[]>([]);
  const phonesRef = useRef<(HTMLDivElement | null)[]>([]);
  const progRef = useRef<HTMLDivElement>(null);
  const indicatorsRef = useRef<(HTMLSpanElement | null)[]>([]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const section = sectionRef.current;
    const pin = pinRef.current;
    if (!section || !pin) return;

    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    textsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.set(el, { autoAlpha: i === 0 ? 1 : 0, yPercent: i === 0 ? 0 : 8 });
    });
    numsRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.set(el, { autoAlpha: i === 0 ? 1 : 0, scale: i === 0 ? 1 : 0.9 });
    });
    phonesRef.current.forEach((el, i) => {
      if (!el) return;
      gsap.set(el, {
        autoAlpha: i === 0 ? 1 : 0,
        scale: i === 0 ? 1 : 0.9,
        yPercent: i === 0 ? 0 : 10,
      });
    });
    const setIndicator = (i: number) => {
      indicatorsRef.current.forEach((el, idx) => {
        if (!el) return;
        el.style.background =
          idx === i ? "rgb(255, 124, 97)" : "rgba(14,14,14,0.15)";
        el.style.width = idx === i ? "56px" : "18px";
      });
    };
    setIndicator(0);

    const ctx = gsap.context(() => {
      if (!isDesktop || reduced) {
        textsRef.current.forEach((el) => {
          if (!el) return;
          gsap.set(el, { autoAlpha: 1, y: 0, yPercent: 0, x: 0, xPercent: 0, clearProps: "transform" });
        });
        numsRef.current.forEach((el) => {
          if (!el) return;
          gsap.set(el, { autoAlpha: 1, scale: 1, clearProps: "transform" });
        });
        phonesRef.current.forEach((el) => {
          if (!el) return;
          gsap.set(el, { autoAlpha: 1, scale: 1, y: 0, yPercent: 0, clearProps: "transform" });
        });
        return;
      }

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: pin,
          start: "top top",
          end: "+=" + STEPS.length * 100 + "%",
          pin: pin,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (progRef.current) {
              progRef.current.style.transform = `scaleX(${self.progress})`;
            }
            const idx = Math.min(
              STEPS.length - 1,
              Math.floor(self.progress * STEPS.length * 0.999),
            );
            setIndicator(idx);
          },
        },
      });

      for (let i = 0; i < STEPS.length - 1; i++) {
        const from = i;
        const to = i + 1;
        tl.to(
          [textsRef.current[from], phonesRef.current[from], numsRef.current[from]],
          { autoAlpha: 0, yPercent: -8, duration: 0.55, ease: "power2.inOut" },
          `+=0.5`,
        );
        tl.to(
          phonesRef.current[from],
          { scale: 0.9, duration: 0.55, ease: "power2.inOut" },
          "<",
        );
        tl.fromTo(
          textsRef.current[to],
          { autoAlpha: 0, yPercent: 10 },
          { autoAlpha: 1, yPercent: 0, duration: 0.7, ease: "expo.out" },
          "<0.12",
        );
        tl.fromTo(
          numsRef.current[to],
          { autoAlpha: 0, scale: 0.88 },
          { autoAlpha: 1, scale: 1, duration: 0.8, ease: "expo.out" },
          "<",
        );
        tl.fromTo(
          phonesRef.current[to],
          { autoAlpha: 0, yPercent: 12, scale: 0.9 },
          { autoAlpha: 1, yPercent: 0, scale: 1, duration: 0.85, ease: "expo.out" },
          "<",
        );
      }
      tl.to({}, { duration: 0.5 });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      id="how-it-works"
      ref={sectionRef}
      className="relative bg-cream overflow-hidden"
    >
      {/* progress bar */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-ink/10 z-10 overflow-hidden">
        <div
          ref={progRef}
          className="absolute inset-0 bg-accent origin-left"
          style={{ transform: "scaleX(0)" }}
        />
      </div>

      {/* Heading area — scrolls normally, gives breathing room above the pinned steps */}
      <div className="relative z-10 mx-auto max-w-[1440px] px-6 lg:px-16 pt-16 lg:pt-20 pb-6 lg:pb-8 text-center">
        <div className="eyebrow text-ink/50 justify-center inline-flex">
          The method
        </div>
        <h2 className="mt-4 font-grotesk font-bold text-ink text-display leading-[0.95]">
          How it <span className="italic text-accent">works.</span>
        </h2>
        <p className="mt-4 text-lg md:text-xl text-ink/60 max-w-md mx-auto leading-[1.55]">
          Three steps. That's it.
        </p>
      </div>

      {/* MOBILE: horizontal swipeable carousel — one step per card, CSS
          scroll-snap, hidden at lg where the pinned animation takes over. */}
      <div className="lg:hidden pt-6 pb-16">
        <div className="overflow-x-auto snap-x snap-mandatory no-scrollbar px-6">
          <div className="flex gap-5 w-max">
            {STEPS.map((step) => (
              <div
                key={step.num}
                className="snap-center shrink-0 w-[82vw] max-w-[380px] rounded-[1.5rem] bg-white border border-ink/10 shadow-[0_20px_40px_-24px_rgba(14,14,14,0.25)] p-6 flex flex-col items-start text-left"
              >
                <div
                  className="font-grotesk font-bold leading-none tracking-[-0.05em] text-ink"
                  style={{ fontSize: "clamp(3rem, 14vw, 5rem)" }}
                >
                  {step.num}
                  <span className="text-accent">.</span>
                </div>
                <div className="text-accent text-[0.7rem] uppercase tracking-[0.22em] font-semibold mt-3">
                  Step / {step.num}
                </div>
                <h3
                  className="mt-2 font-grotesk font-bold text-ink"
                  style={{ fontSize: "clamp(1.6rem, 5.6vw, 2.25rem)", lineHeight: 1.04, letterSpacing: "-0.025em" }}
                >
                  {step.title}
                </h3>
                <p className="mt-3 text-[0.98rem] text-ink/60 leading-[1.55]">
                  {step.body}
                </p>
                <div className="mt-5 mx-auto relative w-[48vw] max-w-[200px] aspect-[9/19.5]">
                  <div
                    aria-hidden
                    className="absolute -inset-6 rounded-full blur-3xl"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 30%, rgba(255,124,97,0.22), transparent 60%)",
                    }}
                  />
                  <div className="relative">
                    <Phone variant={step.variant} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6 flex items-center justify-center gap-2 text-[0.68rem] uppercase tracking-[0.28em] font-semibold text-ink/40">
          <span>← Swipe →</span>
        </div>
      </div>

      <div
        ref={pinRef}
        className="hidden lg:flex relative lg:h-screen lg:min-h-[680px] items-start justify-center pt-[156px] pb-0"
      >
        {/* vertical label */}
        <div className="hidden lg:block absolute left-8 top-1/2 -translate-y-1/2 z-10">
          <span className="vert">How it works · the method</span>
        </div>
        <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 z-10">
          <span className="vert">3 steps to zero</span>
        </div>

        <div className="relative z-10 mx-auto max-w-[1120px] w-full px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16">
            {/* Left text + giant number */}
            <div className="w-full lg:w-[580px] relative lg:text-left">
              {/* Desktop-only absolute-positioned step number area. */}
              <div className="relative h-[11vw] min-h-[128px] lg:min-h-[160px] mb-3">
                {STEPS.map((step, i) => (
                  <div
                    key={step.num}
                    ref={(el) => {
                      numsRef.current[i] = el;
                    }}
                    className="absolute bottom-0 left-0 font-grotesk font-bold leading-[1.05] tracking-[-0.05em] text-ink whitespace-nowrap"
                    style={{ fontSize: "clamp(4.25rem, 8.4vw, 8.4rem)" }}
                  >
                    {step.num}
                    <span className="text-accent">.</span>
                  </div>
                ))}
              </div>

              <div className="relative lg:min-h-[360px]">
                {STEPS.map((step, i) => (
                  <div
                    key={step.num}
                    ref={(el) => {
                      textsRef.current[i] = el;
                    }}
                    className="lg:absolute lg:inset-0 text-left"
                  >
                    <div className="text-accent text-[0.72rem] uppercase tracking-[0.22em] font-semibold mb-4 flex items-center gap-2">
                      <span className="w-[22px] h-[1px] bg-current opacity-55" />
                      Step / {step.num}
                    </div>
                    <h3
                      className="font-grotesk font-bold text-ink"
                      style={{ fontSize: "clamp(2.5rem, 5.6vw, 5.6rem)", lineHeight: 1.02, letterSpacing: "-0.025em" }}
                    >
                      {step.title}
                    </h3>
                    <p className="mt-5 text-[1.28rem] text-ink/60 max-w-[520px] leading-[1.55]">
                      {step.body}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex items-center gap-2">
                {STEPS.map((_, i) => (
                  <span
                    key={i}
                    ref={(el) => {
                      indicatorsRef.current[i] = el;
                    }}
                    className="h-[6px] rounded-full transition-all duration-500"
                    style={{
                      width: i === 0 ? 56 : 18,
                      background: i === 0 ? "rgb(255,124,97)" : "rgba(14,14,14,0.15)",
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Phone — sits right next to the text on desktop. On mobile
                each phone renders inline under its own step text, not in
                this slot, so we only mount the desktop stack here. */}
            <div className="hidden lg:flex relative flex-shrink-0 items-center justify-center">
              <div className="relative w-[54vw] max-w-[300px] lg:max-w-[340px] aspect-[9/19.5]">
                <div
                  aria-hidden
                  className="absolute -inset-10 rounded-full blur-3xl"
                  style={{
                    background:
                      "radial-gradient(circle at 50% 30%, rgba(255,124,97,0.28), transparent 60%)",
                  }}
                />
                {STEPS.map((step, i) => (
                  <div
                    key={step.num}
                    ref={(el) => {
                      phonesRef.current[i] = el;
                    }}
                    className="absolute inset-0"
                  >
                    <Phone variant={step.variant} />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
