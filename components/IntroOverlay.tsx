"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export function IntroOverlay() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (sessionStorage.getItem("tabby-intro-shown") === "1") {
      el.style.display = "none";
      return;
    }
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.style.display = "none";
      sessionStorage.setItem("tabby-intro-shown", "1");
      return;
    }

    document.documentElement.style.overflow = "hidden";

    const tl = gsap.timeline({
      defaults: { ease: "expo.out" },
      onComplete: () => {
        document.documentElement.style.overflow = "";
        sessionStorage.setItem("tabby-intro-shown", "1");
        el.remove();
      },
    });

    gsap.set(".intro-wordmark .word > span", { yPercent: 112 });
    gsap.set(".intro-tag", { y: 20, autoAlpha: 0 });
    gsap.set(".intro-rule", { scaleX: 0 });
    gsap.set(".intro-meta > *", { y: 14, autoAlpha: 0 });

    tl.to(".intro-wordmark .word > span", {
      yPercent: 0,
      duration: 0.95,
      stagger: 0.04,
    });
    tl.to(".intro-rule", { scaleX: 1, duration: 0.8 }, "<0.1");
    tl.to(".intro-tag", { y: 0, autoAlpha: 1, duration: 0.7 }, "<0.2");
    tl.to(
      ".intro-meta > *",
      { y: 0, autoAlpha: 1, duration: 0.55, stagger: 0.05 },
      "<0.1",
    );
    tl.to(
      el,
      {
        yPercent: -100,
        duration: 1.1,
        ease: "expo.inOut",
        delay: 0.45,
      },
      ">",
    );
  }, []);

  return (
    <div
      ref={ref}
      className="fixed inset-0 z-[100] bg-accent text-white overflow-hidden"
      aria-hidden
    >
      <div className="noise opacity-20" />
      <div className="relative h-full w-full flex flex-col justify-between px-6 lg:px-10 py-6 lg:py-10">
        <div className="flex items-start justify-between text-[0.72rem] uppercase tracking-[0.28em] font-semibold">
          <span className="intro-meta flex gap-8">
            <span>Tabby</span>
            <span className="hidden sm:inline">MMXXVI</span>
          </span>
          <span className="intro-meta hidden sm:flex gap-8">
            <span>est. 2026</span>
            <span>No venmo</span>
          </span>
        </div>

        <div className="text-center">
          <div className="intro-wordmark font-grotesk font-bold tracking-[-0.04em] leading-none text-[clamp(5rem,18vw,18rem)]">
            <span className="word">
              <span>tabby.</span>
            </span>
          </div>
          <div className="intro-rule mx-auto mt-10 h-[2px] w-48 bg-white origin-left" />
          <p className="intro-tag mt-6 text-sm md:text-base tracking-[0.22em] uppercase font-semibold">
            Enjoy the meal · not the math
          </p>
        </div>

        <div className="flex items-end justify-between">
          <span className="intro-meta text-[0.72rem] uppercase tracking-[0.28em] font-semibold">
            Bill-splitting, solved
          </span>
          <span className="intro-meta hidden sm:block text-[0.72rem] uppercase tracking-[0.28em] font-semibold">
            Scroll to begin
          </span>
        </div>
      </div>
    </div>
  );
}
