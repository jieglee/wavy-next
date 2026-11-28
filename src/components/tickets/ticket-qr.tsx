"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Check, Copy } from "lucide-react";
import { useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

/**
 * QR tiket yang benar-benar bisa dipindai: dirender dari `code` (JWT tiket dari backend,
 * yang sama dengan yang divalidasi POST /admin/scan/validate).
 * Hitam di atas putih + quiet zone agar terbaca kamera/scanner; level M cukup untuk token ~200 karakter.
 */
export function TicketQr({ code, used, className }: { code: string; used?: boolean; className?: string }) {
  const t = useTranslations("Tickets.qr");
  const [copied, setCopied] = useState(false);

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success(t("copied"));
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error(t("copyFailed"));
    }
  }

  return (
    <div className={cn("flex flex-col items-center gap-3", className)}>
      <div className="relative w-full max-w-[260px] rounded-2xl border border-border bg-white p-3">
        <QRCodeSVG
          value={code}
          level="M"
          marginSize={2}
          size={256}
          bgColor="white"
          fgColor="black"
          title={t("label")}
          className={cn("h-auto w-full", used && "opacity-25")}
        />
        {used && (
          <span className="absolute inset-0 flex items-center justify-center">
            <span className="rounded-full bg-foreground px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-white">
              {t("used")}
            </span>
          </span>
        )}
      </div>
      <button
        type="button"
        onClick={copyCode}
        className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-foreground hover:bg-muted"
      >
        {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        {copied ? t("copied") : t("copy")}
      </button>
    </div>
  );
}
