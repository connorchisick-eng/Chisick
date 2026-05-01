import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Arrow, Paw, ReceiptEdge } from "@/components/icons";

export const metadata: Metadata = {
  title: "404 — Tabby",
  description: "Looks like that table doesn't exist.",
};

const SUGGESTIONS = [
  { label: "Home", path: "/", caption: "the dining room" },
  { label: "How it works", path: "/#how-it-works", caption: "today's specials" },
  { label: "FAQ", path: "/#faq", caption: "questions answered" },
  { label: "Waitlist", path: "/waitlist", caption: "reserve a seat" },
];

export default function NotFound() {
  return (
    <main className="bg-surface relative overflow-hidden">
      {/* HERO */}
      <section className="relative pt-32 lg:pt-40 pb-20 lg:pb-28 overflow-hidden">
        {/* oversized question mark monogram */}
        <div
          aria-hidden
          className="legal-monogram font-grotesk italic font-bold leading-none select-none pointer-events-none"
        >
          ?
        </div>

        <div className="relative mx-auto max-w-[1440px] px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.28em] font-semibold text-body/45 flex-wrap">
                <span className="inline-block w-8 h-px bg-body/30" />
                <span>Error</span>
                <span className="text-accent">·</span>
                <span>Code 404</span>
                <span className="text-accent">·</span>
                <span>Page Not Found</span>
              </div>

              <h1
                className="mt-7 font-grotesk font-bold text-body leading-[0.92] tracking-[-0.035em]"
                style={{ fontSize: "clamp(3rem, 8.4vw, 8rem)" }}
              >
                Table{" "}
                <span className="relative inline-block italic font-medium text-accent whitespace-nowrap">
                  404
                  <svg
                    aria-hidden
                    viewBox="0 0 220 14"
                    preserveAspectRatio="none"
                    className="absolute left-0 right-0 -bottom-2 w-full h-[0.28em]"
                    fill="none"
                  >
                    <path
                      d="M 4 9 Q 50 1, 110 7 T 216 6"
                      stroke="rgb(255,124,97)"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                </span>
                <br />
                doesn&apos;t exist.
              </h1>

              <p className="mt-9 max-w-[560px] text-[1.05rem] md:text-[1.14rem] text-body/70 leading-[1.62]">
                We checked the reservation book.{" "}
                <span className="text-body font-medium">Either the link broke,</span>{" "}
                or the page got pushed back to the kitchen. Either way — here&apos;s the way back to the dining room.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center max-w-[480px]">
                <Link
                  href="/"
                  className="btn-primary justify-center whitespace-nowrap !text-[1rem] !py-[1.05rem] !px-[1.7rem]"
                >
                  Back to the dining room
                  <Arrow className="arrow" />
                </Link>
                <Link
                  href="/waitlist"
                  className="btn-ghost justify-center whitespace-nowrap"
                >
                  Reserve a seat
                </Link>
              </div>

              <div className="mt-11 flex flex-wrap items-center gap-x-8 gap-y-3 text-[0.72rem] uppercase tracking-[0.24em] font-semibold text-body/55">
                <span className="flex items-center gap-2">
                  <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-accent" />
                  Status
                  <span className="text-body">404 · Not Found</span>
                </span>
                <span className="flex items-center gap-2">
                  <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-body/30" />
                  Tab #
                  <span className="text-body">missing</span>
                </span>
                <span className="flex items-center gap-2">
                  <span aria-hidden className="w-1.5 h-1.5 rounded-full bg-body/30" />
                  Server
                  <span className="text-body">caught napping</span>
                </span>
              </div>
            </div>

            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <MissingMascot />
            </div>
          </div>
        </div>
      </section>

      {/* RECEIPT BAND */}
      <section className="relative bg-surface-alt overflow-hidden">
        <div className="text-surface relative -mt-px">
          <ReceiptEdge className="w-full h-6 -mb-px" />
        </div>

        <div className="mx-auto max-w-[760px] px-6 lg:px-10 py-16 lg:py-20">
          <div className="receipt-card relative bg-surface px-7 sm:px-12 py-12 sm:py-14 shadow-[0_30px_70px_-30px_rgba(14,14,14,0.28)]">
            {/* serrated top */}
            <div className="absolute top-0 left-0 right-0 text-surface-alt -translate-y-px rotate-180">
              <ReceiptEdge className="w-full h-3" />
            </div>

            <div className="flex items-end justify-between flex-wrap gap-4 pt-2">
              <div>
                <div className="eyebrow text-body/45">Tabby · 04/28/26</div>
                <h2 className="mt-3 font-grotesk italic font-bold text-body text-3xl md:text-4xl tracking-[-0.02em] leading-[1.05]">
                  You may have meant —
                </h2>
              </div>
              <div className="text-right">
                <div className="text-[0.62rem] uppercase tracking-[0.32em] font-bold text-body/45">
                  Tab #
                </div>
                <div className="font-grotesk italic font-bold text-accent text-[2rem] leading-none mt-1">
                  404
                </div>
              </div>
            </div>

            <div className="mt-7 border-t border-dashed border-line/30" />

            <ul className="mt-2 divide-y divide-line/10">
              {SUGGESTIONS.map((s, i) => (
                <li key={s.path}>
                  <Link
                    href={s.path}
                    className="suggestion-row group flex items-center justify-between gap-4 py-5"
                  >
                    <span className="flex items-baseline gap-4 sm:gap-5 min-w-0">
                      <span className="font-grotesk font-bold text-[0.78rem] tracking-[0.2em] text-body/35 group-hover:text-accent transition-colors flex-shrink-0">
                        {(i + 1).toString().padStart(2, "0")}
                      </span>
                      <span className="flex flex-col min-w-0">
                        <span className="font-grotesk text-body text-lg md:text-xl tracking-[-0.01em] leading-tight group-hover:text-accent transition-colors truncate">
                          {s.label}
                        </span>
                        <span className="italic text-body/50 text-[0.88rem] truncate">
                          {s.caption}
                        </span>
                      </span>
                    </span>
                    <span className="flex items-center gap-3 text-body/40 group-hover:text-accent transition-colors flex-shrink-0">
                      <span className="hidden sm:inline font-grotesk italic text-[0.92rem] tracking-tight">
                        recommended
                      </span>
                      <span className="suggestion-arrow inline-flex items-center justify-center w-9 h-9 rounded-full border border-line/15 text-body group-hover:bg-accent group-hover:text-white group-hover:border-accent transition-all">
                        <Arrow width={14} height={10} />
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-2 border-t border-dashed border-line/30" />

            <div className="mt-7 flex items-end justify-between flex-wrap gap-4">
              <div>
                <div className="eyebrow text-body/45">Total due</div>
                <div className="mt-2 font-grotesk italic font-bold text-body text-2xl md:text-3xl leading-tight">
                  $0.00 ·{" "}
                  <span className="text-accent">come back soon</span>
                </div>
              </div>
              <div className="font-grotesk italic font-medium text-body/55 text-sm">
                Thanks for stopping by ✿
              </div>
            </div>

            {/* serrated bottom */}
            <div className="absolute bottom-0 left-0 right-0 text-surface-alt translate-y-px">
              <ReceiptEdge className="w-full h-3" />
            </div>
          </div>

          {/* paw trail */}
          <div className="mt-10 flex items-center justify-center gap-2 text-accent/70">
            {Array.from({ length: 7 }).map((_, i) => (
              <span
                key={i}
                aria-hidden
                style={{
                  transform: `rotate(${i % 2 === 0 ? -10 : 14}deg) translateY(${
                    i % 2 === 0 ? "0" : "-3px"
                  })`,
                  opacity: 0.18 + i * 0.1,
                }}
              >
                <Paw size={20} />
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* OUTRO BAND */}
      <section
        data-nav-invert
        className="relative bg-ink text-cream overflow-hidden"
      >
        <div className="noise" />
        <div className="relative border-b border-white/5 overflow-hidden py-3">
          <div className="flex animate-marquee whitespace-nowrap">
            {Array.from({ length: 2 }).map((_, rep) => (
              <div key={rep} className="flex items-center gap-12 pr-12 shrink-0">
                {Array.from({ length: 14 }).map((_, i) => (
                  <span
                    key={`${rep}-${i}`}
                    className="font-grotesk italic font-medium text-cream/35 tracking-[-0.02em] flex items-center gap-12"
                    style={{ fontSize: "0.95rem" }}
                  >
                    <span>404 · the cat ate the page</span>
                    <span aria-hidden className="text-accent/60 not-italic">
                      ✶
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="relative mx-auto max-w-[1440px] px-6 lg:px-10 py-16 lg:py-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.28em] font-semibold text-cream/45">
                <span className="inline-block w-8 h-px bg-cream/25" />
                <span>Still lost</span>
              </div>
              <h2
                className="mt-5 font-grotesk font-bold text-cream leading-[0.96] tracking-[-0.025em]"
                style={{ fontSize: "clamp(2.25rem, 5vw, 4.5rem)" }}
              >
                Can&apos;t find what you&apos;re looking{" "}
                <span className="italic text-accent">for?</span>
              </h2>
              <p className="mt-6 max-w-md text-cream/65 leading-[1.55] text-[1.04rem]">
                Tap{" "}
                <span className="text-cream font-semibold">Ask Tabby</span>{" "}
                in the corner — our AI knows the menu by heart and can point
                you to the right table.
              </p>
            </div>
            <div className="lg:col-span-5 flex lg:justify-end">
              <Link href="/" className="legal-back-stamp group">
                <span className="legal-back-stamp-arrow">←</span>
                <span className="flex flex-col leading-none">
                  <span className="text-[0.6rem] uppercase tracking-[0.28em] text-cream/55 font-semibold">
                    Back to
                  </span>
                  <span className="font-grotesk italic font-bold text-cream text-[1.45rem] mt-1.5">
                    tabby.
                  </span>
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function MissingMascot() {
  return (
    <div className="relative" style={{ width: "min(420px, 88vw)" }}>
      {/* Halo behind the mascot */}
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{
          background:
            "radial-gradient(closest-side, rgba(255,124,97,0.16), transparent 72%)",
          transform: "translate(6%, 8%)",
        }}
      />

      {/* The mascot — tilted slightly */}
      <div className="relative" style={{ transform: "rotate(-3deg)" }}>
        <Image
          src="/cat-mascot.webp"
          alt="Tabby mascot holding a 404 receipt"
          width={444}
          height={508}
          priority
          className="block w-full h-auto select-none"
          draggable={false}
        />

        {/* "Tab 404 — not found" rubber stamp slapped diagonally
            across the receipt the mascot is holding. */}
        <div
          aria-hidden
          className="absolute"
          style={{
            top: "40%",
            left: "23%",
            width: "54%",
            transform: "rotate(-12deg)",
            transformOrigin: "center",
          }}
        >
          <NotFoundStamp />
        </div>
      </div>

      {/* Ground shadow */}
      <div
        aria-hidden
        className="mx-auto h-3 w-2/3 rounded-full mt-2"
        style={{
          background:
            "radial-gradient(closest-side, rgba(14,14,14,0.22), transparent 72%)",
          filter: "blur(2px)",
        }}
      />
    </div>
  );
}

function NotFoundStamp() {
  return (
    <svg
      viewBox="0 0 220 100"
      className="w-full h-auto drop-shadow-[0_6px_10px_rgba(255,124,97,0.45)]"
      aria-hidden
    >
      {/* faint cream backing so text reads against busy receipt */}
      <rect
        x="6"
        y="6"
        width="208"
        height="88"
        fill="rgba(255, 255, 255, 0.78)"
        rx="7"
      />
      {/* outer dashed frame */}
      <rect
        x="3"
        y="3"
        width="214"
        height="94"
        fill="none"
        stroke="rgb(255,124,97)"
        strokeWidth="1.6"
        strokeDasharray="3 3"
        rx="10"
      />
      {/* inner solid frame */}
      <rect
        x="9"
        y="9"
        width="202"
        height="82"
        fill="none"
        stroke="rgb(255,124,97)"
        strokeWidth="4"
        rx="6"
      />
      {/* TAB 404 */}
      <text
        x="110"
        y="49"
        textAnchor="middle"
        fill="rgb(255,124,97)"
        fontFamily="'Cabinet Grotesk', sans-serif"
        fontSize="30"
        fontWeight="800"
        letterSpacing="4.5"
      >
        TAB 404
      </text>
      {/* italic "not found" */}
      <text
        x="110"
        y="76"
        textAnchor="middle"
        fill="rgb(255,124,97)"
        fontFamily="'Cabinet Grotesk', sans-serif"
        fontStyle="italic"
        fontSize="18"
        fontWeight="600"
        letterSpacing="1"
      >
        not found
      </text>
    </svg>
  );
}
