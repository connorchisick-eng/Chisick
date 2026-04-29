"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { LOGO } from "@/lib/images";
import { Arrow } from "./icons";
import { clsx } from "clsx";

const LINKS = [
  { href: "/#how-it-works", label: "How it works" },
  { href: "/#features", label: "Payments" },
  { href: "/#faq", label: "FAQ" },
];

export function Nav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [progress, setProgress] = useState(0);
  // onDark flips to true when a section marked `data-nav-invert` is sitting
  // under the nav. Drives the nav text / logo / pill from ink → cream so the
  // bar never disappears against a dark panel.
  const [onDark, setOnDark] = useState(false);

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

  // Observe dark sections. Whenever one sits across the nav line (top 120px
  // of the viewport), mark the nav as "on dark" so text flips to cream.
  useEffect(() => {
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>("[data-nav-invert]"),
    );
    if (!targets.length) {
      setOnDark(false);
      return;
    }
    const active = new Set<Element>();
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) active.add(e.target);
          else active.delete(e.target);
        });
        setOnDark(active.size > 0);
      },
      {
        // Observation line is a 1px band at the vertical center of the nav.
        // Section must cross this line to count as "under the nav."
        rootMargin: "-48px 0px -100% 0px",
        threshold: 0,
      },
    );
    targets.forEach((t) => io.observe(t));
    return () => io.disconnect();
  }, [pathname]);

  useEffect(() => {
    if (open) document.documentElement.style.overflow = "hidden";
    else document.documentElement.style.overflow = "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <motion.header
        initial={false}
        animate={{
          backgroundColor: scrolled
            ? onDark
              ? "rgba(14, 14, 14, 0.82)"
              : "rgb(var(--nav-bg) / 0.88)"
            : onDark
            ? "rgba(14, 14, 14, 0)"
            : "rgb(var(--nav-bg) / 0)",
          boxShadow: scrolled
            ? onDark
              ? "0 1px 0 rgba(255, 255, 255, 0.06)"
              : "0 1px 0 rgb(var(--line) / 0.08)"
            : "0 1px 0 rgb(var(--line) / 0)",
          backdropFilter: scrolled ? "blur(12px)" : "blur(0px)",
        }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
        data-on-dark={onDark ? "true" : "false"}
      >
        {/* Scroll progress — thin accent line that grows as you read */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-transparent pointer-events-none overflow-hidden">
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
            <Link href="/" className="flex items-center gap-3 group">
              <motion.span
                whileHover={{ rotate: 8, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="relative inline-flex items-center justify-center w-14 h-14 rounded-[30%] overflow-hidden bg-ink shadow-[0_4px_12px_rgba(14,14,14,0.18),inset_0_1px_0_rgba(255,255,255,0.08)]"
              >
                <Image
                  src={LOGO}
                  alt="Tabby"
                  width={56}
                  height={56}
                  priority
                  className="block w-full h-full object-contain"
                />
              </motion.span>
              {/* Masthead-style lockup: wordmark over a small meta label.
                  "Launching Q4 '26" reads as a publication-style subtitle
                  rather than a competing badge, so the ribbon stays calm. */}
              <span className="flex flex-col leading-none">
                <span
                  className={clsx(
                    "text-[1.4rem] font-bold tracking-[-0.02em] leading-none transition-colors duration-300",
                    onDark ? "text-cream" : "text-body",
                  )}
                >
                  tabby
                </span>
                <span
                  className={clsx(
                    "hidden sm:flex items-baseline gap-1.5 mt-1.5 text-[0.62rem] uppercase tracking-[0.2em] font-semibold leading-none transition-colors duration-300",
                    onDark ? "text-cream/70" : "text-body/60",
                  )}
                >
                  Launching
                  <span
                    className={clsx(
                      "font-grotesk italic font-bold tracking-[-0.01em] text-[0.78rem]",
                      onDark ? "text-cream" : "text-body",
                    )}
                  >
                    Q4 &apos;26
                  </span>
                </span>
              </span>
            </Link>

            <nav
              className={clsx(
                "hidden md:flex items-center gap-10 text-[0.95rem] transition-colors duration-300",
                onDark ? "text-cream/90" : "text-body/80",
              )}
            >
              {LINKS.map((l) => (
                <a key={l.href} href={l.href} className="ul-link font-medium">
                  {l.label}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-3">
              {/* Live Demo — standout external CTA */}
              <Link
                href="/demo"
                className={clsx(
                  "hidden md:inline-flex items-center gap-2 rounded-full text-sm font-semibold transition-all duration-300 border",
                  "px-4 py-2",
                  onDark
                    ? "bg-transparent border-cream/30 text-cream hover:bg-cream/10 hover:border-cream/60"
                    : "bg-transparent border-accent/40 text-accent hover:bg-accent/8 hover:border-accent",
                )}
              >
                Live Demo
                <Arrow className="arrow" />
              </Link>
              <div className="relative hidden sm:inline-flex">
                {/* Black Tabby cat peeking up from behind the CTA — head only
                    (the asset is taller than the visible window; overflow-hidden
                    crops the receipt below). Hidden on /waitlist where the cat
                    peeks from the receipt instead. */}
                {pathname !== "/waitlist" && (
                  <span
                    aria-hidden
                    className="pointer-events-none absolute left-1/2 -translate-x-1/2 overflow-hidden"
                    style={{
                      bottom: "calc(100% - 6px)",
                      width: "70px",
                      height: "38px",
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
                  className="btn-primary text-sm !py-2.5 !px-5 relative z-10"
                >
                  Join the Waitlist
                  <Arrow className="arrow" />
                </Link>
              </div>
              <button
                className="md:hidden relative z-[70] w-11 h-11 rounded-full grid place-items-center bg-ink text-white"
                aria-label="Menu"
                onClick={() => setOpen((o) => !o)}
              >
                <span className="relative block w-5 h-3.5">
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
      <div className={clsx("menu-overlay md:!hidden", open && "is-open")}>
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
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55, ease: [0.22, 1, 0.36, 1], duration: 0.6 }}
                className="mt-4"
              >
                <Link
                  href="/demo"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center gap-3 rounded-full border border-accent/50 bg-transparent text-accent px-6 py-3 text-lg font-bold"
                >
                  Live Demo
                  <span className="arrow">→</span>
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.65, duration: 0.5 }}
                className="mt-2"
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
