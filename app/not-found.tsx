import type { Metadata } from "next";
import Link from "next/link";
import { Arrow, Paw, ReceiptEdge, Squiggle } from "@/components/icons";

export const metadata: Metadata = {
  title: "Page not found",
  description:
    "This page skipped out on the check. It isn't on the Tabby menu — head back to the home page or join the waitlist.",
  robots: { index: false, follow: false },
};

/**
 * Global 404. Styled to match Tabby's receipt-and-mascot language:
 * hero-scale "404", on-brand copy, and a torn-paper receipt card with
 * the missing line item struck through. Server-rendered; no JS needed.
 */
export default function NotFound() {
  return (
    <main className="relative min-h-screen bg-canvas overflow-hidden flex flex-col">
      {/* Warm radial glow — mirrors the waitlist page */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(255,124,97,0.18), transparent 70%)",
        }}
      />
      <div aria-hidden className="noise" />

      <section className="relative flex-1 mx-auto w-full max-w-[1200px] px-6 lg:px-10 pt-32 lg:pt-40 pb-20">
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-14 lg:gap-20 items-center">
          {/* ── Copy column ──────────────────────────────────────────── */}
          <div>
            <div className="eyebrow">Error 404 · Menu not found</div>

            <h1
              className="mt-5 font-grotesk font-semibold text-fg tracking-[-0.04em] leading-[0.86]"
              style={{ fontSize: "clamp(6rem, 18vw, 14rem)" }}
            >
              <span className="relative inline-block">
                4
                {/* Stamp-style dot under the 4 */}
                <span
                  aria-hidden
                  className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-accent"
                />
              </span>
              <span className="text-accent">0</span>
              <span>4</span>
            </h1>

            <h2 className="mt-8 font-grotesk font-medium text-fg tracking-[-0.02em] leading-[1.04] text-3xl md:text-5xl max-w-[18ch]">
              This page{" "}
              <span className="marker-word">
                skipped out
                <Squiggle className="squiggle drawn" />
              </span>{" "}
              on the check.
            </h2>

            <p className="mt-6 max-w-[46ch] text-fg/65 text-lg leading-[1.55]">
              The link you followed isn&apos;t on the menu — maybe the cat
              knocked it off the table. Head back to the home page, or hop on
              the waitlist so you don&apos;t miss launch.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Link href="/" className="btn-primary">
                <span>Back to home</span>
                <Arrow className="arrow" />
              </Link>
              <Link href="/waitlist" className="btn-ghost">
                Join the waitlist
              </Link>
            </div>

            {/* Paw-print trail, toward the receipt card */}
            <div
              aria-hidden
              className="mt-12 hidden lg:flex items-center gap-5 text-fg/30"
            >
              <Paw size={18} className="-rotate-12" />
              <Paw size={22} className="rotate-6" />
              <Paw size={18} className="-rotate-3" />
              <Paw size={24} className="rotate-12" />
              <span className="text-xs uppercase tracking-[0.22em] font-semibold text-fg/40">
                last seen heading this way
              </span>
            </div>
          </div>

          {/* ── Receipt card ─────────────────────────────────────────── */}
          <div className="relative mx-auto w-full max-w-[420px]">
            {/* Same peeking mascot used on the waitlist receipt / nav —
                PNG with the receipt baked in, cropped so only the ears
                and top of the head pop up above the card's top edge.
                Lives OUTSIDE the card so the card can still clip its
                rounded corners / torn edges with overflow-hidden. */}
            <span
              aria-hidden
              className="pointer-events-none absolute overflow-hidden"
              style={{
                bottom: "calc(100% - 14px)",
                left: "58%",
                transform: "translateX(-50%)",
                width: "70px",
                height: "44px",
              }}
            >
              <span
                className="block absolute left-0 top-0 w-full animate-cat-peek"
                style={{
                  backgroundImage: "url('/cat-mascot.png')",
                  backgroundSize: "100% auto",
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "center top",
                  height: "80px",
                }}
              />
            </span>

            <div className="relative bg-card border border-line rounded-[20px] overflow-hidden shadow-[0_40px_80px_-30px_rgba(14,14,14,0.35)] rotate-[-1.5deg]">
              <ReceiptEdge className="w-full h-5 text-card -mt-px rotate-180" />

              <div className="px-7 pt-4 pb-8 font-grotesk">
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-[0.65rem] uppercase tracking-[0.24em] font-bold text-fg/50">
                      Tabby · Table 404
                    </div>
                    <div className="mt-1 text-xl font-bold text-fg tracking-[-0.01em]">
                      The Missing Page
                    </div>
                  </div>
                  <div className="text-[0.65rem] uppercase tracking-[0.22em] text-fg/40">
                    rcpt&nbsp;#404
                  </div>
                </div>

                <div className="mt-5 border-t border-dashed border-line" />

                <ul className="mt-5 space-y-3 text-[0.95rem]">
                  <li className="flex items-baseline justify-between text-fg/75">
                    <span>Home page</span>
                    <span className="text-fg/40">
                      <span className="mx-2">·····</span>found
                    </span>
                  </li>
                  <li className="flex items-baseline justify-between text-fg/75">
                    <span>Waitlist</span>
                    <span className="text-fg/40">
                      <span className="mx-2">·····</span>found
                    </span>
                  </li>
                  <li className="flex items-baseline justify-between">
                    <span className="line-through decoration-2 decoration-accent text-fg/55">
                      The page you wanted
                    </span>
                    <span className="font-semibold text-accent">missing</span>
                  </li>
                </ul>

                <div className="mt-5 border-t border-dashed border-line" />

                <div className="mt-5 flex items-baseline justify-between">
                  <span className="text-xs uppercase tracking-[0.2em] font-bold text-fg/50">
                    Total owed
                  </span>
                  <span className="text-3xl font-bold text-fg tracking-[-0.02em]">
                    $0.00
                  </span>
                </div>

                <div className="mt-6 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-accent/30 bg-accent/10">
                  <span
                    aria-hidden
                    className="w-1.5 h-1.5 rounded-full bg-accent"
                  />
                  <span className="text-[0.72rem] uppercase tracking-[0.22em] font-semibold text-accent">
                    the cat ate it
                  </span>
                </div>
              </div>

              <ReceiptEdge className="w-full h-5 text-card -mb-px" />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
