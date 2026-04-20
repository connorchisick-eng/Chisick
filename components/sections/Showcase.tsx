"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { clsx } from "clsx";
import { Phone } from "@/components/Phone";
import { Arrow } from "@/components/icons";

/**
 * Renders a payment-method icon via CSS `mask-image` so its color can be
 * driven by `bg-*` utility classes and tracks the active theme. We used to
 * render these as <img> tags, which meant the SVGs' `fill="currentColor"`
 * declarations were ignored (external SVGs can't inherit CSS color) — so
 * in dark mode the icons rendered near-black on a near-black chip.
 * Switching to a mask means a single div takes on whatever color its
 * utility class sets, light or dark.
 */
function MaskIcon({ icon, className }: { icon: string; className?: string }) {
  const url = `url(/icons/${icon}.svg)`;
  return (
    <span
      aria-hidden
      className={clsx("block pointer-events-none", className)}
      style={{
        WebkitMaskImage: url,
        maskImage: url,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskPosition: "center",
        maskPosition: "center",
        WebkitMaskSize: "contain",
        maskSize: "contain",
      }}
    />
  );
}

export function Showcase() {
  const sectionRef = useRef<HTMLDivElement>(null);
  // Block 3 — which of the two phones is currently in front. Tap either to swap.
  const [frontPhone, setFrontPhone] = useState<"friends" | "groups">("friends");

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      const blocks = gsap.utils.toArray<HTMLElement>(".sc-block");
      blocks.forEach((block) => {
        const image = block.querySelector(".sc-image");
        const eyebrow = block.querySelector(".sc-eyebrow");
        const heading = block.querySelector(".sc-heading");
        const body = block.querySelector(".sc-body");
        const cards = block.querySelectorAll(".sc-card");
        const chapter = block.querySelector(".sc-chapter");
        const reverse = block.dataset.reverse === "true";

        if (image) {
          gsap.fromTo(
            image,
            { autoAlpha: 0, x: reverse ? 80 : -80 },
            {
              autoAlpha: 1,
              x: 0,
              duration: 1.2,
              ease: "expo.out",
              scrollTrigger: { trigger: block, start: "top 78%", once: true },
            },
          );
        }
        gsap.fromTo(
          [eyebrow, heading, body].filter(Boolean),
          { autoAlpha: 0, y: 36 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.95,
            ease: "expo.out",
            stagger: 0.09,
            delay: 0.15,
            scrollTrigger: { trigger: block, start: "top 78%", once: true },
          },
        );
        if (cards.length) {
          gsap.fromTo(
            cards,
            { autoAlpha: 0, y: 26 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.75,
              ease: "power3.out",
              stagger: 0.07,
              delay: 0.45,
              scrollTrigger: { trigger: block, start: "top 75%", once: true },
            },
          );
        }
        if (chapter) {
          gsap.fromTo(
            chapter,
            { autoAlpha: 0, x: reverse ? 60 : -60 },
            {
              autoAlpha: 1,
              x: 0,
              duration: 1.3,
              ease: "expo.out",
              scrollTrigger: { trigger: block, start: "top 80%", once: true },
            },
          );
        }
        if (!reduced && image) {
          gsap.to(image, {
            y: -60,
            ease: "none",
            scrollTrigger: {
              trigger: block,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          });
        }
      });
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  return (
    <section
      id="features"
      data-section="showcase"
      ref={sectionRef}
      className="relative bg-canvas text-fg overflow-hidden"
    >
      <div className="noise" />

      {/* BLOCK 1 — no phone; text left, payment methods grid right */}
      <div
        data-reverse="false"
        className="sc-block relative mx-auto max-w-[1440px] px-6 lg:px-10 pt-14 lg:pt-20 pb-20 lg:pb-28"
      >
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-5 relative z-10">
            <div className="sc-eyebrow eyebrow">Payments</div>
            <h3 className="sc-heading mt-5 font-grotesk font-bold text-fg text-section">
              Pay <span className="italic text-accent">your</span> way
            </h3>
            <p className="sc-body mt-6 text-lg text-fg/65 max-w-md leading-[1.6]">
              Apple Pay, credit card, debit, bank transfer. Use whatever works
              for you — and crypto is next.
            </p>
          </div>
          <div className="lg:col-span-7 relative z-10 lg:mt-[88px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { label: "Tap to pay", icon: "tap-to-pay" },
                { label: "Debit / Credit card", icon: "creditcard" },
                { label: "Bank transfer", icon: "bank" },
                { label: "Crypto", icon: "bitcoin", soon: true },
              ].map((c) => (
                <div
                  key={c.label}
                  className={clsx(
                    "sc-card group relative flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-5 p-6 rounded-2xl bg-card border border-line transition-all hover:-translate-y-0.5 text-center sm:text-left overflow-hidden",
                    c.soon ? "hover:border-accent/50" : "hover:border-accent/40",
                  )}
                >
                  {/* Subtle accent glow on hover — lifts the card without
                      repainting it. Kept low-opacity so the brand color
                      suggests, not shouts. */}
                  <span
                    aria-hidden
                    className="pointer-events-none absolute -top-8 -left-8 w-28 h-28 rounded-full bg-accent/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                  />
                  <span className="relative w-14 h-14 rounded-xl grid place-items-center shrink-0 bg-surface border border-line-strong shadow-[0_4px_12px_rgba(0,0,0,0.08)] group-hover:bg-accent/10 group-hover:border-accent/40 transition-colors duration-300">
                    <MaskIcon
                      icon={c.icon}
                      className="w-7 h-7 bg-fg/85 group-hover:bg-accent transition-colors duration-300"
                    />
                  </span>
                  <span className="relative text-base lg:text-lg text-fg/90 sm:flex-1 font-medium">
                    {c.label}
                  </span>
                  {c.soon && (
                    <span className="relative text-[0.62rem] uppercase tracking-[0.18em] text-accent/90 font-semibold border border-accent/30 bg-accent/5 rounded-full px-2 py-1">
                      Coming later
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* BLOCK 2 — FULL-BLEED BOLD COLOR, NO SCREEN */}
      <div data-reverse="true" className="sc-block relative w-full pt-12 lg:pt-20 pb-24 lg:pb-32">
        <div className="sc-image relative w-full">
          <div
            className="sc-full-image relative mx-auto w-[88vw] max-w-[1360px] min-h-[560px] md:min-h-[620px] lg:min-h-[640px] rounded-[1.4rem] overflow-hidden bg-cream"
            style={{
              backgroundImage:
                "radial-gradient(circle at 85% 120%, rgba(255,124,97,0.28), transparent 55%), radial-gradient(circle at 10% -20%, rgba(255,124,97,0.22), transparent 55%)",
            }}
          >
            {/* decorative grid lines */}
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.08]"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(14,14,14,0.8) 1px, transparent 1px)",
                backgroundSize: "7% 100%",
              }}
            />

            {/* "settled." wordmark — scaled down on mobile, anchored
                bottom-right on desktop. */}
            <div
              aria-hidden
              className="pointer-events-none absolute right-[4%] bottom-[2%] md:right-[2%] md:bottom-[4%] font-grotesk italic font-bold text-ink/10 leading-none select-none"
              style={{ fontSize: "clamp(3rem, 12vw, 14rem)", letterSpacing: "0.01em" }}
            >
              settled.
            </div>

            <div className="relative h-full min-h-[inherit] flex items-center justify-center md:justify-start py-12 md:py-16 lg:py-20">
              <div className="w-full px-6 md:pl-[4vw] md:pr-[4vw] lg:pl-[5vw] md:max-w-[1000px] relative z-10 text-center md:text-left flex flex-col items-center md:items-start gap-8 md:gap-12">
                <div className="flex flex-col items-center md:items-start gap-5 md:gap-7">
                  <h3 className="sc-heading font-grotesk font-bold text-ink text-title md:text-display leading-[1.05] md:leading-[0.98]">
                    No one fronts <span className="italic">the bill.</span>
                  </h3>
                  <p className="sc-body text-base md:text-lg text-ink/75 max-w-xl mx-auto md:mx-0 leading-[1.6]">
                    Everyone pays their share up front. Funds are held safely
                    until the tab is complete, then a one-time virtual card
                    appears on the host's phone — one tap at the POS and the
                    restaurant is paid in a single transaction.
                  </p>
                </div>

                <div className="sc-body grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-6 md:gap-10 lg:gap-14 w-full max-w-3xl">
                  {[
                    { h: "Safe hold", c: "Funds held until settled" },
                    { h: "Virtual card", c: "One clean transaction" },
                    { h: "1 tap", c: "Host pays the restaurant" },
                  ].map((m) => (
                    <div
                      key={m.h}
                      className="flex flex-col items-center sm:items-start text-center sm:text-left gap-3"
                    >
                      <div
                        className="font-grotesk font-bold text-ink leading-[1.02] tracking-[-0.02em] whitespace-nowrap"
                        style={{ fontSize: "clamp(1.6rem, 2.6vw, 2.4rem)" }}
                      >
                        {m.h}
                      </div>
                      <div className="text-[0.68rem] md:text-[0.72rem] uppercase tracking-[0.2em] text-ink/55 font-semibold leading-[1.45]">
                        {m.c}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* BLOCK 3 — text left, phone right + QR */}
      <div
        data-reverse="false"
        className="sc-block relative mx-auto max-w-[1440px] px-6 lg:px-10 pb-32 lg:pb-40"
      >
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-6 relative z-10 order-2 lg:order-1">
            <div className="sc-eyebrow eyebrow">Share</div>
            <h3 className="sc-heading mt-5 font-grotesk font-bold text-fg text-section">
              Invite your <span className="italic text-accent">friends.</span>
            </h3>
            <p className="sc-body mt-6 text-lg text-fg/65 max-w-md leading-[1.6]">
              Every table gets a unique QR code. Every friend gets their own
              friend code. Scan, join, split — no app install required for your
              guests.
            </p>
            <div className="mt-10 flex items-start gap-6">
              <div className="relative shrink-0">
                <div className="w-36 h-36 rounded-2xl bg-cream p-3 shadow-[0_24px_60px_-20px_rgba(255,124,97,0.35)] border border-line">
                  <img
                    src="/qr-code.svg"
                    alt=""
                    width={120}
                    height={120}
                    className="w-full h-full object-contain pointer-events-none"
                    aria-hidden
                  />
                </div>
                <span className="absolute -top-3 -right-3 bg-accent text-white text-[0.58rem] uppercase tracking-[0.22em] font-bold px-2.5 py-1 rounded-full rotate-6 shadow-md">
                  Table 07
                </span>
              </div>
              <div className="flex-1 text-sm text-fg/65 leading-snug">
                <div className="uppercase tracking-[0.22em] text-[0.62rem] font-bold text-accent mb-2">
                  Your friend code
                </div>
                <div className="font-grotesk font-bold text-fg text-[1.8rem] tracking-[-0.02em] leading-none">
                  48C2
                </div>
                <p className="mt-3 text-fg/50 text-[0.85rem] max-w-[220px]">
                  Share it, and anyone can split with you in one tap.
                </p>
              </div>
            </div>
          </div>
          <div className="sc-image lg:col-span-6 lg:col-start-7 relative z-10 order-1 lg:order-2">
            <div className="relative mx-auto w-full max-w-[460px] h-[520px] flex items-center justify-center">
              <div
                className="absolute -inset-10 blur-3xl opacity-60 -z-10"
                style={{
                  background:
                    "radial-gradient(circle at 50% 30%, rgba(255,124,97,0.55), transparent 65%)",
                }}
              />

              {/* Dashed connection line between the two phones */}
              <svg
                aria-hidden
                className="absolute inset-0 w-full h-full pointer-events-none z-0"
                viewBox="0 0 460 520"
                fill="none"
              >
                <path
                  d="M 140 300 C 200 360, 260 360, 320 300"
                  stroke="rgb(255,124,97)"
                  strokeWidth="1.6"
                  strokeDasharray="4 6"
                  strokeLinecap="round"
                  opacity="0.55"
                />
              </svg>

              {(["friends", "groups"] as const).map((v, i) => {
                const isFront = frontPhone === v;
                const baseRot = v === "friends" ? -9 : 8;
                const activeRot = v === "friends" ? -4 : 4;
                return (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setFrontPhone(v)}
                    aria-label={
                      isFront ? `${v} screen in front` : `Bring ${v} screen to front`
                    }
                    className="absolute cursor-pointer focus:outline-hidden focus-visible:ring-2 focus-visible:ring-accent rounded-[1.75rem] transition-[transform,opacity,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{
                      width: isFront ? "58%" : "50%",
                      left: v === "friends" ? "6%" : undefined,
                      right: v === "groups" ? "6%" : undefined,
                      top: isFront ? "8%" : "18%",
                      transform: `rotate(${isFront ? activeRot : baseRot}deg)`,
                      opacity: isFront ? 1 : 0.85,
                      filter: isFront ? "none" : "saturate(0.85)",
                      zIndex: isFront ? 20 : 5,
                    }}
                  >
                    <Phone variant={v} />
                  </button>
                );
              })}

              {/* Floating "friend request accepted" pill */}
              <span
                aria-hidden
                className="absolute top-[4%] right-[4%] z-30 bg-ink text-cream rounded-full px-3.5 py-1.5 text-[0.62rem] uppercase tracking-[0.22em] font-bold shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] flex items-center gap-2 rotate-6"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                Friend joined
              </span>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}
