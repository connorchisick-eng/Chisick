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
      className={clsx(
        "relative overflow-hidden",
        dark ? "bg-ink text-cream" : "bg-surface-alt text-body",
      )}
    >
      {dark && <div className="noise" />}

      <div
        className={clsx(
          "relative mx-auto max-w-[1440px] px-6 lg:px-10",
          dark ? "pt-10 lg:pt-14 pb-24 lg:pb-32" : "py-24 lg:py-32",
        )}
      >
        <h2
          className={clsx(
            "font-grotesk font-bold leading-[1.25] text-center mx-auto max-w-[18ch]",
            dark ? "text-cream" : "text-body",
          )}
          style={{ fontSize: "clamp(2.5rem, 7.2vw, 7.2rem)" }}
        >
          <div className="flip-line">
            Don't pay for their{" "}
            <span className="italic font-medium text-accent">
              <WordFlip words={LUXURY} index={idx} />
            </span>
          </div>
          <div className="flip-line">
            when you had{" "}
            <span
              className={clsx(
                "italic font-medium",
                dark ? "text-cream/70" : "text-body/80",
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
