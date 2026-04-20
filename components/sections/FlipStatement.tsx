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
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".flip-meta > *",
        { y: 16, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 0.8,
          ease: "expo.out",
          stagger: 0.07,
          scrollTrigger: { trigger: ref.current, start: "top 85%", once: true },
        },
      );
      gsap.fromTo(
        ".flip-line",
        { y: 28, autoAlpha: 0 },
        {
          y: 0,
          autoAlpha: 1,
          duration: 1,
          ease: "expo.out",
          stagger: 0.08,
          scrollTrigger: { trigger: ref.current, start: "top 80%", once: true },
        },
      );
    }, ref);
    return () => ctx.revert();
  }, []);

  const dark = variant === "dark";

  return (
    <section
      ref={ref}
      data-section="flip_statement"
      className={clsx(
        "relative overflow-hidden",
        dark ? "bg-ink text-cream" : "bg-surface text-fg",
      )}
      aria-label="Public service announcement"
    >
      {dark && <div className="noise" />}

      <div
        className={clsx(
          "relative mx-auto max-w-[1440px] px-6 lg:px-10",
          dark ? "pt-10 lg:pt-14 pb-24 lg:pb-32" : "py-24 lg:py-32",
        )}
      >
        <div className="flip-meta relative mb-12 lg:mb-16 flex items-center justify-center">
          <span
            className={clsx(
              "hidden sm:block h-px flex-1 max-w-[120px] lg:max-w-[200px]",
              dark ? "bg-cream/25" : "bg-fg/20",
            )}
          />
          <div
            className={clsx(
              "relative inline-flex items-center px-5 sm:px-6 py-2 sm:py-2.5 border-y-2 mx-0 sm:mx-6",
              dark ? "border-cream/30" : "border-fg/25",
            )}
          >
            <span
              className={clsx(
                "font-grotesk text-[0.6rem] sm:text-[0.72rem] uppercase tracking-[0.32em] font-bold whitespace-nowrap",
                dark ? "text-cream/90" : "text-fg/80",
              )}
            >
              A public service announcement
            </span>
          </div>
          <span
            className={clsx(
              "hidden sm:block h-px flex-1 max-w-[120px] lg:max-w-[200px]",
              dark ? "bg-cream/25" : "bg-fg/20",
            )}
          />
        </div>

        <h2
          className={clsx(
            "font-grotesk font-bold leading-tight",
            dark ? "text-cream" : "text-fg",
          )}
          style={{ fontSize: "clamp(2.5rem, 7.2vw, 7.2rem)" }}
        >
          <div className="flip-line">
            Don&apos;t pay for their{" "}
            <span className="italic font-medium text-accent">
              <WordFlip words={LUXURY} index={idx} />
            </span>
          </div>
          <div className="flip-line">
            when you had{" "}
            <span
              className={clsx(
                "italic font-medium",
                dark ? "text-cream/70" : "text-fg/80",
              )}
            >
              <WordFlip words={HUMBLE} index={idx} />
            </span>
            <span className="text-accent">.</span>
          </div>
        </h2>

      </div>
    </section>
  );
}
