"use client";
import Link from "next/link";
import { Arrow } from "@/components/icons";

type Props = {
  /** Hide the cluster on certain scenes (e.g. `replay` already has prominent CTAs). */
  visible: boolean;
  /** Jump to the final recap scene. */
  onSkipToRecap: () => void;
};

/**
 * Persistent CTAs anchored bottom-right of the demo viewport.
 * - "Skip to recap" gives a fast exit to users who don't want to step through
 *   every scene.
 * - "Join the waitlist" is the primary marketing conversion — present on
 *   every scene except `replay` (which already shows it inline).
 */
export function FloatingCtas({ visible, onSkipToRecap }: Props) {
  if (!visible) return null;
  return (
    <div
      className="fixed z-50 flex items-center gap-2.5 sm:gap-3 pointer-events-none"
      style={{
        right: "max(env(safe-area-inset-right), 1.25rem)",
        bottom: "max(env(safe-area-inset-bottom), 1.25rem)",
      }}
    >
      <button
        type="button"
        onClick={onSkipToRecap}
        className="pointer-events-auto hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-white/90 backdrop-blur border border-line/12 text-body/65 hover:text-body hover:border-accent/40 hover:bg-white transition-colors text-[0.7rem] font-semibold uppercase tracking-[0.2em] shadow-[0_8px_24px_-12px_rgba(14,14,14,0.18)]"
      >
        Skip to recap
        <span aria-hidden className="text-accent">↗</span>
      </button>
      <Link
        href="/waitlist"
        className="pointer-events-auto btn-primary !text-[0.82rem] !py-[0.7rem] !px-[1.15rem] shadow-[0_18px_40px_-12px_rgba(255,124,97,0.55)]"
      >
        Join the waitlist
        <Arrow className="arrow" />
      </Link>
    </div>
  );
}
