"use client";

// Midtrans Snap.js (sandbox kecuali NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION=true).
// Tanpa NEXT_PUBLIC_MIDTRANS_CLIENT_KEY, pembayaran online dimatikan dan UI
// kembali ke verifikasi manual oleh penyelenggara.

export const MIDTRANS_CLIENT_KEY = process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY ?? "";
export const MIDTRANS_ENABLED = MIDTRANS_CLIENT_KEY.length > 0;

const SNAP_URL =
  process.env.NEXT_PUBLIC_MIDTRANS_IS_PRODUCTION === "true"
    ? "https://app.midtrans.com/snap/snap.js"
    : "https://app.sandbox.midtrans.com/snap/snap.js";

export type SnapCallbacks = {
  onSuccess?: (result: unknown) => void;
  onPending?: (result: unknown) => void;
  onError?: (result: unknown) => void;
  onClose?: () => void;
};

type Snap = { pay: (token: string, callbacks: SnapCallbacks) => void };

declare global {
  interface Window {
    snap?: Snap;
  }
}

let loading: Promise<Snap> | null = null;

export function loadSnap(): Promise<Snap> {
  if (typeof window === "undefined") return Promise.reject(new Error("snap: no window"));
  if (window.snap) return Promise.resolve(window.snap);
  if (loading) return loading;
  loading = new Promise<Snap>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = SNAP_URL;
    script.async = true;
    script.dataset.clientKey = MIDTRANS_CLIENT_KEY;
    script.onload = () => (window.snap ? resolve(window.snap) : reject(new Error("snap: not available")));
    script.onerror = () => {
      loading = null;
      script.remove();
      reject(new Error("snap: failed to load"));
    };
    document.head.appendChild(script);
  });
  return loading;
}
