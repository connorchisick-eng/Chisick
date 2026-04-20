"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LOGO } from "@/lib/images";
import { Arrow } from "./icons";
import { ThemeToggle } from "./ThemeToggle";
import { track } from "@/lib/analytics";
import { clsx } from "clsx";

const LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/#pricing", label: "Pricing" },
  { href: "/#faq", label: "FAQ" },
];

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 40);
      const max =
        document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, Math.max(0, y / max)) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (open) document.documentElement.style.overflow = "hidden";
    else document.documentElement.style.overflow = "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  // Close the mobile menu on Escape for keyboard users.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <motion.header
        role="banner"
        initial={false}
        animate={{
          // Adaptive header bg driven by the --nav-bg RGB tuple so it flips
          // cleanly with the theme without re-running framer on every swap.
          backgroundColor: scrolled
            ? "rgba(var(--nav-bg), 0.92)"
            : "rgba(var(--nav-bg), 0)",
          boxShadow: scrolled
            ? "0 1px 0 var(--line)"
            : "0 1px 0 rgba(0,0,0,0)",
          backdropFilter: scrolled ? "blur(12px)" : "blur(0px)",
        }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        {/* Scroll progress — thin accent line */}
        <div
          className="absolute top-0 left-0 right-0 h-[2px] bg-transparent pointer-events-none overflow-hidden"
          role="progressbar"
          aria-label="Page scroll"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress * 100)}
        >
          <div
            className="h-full bg-accent origin-left"
            style={{
              transform: `scaleX(${progress})`,
              transition: "transform 0.12s linear",
            }}
          />
        </div>
        <div className="mx-auto max-w-[1440px] px-6 lg:px-10">
          <div className="flex items-center justify-between h-[104px]">
            <Link
              href="/"
              className="flex items-center gap-3 group"
              aria-label="Tabby — home"
              onClick={() => track("nav_logo_clicked")}
            >
              <motion.span
                whileHover={{ rotate: 8, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="relative inline-flex items-center justify-center w-14 h-14 rounded-[30%] overflow-hidden bg-ink shadow-[0_4px_12px_rgba(14,14,14,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]"
                aria-hidden
              >
                <Image
                  src={LOGO}
                  alt=""
                  width={56}
                  height={56}
                  priority
                  className="block w-full h-full object-contain"
                />
              </motion.span>
              {/* Masthead-style lockup */}
              <span className="flex flex-col leading-none">
                <span className="text-[1.4rem] font-bold tracking-[-0.02em] text-fg leading-none">
                  tabby
                </span>
                <span className="hidden sm:flex items-baseline gap-1.5 mt-1.5 text-[0.62rem] uppercase tracking-[0.2em] font-semibold text-fg/60 leading-none">
                  Launching
                  <span className="font-grotesk italic font-bold text-fg tracking-[-0.01em] text-[0.78rem]">
                    Q4 &apos;26
                  </span>
                </span>
              </span>
            </Link>

            <nav
              className="hidden md:flex items-center gap-10 text-[0.95rem] text-fg/80"
              aria-label="Primary"
            >
              {LINKS.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  className="ul-link font-medium"
                  onClick={() =>
                    track("nav_link_clicked", {
                      section: l.href.replace(/^\/?#/, ""),
                      surface: "desktop",
                    })
                  }
                >
                  {l.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <ThemeToggle />
              <div className="relative hidden sm:inline-flex">
                {/* Black Tabby cat peeking up from behind the CTA */}
                {pathname !== "/waitlist" && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 -translate-x-1/2 overflow-hidden"
                    style={{
                      bottom: "calc(100% - 6px)",
                      width: "70px",
                      height: "44px",
                      zIndex: 1,
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
                )}
                <Link
                  href="/waitlist"
                  onClick={() =>
                    track("cta_join_waitlist_clicked", { surface: "nav" })
                  }
                  className="btn-primary text-sm py-2.5! px-5! relative z-10"
                >
                  Join the Waitlist
                  <Arrow className="arrow" />
                </Link>
              </div>
              <button
                className="md:hidden relative z-70 w-11 h-11 rounded-full grid place-items-center bg-ink text-white"
                aria-label={open ? "Close menu" : "Open menu"}
                aria-expanded={open}
                aria-controls="mobile-menu"
                onClick={() => setOpen((o) => !o)}
              >
                <span className="relative block w-5 h-3.5" aria-hidden>
                  <span
                    className={clsx(
                      "absolute left-0 right-0 h-[1.6px] bg-white transition-transform duration-500",
                      open ? "top-1.5 rotate-45" : "top-0",
                    )}
                  />
                  <span
                    className={clsx(
                      "absolute left-0 right-0 h-[1.6px] bg-white transition-opacity duration-300",
                      open ? "top-1.5 opacity-0" : "top-1.5",
                    )}
                  />
                  <span
                    className={clsx(
                      "absolute left-0 right-0 h-[1.6px] bg-white transition-transform duration-500",
                      open ? "top-1.5 -rotate-45" : "top-3",
                    )}
                  />
                </span>
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Full-screen overlay menu (mobile) */}
      <div
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Main navigation"
        aria-hidden={!open}
        className={clsx("menu-overlay md:hidden!", open && "is-open")}
      >
        <AnimatePresence>
          {open && (
            <motion.div
              className="w-full px-8 flex flex-col items-center text-center gap-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ delay: 0.2, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              {LINKS.map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 + i * 0.08, ease: [0.22, 1, 0.36, 1], duration: 0.6 }}
                  className="block w-full text-center text-5xl font-bold tracking-tight text-white hover:text-accent transition-colors duration-300"
                >
                  {l.label}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="mt-6"
              >
                <Link
                  href="/waitlist"
                  onClick={() => setOpen(false)}
                  className="btn-primary"
                >
                  Join the Waitlist
                  <span className="arrow">→</span>
                </Link>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
