"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { clsx } from "clsx";
import { Phone } from "@/components/Phone";
import { Arrow } from "@/components/icons";

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
      ref={sectionRef}
      className="relative bg-ink text-cream overflow-hidden"
    >
      <div className="noise" />

      {/* BLOCK 1 — no phone; text left, payment methods grid right */}
      <div
        data-reverse="false"
        className="sc-block relative mx-auto max-w-[1440px] px-6 lg:px-10 pt-14 lg:pt-20 pb-20 lg:pb-28"
      >
        <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          <div className="lg:col-span-5 relative z-10">
            <div className="sc-eyebrow eyebrow text-cream/50">Payments</div>
            <h3 className="sc-heading mt-5 font-grotesk font-bold text-cream text-section">
              Pay <span className="italic text-accent">your</span> way
            </h3>
            <p className="sc-body mt-6 text-lg text-cream/65 max-w-md leading-[1.6]">
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
                    "sc-card flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-5 p-6 rounded-2xl bg-white/5 border border-white/10 transition-all hover:bg-white/10 hover:-translate-y-0.5 text-center sm:text-left",
                    c.soon ? "hover:border-accent/40" : "hover:border-accent/30",
                  )}
                >
                  <span className="w-14 h-14 rounded-xl grid place-items-center shrink-0 bg-white text-ink shadow-[0_4px_12px_rgba(0,0,0,0.2)]">
                    <img
                      src={`/icons/${c.icon}.svg`}
                      alt=""
                      aria-hidden
                      width={28}
                      height={28}
                      className="pointer-events-none"
                    />
                  </span>
                  <span className="text-base lg:text-lg text-cream/90 sm:flex-1 font-medium">
                    {c.label}
                  </span>
                  {c.soon && (
                    <span className="text-[0.62rem] uppercase tracking-[0.18em] text-accent/80 font-semibold border border-accent/30 rounded-full px-2 py-1">
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
            className="sc-full-image relative mx-auto w-[88vw] max-w-[1360px] min-h-[520px] md:min-h-0 md:aspect-[16/7.2] rounded-[1.4rem] overflow-hidden bg-cream"
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
              style={{ fontSize: "clamp(3rem, 14vw, 16rem)", letterSpacing: "0.01em" }}
            >
              settled.
            </div>

            <div className="relative h-full min-h-[inherit] flex items-center justify-center md:justify-start py-10 md:py-0">
              <div className="w-full px-6 md:pl-[3vw] md:pr-[4vw] lg:pl-[4vw] md:max-w-[980px] relative z-10 text-center md:text-left flex flex-col items-center md:items-start">
                <h3 className="sc-heading font-grotesk font-bold text-ink text-title md:text-display leading-[1.02] md:leading-[0.92]">
                  No one fronts <span className="italic">the bill.</span>
                </h3>
                <p className="sc-body mt-5 md:mt-6 text-base md:text-lg text-ink/75 max-w-xl mx-auto md:mx-0 leading-[1.6]">
                  Everyone pays their share up front. Funds are held safely
                  until the tab is complete, then a one-time virtual card
                  appears on the host's phone — one tap at the POS and the
                  restaurant is paid in a single transaction.
                </p>

                <div className="sc-body mt-10 md:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-5 md:gap-8 lg:gap-12 w-full max-w-3xl">
                  {[
                    { h: "Safe hold", c: "Funds held until settled" },
                    { h: "Virtual card", c: "One clean transaction" },
                    { h: "1 tap", c: "Host pays the restaurant" },
                  ].map((m) => (
                    <div
                      key={m.h}
                      className="flex flex-col items-center sm:items-start text-center sm:text-left"
                    >
                      <div className="font-grotesk font-bold text-ink leading-[1.02] tracking-[-0.02em] text-[1.8rem] sm:text-[1.5rem] md:text-[2rem] lg:text-[2.4rem] whitespace-nowrap">
                        {m.h}
                      </div>
                      <div className="mt-auto pt-3 text-[0.68rem] md:text-[0.72rem] uppercase tracking-[0.2em] text-ink/55 font-semibold leading-[1.45] min-h-[2.6em]">
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
            <div className="sc-eyebrow eyebrow text-cream/50">Share</div>
            <h3 className="sc-heading mt-5 font-grotesk font-bold text-cream text-section">
              Invite your <span className="italic text-accent">friends.</span>
            </h3>
            <p className="sc-body mt-6 text-lg text-cream/65 max-w-md leading-[1.6]">
              Every table gets a unique QR code. Every friend gets their own
              friend code. Scan, join, split — no app install required for your
              guests.
            </p>
            <div className="mt-10 flex items-start gap-6">
              <div className="relative flex-shrink-0">
                <div className="w-36 h-36 rounded-2xl bg-cream p-3 shadow-[0_24px_60px_-20px_rgba(255,124,97,0.35)]">
                  <FakeQR />
                </div>
                <span className="absolute -top-3 -right-3 bg-accent text-white text-[0.58rem] uppercase tracking-[0.22em] font-bold px-2.5 py-1 rounded-full rotate-[6deg] shadow-md">
                  Table 07
                </span>
              </div>
              <div className="flex-1 text-sm text-cream/65 leading-snug">
                <div className="uppercase tracking-[0.22em] text-[0.62rem] font-bold text-accent mb-2">
                  Your friend code
                </div>
                <div className="font-grotesk font-bold text-cream text-[1.8rem] tracking-[-0.02em] leading-none">
                  48C2
                </div>
                <p className="mt-3 text-cream/50 text-[0.85rem] max-w-[220px]">
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
                    className="absolute cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-[1.75rem] transition-[transform,opacity,filter] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
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
                className="absolute top-[4%] right-[4%] z-30 bg-ink text-cream rounded-full px-3.5 py-1.5 text-[0.62rem] uppercase tracking-[0.22em] font-bold shadow-[0_10px_30px_-10px_rgba(0,0,0,0.6)] flex items-center gap-2 rotate-[6deg]"
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

/**
 * Deterministic "looks real" QR code. A 25×25 module grid with the three
 * finder patterns at the corners, timing rails, and a seeded pseudo-random
 * fill for the data region. It does not encode anything — if you scan it,
 * your camera will tell you it's invalid, which is exactly what we want for
 * a marketing visual that shouldn't lead anywhere yet.
 */
function FakeQR() {
  const n = 25;
  const bits: boolean[][] = [];
  let seed = 0x1a2b3c;
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let y = 0; y < n; y++) {
    bits[y] = [];
    for (let x = 0; x < n; x++) {
      bits[y][x] = rand() > 0.52;
    }
  }
  // Three 7×7 finder patterns (TL, TR, BL)
  const finders: [number, number][] = [
    [0, 0],
    [n - 7, 0],
    [0, n - 7],
  ];
  finders.forEach(([fx, fy]) => {
    for (let dy = 0; dy < 7; dy++) {
      for (let dx = 0; dx < 7; dx++) {
        const onRing = dy === 0 || dy === 6 || dx === 0 || dx === 6;
        const inCenter = dy >= 2 && dy <= 4 && dx >= 2 && dx <= 4;
        bits[fy + dy][fx + dx] = onRing || inCenter;
      }
    }
    // White separator ring around the finder
    for (let dy = -1; dy <= 7; dy++) {
      for (let dx = -1; dx <= 7; dx++) {
        if (dy === -1 || dy === 7 || dx === -1 || dx === 7) {
          const yy = fy + dy;
          const xx = fx + dx;
          if (yy >= 0 && yy < n && xx >= 0 && xx < n) {
            if (!(dy >= 0 && dy <= 6 && dx >= 0 && dx <= 6)) {
              bits[yy][xx] = false;
            }
          }
        }
      }
    }
  });
  // Timing rails on row 6 and col 6
  for (let i = 8; i < n - 8; i++) {
    bits[6][i] = i % 2 === 0;
    bits[i][6] = i % 2 === 0;
  }
  // Small alignment block near bottom-right
  const ax = n - 5;
  const ay = n - 5;
  for (let dy = 0; dy < 5; dy++) {
    for (let dx = 0; dx < 5; dx++) {
      const onRing = dy === 0 || dy === 4 || dx === 0 || dx === 4;
      const inCenter = dy === 2 && dx === 2;
      bits[ay + dy][ax + dx] = onRing || inCenter;
    }
  }

  return (
    <svg
      viewBox={`0 0 ${n} ${n}`}
      className="w-full h-full"
      shapeRendering="crispEdges"
      aria-hidden
    >
      {bits.map((row, y) =>
        row.map(
          (on, x) =>
            on && (
              <rect
                key={`${x}-${y}`}
                x={x}
                y={y}
                width={1}
                height={1}
                fill="#0E0E0E"
              />
            ),
        ),
      )}
    </svg>
  );
}
