"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { ApiError, apiPost } from "@/lib/api";
import { useErrorMessage } from "@/lib/error-message";
import type { Ticket } from "@/types/type";

/**
 * Transfer kepemilikan tiket (POST /tickets/:id/transfer). Error ditampilkan di dialog;
 * toast sukses hanya setelah API berhasil.
 */
export function TransferDialog({
  ticket,
  onClose,
  onTransferred,
}: {
  ticket: Ticket;
  onClose: () => void;
  onTransferred: (ticket: Ticket) => void;
}) {
  const t = useTranslations("Tickets.transfer");
  const errorMessage = useErrorMessage();
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setBusy(true);
    setError(null);
    try {
      await apiPost(`/tickets/${ticket.id}/transfer`, { to_email: email });
      toast.success(t("success", { email }));
      onTransferred(ticket);
    } catch (err: unknown) {
      // 404 = email penerima belum terdaftar sebagai customer Wavy
      setError(err instanceof ApiError && err.status === 404 ? t("recipientNotFound") : errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/60 p-0 backdrop-blur-sm sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transfer-title"
    >
      <div className="relative w-full max-w-md space-y-4 rounded-t-2xl bg-background p-5 sm:rounded-2xl sm:p-6">
        <button
          type="button"
          onClick={onClose}
          aria-label={t("close")}
          className="absolute right-4 top-4 rounded-full bg-muted p-1 text-muted-foreground hover:bg-border"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="pr-8">
          <h3 id="transfer-title" className="font-display text-xl font-bold tracking-tight text-foreground">
            {t("title")}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">{t("description", { title: ticket.title })}</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label htmlFor="transfer-email" className="mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">
              {t("email")}
            </label>
            <input
              id="transfer-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-ring/25"
            />
          </div>

          <div className="space-y-1 rounded-lg bg-warning/5 p-3 text-xs text-warning">
            <p className="font-bold">{t("warningTitle")}</p>
            <p>{t("warningBody")}</p>
          </div>

          {error && (
            <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              {error}
            </p>
          )}

          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-lg border border-border py-2.5 text-sm font-semibold text-muted-foreground hover:bg-surface"
            >
              {t("cancel")}
            </button>
            <button
              type="submit"
              disabled={busy}
              className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground hover:brightness-110 disabled:opacity-50"
            >
              {busy ? t("sending") : t("submit")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
