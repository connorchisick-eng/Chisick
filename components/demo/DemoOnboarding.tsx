"use client";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Arrow } from "@/components/icons";

const STORAGE_KEY = "tabby:demo-seen";

export type OnboardingHandle = {
  open: () => void;
};

type Props = {
  /** When provided, the parent owns the open state. Otherwise the component
   *  decides on first mount based on localStorage. */
  forceOpen?: boolean;
  onClose?: () => void;
};

export function DemoOnboarding({ forceOpen, onClose }: Props) {
  // Local state — null until we know what localStorage says (avoids SSR flash)
  const [open, setOpen] = useState<boolean | null>(null);

  useEffect(() => {
    if (forceOpen !== undefined) {
      setOpen(forceOpen);
      return;
    }
    try {
      const seen = localStorage.getItem(STORAGE_KEY) === "1";
      setOpen(!seen);
    } catch {
      setOpen(false);
    }
  }, [forceOpen]);

  // Lock body scroll while overlay is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Escape closes
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") dismiss();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function dismiss() {
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      // ignore
    }
    setOpen(false);
    onClose?.();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="demo-onboarding"
          role="dialog"
          aria-modal="true"
          aria-labelledby="demo-onboarding-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[120] flex items-center justify-center px-4"
          style={{
            backgroundColor: "rgba(14,14,14,0.78)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
          }}
          onClick={dismiss}
        >
          <motion.div
            initial={{ scale: 0.94, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 6 }}
            transition={{ type: "spring", stiffness: 240, damping: 28 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-[520px] bg-surface rounded-[22px] shadow-[0_60px_120px_-30px_rgba(14,14,14,0.6)] overflow-hidden"
          >
            {/* Decorative top band — the same gradient halo language as
                the rest of the marketing site */}
            <div
              aria-hidden
              className="absolute inset-x-0 top-0 h-32 pointer-events-none"
              style={{
                background:
                  "radial-gradient(60% 100% at 50% 0%, rgba(255,124,97,0.22), transparent 70%)",
              }}
            />

            <div className="relative px-7 sm:px-10 pt-10 pb-7">
              {/* Eyebrow */}
              <div className="flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.28em] font-semibold text-body/45">
                <span aria-hidden className="inline-block w-7 h-px bg-body/30" />
                <span>Tabby</span>
                <span className="text-accent">·</span>
                <span>Live Demo</span>
              </div>

              {/* Title */}
              <h2
                id="demo-onboarding-title"
                className="mt-6 font-grotesk font-bold text-body leading-[0.98] tracking-[-0.025em]"
                style={{ fontSize: "clamp(1.9rem, 4vw, 2.6rem)" }}
              >
                Welcome to the{" "}
                <span className="italic font-medium text-accent">demo.</span>
              </h2>

              {/* Subhead */}
              <p className="mt-5 text-body/72 text-[1rem] leading-[1.6] max-w-[440px]">
                Walk through a real four-person tab end-to-end —{" "}
                <span className="text-body font-medium">scan the receipt,</span>{" "}
                claim what you ate, and settle on a one-time virtual card.
                Click the dots at the top to jump between scenes any time.
              </p>

              {/* Mobile heads-up — the consolidated mobile warning */}
              <div className="mt-6 flex items-start gap-3 rounded-xl border border-accent/25 bg-accent/[0.06] px-4 py-3">
                <span
                  aria-hidden
                  className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0"
                />
                <p className="text-body/75 text-[0.88rem] leading-[1.5]">
                  <span className="font-semibold text-body">
                    Best on desktop.
                  </span>{" "}
                  Mobile works, but the phone-in-phone gets snug — try a wider
                  screen if you can.
                </p>
              </div>

              {/* CTAs */}
              <div className="mt-8 flex flex-col-reverse sm:flex-row sm:items-center gap-3 sm:gap-5">
                <button
                  type="button"
                  onClick={dismiss}
                  className="text-[0.85rem] text-body/55 hover:text-body transition-colors underline-offset-4 hover:underline self-start sm:self-auto"
                >
                  Skip the intro
                </button>
                <button
                  type="button"
                  onClick={dismiss}
                  className="btn-primary justify-center !text-[0.95rem] !py-[0.85rem] !px-[1.5rem] sm:ml-auto"
                >
                  Start the demo
                  <Arrow className="arrow" />
                </button>
              </div>
            </div>

            {/* Hint strip at the bottom — what to do once dismissed */}
            <div className="relative border-t border-line/10 bg-surface-alt px-7 sm:px-10 py-4 flex items-center justify-between flex-wrap gap-3">
              <span className="text-[0.66rem] uppercase tracking-[0.26em] font-semibold text-body/45">
                15 scenes · 2 minutes
              </span>
              <span className="text-[0.66rem] uppercase tracking-[0.26em] font-semibold text-body/45">
                Press <kbd className="px-1.5 py-0.5 rounded bg-body/8 text-body/70 font-grotesk normal-case tracking-normal text-[0.7rem]">Esc</kbd>{" "}
                to dismiss
              </span>
            </div>

            {/* Close X */}
            <button
              type="button"
              onClick={dismiss}
              aria-label="Close intro"
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-body/8 hover:bg-body/15 text-body flex items-center justify-center transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path
                  d="M2 2 L10 10 M10 2 L2 10"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
