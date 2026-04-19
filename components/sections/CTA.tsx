"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

export function CTA() {
  const ref = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (!reduced && glowRef.current) {
        gsap.to(glowRef.current, {
          rotate: 360,
          duration: 60,
          ease: "none",
          repeat: -1,
        });
      }
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={ref}
      className="relative bg-ink text-cream overflow-hidden flex flex-col items-center justify-start pt-10 lg:pt-16 pb-12 lg:pb-16"
    >
      <div className="noise" />
      <div
        ref={glowRef}
        className="absolute left-1/2 top-[42%] -translate-x-1/2 -translate-y-1/2 w-[1100px] h-[1100px] rounded-full pointer-events-none"
        style={{
          background:
            "conic-gradient(from 0deg, rgba(255,124,97,0.28), rgba(255,124,97,0) 35%, rgba(255,124,97,0.2) 65%, rgba(255,124,97,0) 100%)",
          filter: "blur(60px)",
        }}
      />
      <div className="relative mx-auto max-w-[1680px] px-6 lg:px-10 w-full flex flex-col items-center">
        {/* Giant gradient "tabby." wordmark — the visual anchor of the section */}
        <div
          aria-hidden
          className="relative select-none pointer-events-none w-full flex items-center justify-center overflow-visible"
        >
          <div
            className="font-grotesk italic font-bold leading-[1] tracking-[-0.05em] inline-block text-center px-[0.1em] pb-[0.15em]"
            style={{
              fontSize: "clamp(5rem, 18vw, 18rem)",
              backgroundImage:
                "linear-gradient(180deg, rgb(255, 124, 97) 0%, rgb(255, 150, 130) 55%, rgba(248, 244, 240, 0.35) 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
              color: "transparent",
              filter: "drop-shadow(0 14px 40px rgba(255, 124, 97, 0.28))",
            }}
          >
            tabby.
          </div>
        </div>

        {/* Signature mark — circular stamp with orbiting "EST · 2026" and a
            tilted italic "est. 2026" signature. Hand-crafted, not template. */}
        <div
          aria-hidden
          className="relative -mt-3 lg:-mt-12 flex items-center justify-center gap-6"
        >
          <span className="h-px flex-1 max-w-[120px] bg-cream/15" />

          <div className="relative flex items-center justify-center w-[118px] h-[118px] sm:w-[140px] sm:h-[140px]">
            {/* Rotating outer ring with repeating text */}
            <svg
              className="absolute inset-0 w-full h-full animate-stamp-spin"
              viewBox="0 0 120 120"
              fill="none"
              aria-hidden
            >
              <defs>
                <path
                  id="stamp-circle"
                  d="M 60, 60 m -50, 0 a 50,50 0 1,1 100,0 a 50,50 0 1,1 -100,0"
                />
              </defs>
              <circle
                cx="60"
                cy="60"
                r="54"
                stroke="rgba(255,124,97,0.35)"
                strokeWidth="0.6"
                strokeDasharray="2 3"
                fill="none"
              />
              <text
                fill="rgb(255,124,97)"
                style={{
                  fontFamily: "'Cabinet Grotesk', sans-serif",
                  fontSize: "8px",
                  fontWeight: 700,
                  letterSpacing: "0.32em",
                  textTransform: "uppercase",
                }}
              >
                <textPath href="#stamp-circle" startOffset="0">
                  Enjoy the meal · Not the math · Enjoy the meal · Not the math ·
                </textPath>
              </text>
            </svg>

            {/* Inner italic signature */}
            <div className="relative flex flex-col items-center -rotate-[8deg]">
              <span className="font-grotesk italic font-bold text-accent text-[1.05rem] sm:text-[1.25rem] leading-none tracking-[-0.02em]">
                est. 2026
              </span>
              <svg
                width="64"
                height="10"
                viewBox="0 0 64 10"
                fill="none"
                aria-hidden
                className="mt-1"
              >
                <path
                  d="M 2 6 Q 12 0, 24 5 T 50 4 Q 58 3, 62 7"
                  stroke="rgb(255,124,97)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  fill="none"
                />
              </svg>
            </div>
          </div>

          <span className="h-px flex-1 max-w-[120px] bg-cream/15" />
        </div>

        {/* Launching on iOS + Android — platform pills beneath the wordmark */}
        <div className="mt-6 lg:mt-8 relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
          <span className="text-[0.68rem] uppercase tracking-[0.3em] text-cream/45 font-semibold">
            Launching on
          </span>
          <div className="flex items-center gap-3">
            <PlatformPill label="iOS" icon={<AppleMark />} />
            <PlatformPill label="Android" icon={<AndroidMark />} />
          </div>
        </div>
      </div>
    </section>
  );
}

function PlatformPill({ label, icon }: { label: string; icon: React.ReactNode }) {
  return (
    <span className="group inline-flex items-center gap-2 rounded-full border border-cream/15 bg-white/[0.04] px-4 py-2 transition-colors hover:bg-white/[0.08] hover:border-cream/25">
      <span className="text-cream/90 flex items-center">{icon}</span>
      <span className="text-cream font-semibold text-sm tracking-[0.06em]">
        {label}
      </span>
    </span>
  );
}

function AppleMark() {
  return (
    <svg
      width="16"
      height="16"
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
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.523 15.34a1.122 1.122 0 1 1 0-2.244 1.122 1.122 0 0 1 0 2.244Zm-11.046 0a1.122 1.122 0 1 1 0-2.244 1.122 1.122 0 0 1 0 2.244Zm11.45-6.18 1.994-3.454a.415.415 0 1 0-.72-.414l-2.02 3.498A12.588 12.588 0 0 0 12 7.5c-1.876 0-3.652.398-5.181 1.108L4.8 5.292a.415.415 0 1 0-.72.414L6.073 9.16C2.64 11.032.305 14.52 0 18.5h24c-.305-3.98-2.64-7.468-6.073-9.34Z" />
    </svg>
  );
}
