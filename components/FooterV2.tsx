"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion } from "motion/react";
import { LOGO } from "@/lib/images";
import { track } from "@/lib/analytics";
import { Arrow } from "@/components/icons";

/**
 * FooterV2 — editorial redesign. Asymmetric grid: oversized left-aligned
 * "Be the first in line for tabby." finale on the left, link columns on the
 * right. Below it, a cropped edge-bleeding "tabby." wordmark teases off the
 * viewport — a different visual treatment from the centered stamp in the
 * CTA section, so the two don't read as duplicates when stacked.
 *
 * Mobile-first: the grid collapses to a single column at <lg, the wordmark
 * caps its growth at the viewport so it never blows out horizontal scroll,
 * and the CTA cluster restacks (button on its own row, "Launching on …"
 * platform badges directly underneath) so nothing crams or wraps awkwardly.
 *
 * Borrows a hairline progress bar from StickyStack — fills as the footer
 * scrolls into view, gives the section a deliberate finishing rule.
 */
export function FooterV2() {
  const ref = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      if (progressRef.current && ref.current) {
        gsap.fromTo(
          progressRef.current,
          { scaleX: 0 },
          {
            scaleX: 1,
            ease: "none",
            scrollTrigger: {
              trigger: ref.current,
              start: "top bottom",
              end: "bottom bottom",
              scrub: 0.6,
            },
          },
        );
      }
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <footer
      ref={ref}
      data-nav-invert
      data-analytics-section="footer_v2"
      className="relative bg-ink text-cream overflow-hidden"
    >
      <div className="noise" />

      {/* Bottom-left ambient glow — anchors the eye to the headline column.
          Sized smaller on mobile so it doesn't wash out the type. */}
      <div
        aria-hidden
        className="absolute -left-32 top-[10%] w-[460px] h-[460px] sm:w-[600px] sm:h-[600px] lg:w-[760px] lg:h-[760px] rounded-full pointer-events-none opacity-80"
        style={{
          background:
            "radial-gradient(circle at 30% 40%, rgba(255,124,97,0.22), rgba(255,124,97,0) 65%)",
          filter: "blur(70px)",
        }}
      />

      {/* HEADLINE BLOCK — asymmetric grid, left big type, right link columns */}
      <div className="relative mx-auto max-w-[1560px] px-6 lg:px-12 pt-20 sm:pt-24 lg:pt-36 pb-8 lg:pb-14 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-end">
          {/* Headline column — 7/12 */}
          <div className="lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-15%" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="flex items-center gap-3 sm:gap-5 mb-7 sm:mb-9 lg:mb-10"
            >
              <span aria-hidden className="h-px w-10 sm:w-14 lg:w-16 bg-accent/60" />
              <span className="text-[0.66rem] sm:text-[0.7rem] uppercase tracking-[0.28em] font-semibold text-cream">
                Get on the list
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-12%" }}
              transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1], delay: 0.05 }}
              className="font-grotesk font-bold text-cream leading-[0.92] tracking-[-0.035em]"
              style={{ fontSize: "clamp(2.4rem, 7.4vw, 7.25rem)" }}
            >
              Be the first in{" "}
              <span className="relative inline-block italic font-medium text-accent">
                line
                <svg
                  aria-hidden
                  viewBox="0 0 120 10"
                  preserveAspectRatio="none"
                  className="absolute left-0 right-0 -bottom-2 w-full h-[0.32em]"
                  fill="none"
                >
                  <path
                    d="M 2 6 Q 30 1, 60 5 T 118 4"
                    stroke="rgb(255,124,97)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </span>
              <br />
              for{" "}
              <span className="italic font-medium text-cream/95">tabby.</span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.18 }}
              className="mt-6 sm:mt-8 lg:mt-10 max-w-[44ch] text-cream/65 text-[0.98rem] sm:text-[1.05rem] lg:text-[1.18rem] leading-[1.55]"
            >
              We're rolling out tables one city at a time. Drop your number
              and you'll be on the first invite when Tabby lands near you.
            </motion.p>

            {/* CTA cluster — button stacked above platform badges on mobile so
                the row never wraps mid-element. Inline on sm+. */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: 0.28 }}
              className="mt-8 lg:mt-12 flex flex-col sm:flex-row items-stretch sm:items-center gap-5 sm:gap-7"
            >
              <Link
                href="/waitlist"
                onClick={() =>
                  track("cta_clicked", {
                    cta_name: "join_waitlist",
                    location: "footer_v2_headline",
                    target_path: "/waitlist",
                  })
                }
                className="btn-primary justify-center sm:justify-start"
              >
                Join the waitlist
                <Arrow className="arrow" />
              </Link>

              <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                <span className="text-[0.62rem] sm:text-[0.66rem] uppercase tracking-[0.3em] text-cream/45 font-semibold">
                  Launching on
                </span>
                <PlatformBadge label="iOS" icon={<AppleMark />} />
                <PlatformBadge label="Android" icon={<AndroidMark />} />
              </div>
            </motion.div>
          </div>

          {/* Link columns — 5/12, right-aligned. Mobile uses a 2-col grid
              that lays out as 2x2 with a single 3rd-column trailing row,
              which always looks orphaned. Switch to 3-col from sm so the
              row sits naturally on phones held landscape and on small
              tablets, and stays 3-col through lg. */}
          <div className="lg:col-span-5 grid grid-cols-3 gap-6 sm:gap-8 md:gap-10">
            <NavCol
              label="Product"
              items={[
                { href: "/#how-it-works", text: "How it works", cta: "how_it_works" },
                { href: "/#features", text: "Payments", cta: "payments" },
                { href: "/#faq", text: "FAQ", cta: "faq" },
                { href: "/waitlist", text: "Waitlist", cta: "waitlist", internal: true },
              ]}
            />
            <NavCol
              label="Social"
              soon
              items={[
                { text: "Instagram", muted: true },
                { text: "TikTok", muted: true },
                { text: "Twitter / X", muted: true },
                { text: "LinkedIn", muted: true },
              ]}
            />
            <NavCol
              label="Legal"
              items={[
                { href: "/privacy", text: "Privacy", internal: true },
                { href: "/terms", text: "Terms", internal: true },
                { href: "/security", text: "Security", internal: true },
              ]}
            />
          </div>
        </div>
      </div>

      {/* EDGE-BLEEDING WORDMARK — cropped at the viewport edges. The teaser
          equivalent of a logo signature at the bottom. Single "tabby." word
          (instead of "tabby tabby.") so the word is still huge but never
          forces horizontal overflow on narrow viewports.
          - `overflow-x-clip` lets the horizontal bleed clip cleanly while
            allowing the descender on "y" + the period to render below the
            wrapper's box. Plain `overflow-hidden` was clipping them.
          - `translateY` is slightly negative so the glyph sits above the
            marquee instead of pushing into it. */}
      <div
        aria-hidden
        className="relative select-none pointer-events-none w-full overflow-x-clip mt-2 lg:mt-6 pb-[0.18em]"
      >
        <div
          className="font-grotesk italic font-bold leading-[0.95] tracking-[-0.06em] whitespace-nowrap text-center"
          style={{
            fontSize: "clamp(5rem, 28vw, 26rem)",
            backgroundImage:
              "linear-gradient(180deg, rgba(255,124,97,0.85) 0%, rgba(255,124,97,0.35) 55%, rgba(248,244,240,0.06) 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
            filter: "drop-shadow(0 22px 60px rgba(255, 124, 97, 0.22))",
          }}
        >
          tabby.
        </div>
      </div>

      {/* Marquee + brand row + copyright. Small positive margin so the
          marquee sits clearly below the wordmark's descender / period. */}
      <div className="relative mx-auto max-w-[1560px] px-6 lg:px-12 mt-2 lg:mt-4 pb-0 z-10">
        <div className="relative border-y border-white/5 overflow-hidden py-3 -mx-6 lg:-mx-12">
          <div className="flex animate-marquee whitespace-nowrap">
            {Array.from({ length: 2 }).map((_, rep) => (
              <div key={rep} className="flex items-center gap-10 pr-10 shrink-0">
                {Array.from({ length: 14 }).map((_, i) => (
                  <span
                    key={`${rep}-${i}`}
                    className="flex items-center gap-10 text-cream/30"
                  >
                    <span
                      className="font-grotesk italic font-medium text-cream/35 tracking-[-0.02em]"
                      style={{ fontSize: "0.95rem" }}
                    >
                      enjoy the meal · not the math
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="py-5 sm:py-6 pb-9 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 text-sm text-cream/50">
          <div className="flex items-center gap-3">
            <span className="relative w-7 h-7 rounded-[30%] overflow-hidden bg-white grid place-items-center shadow-[0_2px_6px_rgba(0,0,0,0.25)]">
              <Image src={LOGO} alt="Tabby" width={18} height={18} />
            </span>
            <span className="text-cream/55 text-[0.82rem] sm:text-sm">© 2026 Tabby. All rights reserved.</span>
          </div>
          <span className="font-grotesk italic text-cream/40 text-[0.82rem] sm:text-sm">
            enjoy the meal — not the math.
          </span>
        </div>
      </div>

      {/* Hairline progress bar — pinned to the very bottom, fills as the
          footer scrolls into view. Same finishing rule as StickyStack. */}
      <div className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none">
        <div className="h-[2px] w-full bg-cream/10">
          <div
            ref={progressRef}
            className="h-full origin-left bg-accent"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>
    </footer>
  );
}

type NavItem = {
  href?: string;
  text: string;
  cta?: string;
  internal?: boolean;
  muted?: boolean;
};

function NavCol({
  label,
  items,
  soon,
}: {
  label: string;
  items: NavItem[];
  soon?: boolean;
}) {
  return (
    <div className="min-w-0">
      <h4 className="text-[0.62rem] sm:text-xs uppercase tracking-[0.18em] sm:tracking-[0.22em] text-cream/40 font-semibold flex items-center flex-wrap gap-x-2 gap-y-1">
        {label}
        {soon && (
          <span className="text-[0.5rem] sm:text-[0.56rem] text-accent tracking-[0.24em]">
            SOON
          </span>
        )}
      </h4>
      <ul
        className={`mt-3 sm:mt-5 space-y-2 sm:space-y-3 text-[0.82rem] sm:text-[0.95rem] ${
          soon ? "text-cream/40" : "text-cream/85"
        }`}
      >
        {items.map((item) => {
          if (item.muted || !item.href) {
            return (
              <li key={item.text} className="leading-tight">
                {item.text}
              </li>
            );
          }
          const onClick = item.cta
            ? () =>
                track("cta_clicked", {
                  cta_name: item.cta!,
                  location: "footer_v2",
                  target_path: item.href!,
                })
            : undefined;
          if (item.internal) {
            return (
              <li key={item.text} className="leading-tight">
                <Link
                  href={item.href}
                  onClick={onClick}
                  className="ul-link ul-link-light"
                >
                  {item.text}
                </Link>
              </li>
            );
          }
          return (
            <li key={item.text} className="leading-tight">
              <a
                href={item.href}
                onClick={onClick}
                className="ul-link ul-link-light"
              >
                {item.text}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function PlatformBadge({
  label,
  icon,
}: {
  label: string;
  icon: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-cream/15 bg-white/[0.04] px-2.5 sm:px-3 py-1 sm:py-1.5 text-[0.72rem] sm:text-[0.78rem]">
      <span className="text-cream/85 flex items-center">{icon}</span>
      <span className="text-cream font-semibold tracking-[0.04em]">{label}</span>
    </span>
  );
}

function AppleMark() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

function AndroidMark() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.523 15.34a1.122 1.122 0 1 1 0-2.244 1.122 1.122 0 0 1 0 2.244Zm-11.046 0a1.122 1.122 0 1 1 0-2.244 1.122 1.122 0 0 1 0 2.244Zm11.45-6.18 1.994-3.454a.415.415 0 1 0-.72-.414l-2.02 3.498A12.588 12.588 0 0 0 12 7.5c-1.876 0-3.652.398-5.181 1.108L4.8 5.292a.415.415 0 1 0-.72.414L6.073 9.16C2.64 11.032.305 14.52 0 18.5h24c-.305-3.98-2.64-7.468-6.073-9.34Z" />
    </svg>
  );
}
