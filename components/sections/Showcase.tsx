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
      data-nav-invert
      className="relative bg-ink text-cream overflow-hidden"
    >
      <div className="noise" />

      {/* ═══════════════ § 01 + § 02 — Payments + Fee ═══════════════
          One unified editorial spread. Heading + 4-method list on the left,
          the 1.5% fee + supporting bullets on the right. Both stories live
          on the same canvas — half the height, all the info. */}
      <div
        data-reverse="false"
        className="sc-block relative mx-auto max-w-[1440px] px-6 lg:px-10 pt-16 lg:pt-24 pb-14 lg:pb-20"
      >
        <ChapterMark num="01" label="Payments & the fee" tone="dark" />

        <div className="relative mt-8 lg:mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">
          {/* Methods — left */}
          <div className="lg:col-span-7 relative z-10">
            <h3
              className="sc-heading font-grotesk font-bold text-cream leading-[0.94] tracking-[-0.03em]"
              style={{ fontSize: "clamp(2.5rem, 4.8vw, 4.5rem)" }}
            >
              Pay <span className="italic text-accent">your</span> way.
            </h3>
            <p className="sc-body mt-4 text-[0.98rem] lg:text-[1.05rem] text-cream/60 max-w-[36ch] leading-[1.55]">
              Apple Pay, credit, debit, bank transfer. Crypto is next.
            </p>

            <ul className="mt-7 lg:mt-9 border-y border-cream/15 divide-y divide-cream/10">
              {[
                { label: "Tap to pay", tag: "Instant", icon: "tap-to-pay" },
                { label: "Debit / Credit card", tag: "+3% fee", icon: "creditcard" },
                { label: "Bank transfer", tag: "Free", icon: "bank" },
                { label: "Crypto", tag: "Soon", icon: "bitcoin", soon: true },
              ].map((c, i) => (
                <li
                  key={c.label}
                  className="sc-card relative flex items-center gap-4 sm:gap-5 py-3.5 sm:py-4"
                >
                  <span
                    className="font-grotesk font-bold text-cream/30 tabular-nums tracking-[-0.04em] leading-none w-9 sm:w-12 shrink-0"
                    style={{ fontSize: "clamp(1.15rem, 1.7vw, 1.5rem)" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="w-9 h-9 rounded-full grid place-items-center shrink-0 bg-cream text-ink shadow-[0_4px_14px_rgba(0,0,0,0.25)]">
                    <img
                      src={`/icons/${c.icon}.svg`}
                      alt=""
                      aria-hidden
                      width={20}
                      height={20}
                      className="pointer-events-none"
                    />
                  </span>
                  <span className="flex-1 min-w-0 font-grotesk font-bold text-cream tracking-[-0.015em] text-[1rem] sm:text-[1.1rem] leading-tight">
                    {c.label}
                  </span>
                  <span
                    className={clsx(
                      "text-[0.62rem] uppercase tracking-[0.22em] font-semibold whitespace-nowrap shrink-0 tabular-nums",
                      c.soon ? "text-accent" : "text-cream/45",
                    )}
                  >
                    {c.tag}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* Fee — right */}
          <aside className="lg:col-span-5 relative z-10 lg:pl-8 lg:border-l lg:border-cream/10">
            <div className="sc-body flex items-center gap-3 text-[0.66rem] uppercase tracking-[0.28em] font-semibold text-accent">
              <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-accent" />
              Settlement fee
            </div>

            <div className="sc-heading mt-3 flex items-baseline gap-2 lg:gap-3">
              <span
                className="font-grotesk font-bold text-cream tabular-nums tracking-[-0.05em] leading-[0.85]"
                style={{ fontSize: "clamp(4.5rem, 11vw, 9rem)" }}
              >
                1<span className="text-accent">.</span>5
              </span>
              <span
                className="font-grotesk font-bold text-accent leading-[0.9] tracking-[-0.04em]"
                style={{ fontSize: "clamp(2.25rem, 5.5vw, 4.5rem)" }}
              >
                %
              </span>
            </div>
            <p className="sc-body mt-1 font-grotesk italic font-medium text-cream/70 text-[0.95rem] lg:text-[1.05rem] leading-[1.4]">
              one tab, one fee. paid by whoever started it.
            </p>

            <ul className="sc-body mt-6 lg:mt-7 grid grid-cols-1 gap-2 text-[0.78rem] lg:text-[0.82rem] text-cream/70 leading-tight">
              {[
                "No per-person fees",
                "No hidden charges",
                "Host pays the fee, not the table",
                "Settles overnight",
              ].map((b, i) => (
                <li key={b} className="flex items-center gap-3">
                  <span className="font-grotesk font-bold text-accent tabular-nums leading-none w-5 shrink-0 text-[0.78rem]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span aria-hidden className="w-3 h-px bg-cream/30 shrink-0" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>
          </aside>
        </div>
      </div>

      {/* ═══════════════ § 02 — THE HANDOFF ═══════════════
          Cream slab. Hero claim + tight 3-step flow. All copy compressed
          to fragments — heading carries the punch, nodes are noun phrases.
          Mobile gets noticeably more top padding so the chapter mark has
          breathing room above the cream card and isn't crushed against the
          tail of the Payments list. */}
      <div data-reverse="true" className="sc-block relative w-full pt-12 sm:pt-14 lg:pt-6 pb-20 lg:pb-28">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10 pb-7 sm:pb-6 lg:pb-8">
          <ChapterMark num="02" label="The handoff" tone="dark" />
        </div>

        <div className="sc-image relative mx-auto max-w-[1440px] px-6 lg:px-10">
          <div
            className="sc-full-image relative w-full rounded-[1.4rem] overflow-hidden bg-cream"
            style={{
              backgroundImage:
                "radial-gradient(circle at 85% 110%, rgba(255,124,97,0.28), transparent 55%), radial-gradient(circle at 10% -20%, rgba(255,124,97,0.22), transparent 55%)",
            }}
          >
            <div
              aria-hidden
              className="absolute inset-0 opacity-[0.06]"
              style={{
                backgroundImage:
                  "linear-gradient(90deg, rgba(14,14,14,0.8) 1px, transparent 1px)",
                backgroundSize: "7% 100%",
              }}
            />

            {/* "settled." stamp — rotated, anchored bottom-right */}
            <div
              aria-hidden
              className="pointer-events-none absolute right-[3%] bottom-[3%] md:right-[2.5%] md:bottom-[5%] font-grotesk italic font-bold text-ink/[0.08] leading-none select-none whitespace-nowrap"
              style={{
                fontSize: "clamp(2.5rem, 9.5vw, 11rem)",
                letterSpacing: "0.01em",
                transform: "rotate(-4deg)",
                transformOrigin: "100% 100%",
              }}
            >
              settled.
            </div>

            <div className="relative px-8 md:px-[5.5vw] lg:px-[6vw] py-12 md:py-14 lg:py-16 grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-14 items-start">
              {/* Left — claim */}
              <div className="md:col-span-7 flex flex-col items-center md:items-start text-center md:text-left">
                <div className="flex items-center gap-3 text-[0.66rem] uppercase tracking-[0.28em] font-semibold text-ink/55">
                  <span aria-hidden className="inline-block w-7 h-px bg-ink/40" />
                  The flow
                </div>
                <h3
                  className="sc-heading mt-4 font-grotesk font-bold text-ink leading-[0.94] tracking-[-0.03em] max-w-[14ch]"
                  style={{ fontSize: "clamp(2.5rem, 6.4vw, 5.75rem)" }}
                >
                  No one fronts <span className="italic">the bill.</span>
                </h3>
                <p className="sc-body mt-5 text-[0.98rem] md:text-[1.05rem] text-ink/70 max-w-md leading-[1.55]">
                  Everyone pays first. Funds wait in escrow. A one-time
                  virtual card lands on the host&apos;s phone — one tap at
                  the POS pays the restaurant in full.
                </p>
              </div>

              {/* Right — 3-step flow, vertical, tight */}
              <ol className="sc-body md:col-span-5 md:pl-6 md:border-l md:border-ink/15 flex flex-col">
                {[
                  { n: "01", h: "Everyone pays", c: "Funds enter escrow" },
                  { n: "02", h: "Card mints", c: "One-time virtual card" },
                  { n: "03", h: "Host taps", c: "Restaurant paid in full" },
                ].map((m, i, arr) => (
                  <li
                    key={m.n}
                    className={clsx(
                      "py-4 flex items-baseline gap-4",
                      i < arr.length - 1 && "border-b border-ink/12",
                    )}
                  >
                    <span className="font-grotesk font-bold text-accent tabular-nums leading-none text-[1rem] w-7 shrink-0">
                      {m.n}
                    </span>
                    <div className="flex-1">
                      <div
                        className="font-grotesk font-bold text-ink leading-[1.05] tracking-[-0.02em]"
                        style={{ fontSize: "clamp(1.2rem, 1.9vw, 1.6rem)" }}
                      >
                        {m.h}
                      </div>
                      <div className="mt-1 text-[0.78rem] uppercase tracking-[0.18em] text-ink/55 font-semibold leading-tight">
                        {m.c}
                      </div>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      </div>

    </section>
  );
}

/**
 * Editorial chapter mark — a numbered, hairline-ruled section label that
 * starts each block in the showcase. Acts like a magazine chapter heading.
 */
function ChapterMark({
  num,
  label,
  tone = "dark",
}: {
  num: string;
  label: string;
  tone?: "dark" | "light";
}) {
  const text = tone === "dark" ? "text-cream/55" : "text-ink/55";
  const rule = tone === "dark" ? "bg-cream/25" : "bg-ink/25";
  return (
    <div className="flex items-center gap-4 text-[0.7rem] uppercase tracking-[0.3em] font-semibold">
      <span className={clsx("font-grotesk font-bold tabular-nums", text)}>
        § {num}
      </span>
      <span aria-hidden className={clsx("h-px w-12 lg:w-16", rule)} />
      <span className={text}>{label}</span>
    </div>
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
