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
    <section id="pricing" ref={ref} className="relative bg-surface-alt scroll-mt-[120px]">
      <div className="mx-auto max-w-[1240px] px-6 lg:px-10 pt-14 lg:pt-20 pb-20 lg:pb-24">
        <div className="text-center mb-14 lg:mb-16">
          <div className="eyebrow text-body/50 justify-center inline-flex">Pricing</div>
          <h2 className="mt-4 font-grotesk font-bold text-body text-section leading-[0.95] tracking-[-0.03em]">
            <span className="italic font-medium text-accent">two tiers.</span>
          </h2>
        </div>

        {/* Period toggle */}
        <div className="flex items-center gap-3 mb-8">
          <div className="inline-flex items-center p-1 rounded-full bg-surface border border-line/10 text-sm font-semibold">
            <button
              onClick={() => setPeriod("monthly")}
              className={`px-5 py-2 rounded-full transition-colors ${
                period === "monthly" ? "bg-body text-surface" : "text-body/60 hover:text-body"
              }`}
              aria-pressed={period === "monthly"}
            >
              Monthly
            </button>
            <button
              onClick={() => setPeriod("annual")}
              className={`relative px-5 py-2 rounded-full transition-colors ${
                period === "annual" ? "bg-body text-surface" : "text-body/60 hover:text-body"
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
          {/* BASIC */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="price-card relative rounded-[2rem] p-8 lg:p-12 bg-surface border border-line/10 flex flex-col"
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-grotesk text-2xl lg:text-3xl font-bold text-body">Free</h3>
                <p className="text-body/50 mt-2 text-base">For the casual split.</p>
              </div>
            </div>

            <div className="mt-8 flex items-baseline gap-3">
              <span className="font-grotesk font-bold tracking-[-0.03em] text-body" style={{ fontSize: "clamp(3.5rem, 6.4vw, 5.5rem)", lineHeight: 0.9 }}>
                $0
              </span>
              <span className="text-body/50 text-base">forever</span>
            </div>

            <ul className="mt-10 space-y-4 flex-1">
              {[
                "5 receipt scans per month",
                "Claim items and split with friends",
                "Pay with Apple Pay, card, bank, or crypto",
                "Real-time splitting",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-[1rem] text-body/75">
                  <span className="mt-[9px] w-1.5 h-1.5 rounded-full bg-body/60 flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/waitlist"
              className="mt-10 inline-flex items-center gap-2 px-5 py-3 rounded-full font-medium bg-body text-surface hover:bg-accent hover:text-white transition-colors text-[0.95rem] w-fit"
            >
              Get started
              <Arrow />
            </Link>
          </motion.div>

          {/* PRO */}
          <motion.div
            whileHover={{ y: -4 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="price-card relative rounded-[2rem] p-8 lg:p-12 bg-ink text-cream overflow-hidden flex flex-col"
          >
            <div
              aria-hidden
              className="absolute inset-0 pointer-events-none overflow-hidden rounded-[2rem]"
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
                <h3 className="font-grotesk text-2xl lg:text-3xl font-bold">Pro</h3>
                <p className="text-cream/55 mt-2 text-base">For the regulars.</p>
              </div>
              <span className="text-[0.68rem] uppercase tracking-[0.22em] text-accent font-semibold">
                Launching 2027
              </span>
            </div>

            <div className="relative mt-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={period}
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -14, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex items-baseline gap-3"
                >
                  <span className="font-grotesk font-bold tracking-[-0.035em] text-cream" style={{ fontSize: "clamp(3.5rem, 6.4vw, 5.5rem)", lineHeight: 0.9 }}>
                    ${proPrice}
                  </span>
                  <span className="text-cream/55 text-base">{proPeriod}</span>
                </motion.div>
              </AnimatePresence>
              <div className="mt-2 text-[0.9rem] text-accent font-medium italic">{proSub}</div>
            </div>

            <ul className="relative mt-10 space-y-4 flex-1">
              {[
                "Everything in Free",
                "Unlimited receipt scans",
                "SmartReceipts — AI-powered spending insights & history",
              ].map((f) => (
                <li key={f} className="flex items-start gap-3 text-[1rem] text-cream/85">
                  <span className="mt-[9px] w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                  {f}
                </li>
              ))}
            </ul>

            <Link
              href="/waitlist"
              className="relative mt-10 inline-flex items-center gap-2 px-5 py-3 rounded-full font-medium bg-accent text-white hover:bg-[rgb(240,108,82)] transition-colors text-[0.95rem] w-fit"
            >
              Get started
              <Arrow />
            </Link>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
