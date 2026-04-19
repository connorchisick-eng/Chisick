"use client";
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { clsx } from "clsx";

/**
 * Tabby — the mascot.
 *
 * Geometric, cute, studio-quality. Yellow body with orange tabby stripes.
 * Exposes an imperative `jumpTo(dx)` handle for the hero carousel.
 */

export type CatState = "idle" | "sleeping" | "walking" | "celebrating" | "peeking";

export type CatHandle = {
  jumpTo: (deltaX: number, direction?: 1 | -1) => void;
  celebrate: () => void;
  root: HTMLDivElement | null;
};

type Props = {
  state?: CatState;
  className?: string;
  size?: number;
  /** Flip cat horizontally (faces left) */
  facing?: "left" | "right";
};

export const Cat = forwardRef<CatHandle, Props>(function Cat(
  { state = "idle", className, size = 120, facing = "right" },
  ref,
) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [local, setLocal] = useState(state);
  useEffect(() => setLocal(state), [state]);

  useImperativeHandle(ref, () => ({
    root: rootRef.current,
    jumpTo(deltaX: number, direction: 1 | -1 = 1) {
      if (!rootRef.current || typeof window === "undefined") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        rootRef.current.style.transform = `translateX(${deltaX}px)`;
        return;
      }
      // Dynamically import GSAP on call
      import("gsap").then(({ gsap }) => {
        const el = rootRef.current!;
        const currentX = gsap.getProperty(el, "x") as number;
        const targetX = currentX + deltaX;
        const peakY = -70 - Math.min(80, Math.abs(deltaX) * 0.18);

        gsap.killTweensOf(el);

        const tl = gsap.timeline({
          defaults: { transformOrigin: "50% 100%" },
        });
        // quick anticipation dip
        tl.to(el, {
          scaleY: 0.78,
          scaleX: 1.18,
          duration: 0.11,
          ease: "power2.in",
        });
        // launch up
        tl.to(el, {
          y: peakY,
          scaleY: 1.16,
          scaleX: 0.86,
          rotate: 10 * direction,
          duration: 0.28,
          ease: "power2.out",
        });
        // travel horizontally while floating
        tl.to(
          el,
          {
            x: targetX,
            duration: 0.55,
            ease: "none",
          },
          "-=0.38",
        );
        // descend
        tl.to(el, {
          y: 0,
          scaleY: 1.08,
          scaleX: 0.94,
          rotate: 0,
          duration: 0.28,
          ease: "power2.in",
        });
        // squash on landing
        tl.to(el, {
          scaleY: 0.82,
          scaleX: 1.14,
          duration: 0.09,
          ease: "power2.out",
        });
        // settle bounce
        tl.to(el, {
          scaleY: 1,
          scaleX: 1,
          duration: 0.35,
          ease: "elastic.out(1, 0.45)",
        });
      });
    },
    celebrate() {
      if (!rootRef.current || typeof window === "undefined") return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      import("gsap").then(({ gsap }) => {
        const el = rootRef.current!;
        gsap.killTweensOf(el);
        gsap.timeline()
          .to(el, { y: -80, scaleY: 1.15, scaleX: 0.9, duration: 0.34, ease: "power2.out" })
          .to(el, { rotate: 360, duration: 0.5, ease: "power2.inOut" }, "<")
          .to(el, { y: 0, duration: 0.3, ease: "power2.in" })
          .to(el, { scaleY: 0.85, scaleX: 1.15, duration: 0.08 })
          .to(el, { scaleY: 1, scaleX: 1, duration: 0.4, ease: "elastic.out(1,0.4)" });
      });
    },
  }));

  const flip = facing === "left" ? -1 : 1;

  return (
    <div
      ref={rootRef}
      className={clsx("relative inline-block will-change-transform", className)}
      style={{
        width: size,
        height: size,
      }}
    >
      <div
        className={clsx(local === "walking" && "animate-tailSway")}
        style={{ width: size, height: size, transform: `scaleX(${flip})` }}
      >
        <CatSVG state={local} size={size} />
      </div>
      {local === "sleeping" && (
        <div aria-hidden className="absolute inset-0 pointer-events-none">
          <span
            className="zzz-particle animate-zzz"
            style={{ left: "62%", top: "28%", animationDelay: "0s" }}
          >
            z
          </span>
          <span
            className="zzz-particle animate-zzz"
            style={{ left: "70%", top: "20%", animationDelay: "1s", fontSize: "0.85rem" }}
          >
            z
          </span>
          <span
            className="zzz-particle animate-zzz"
            style={{ left: "78%", top: "15%", animationDelay: "2s", fontSize: "0.7rem" }}
          >
            z
          </span>
        </div>
      )}
    </div>
  );
});

