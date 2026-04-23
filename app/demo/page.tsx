import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { InteractiveDemo } from "@/components/demo/InteractiveDemo";
import { ScrollToTop } from "@/components/ScrollToTop";

export const metadata: Metadata = {
  title: "Live demo — Tabby",
  description:
    "Run a four-person tab end-to-end — scan, claim, tip, and settle on a one-time virtual card.",
};

export default function DemoPage() {
  if (process.env.NEXT_PUBLIC_DEMO_ENABLED !== "1") notFound();

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

      {/* Single section — sits below the fixed 104px nav, then fills viewport */}
      <section
        className="relative mx-auto max-w-[1280px] px-6 lg:px-12"
        style={{ paddingTop: "112px", paddingBottom: "20px" }}
      >
        <InteractiveDemo />
      </section>
    </main>
  );
}
