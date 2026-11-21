"use client";

import { useSyncExternalStore } from "react";
import { motion, useReducedMotion, useSpring } from "motion/react";

const FINE_POINTER = "(hover: hover) and (pointer: fine)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(FINE_POINTER);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** true hanya di perangkat dengan mouse; layar sentuh tidak di-tilt. */
function useFinePointer() {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(FINE_POINTER).matches,
    () => false
  );
}

const spring = { stiffness: 220, damping: 22, mass: 0.6 };

/**
 * Kartu miring 3D mengikuti kursor (maksimal `max` derajat), kembali halus saat kursor keluar.
 * Mati di layar sentuh dan saat prefers-reduced-motion.
 */
export function TiltCard({
  children,
  className,
  max = 8,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const reduce = useReducedMotion();
  const finePointer = useFinePointer();
  const enabled = finePointer && !reduce;
  const rotateX = useSpring(0, spring);
  const rotateY = useSpring(0, spring);

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!enabled || e.pointerType !== "mouse") return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5; // -0.5 … 0.5
    const py = (e.clientY - r.top) / r.height - 0.5;
    rotateY.set(px * 2 * max);
    rotateX.set(-py * 2 * max);
  };

  const reset = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <motion.div
      className={className}
      style={enabled ? { rotateX, rotateY, transformPerspective: 800 } : undefined}
      onPointerMove={enabled ? onPointerMove : undefined}
      onPointerLeave={enabled ? reset : undefined}
    >
      {children}
    </motion.div>
  );
}
