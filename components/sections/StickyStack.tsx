"use client";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { PhoneFrame } from "@/components/PhoneFrame";
import type { ScreenVariant } from "@/components/Screen";

type Step = {
  num: string;
  eyebrow: string;
  headline: [string, string];
  body: string;
  variant: ScreenVariant;
};

const STEPS: Step[] = [
  {
    num: "01",
    eyebrow: "Invite",
    headline: ["Bring your", "people in."],
    body: "Add friends or load a saved group, then start a tab. Anyone you bring can join from any phone — no app required.",
    variant: "friends",
  },
  {
    num: "02",
    eyebrow: "Scan",
    headline: ["Whole receipt,", "in a split second."],
    body: "Open the camera, snap the receipt. Tabby reads every line item, price, tax, and tip suggestion in under two seconds.",
    variant: "scan",
  },
  {
    num: "03",
    eyebrow: "Claim",
    headline: ["Tap what", "you had."],
    body: "Everyone taps the items they ordered. Shared plates split between whoever claims them. Real-time, no math.",
    variant: "claim-expanded",
  },
  {
    num: "04",
    eyebrow: "Settle",
    headline: ["One tap.", "Done."],
    body: "Funds collect in escrow. Once the table's covered, a one-time virtual card lands in the initiator's wallet. Tap the terminal — the merchant sees a single charge.",
    variant: "settle",
  },
];

