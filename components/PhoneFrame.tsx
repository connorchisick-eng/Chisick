"use client";
import Image from "next/image";
import { clsx } from "clsx";
import type { ScreenVariant } from "./Screen";
import { PHONE_ASPECT, PHONE_FRAME_SRC, PHONE_INSETS } from "@/lib/phoneInsets";

type Props = {
  variant: ScreenVariant;
  className?: string;
};

/**
 * Renders a static phone screen (PNG) wrapped in the iPhone 17 Pro bezel.
 * For interactive screen content, see PhoneShell inside InteractiveDemo
 * which uses the same bezel + insets but accepts arbitrary children.
 */
export function PhoneFrame({ variant, className }: Props) {
  return (
    <div
      className={clsx("relative mx-auto", className)}
      style={{ aspectRatio: PHONE_ASPECT }}
    >
      <div
        className="absolute overflow-hidden bg-white"
        style={{
          top: PHONE_INSETS.top,
          bottom: PHONE_INSETS.bottom,
          left: PHONE_INSETS.left,
          right: PHONE_INSETS.right,
          borderRadius: PHONE_INSETS.radius,
        }}
      >
        <Image
          src={`/screens/${variant}.png`}
          alt={`Tabby ${variant} screen`}
          fill
          sizes="(max-width: 768px) 60vw, 360px"
          className="object-cover pointer-events-none select-none"
          draggable={false}
        />
      </div>

      <img
        src={PHONE_FRAME_SRC}
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full pointer-events-none select-none"
        draggable={false}
      />
    </div>
  );
}
