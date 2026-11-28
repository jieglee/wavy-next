"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/type";

// DESIGN §6: pending amber, paid hijau, expired/dibatalkan abu, ditolak/refund merah. Teks uppercase.
const STYLES: Record<OrderStatus, string> = {
  pending_payment: "bg-warning/10 text-warning",
  paid: "bg-success/10 text-success",
  expired: "bg-muted text-muted-foreground",
  rejected: "bg-destructive/10 text-destructive",
  refunded: "bg-destructive/10 text-destructive",
  cancelled: "bg-muted text-muted-foreground",
};

export function OrderStatusBadge({ status, className }: { status: OrderStatus | string; className?: string }) {
  const t = useTranslations("OrderStatus");
  const known = status in STYLES ? (status as OrderStatus) : null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider",
        known ? STYLES[known] : "bg-muted text-muted-foreground",
        className
      )}
    >
      {known ? t(known) : status}
    </span>
  );
}
