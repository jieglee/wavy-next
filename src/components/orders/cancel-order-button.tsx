"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { apiPost } from "@/lib/api";
import { useErrorMessage } from "@/lib/error-message";

/**
 * Batalkan order pending milik customer (POST /orders/:id/cancel) dengan konfirmasi di tempat.
 * Gagal = pesan error di bawah tombol, tidak ada toast sukses; order dimuat ulang lewat onSettled.
 */
export function CancelOrderButton({ orderId, onSettled }: { orderId: number; onSettled: () => void }) {
  const t = useTranslations("OrderDetail.cancel");
  const errorMessage = useErrorMessage();
  const titleId = useId();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    setBusy(true);
    setError(null);
    try {
      await apiPost(`/orders/${orderId}/cancel`);
      toast.success(t("done"));
      setConfirming(false);
      onSettled();
    } catch (err) {
      setError(errorMessage(err));
      onSettled(); // status bisa saja sudah berubah (lunas / kedaluwarsa)
    } finally {
      setBusy(false);
    }
  }

  if (!confirming)
    return (
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => {
            setError(null);
            setConfirming(true);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-background py-3 text-sm font-semibold text-destructive hover:bg-destructive/10"
        >
          <XCircle className="h-4 w-4" />
          {t("cta")}
        </button>
        {error && (
          <p role="alert" className="text-xs font-semibold text-destructive">
            {error}
          </p>
        )}
      </div>
    );

  return (
    <div role="alertdialog" aria-labelledby={titleId} className="space-y-3 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
      <p id={titleId} className="text-sm font-bold text-foreground">
        {t("confirmTitle")}
      </p>
      <p className="text-xs text-muted-foreground">{t("confirmBody")}</p>
      {error && (
        <p role="alert" className="text-xs font-semibold text-destructive">
          {error}
        </p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <button
          type="button"
          onClick={cancel}
          disabled={busy}
          className="flex-1 rounded-lg bg-destructive py-2.5 text-sm font-bold text-background hover:brightness-110 disabled:opacity-60"
        >
          {busy ? t("cancelling") : t("confirm")}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          disabled={busy}
          autoFocus
          className="flex-1 rounded-lg border border-border bg-background py-2.5 text-sm font-semibold text-foreground hover:bg-surface disabled:opacity-60"
        >
          {t("keep")}
        </button>
      </div>
    </div>
  );
}
