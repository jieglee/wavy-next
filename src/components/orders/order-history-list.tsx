"use client";

import { ChevronRight } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatIDR } from "@/lib/price";
import type { Order } from "@/types/type";

/**
 * Riwayat order (DESIGN §4 Baseline): baris rapat, tanggal & kode mono rata kiri,
 * status & total rata kanan. Di bawah md tiap baris jadi card.
 */
export function OrderHistoryList({ orders }: { orders: Order[] }) {
  const t = useTranslations("Orders");
  const format = useFormatter();

  return (
    <ul className="space-y-3 md:space-y-0 md:divide-y md:divide-border md:rounded-xl md:border md:border-border md:bg-background">
      {orders.map((o) => (
        <li key={o.id}>
          <Link
            href={`/orders/${o.id}`}
            className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-2 rounded-xl border border-border bg-background p-4 transition-colors hover:bg-surface md:grid-cols-[180px_minmax(0,1fr)_auto_auto] md:rounded-none md:border-0 md:bg-transparent md:px-5 md:py-4"
          >
            <div className="min-w-0">
              <p className="font-mono text-sm font-bold text-foreground">{t("code", { id: o.id })}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {format.dateTime(new Date(o.created_at), { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" })}
              </p>
            </div>
            <div className="col-start-2 row-start-1 justify-self-end md:hidden">
              <OrderStatusBadge status={o.status} />
            </div>
            <p className="min-w-0 truncate text-sm text-muted-foreground">
              {o.event_title ?? t("event", { id: o.event_id })}
              <span className="font-mono"> · {t("quantity", { count: o.quantity })}</span>
            </p>
            <div className="hidden justify-self-end md:block">
              <OrderStatusBadge status={o.status} />
            </div>
            <div className="flex items-center justify-end gap-1">
              <span className="font-mono text-sm font-bold text-foreground">{formatIDR(Number(o.total_price))}</span>
              <ChevronRight className="h-4 w-4 text-muted-foreground" aria-hidden />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
