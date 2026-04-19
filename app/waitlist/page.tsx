import type { Metadata } from "next";
import { WaitlistReceipt } from "@/components/WaitlistReceipt";
import { ScrollToTop } from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: "Join the Waitlist — Tabby",
  description:
    "Be the first to try Tabby when we launch. Split the bill in seconds, not friendships.",
};

export default function WaitlistPage() {
  return (
    <main className="relative min-h-screen bg-cream overflow-hidden flex flex-col">
      <ScrollToTop />
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            "radial-gradient(65% 55% at 50% 0%, rgba(255,124,97,0.2), transparent 70%)",
        }}
      />
      <section className="relative mx-auto max-w-[840px] w-full px-6 lg:px-10 py-20 lg:py-24 text-center flex-1 flex flex-col items-center justify-center">
        <WaitlistReceipt />
        <p className="mt-10 text-xs uppercase tracking-[0.22em] text-ink/40 font-semibold">
          No spam. One text when we launch.
        </p>
      </section>
    </main>
  );
}
