"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { motion, AnimatePresence } from "framer-motion";
import { Arrow } from "@/components/icons";

type Period = "monthly" | "annual";

export function Pricing() {
  const ref = useRef<HTMLDivElement>(null);
  const [period, setPeriod] = useState<Period>("annual");

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".price-card",
        { y: 40, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.9,
          ease: "expo.out",
          stagger: 0.1,
          scrollTrigger: { trigger: ref.current, start: "top 75%", once: true },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  const isAnnual = period === "annual";
  const proPrice = isAnnual ? "18.99" : "1.99";
  const proPeriod = isAnnual ? "/year" : "/month";
  const proSub = isAnnual ? "That's $1.58/mo — save 20%" : "Or $18.99/year — save 20%";

  return (
    <section id="pricing" ref={ref} className="relative bg-cream">
      <div className="mx-auto max-w-[960px] px-6 lg:px-10 pt-12 lg:pt-16 pb-20 lg:pb-24">
        {/* Period toggle */}
        <div className="flex items-center gap-3 mb-8">
          <div className="inline-flex items-center p-1 rounded-full bg-white border border-ink/10 text-sm font-semibold">
            <button
              onClick={() => setPeriod("monthly")}
              className={`px-5 py-2 rounded-full transition-colors ${
                period === "monthly" ? "bg-ink text-white" : "text-ink/60 hover:text-ink"
              }`}
              aria-pressed={period === "monthly"}
            >
              Monthly
            </button>
            <button
              onClick={() => setPeriod("annual")}
              className={`relative px-5 py-2 rounded-full transition-colors ${
                period === "annual" ? "bg-ink text-white" : "text-ink/60 hover:text-ink"
              }`}
              aria-pressed={period === "annual"}
            >
              Annual
            </button>
          </div>
          <span className="text-xs uppercase tracking-[0.22em] font-semibold text-accent">
            Save 20% yearly
          </span>
        </div>

        {/* Two cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 lg:gap-6">
          {/* BASIC */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="price-card relative rounded-3xl p-6 lg:p-8 bg-white border border-ink/10"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-grotesk text-xl font-bold">Free</h3>
                <p className="text-ink/50 mt-1 text-sm">For the casual split.</p>
              </div>
              <span className="text-[0.68rem] uppercase tracking-[0.22em] text-ink/40 font-semibold">
                Forever
              </span>
            </div>

            <div className="mt-5 flex items-baseline gap-2">
              <span className="font-grotesk font-bold tracking-[-0.03em] text-ink" style={{ fontSize: "clamp(2.75rem, 5vw, 4rem)", lineHeight: 0.9 }}>
                $0
              </span>
              <span className="text-ink/50 text-sm">forever</span>
            </div>

            <ul className="mt-6 space-y-2">
              {[
                "5 receipt scans per month",
                "Claim items and split with friends",
                "Pay with Apple Pay, card, bank, or crypto",
                "Real-time splitting",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-[0.9rem] text-ink/75">
                  <span className="mt-[8px] w-1.5 h-1.5 rounded-full bg-ink/60 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/waitlist"
              className="mt-7 inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-medium bg-ink text-white hover:bg-black transition-colors text-sm"
            >
              Get started
              <Arrow />
            </Link>
          </motion.div>

          {/* PRO */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="price-card relative rounded-3xl p-6 lg:p-8 bg-ink text-cream overflow-hidden"
          >
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl"
            >
              <div
                className="absolute -bottom-40 -right-40 w-[520px] h-[520px] rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,124,97,0.32) 0%, rgba(255,124,97,0.12) 40%, transparent 70%)",
                  filter: "blur(50px)",
                }}
              />
              <div
                className="absolute -top-32 -left-24 w-[360px] h-[360px] rounded-full"
                style={{
                  background:
                    "radial-gradient(circle, rgba(255,124,97,0.14), transparent 65%)",
                  filter: "blur(60px)",
                }}
              />
            </div>

            <div className="relative flex items-start justify-between">
              <div>
                <h3 className="font-grotesk text-xl font-bold">Pro</h3>
                <p className="text-cream/55 mt-1 text-sm">For the regulars.</p>
              </div>
              <span className="text-[0.68rem] uppercase tracking-[0.22em] text-accent font-semibold">
                Most popular
              </span>
            </div>

            <div className="relative mt-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={period}
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -14, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-baseline gap-2"
                >
                  <span className="font-grotesk font-bold tracking-[-0.035em] text-cream" style={{ fontSize: "clamp(2.75rem, 5vw, 4rem)", lineHeight: 0.9 }}>
                    ${proPrice}
                  </span>
                  <span className="text-cream/55 text-sm">{proPeriod}</span>
                </motion.div>
              </AnimatePresence>
              <div className="mt-1.5 text-[0.82rem] text-accent font-medium italic">{proSub}</div>
            </div>

            <ul className="relative mt-6 space-y-2">
              {[
                "Everything in Free",
                "Unlimited receipt scans",
                "SmartReceipts: AI-powered spending insights, history, and suggestions",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-[0.9rem] text-cream/85">
                  <span className="mt-[8px] w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/waitlist"
              className="relative mt-7 inline-flex items-center gap-2 px-4 py-2.5 rounded-full font-medium bg-accent text-white hover:bg-[rgb(240,108,82)] transition-colors text-sm"
            >
              Get started
              <Arrow />
            </Link>
            <p className="relative mt-6 text-[0.66rem] uppercase tracking-[0.22em] text-cream/40 font-semibold">
              7 days free · no card required
            </p>
          </motion.div>
        </div>

        <p className="mt-10 text-sm text-ink/50 text-center">
          Only Free available during closed beta.
        </p>
      </div>
    </section>
  );
}
