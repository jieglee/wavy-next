"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, MailCheck, MailWarning, X } from "lucide-react";
import toast from "react-hot-toast";
import { adminPatch, notifyOrganizersChanged } from "@/lib/admin-session";
import { useErrorMessage } from "@/lib/error-message";
import { cn } from "@/lib/utils";
import { btn, inputCls, labelCls } from "@/components/studio/studio-ui";
import type { SetOrganizerStatusResult } from "@/types/type";

export const REASON_MIN = 10;
export const REASON_MAX = 500;

type Target = { id: number; name: string; email: string };
type Mode = "approve" | "reject";

/** pesan validasi alasan penolakan; null = valid (aturan sama dengan backend: 10–500 karakter setelah trim) */
export function reasonError(reason: string): "reasonTooShort" | "reasonTooLong" | null {
  const n = reason.trim().length;
  if (n < REASON_MIN) return "reasonTooShort";
  if (n > REASON_MAX) return "reasonTooLong";
  return null;
}

/**
 * Tombol Setujui / Tolak untuk organizer pending_verification + dialog konfirmasi.
 * Tolak wajib alasan (dikirim ke EO lewat email). Toast sukses hanya setelah API berhasil;
 * bila email gagal terkirim, admin diberi tahu (status tetap tersimpan di backend).
 */
export function OrganizerReviewActions({
  organizer,
  onDone,
  className,
}: {
  organizer: Target;
  onDone: (result: SetOrganizerStatusResult) => void;
  className?: string;
}) {
  const t = useTranslations("Admin.review");
  const errorMessage = useErrorMessage();
  const ids = useId();
  const [mode, setMode] = useState<Mode | null>(null);
  const [reason, setReason] = useState("");
  const [touched, setTouched] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const invalid = mode === "reject" ? reasonError(reason) : null;

  function open(next: Mode) {
    setMode(next);
    setReason("");
    setTouched(false);
    setError(null);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!mode) return;
    setTouched(true);
    if (invalid) return;
    setBusy(true);
    setError(null);
    try {
      const res = await adminPatch<SetOrganizerStatusResult>(
        `/admin/organizers/${organizer.id}`,
        mode === "approve" ? { status: "active" } : { status: "rejected", reason: reason.trim() }
      );
      toast.success(t(mode === "approve" ? "approved" : "rejected", { name: organizer.name }));
      if (res.email_sent === false) toast.error(t("emailFailed", { email: organizer.email }), { duration: 8000 });
      setMode(null);
      notifyOrganizersChanged();
      onDone(res);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className={cn("flex gap-2", className)}>
        <button type="button" onClick={() => open("reject")} className={cn(btn.danger, "flex-1 sm:flex-none")}>
          <X className="h-4 w-4" />
          {t("reject")}
        </button>
        <button type="button" onClick={() => open("approve")} className={cn(btn.primary, "flex-1 sm:flex-none")}>
          <Check className="h-4 w-4" />
          {t("approve")}
        </button>
      </div>

      {mode && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/60 backdrop-blur-sm sm:items-center sm:p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby={`${ids}-title`}
          aria-describedby={`${ids}-body`}
        >
          <form onSubmit={submit} noValidate className="w-full max-w-md space-y-4 rounded-t-2xl bg-background p-5 sm:rounded-2xl sm:p-6">
            <h2 id={`${ids}-title`} className="font-display text-lg font-bold tracking-tight text-foreground">
              {t(mode === "approve" ? "approveTitle" : "rejectTitle", { name: organizer.name })}
            </h2>
            <p id={`${ids}-body`} className="text-sm text-muted-foreground">
              {mode === "approve" ? t("approveBody", { email: organizer.email }) : t("rejectBody")}
            </p>

            {mode === "reject" && (
              <div>
                <label htmlFor={`${ids}-reason`} className={labelCls}>
                  {t("reasonLabel")}
                </label>
                <textarea
                  id={`${ids}-reason`}
                  autoFocus
                  rows={4}
                  maxLength={REASON_MAX + 50}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  onBlur={() => setTouched(true)}
                  placeholder={t("reasonPlaceholder")}
                  aria-invalid={touched && !!invalid}
                  aria-describedby={`${ids}-reason-hint`}
                  className={cn(inputCls, "resize-y", touched && invalid && "border-destructive focus:border-destructive")}
                />
                <div id={`${ids}-reason-hint`} className="mt-1 flex justify-between gap-3 text-xs">
                  <span className={touched && invalid ? "text-destructive" : "text-muted-foreground"}>
                    {touched && invalid ? t(invalid) : t("reasonHint")}
                  </span>
                  <span className="font-mono text-muted-foreground">
                    {reason.trim().length}/{REASON_MAX}
                  </span>
                </div>
              </div>
            )}

            {error && (
              <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
                {error}
              </p>
            )}

            <div className="flex gap-2">
              <button type="button" onClick={() => setMode(null)} disabled={busy} className={cn(btn.outline, "flex-1")}>
                {t("cancel")}
              </button>
              <button type="submit" disabled={busy} className={cn(mode === "approve" ? btn.primary : btn.danger, "flex-1")}>
                {busy ? t("saving") : t(mode === "approve" ? "approve" : "reject")}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}

/** status OTP email dari pendaftaran (organizers.email_verified_at) */
export function EmailVerifiedChip({ verifiedAt }: { verifiedAt: string | null }) {
  const t = useTranslations("Admin.verification");
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10px] font-medium uppercase tracking-widest",
        verifiedAt ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
      )}
    >
      {verifiedAt ? <MailCheck className="h-3 w-3" /> : <MailWarning className="h-3 w-3" />}
      {verifiedAt ? t("emailVerified") : t("emailUnverified")}
    </span>
  );
}
