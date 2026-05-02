"use client";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { WordFlip } from "@/components/WordFlip";
import { clsx } from "clsx";

const LUXURY = ["wagyu", "caviar", "truffle", "lobster", "oysters", "dry-aged"];
const HUMBLE = ["water", "salad", "bread", "fries", "a Coke", "tap water"];

type Props = {
  variant?: "light" | "dark";
  interval?: number;
};

  export function FlipStatement({ variant = "light", interval = 2200 }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    const t = setInterval(() => setIdx((i) => i + 1), interval);
    return () => clearInterval(t);
  }, [interval, inView]);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".fs-rise",
        { y: 26, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.95,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: { trigger: ref.current, start: "top 78%", once: true },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  const dark = variant === "dark";

  return (
    <section
      ref={ref}
      className={clsx(
        "relative overflow-hidden",
        dark ? "bg-ink text-cream" : "bg-surface-alt text-body",
      )}
    >
      {dark && <div className="noise" />}

      {/* Ledger-paper hairlines — vertical pinstripes that suggest accounting
          stationery without being literal. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: dark
            ? "repeating-linear-gradient(90deg, rgba(248,244,240,0.9) 0 1px, transparent 1px 7%)"
            : "repeating-linear-gradient(90deg, rgba(14,14,14,0.9) 0 1px, transparent 1px 7%)",
          maskImage:
            "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 32%, black 70%)",
          WebkitMaskImage:
            "radial-gradient(ellipse 70% 70% at 50% 50%, transparent 32%, black 70%)",
        }}
      />

      <div
        className={clsx(
          "relative mx-auto max-w-[1440px] px-6 lg:px-10",
          dark ? "pt-12 lg:pt-16 pb-20 lg:pb-28" : "pt-20 lg:pt-28 pb-20 lg:pb-28",
        )}
      >
        <div className="relative">
          <div
            aria-hidden
            className={clsx(
              "fs-rise absolute top-0 left-1/2 -translate-x-1/2 h-px",
              dark ? "bg-cream/12" : "bg-body/15",
            )}
            style={{ width: "min(640px, 90%)" }}
          />

          <h2
            className={clsx(
              "fs-rise font-grotesk font-bold leading-[1.2] text-center mx-auto py-10 sm:py-12 lg:py-16",
              "tracking-[-0.025em]",
              dark ? "text-cream" : "text-body",
            )}
            style={{ fontSize: "clamp(1.95rem, 6vw, 6.25rem)" }}
          >
            <div className="md:whitespace-nowrap">
              Don&apos;t pay for their{" "}
              <span className="italic font-medium text-accent">
                <WordFlip words={LUXURY} index={idx} />
              </span>
            </div>
            <div className="mt-1 sm:mt-2 md:whitespace-nowrap">
              when you had{" "}
              <span
                className={clsx(
                  "italic font-medium",
                  dark ? "text-cream/70" : "text-body/75",
                )}
              >
                <WordFlip
                  words={HUMBLE}
                  index={idx}
                  suffix={<span className="text-accent">.</span>}
                />
              </span>
            </div>
          </h2>

          <div
            aria-hidden
            className={clsx(
              "fs-rise absolute bottom-0 left-1/2 -translate-x-1/2 h-px",
              dark ? "bg-cream/12" : "bg-body/15",
            )}
            style={{ width: "min(640px, 90%)" }}
          />
        </div>

      </div>
    </section>
  );
}
