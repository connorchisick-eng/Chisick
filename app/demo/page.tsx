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
          The "Back to tabby" pill lives in InteractiveDemo's top bar so it
          sits in-row with the narrative title. */}
      <section
        className="relative mx-auto max-w-[1280px] px-6 md:px-16"
        style={{ paddingTop: "32px", paddingBottom: "20px" }}
      >
        <InteractiveDemo />
      </section>
    </main>
  );
}
