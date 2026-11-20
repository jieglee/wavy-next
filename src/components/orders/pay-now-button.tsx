"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { apiGet, apiPost } from "@/lib/api";
import { loadSnap } from "@/lib/midtrans";
import { useErrorMessage } from "@/lib/error-message";

/**
 * "Bayar sekarang": minta token Snap ke backend lalu buka popup Midtrans.
 * Setiap callback Snap (sukses / pending / tutup) menanyakan status ke backend
 * (GET /orders/:id/payment-status) supaya order ter-update tanpa webhook, lalu onSettled().
 */
export function PayNowButton({ orderId, onSettled }: { orderId: number; onSettled: () => void }) {
  const t = useTranslations("OrderDetail.pay");
  const errorMessage = useErrorMessage();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function sync() {
    try {
      await apiGet<{ status: string }>(`/orders/${orderId}/payment-status`);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
      onSettled();
    }
  }

  async function pay() {
    setBusy(true);
    setError(null);
    try {
      const { token } = await apiPost<{ token: string }>(`/orders/${orderId}/pay`);
      const snap = await loadSnap().catch(() => {
        throw new Error("snap");
      });
      snap.pay(token, {
        onSuccess: sync,
        onPending: sync,
        onClose: sync,
        onError: () => {
          setError(t("failed"));
          void sync();
        },
      });
    } catch (err) {
      setError(err instanceof Error && err.message === "snap" ? t("snapUnavailable") : errorMessage(err));
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={pay}
        disabled={busy}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-sm font-bold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CreditCard className="h-4 w-4" />}
        {busy ? t("processing") : t("cta")}
      </button>
      {error && (
        <p role="alert" className="text-xs font-semibold text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
