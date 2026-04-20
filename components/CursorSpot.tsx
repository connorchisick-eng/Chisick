"use client";
import { useEffect, useRef } from "react";

/**
 * Soft warm radial glow that follows the pointer in dark mode.
 * CSS in globals.css handles the visual (gated by [data-theme="dark"]
 * and reduced-motion). This component just writes --mx / --my onto
 * <html> via requestAnimationFrame-throttled pointer events.
 */
export function CursorSpot() {
  const pending = useRef<{ x: number; y: number } | null>(null);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pending.current = { x: e.clientX, y: e.clientY };
      if (raf.current != null) return;
      raf.current = requestAnimationFrame(() => {
        raf.current = null;
        if (!pending.current) return;
        const { x, y } = pending.current;
        document.documentElement.style.setProperty("--mx", `${x}px`);
        document.documentElement.style.setProperty("--my", `${y}px`);
      });
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (raf.current != null) cancelAnimationFrame(raf.current);
    };
  }, []);

  return <div className="cursor-spot" aria-hidden />;
}
