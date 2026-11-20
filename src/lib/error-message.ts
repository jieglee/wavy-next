"use client";

import { useCallback } from "react";
import { useTranslations } from "next-intl";
import { ApiError } from "@/lib/api";

// Kode error aturan bisnis dari backend (PRD §4) yang punya teks sendiri.
export const KNOWN_ERROR_CODES = [
  "SALES_CLOSED",
  "SALES_NOT_STARTED",
  "SALES_ENDED",
  "QUOTA_EXCEEDED",
  "ORDER_EXPIRED",
  "ORGANIZER_SUSPENDED",
  "INVALID_QUANTITY",
  "VALIDATION_ERROR",
] as const;
export type KnownErrorCode = (typeof KNOWN_ERROR_CODES)[number];

export const isKnownErrorCode = (code: unknown): code is KnownErrorCode =>
  typeof code === "string" && (KNOWN_ERROR_CODES as readonly string[]).includes(code);

/** Ubah error (ApiError atau apa pun) jadi pesan yang aman ditampilkan, lewat next-intl. */
export function useErrorMessage() {
  const t = useTranslations("Errors");
  return useCallback(
    (err: unknown): string => {
      if (err instanceof ApiError) {
        if (isKnownErrorCode(err.code)) return t(`codes.${err.code}`);
        if (err.status === 0) return t("network");
        if (err.status === 401) return t("unauthorized");
        if (err.status === 404) return t("notFound");
      }
      return t("generic");
    },
    [t]
  );
}

export const isUnauthorized = (err: unknown) => err instanceof ApiError && err.status === 401;
