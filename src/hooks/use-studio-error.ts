"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { ApiError } from "@/lib/api";
import { useErrorMessage } from "@/lib/error-message";

// Kode error Creator Studio dari backend yang punya teks sendiri (Studio.errors.*).
const STUDIO_CODES = [
  "NO_TICKET_CATEGORY",
  "QUOTA_BELOW_RESERVED",
  "CATEGORY_HAS_ORDERS",
  "EVENT_HAS_ORDERS",
  "INVALID_QR",
  "QR_EXPIRED",
  "TICKET_NOT_FOUND",
  "WRONG_ORGANIZER",
  "ALREADY_SCANNED",
  "EVENT_ENDED",
] as const;

/**
 * Pesan error untuk aksi studio: kode dikenal -> teks i18n; 4xx lain -> pesan
 * backend (validasi, mis. "sales_end_at must be ..."); sisanya pesan umum.
 */
export function useStudioError() {
  const t = useTranslations("Studio.errors");
  const base = useErrorMessage();
  return useCallback(
    (err: unknown): string => {
      if (err instanceof ApiError) {
        if (err.code && (STUDIO_CODES as readonly string[]).includes(err.code)) return t(err.code);
        // validasi backend: { code: "VALIDATION_ERROR", message: "<field>: <msg>" } atau error lama tanpa kode
        const validation = err.code === "VALIDATION_ERROR" || !err.code;
        if (validation && err.status >= 400 && err.status < 500 && err.status !== 401 && err.status !== 404 && err.message)
          return t("validation", { message: err.message });
      }
      return base(err);
    },
    [t, base]
  );
}
