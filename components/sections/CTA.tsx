"use client";
import Link from "next/link";
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
      data-nav-invert
      className="relative bg-ink text-cream overflow-hidden flex flex-col items-center justify-start pt-24 lg:pt-32 pb-16 lg:pb-20"
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
        {/* Be the first in line — editorial headline leading into the wordmark */}
        <div className="relative z-10 text-center mx-auto mb-10 lg:mb-14 flex flex-col items-center">
          <h2 className="font-grotesk font-bold text-cream leading-[0.96] tracking-[-0.025em]" style={{ fontSize: "clamp(2.5rem, 6vw, 6rem)" }}>
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
            </span>{" "}
            for
          </h2>
        </div>

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

        {/* Interactive stamp — the signature mark IS the CTA. */}
        <div className="relative mt-4 lg:mt-6 flex items-center justify-center gap-8">
          <span aria-hidden className="h-px flex-1 max-w-[140px] bg-cream/15" />

          <div className="relative flex items-center justify-center">
            <Link
              href="/waitlist"
              aria-label="Join the waitlist"
              className="group relative flex items-center justify-center w-[150px] h-[150px] sm:w-[180px] sm:h-[180px] rounded-full transition-transform duration-500 hover:scale-[1.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-ink animate-stamp-pulse"
            >
              {/* Rotating outer ring with repeating CTA text */}
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
                  stroke="rgba(255,124,97,0.4)"
                  strokeWidth="0.7"
                  strokeDasharray="2 3"
                  fill="none"
                />
                <text
                  fill="rgb(255,124,97)"
                  style={{
                    fontFamily: "'Cabinet Grotesk', sans-serif",
                    fontSize: "7.4px",
                    fontWeight: 700,
                    letterSpacing: "0.32em",
                    textTransform: "uppercase",
                  }}
                >
                  <textPath href="#stamp-circle" startOffset="0">
                    Join the waitlist · tap here · Join the waitlist · tap here ·
                  </textPath>
                </text>
              </svg>

              {/* Inner signature — italic "Join the" / "waitlist." */}
              <div className="relative flex flex-col items-center -rotate-[6deg] transition-transform duration-500 group-hover:rotate-0">
                <span className="font-grotesk italic font-bold text-cream/70 text-[0.6rem] sm:text-[0.7rem] leading-none tracking-[0.22em] uppercase mb-1">
                  Join the
                </span>
                <span className="font-grotesk italic font-bold text-accent text-[1.35rem] sm:text-[1.6rem] leading-none tracking-[-0.02em]">
                  waitlist.
                </span>
                <svg
                  width="68"
                  height="10"
                  viewBox="0 0 68 10"
                  fill="none"
                  aria-hidden
                  className="mt-1.5"
                >
                  <path
                    d="M 2 6 Q 14 0, 28 5 T 54 4 Q 62 3, 66 7"
                    stroke="rgb(255,124,97)"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    fill="none"
                  />
                </svg>
              </div>
            </Link>
          </div>

          <span aria-hidden className="h-px flex-1 max-w-[140px] bg-cream/15" />
        </div>

        {/* Launching on iOS + Android — platform pills beneath the wordmark */}
        <div className="mt-20 lg:mt-28 relative z-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-5">
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
