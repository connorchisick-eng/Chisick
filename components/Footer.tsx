import Link from "next/link";
import Image from "next/image";
import { LOGO } from "@/lib/images";

export function Footer() {
  return (
    <footer className="bg-ink text-cream relative overflow-hidden">
      <div className="noise" />

      <div className="relative mx-auto max-w-[1440px] px-6 lg:px-10 pt-10 lg:pt-12 pb-0 z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Brand + blurb (no duplicate CTA — the CTA section already has one) */}
          <div className="lg:col-span-5">
            <div className="flex items-center gap-2.5">
              <span className="relative w-10 h-10 rounded-[30%] overflow-hidden bg-white grid place-items-center shadow-[0_2px_6px_rgba(0,0,0,0.25),inset_0_1px_0_rgba(255,255,255,0.08)]">
                <Image src={LOGO} alt="Tabby" width={24} height={24} />
              </span>
              <span className="text-xl font-bold tracking-tight">tabby</span>
            </div>
            <p className="mt-5 max-w-sm text-cream/55 leading-relaxed text-[1.02rem]">
              Scan the receipt. Claim your items. Settle up before you leave
              the table.
            </p>
          </div>

          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-10 lg:justify-self-end">
            <div>
              <h4 className="text-xs uppercase tracking-[0.22em] text-cream/40 font-semibold">Product</h4>
              <ul className="mt-5 space-y-3 text-cream/85">
                <li><a href="/#how-it-works" className="ul-link ul-link-light">How it works</a></li>
                <li><a href="/#features" className="ul-link ul-link-light">Features</a></li>
                <li><a href="/#pricing" className="ul-link ul-link-light">Pricing</a></li>
                <li><a href="/#faq" className="ul-link ul-link-light">FAQ</a></li>
                <li><Link href="/waitlist" className="ul-link ul-link-light">Waitlist</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.22em] text-cream/40 font-semibold">
                Social
                <span className="ml-2 text-[0.56rem] text-accent tracking-[0.24em]">
                  SOON
                </span>
              </h4>
              <ul className="mt-5 space-y-3 text-cream/40">
                <li>Instagram</li>
                <li>TikTok</li>
                <li>Twitter / X</li>
                <li>LinkedIn</li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs uppercase tracking-[0.22em] text-cream/40 font-semibold">Legal</h4>
              <ul className="mt-5 space-y-3 text-cream/85">
                <li><Link href="/privacy" className="ul-link ul-link-light">Privacy</Link></li>
                <li><Link href="/terms" className="ul-link ul-link-light">Terms</Link></li>
                <li><Link href="/security" className="ul-link ul-link-light">Security</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Pawprint marquee ribbon — with breathing room above it */}
        <div className="relative border-y border-white/5 overflow-hidden py-3 -mx-6 lg:-mx-10 mt-16 lg:mt-20">
          <div className="flex animate-marquee whitespace-nowrap">
            {Array.from({ length: 2 }).map((_, rep) => (
              <div key={rep} className="flex items-center gap-10 pr-10 shrink-0">
                {Array.from({ length: 14 }).map((_, i) => (
                  <span
                    key={`${rep}-${i}`}
                    className="flex items-center gap-10 text-cream/30"
                  >
                    <span
                      className="font-grotesk italic font-medium text-cream/35 tracking-[-0.02em]"
                      style={{ fontSize: "0.95rem" }}
                    >
                      enjoy the meal · not the math
                    </span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Copyright strip */}
        <div className="py-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-sm text-cream/50">
          <span>© 2026 Tabby. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
