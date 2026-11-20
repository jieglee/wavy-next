"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import SalesBadge from "@/components/concerts/sales-badge";
import type { EventStatus } from "@/lib/organizer";
import type { SalesStatus } from "@/types/type";

const eventTone: Record<EventStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  published: "bg-info-subtle text-info",
  closed: "bg-destructive/10 text-destructive",
};

/** Status event (draft/published/closed) — label mono uppercase sesuai DESIGN §6. */
export function EventStatusBadge({ status }: { status: EventStatus }) {
  const t = useTranslations("Studio.eventStatus");
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 font-mono text-[10px] font-medium uppercase tracking-widest",
        eventTone[status] ?? eventTone.draft
      )}
    >
      {t(status)}
    </span>
  );
}

/** Badge status event + status penjualan (kalau event sudah dipublish). */
export function EventBadges({ status, salesStatus }: { status: EventStatus; salesStatus?: SalesStatus }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <EventStatusBadge status={status} />
      {status === "published" && salesStatus && <SalesBadge status={salesStatus} />}
    </div>
  );
}

/** Bar kuota: terjual / pending / sisa (DESIGN §4 kategori tiket & kuota). */
export function QuotaBar({ quota, sold, pending, className }: { quota: number; sold: number; pending: number; className?: string }) {
  const t = useTranslations("Studio.quota");
  const safe = Math.max(quota, 1);
  const soldPct = Math.min(100, (sold / safe) * 100);
  const pendingPct = Math.min(100 - soldPct, (pending / safe) * 100);
  const remaining = Math.max(0, quota - sold - pending);
  return (
    <div className={cn("w-full", className)}>
      <div
        className="flex h-2 w-full overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={t("aria", { sold, pending, remaining, quota })}
      >
        <div className="h-full bg-primary" style={{ width: `${soldPct}%` }} />
        <div className="h-full bg-warning" style={{ width: `${pendingPct}%` }} />
      </div>
      <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1">
          <i className="h-2 w-2 rounded-full bg-primary" aria-hidden />
          {t("sold", { n: sold })}
        </span>
        <span className="inline-flex items-center gap-1">
          <i className="h-2 w-2 rounded-full bg-warning" aria-hidden />
          {t("pending", { n: pending })}
        </span>
        <span className="inline-flex items-center gap-1">
          <i className="h-2 w-2 rounded-full bg-muted-foreground/40" aria-hidden />
          {t("remaining", { n: remaining, quota })}
        </span>
      </div>
    </div>
  );
}

export const btn = {
  primary:
    "inline-flex items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50",
  dark: "inline-flex items-center justify-center gap-1.5 rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
  outline:
    "inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-background px-4 py-2 text-sm font-semibold text-foreground transition hover:bg-surface disabled:cursor-not-allowed disabled:opacity-50",
  danger:
    "inline-flex items-center justify-center gap-1.5 rounded-lg border border-destructive/30 bg-background px-4 py-2 text-sm font-semibold text-destructive transition hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-50",
  ghost:
    "inline-flex items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-surface hover:text-foreground disabled:opacity-50",
};

export const inputCls =
  "w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-ring/30";

export const labelCls = "mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground";