function CatSVG({ state, size }: { state: CatState; size: number }) {
  const sleeping = state === "sleeping";
  return (
    <svg
      viewBox="0 0 140 130"
      width={size}
      height={size}
      aria-hidden
      className="overflow-visible"
    >
      {/* Tail — sways when idle */}
      <g
        className={clsx(
          "cat-tail",
          !sleeping && state !== "celebrating" && "animate-tailSway",
        )}
        style={{ transformOrigin: "100px 82px" }}
      >
        <path
          d="M100 82 C 122 78, 132 58, 118 36"
          stroke="rgb(253, 213, 9)"
          strokeWidth="14"
          fill="none"
          strokeLinecap="round"
        />
        {/* stripes on tail */}
        <circle cx="126" cy="52" r="2.5" fill="rgb(255, 124, 97)" opacity="0.55" />
        <circle cx="122" cy="68" r="2.5" fill="rgb(255, 124, 97)" opacity="0.55" />
      </g>

      {/* Back legs (peeking behind body) */}
      <ellipse cx="42" cy="100" rx="9" ry="7" fill="rgb(253, 213, 9)" />
      <ellipse cx="82" cy="100" rx="9" ry="7" fill="rgb(253, 213, 9)" />

      {/* Body */}
      <g
        className={clsx("cat-body", sleeping && "animate-sleep")}
        style={{ transformOrigin: "62px 110px" }}
      >
        <ellipse cx="62" cy="85" rx="34" ry="23" fill="rgb(253, 213, 9)" />
        {/* body stripes */}
        <path
          d="M44 72 Q47 88 46 100"
          stroke="rgb(255, 124, 97)"
          strokeWidth="2.6"
          fill="none"
          opacity="0.6"
          strokeLinecap="round"
        />
        <path
          d="M62 68 Q64 88 62 102"
          stroke="rgb(255, 124, 97)"
          strokeWidth="2.6"
          fill="none"
          opacity="0.6"
          strokeLinecap="round"
        />
        <path
          d="M78 72 Q80 88 76 100"
          stroke="rgb(255, 124, 97)"
          strokeWidth="2.6"
          fill="none"
          opacity="0.6"
          strokeLinecap="round"
        />
        {/* front paws */}
        <ellipse cx="52" cy="106" rx="8" ry="4.5" fill="rgb(253, 213, 9)" />
        <ellipse cx="74" cy="106" rx="8" ry="4.5" fill="rgb(253, 213, 9)" />

        {/* Head */}
        <g>
          {/* outer ears */}
          <path d="M38 42 L34 20 L52 32 Z" fill="rgb(253, 213, 9)" />
          <path d="M86 42 L90 20 L72 32 Z" fill="rgb(253, 213, 9)" />
          {/* inner ears */}
          <path d="M40 38 L38 26 L49 32 Z" fill="rgb(255, 124, 97)" opacity="0.75" />
          <path d="M84 38 L86 26 L75 32 Z" fill="rgb(255, 124, 97)" opacity="0.75" />

          {/* head circle */}
          <circle cx="62" cy="52" r="27" fill="rgb(253, 213, 9)" />

          {/* head stripes */}
          <path
            d="M48 30 Q50 38 52 42"
            stroke="rgb(255, 124, 97)"
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M62 26 L62 38"
            stroke="rgb(255, 124, 97)"
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
          <path
            d="M76 30 Q74 38 72 42"
            stroke="rgb(255, 124, 97)"
            strokeWidth="2.4"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />

          {/* cheek blush */}
          <circle cx="48" cy="58" r="3.8" fill="rgb(255, 124, 97)" opacity="0.32" />
          <circle cx="76" cy="58" r="3.8" fill="rgb(255, 124, 97)" opacity="0.32" />

          {/* eyes */}
          {sleeping ? (
            <g>
              <path
                d="M48 52 Q53 56 58 52"
                stroke="rgb(14,14,14)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
              <path
                d="M66 52 Q71 56 76 52"
                stroke="rgb(14,14,14)"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
              />
            </g>
          ) : (
            <g className="animate-blink" style={{ transformOrigin: "62px 52px", transformBox: "fill-box" }}>
              <ellipse cx="53" cy="52" rx="3.8" ry="4.4" fill="rgb(14,14,14)" />
              <ellipse cx="71" cy="52" rx="3.8" ry="4.4" fill="rgb(14,14,14)" />
              {/* eye shines */}
              <circle cx="54.4" cy="50.6" r="1.1" fill="#fff" />
              <circle cx="72.4" cy="50.6" r="1.1" fill="#fff" />
            </g>
          )}

          {/* nose */}
          <path
            d="M58 60 L66 60 L62 65 Z"
            fill="rgb(255, 124, 97)"
          />

          {/* mouth */}
          <path
            d="M62 65 Q58 68 55 67"
            stroke="rgb(14,14,14)"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M62 65 Q66 68 69 67"
            stroke="rgb(14,14,14)"
            strokeWidth="1.6"
            fill="none"
            strokeLinecap="round"
          />

          {/* whiskers */}
          <g opacity="0.45">
            <path d="M40 62 L50 61" stroke="rgb(14,14,14)" strokeWidth="0.9" strokeLinecap="round" />
            <path d="M40 65 L50 64" stroke="rgb(14,14,14)" strokeWidth="0.9" strokeLinecap="round" />
            <path d="M84 62 L74 61" stroke="rgb(14,14,14)" strokeWidth="0.9" strokeLinecap="round" />
            <path d="M84 65 L74 64" stroke="rgb(14,14,14)" strokeWidth="0.9" strokeLinecap="round" />
          </g>
        </g>
      </g>
    </svg>
  );
}
