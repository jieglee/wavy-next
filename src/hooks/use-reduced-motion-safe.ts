"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/**
 * prefers-reduced-motion yang aman untuk hydration. `useReducedMotion` dari motion langsung
 * membaca preferensi di render pertama client, sehingga HTML server (tanpa preferensi) dan
 * render hydration berbeda. Hook ini memakai nilai server (false) saat hydration, lalu
 * render ulang dengan nilai sebenarnya.
 */
export function useReducedMotionSafe(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
}