export function StickyStack() {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    setIsMobile(mobile);

    if (reduced || mobile) return;

    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      const n = STEPS.length;
      // Pin for (n + dwell) viewport heights so each step gets ~1 viewport
      // of scroll, plus a bit of dwell time on the final step before unpin.
      const totalUnits = n + 0.5;
      // Hysteresis: each step "activates" when progress crosses the midpoint
      // of its slot rather than the leading edge — feels less jumpy than a
      // hard floor() boundary at the slot start.
      let lastIdx = 0;

      ScrollTrigger.create({
        trigger: section,
        start: "top top",
        end: () => "+=" + window.innerHeight * totalUnits,
        pin: true,
        // pinType: "transform" tracks Lenis's transform-based smoothing
        // perfectly. The default "fixed" pin can lag a frame against the
        // smooth scroller, which reads as a "snap" when the section engages.
        pinType: "transform",
        // Heavier scrub (1.0 vs 0.6) gives the cross-step transitions more
        // inertia, so stepping in and out of the pinned section feels eased
        // rather than abrupt. Lower values are snappier; higher values drift.
        scrub: 1,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          setProgress(self.progress);
          // Step boundaries with a small dead-zone around each midpoint so a
          // tiny scroll wobble can't bounce us between two steps.
          const slot = self.progress * n;
          const candidate = Math.min(n - 1, Math.floor(slot));
          const intra = slot - candidate; // 0..1 within the slot
          if (candidate !== lastIdx) {
            // Require ~12% travel into a new slot before committing.
            if (candidate > lastIdx ? intra > 0.12 : intra < 0.88) {
              lastIdx = candidate;
              setActive(candidate);
            }
          }
        },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  // Mobile / reduced-motion: render a simpler inline list instead of pinning.
  if (isMobile) {
    return (
      <section
        ref={sectionRef}
        id="how-it-works"
        data-nav-invert
        className="relative bg-ink text-cream overflow-hidden"
      >
        <div className="noise" />
        <Header />
        <div className="relative mx-auto max-w-[1400px] px-6 pb-24">
          {STEPS.map((s) => (
            <div
              key={s.num}
              className="border-t border-cream/10 py-14 first:border-t-0"
            >
              <StepMeta s={s} active />
              <h3
                className="mt-5 font-grotesk font-bold leading-[0.96] tracking-[-0.025em]"
                style={{ fontSize: "clamp(2.1rem, 8vw, 3.25rem)" }}
              >
                {s.headline[0]}
                <br />
                <span className="italic font-medium text-accent">
                  {s.headline[1]}
                </span>
              </h3>
              <p className="mt-5 max-w-[42ch] text-cream/65 text-[1.02rem] leading-[1.6]">
                {s.body}
              </p>
              <div className="mt-9 flex justify-center">
                <div
                  className="relative aspect-[450/920]"
                  style={{
                    height: "min(70vh, 540px)",
                    width: "calc(min(70vh, 540px) * 450 / 920)",
                  }}
                >
                  <div
                    aria-hidden
                    className="absolute -inset-8 rounded-full blur-3xl pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 40%, rgba(255,124,97,0.28), transparent 65%)",
                    }}
                  />
                  <PhoneFrame variant={s.variant} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }

  // Desktop: pinned guided scroll
  return (
    <section
      ref={sectionRef}
      id="how-it-works"
      data-nav-invert
      className="relative bg-ink text-cream overflow-hidden h-[100svh]"
    >
      <div className="noise" />

      {/* Body — phone left, copy right. Tightened top padding so phone +
          copy can stretch larger; max-w bumped for more horizontal room. */}
      <div className="relative h-full mx-auto max-w-[1560px] px-8 lg:px-16 pt-24 pb-28 grid grid-cols-12 gap-12 lg:gap-24 items-center">
        {/* Phone column — bigger. Phone now fills closer to viewport height. */}
        <div className="col-span-5 relative h-full flex items-center justify-center">
          <div
            aria-hidden
            className="absolute -inset-16 rounded-full blur-3xl pointer-events-none"
            style={{
              background:
                "radial-gradient(circle at 50% 40%, rgba(255,124,97,0.36), transparent 65%)",
            }}
          />
          <div className="relative aspect-[450/920] h-full max-h-[760px]">
            <AnimatePresence initial={false}>
              <motion.div
                key={STEPS[active].variant}
                initial={{ opacity: 0, y: 14, scale: 0.97, filter: "blur(8px)" }}
                animate={{ opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }}
                exit={{
                  opacity: 0,
                  y: -10,
                  scale: 0.97,
                  filter: "blur(6px)",
                  transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <PhoneFrame variant={STEPS[active].variant} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Copy column — bigger headlines, more breathing room */}
        <div className="col-span-7 relative h-full flex flex-col justify-center">
          <div className="relative min-h-[64vh]">
            <AnimatePresence initial={false}>
              <motion.div
                key={STEPS[active].num}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{
                  opacity: 0,
                  y: -12,
                  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
                }}
                transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-0"
              >
                <StepMeta s={STEPS[active]} active />
                <h3
                  className="mt-8 font-grotesk font-bold leading-[0.92] tracking-[-0.03em]"
                  style={{ fontSize: "clamp(3rem, 6.4vw, 6.5rem)" }}
                >
                  {STEPS[active].headline[0]}
                  <br />
                  <span className="italic font-medium text-accent">
                    {STEPS[active].headline[1]}
                  </span>
                </h3>
                <p className="mt-9 max-w-[46ch] text-cream/70 text-[1.15rem] lg:text-[1.25rem] leading-[1.55]">
                  {STEPS[active].body}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Step rail — left edge */}
      <div
        aria-hidden
        className="absolute left-5 lg:left-7 top-1/2 -translate-y-1/2 z-30 flex flex-col gap-3"
      >
        {STEPS.map((_, i) => (
          <span
            key={i}
            className={`block rounded-full transition-all duration-500 ${
              i === active
                ? "w-1.5 h-8 bg-accent"
                : i < active
                ? "w-1.5 h-1.5 bg-accent/60"
                : "w-1.5 h-1.5 bg-cream/30"
            }`}
          />
        ))}
      </div>

      {/* Bottom-center scroll cue. Persistent through the pinned section.
          Glass pill: arrow chip on the left, primary label + hairline
          divider + uppercase caption. Copy crossfades, pill stays put. */}
      <div className="pointer-events-none absolute bottom-12 left-0 right-0 z-30 flex justify-center">
        <motion.div
          animate={{
            backgroundColor:
              active === STEPS.length - 1
                ? "rgba(255, 124, 97, 0.14)"
                : "rgba(14, 14, 14, 0.55)",
            borderColor:
              active === STEPS.length - 1
                ? "rgba(255, 124, 97, 0.5)"
                : "rgba(248, 244, 240, 0.16)",
            boxShadow:
              active === STEPS.length - 1
                ? "0 24px 60px -18px rgba(255, 124, 97, 0.45)"
                : "0 24px 60px -18px rgba(0, 0, 0, 0.55)",
          }}
          transition={{ duration: 0.4 }}
          className="flex items-center gap-4 pl-2.5 pr-5 py-2.5 rounded-full backdrop-blur-xl border"
        >
          {/* Arrow chip — outer ring + filled inner so it reads as a button
              shape, not a flat blob. */}
          <motion.span
            aria-hidden
            animate={{ y: [0, 5, 0] }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="relative inline-flex w-9 h-9 items-center justify-center rounded-full bg-accent text-cream text-[1rem] font-bold leading-none shrink-0 ring-1 ring-cream/15"
          >
            ↓
          </motion.span>

          <AnimatePresence mode="wait" initial={false}>
            {active === STEPS.length - 1 ? (
              <motion.span
                key="last"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3.5 whitespace-nowrap"
              >
                <span className="font-grotesk font-semibold text-cream text-[1rem] tracking-[-0.01em] leading-none">
                  Last step
                </span>
                <span aria-hidden className="w-px h-3.5 bg-cream/25" />
                <span className="text-cream/65 text-[0.66rem] uppercase tracking-[0.24em] font-semibold leading-none">
                  Scroll past to continue
                </span>
              </motion.span>
            ) : (
              <motion.span
                key="continue"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3.5 whitespace-nowrap"
              >
                <span className="font-grotesk font-semibold text-cream text-[1rem] tracking-[-0.01em] leading-none">
                  Keep scrolling
                </span>
                <span aria-hidden className="w-px h-3.5 bg-cream/25" />
                <span className="text-cream/65 text-[0.66rem] uppercase tracking-[0.24em] font-semibold leading-none tabular-nums">
                  Step {String(active + 1).padStart(2, "0")} / 0{STEPS.length}
                </span>
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Hairline progress bar — pinned to very bottom */}
      <div className="absolute bottom-0 left-0 right-0 z-30">
        <div className="h-[2px] w-full bg-cream/10">
          <div
            className="h-full origin-left bg-accent transition-transform duration-100 ease-out"
            style={{ transform: `scaleX(${progress})` }}
          />
        </div>
      </div>
    </section>
  );
}

function Header() {
  return (
    <div className="relative mx-auto max-w-[1400px] px-6 lg:px-12 pt-20 md:pt-28 pb-6 md:pb-12">
      <div className="flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.28em] font-semibold text-cream/45">
        <span aria-hidden className="inline-block w-8 h-px bg-cream/30" />
        How it works
      </div>
      <h2
        className="mt-6 font-grotesk font-bold leading-[0.95] tracking-[-0.03em]"
        style={{ fontSize: "clamp(2.5rem, 9vw, 4.5rem)" }}
      >
        Four steps. <span className="italic font-medium text-accent">No math.</span>
      </h2>
    </div>
  );
}

function StepMeta({ s, active }: { s: Step; active: boolean }) {
  return (
    <div className="flex items-center gap-4 md:gap-5">
      <span
        className={`font-grotesk font-bold leading-none transition-colors duration-500 ${
          active ? "text-accent" : "text-cream/30"
        }`}
        style={{
          fontSize: "clamp(2.5rem, 4vw, 4rem)",
          letterSpacing: "-0.04em",
        }}
      >
        {s.num}
      </span>
      <span
        aria-hidden
        className={`h-px transition-all duration-500 ${
          active ? "w-16 bg-accent/60" : "w-10 bg-cream/15"
        }`}
      />
      <span
        className={`text-[0.72rem] uppercase tracking-[0.26em] font-semibold transition-colors duration-500 ${
          active ? "text-cream" : "text-cream/45"
        }`}
      >
        {s.eyebrow}
      </span>
    </div>
  );
}
