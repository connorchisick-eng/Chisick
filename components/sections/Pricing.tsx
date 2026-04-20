"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import { Arrow } from "@/components/icons";
import { track } from "@/lib/analytics";

type Period = "monthly" | "annual";

export function Pricing() {
  const ref = useRef<HTMLDivElement>(null);
  const [period, setPeriod] = useState<Period>("annual");

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".pr-reveal",
        { y: 28, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.09,
          scrollTrigger: { trigger: ref.current, start: "top 78%", once: true },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  const isAnnual = period === "annual";
  const proPrice = isAnnual ? "18.99" : "1.99";
  const proPeriod = isAnnual ? "/ year" : "/ month";
  const proSub = isAnnual
    ? "That's $1.58/mo — save 20%"
    : "Or $18.99/year — save 20%";

  return (
    <section
      id="pricing"
      data-section="pricing"
      ref={ref}
      className="relative bg-surface"
      aria-labelledby="pricing-heading"
    >
      <div className="mx-auto max-w-[1080px] px-6 lg:px-10 pt-20 lg:pt-28 pb-24 lg:pb-32">
        {/* Header */}
        <div className="pr-reveal flex flex-col items-start gap-8 lg:flex-row lg:items-end lg:justify-between mb-14 lg:mb-16">
          <div>
            <div className="eyebrow text-fg/45">Pricing</div>
            <h2
              id="pricing-heading"
              className="mt-4 font-grotesk font-bold text-fg text-section"
            >
              Simple, fair, and{" "}
              <span className="italic text-accent">honest</span>.
            </h2>
            <p className="mt-4 max-w-md text-base text-fg/60 leading-relaxed">
              Two tiers. No upsells, no contracts, no fine print you&apos;ll
              regret.
            </p>
          </div>

          <div
            className="flex items-center gap-3 shrink-0"
            role="group"
            aria-label="Billing period"
          >
            <div className="inline-flex items-center p-1 rounded-full bg-card border border-line text-sm font-semibold">
              <button
                onClick={() => {
                  setPeriod("monthly");
                  track("pricing_period_toggled", { period: "monthly" });
                }}
                className={`px-4 py-1.5 rounded-full transition-colors ${
                  period === "monthly"
                    ? "bg-fg text-canvas"
                    : "text-fg/60 hover:text-fg"
                }`}
                aria-pressed={period === "monthly"}
              >
                Monthly
              </button>
              <button
                onClick={() => {
                  setPeriod("annual");
                  track("pricing_period_toggled", { period: "annual" });
                }}
                className={`px-4 py-1.5 rounded-full transition-colors ${
                  period === "annual"
                    ? "bg-fg text-canvas"
                    : "text-fg/60 hover:text-fg"
                }`}
                aria-pressed={period === "annual"}
              >
                Annual
              </button>
            </div>
            <span className="text-[0.62rem] uppercase tracking-[0.24em] font-semibold text-accent">
              Save 20%
            </span>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
          {/* FREE */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="pr-reveal relative flex flex-col rounded-3xl p-7 lg:p-9 bg-card border border-line"
          >
            <div className="flex items-start justify-between">
              <h3 className="font-grotesk text-lg font-bold text-fg">Free</h3>
              <span className="text-[0.6rem] uppercase tracking-[0.22em] text-fg/40 font-semibold">
                Forever
              </span>
            </div>
            <p className="mt-1.5 text-sm text-fg/55">For the casual split.</p>

            <div className="mt-8 flex items-baseline gap-2">
              <span
                className="font-grotesk font-bold tracking-[-0.04em] text-fg"
                style={{
                  fontSize: "clamp(3rem, 5.5vw, 4.25rem)",
                  lineHeight: 0.9,
                }}
              >
                $0
              </span>
              <span className="text-fg/50 text-sm">/ forever</span>
            </div>
            <div className="mt-1.5 h-[1.1rem]" aria-hidden />

            <ul className="mt-8 space-y-3">
              {[
                "5 receipt scans per month",
                "Claim items and split with friends",
                "Pay with Apple Pay, card, bank, or crypto",
                "Real-time splitting",
              ].map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-3 text-[0.92rem] text-fg/75"
                >
                  <span className="mt-[9px] w-1 h-1 rounded-full bg-fg/50 shrink-0" />
                  <span className="leading-snug">{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/waitlist"
              onClick={() => {
                track("pricing_cta_clicked", { tier: "free", period });
                track("cta_join_waitlist_clicked", { surface: "pricing_free" });
              }}
              className="mt-9 inline-flex w-fit items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border border-fg/15 text-fg hover:border-fg hover:bg-fg hover:text-canvas transition-colors"
            >
              Get started
              <Arrow />
            </Link>
          </motion.div>

          {/* PRO */}
          <motion.div
            whileHover={{ y: -3 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="pr-reveal relative flex flex-col rounded-3xl p-7 lg:p-9 bg-card border border-accent/40 overflow-hidden"
          >
            <span
              aria-hidden
              className="absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-accent/70 to-transparent"
            />
            <div className="flex items-start justify-between">
              <h3 className="font-grotesk text-lg font-bold text-fg">Pro</h3>
              <span className="text-[0.6rem] uppercase tracking-[0.22em] text-accent font-semibold">
                Free in closed beta
              </span>
            </div>
            <p className="mt-1.5 text-sm text-fg/55">For the regulars.</p>

            <div className="mt-8 relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={period}
                  initial={{ y: 12, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -12, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-baseline gap-2"
                >
                  <span
                    className="font-grotesk font-bold tracking-[-0.04em] text-fg"
                    style={{
                      fontSize: "clamp(3rem, 5.5vw, 4.25rem)",
                      lineHeight: 0.9,
                    }}
                  >
                    ${proPrice}
                  </span>
                  <span className="text-fg/50 text-sm">{proPeriod}</span>
                </motion.div>
              </AnimatePresence>
              <div className="mt-1.5 text-[0.78rem] text-accent font-medium">
                {proSub}
              </div>
            </div>

            <ul className="mt-8 space-y-3">
              {[
                "Everything in Free",
                "Unlimited receipt scans",
                "SmartReceipts — AI-powered spending insights & history",
              ].map((f) => (
                <li
                  key={f}
                  className="flex items-start gap-3 text-[0.92rem] text-fg/80"
                >
                  <span className="mt-[9px] w-1 h-1 rounded-full bg-accent shrink-0" />
                  <span className="leading-snug">{f}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/waitlist"
              onClick={() => {
                track("pricing_cta_clicked", { tier: "pro", period });
                track("cta_join_waitlist_clicked", { surface: "pricing_pro" });
              }}
              className="mt-9 inline-flex w-fit items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium bg-accent text-white hover:bg-[rgb(240,108,82)] transition-colors"
            >
              Get started
              <Arrow />
            </Link>
          </motion.div>
        </div>

        {/* Closed-beta footer */}
        <div className="pr-reveal mt-14 text-center">
          <div className="text-[0.62rem] uppercase tracking-[0.24em] text-accent/80 font-semibold">
            Closed beta
          </div>
          <p className="mt-2 mx-auto max-w-[460px] text-sm text-fg/65 leading-relaxed">
            Testers from the waitlist get Pro free — every feature, on us —
            until we open to everyone.
          </p>
          <Link
            href="/waitlist"
            onClick={() => {
              track("cta_join_waitlist_clicked", {
                surface: "pricing_closed_beta_callout",
              });
            }}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-accent hover:text-fg transition-colors"
          >
            Join the waitlist
            <Arrow />
          </Link>
        </div>
      </div>
    </section>
  );
}
