"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ApiError } from "@/lib/api";
import { isUnauthorized, useErrorMessage } from "@/lib/error-message";

export type OrderSubmitError = {
  error: unknown;
};

const SALES_CODES = new Set(["SALES_CLOSED", "SALES_NOT_STARTED", "SALES_ENDED"]);
const RESELECT_CODES = new Set(["QUOTA_EXCEEDED", "ORDER_EXPIRED", "INVALID_QUANTITY"]);

/**
 * Pesan gagal membuat order di checkout. Teks per error.code backend; error lain
 * -> pesan umum + coba lagi. Tidak pernah menampilkan sukses palsu.
 */
export function OrderErrorAlert({
  value,
  concertId,
  onRetry,
  onReselect,
}: {
  value: OrderSubmitError;
  concertId: string;
  onRetry: () => void;
  onReselect: () => void;
}) {
  const t = useTranslations("Checkout.orderError");
  const tStates = useTranslations("States");
  const message = useErrorMessage()(value.error);
  const code = value.error instanceof ApiError ? value.error.code : undefined;

  const actionCls = "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold";

  return (
    <div role="alert" className="mt-3 rounded-lg border border-destructive/30 bg-destructive/5 p-3">
      <div className="flex gap-2">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
        <div className="min-w-0 space-y-1">
          <p className="text-xs font-bold text-foreground">{t("title")}</p>
          <p className="text-xs text-muted-foreground">{message}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {isUnauthorized(value.error) ? (
          <Link href="/auth/login" className={`${actionCls} bg-primary text-white`}>
            {tStates("login")}
          </Link>
        ) : code && SALES_CODES.has(code) ? (
          <Link href={`/concerts/${concertId}`} className={`${actionCls} bg-foreground text-white`}>
            {t("backToConcert")}
          </Link>
        ) : code && RESELECT_CODES.has(code) ? (
          <button type="button" onClick={onReselect} className={`${actionCls} bg-foreground text-white`}>
            <RefreshCw className="h-3.5 w-3.5" />
            {t("reselect")}
          </button>
        ) : (
          <button type="button" onClick={onRetry} className={`${actionCls} bg-foreground text-white`}>
            <RefreshCw className="h-3.5 w-3.5" />
            {tStates("retry")}
          </button>
        )}
      </div>
    </div>
  );
}
