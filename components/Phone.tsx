"use client";
import { clsx } from "clsx";
import { useEffect, useRef } from "react";
import Image from "next/image";
import type { ScreenVariant } from "./Screen";
import { TALL_VARIANTS } from "@/lib/images";

type Props = {
  variant: ScreenVariant;
  className?: string;
  shadow?: boolean;
  indicator?: boolean;
  tilt?: boolean;
};

export function Phone({ variant, className, shadow = true, tilt = false }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tilt) return;
    const el = cardRef.current;
    if (!el) return;
    if (window.matchMedia("(pointer: coarse)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    const maxTilt = 12;
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const ry = (px - 0.5) * maxTilt * 2;
      const rx = -(py - 0.5) * maxTilt * 2;
      if (!raf) {
        raf = requestAnimationFrame(() => {
          raf = 0;
          el.style.transform = `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg)`;
        });
      }
    };
    const onLeave = () => {
      el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg)";
    };
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerleave", onLeave);
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerleave", onLeave);
      if (raf) cancelAnimationFrame(raf);
      el.style.transform = "";
    };
  }, [tilt]);

  const isTall = TALL_VARIANTS.has(variant);

  return (
    <div
      ref={cardRef}
      className={clsx(
        "phone-card relative aspect-[9/19.5] rounded-[1.75rem] overflow-hidden bg-white select-none",
        shadow && "shadow-[0_40px_80px_-35px_rgba(14,14,14,0.45)]",
        tilt && "transition-transform duration-500 ease-out will-change-transform",
        className,
      )}
      style={tilt ? { transformStyle: "preserve-3d" } : undefined}
    >
      {isTall ? (
        // Tall PNG (e.g. smart-receipts is 1179×3462) — wrap in an
        // overflow-hidden frame and slow-scroll the image so the bottom
        // becomes visible on a loop instead of getting cropped.
        <div className="absolute inset-0 overflow-hidden">
          <img
            src={`/screens/${variant}.png`}
            alt={`Tabby ${variant} screen`}
            className="block w-full h-auto pointer-events-none phone-tall-scroll"
            draggable={false}
          />
        </div>
      ) : (
        <Image
          src={`/screens/${variant}.png`}
          alt={`Tabby ${variant} screen`}
          fill
          sizes="(max-width: 768px) 70vw, 420px"
          className="object-cover pointer-events-none"
        />
      )}
    </div>
  );
}
