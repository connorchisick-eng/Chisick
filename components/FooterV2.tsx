"use client";

import Link from "next/link";
import Image from "next/image";
import { LOGO } from "@/lib/images";
import { track } from "@/lib/analytics";

/**
 * FooterV2 — pared-down editorial signature.
 *
 * The CTA already lives in its own dedicated section above the footer, so
 * the footer is no longer a second close — it's a signature. One oversized
 * edge-bleeding `tabby.` wordmark sets the tone, a single thin row of
 * essential links sits underneath, and a small copyright/tagline row
 * closes the page.
 */
export function FooterV2() {
  return (
    <footer
      data-nav-invert
      data-analytics-section="footer_v2"
      className="relative bg-ink text-cream overflow-hidden"
    >
      <div className="noise" />

      {/* Single ambient accent glow, low and centered, anchors the wordmark. */}
      <div
        aria-hidden
        className="absolute left-1/2 -translate-x-1/2 bottom-[-30%] w-[900px] h-[900px] rounded-full pointer-events-none opacity-70"
        style={{
          background:
            "radial-gradient(circle, rgba(255,124,97,0.18), rgba(255,124,97,0) 60%)",
          filter: "blur(80px)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-[1560px] px-6 lg:px-12 pt-20 sm:pt-24 lg:pt-28">
        {/* Single thin link row — essentials only. Centered on mobile,
            spread between brand mark and links on lg+. */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border-t border-cream/10 pt-8">
          <div className="flex items-center gap-3">
            <span className="relative w-7 h-7 rounded-[30%] overflow-hidden bg-white grid place-items-center shadow-[0_2px_6px_rgba(0,0,0,0.25)]">
              <Image src={LOGO} alt="Tabby" width={18} height={18} />
            </span>
            <span className="font-grotesk italic text-cream/55 text-[0.85rem]">
              enjoy the meal — not the math.
            </span>
          </div>

          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center gap-x-6 gap-y-3 text-[0.85rem] text-cream/70"
          >
            <FootLink href="/waitlist" cta="waitlist">Waitlist</FootLink>
            <FootLink href="/#how-it-works" cta="how_it_works">How it works</FootLink>
            <FootLink href="/#faq" cta="faq">FAQ</FootLink>
            <FootLink href="/privacy" cta="privacy">Privacy</FootLink>
            <FootLink href="/terms" cta="terms">Terms</FootLink>
            <FootLink href="/security" cta="security">Security</FootLink>
          </nav>
        </div>
      </div>

      {/* Edge-bleeding `tabby.` signature — the only piece of bravado the
          footer earns. overflow-x-clip so descenders/period render below
          the wrapper while horizontal bleed clips cleanly. */}
      <div
        aria-hidden
        className="relative select-none pointer-events-none w-full overflow-x-clip mt-10 sm:mt-14 lg:mt-16 pb-[0.18em]"
      >
        <div
          className="font-grotesk italic font-bold leading-[0.95] tracking-[-0.06em] whitespace-nowrap text-center"
          style={{
            fontSize: "clamp(5rem, 28vw, 26rem)",
            backgroundImage:
              "linear-gradient(180deg, rgba(255,124,97,0.85) 0%, rgba(255,124,97,0.35) 55%, rgba(248,244,240,0.06) 100%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
            color: "transparent",
            filter: "drop-shadow(0 22px 60px rgba(255, 124, 97, 0.22))",
          }}
        >
          tabby.
        </div>
      </div>

      <div className="relative z-10 mx-auto max-w-[1560px] px-6 lg:px-12 pb-8 sm:pb-10">
        <div className="text-cream/45 text-[0.78rem] sm:text-[0.82rem] text-center sm:text-left">
          © 2026 Tabby. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

function FootLink({
  href,
  cta,
  children,
}: {
  href: string;
  cta: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={() =>
        track("cta_clicked", {
          cta_name: cta,
          location: "footer_v2",
          target_path: href,
        })
      }
      className="ul-link ul-link-light"
    >
      {children}
    </Link>
  );
}
