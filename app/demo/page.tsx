import type { Metadata } from "next";
import { InteractiveDemo } from "@/components/demo/InteractiveDemo";
import { ScrollToTop } from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: "Live demo — Tabby",
  description:
    "Run a four-person tab end-to-end — scan, claim, tip, and settle on a one-time virtual card.",
};

export default function DemoPage() {
  return (
    <main className="relative bg-surface-alt min-h-screen overflow-hidden">
      <ScrollToTop />

      <div
        className="absolute inset-x-0 top-0 h-[480px] pointer-events-none"
        aria-hidden
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, rgba(255,124,97,0.16), transparent 70%)",
        }}
      />

      {/* Demo takes the whole viewport — Nav/Footer hidden via SiteChrome.
          The "Back to tabby" pill lives in InteractiveDemo's compact top bar. */}
      <section
        className="relative mx-auto flex min-h-screen max-w-[1360px] flex-col px-4 pb-[7.5rem] pt-5 sm:px-6 md:px-10 lg:px-12 lg:pb-8 lg:pt-4 xl:px-8"
      >
        <InteractiveDemo />
      </section>
    </main>
  );
}
