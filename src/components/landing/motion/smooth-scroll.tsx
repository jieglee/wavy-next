"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { useReducedMotionSafe } from "@/hooks/use-reduced-motion-safe";

/** Smooth scroll (Lenis) khusus landing. Mati total saat prefers-reduced-motion. */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotionSafe();

  useEffect(() => {
    if (reduce) return;
    const lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, [reduce]);

  return <>{children}</>;
}
