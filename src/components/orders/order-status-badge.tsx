"use client";

import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { OrderStatus } from "@/types/type";

// DESIGN §6: pending amber, paid hijau, expired abu, ditolak/refund merah. Teks uppercase.
const STYLES: Record<OrderStatus, string> = {
  pending_payment: "bg-amber-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
  expired: "bg-wavy-surface text-wavy-text-secondary",
  rejected: "bg-red-100 text-red-700",
  refunded: "bg-red-100 text-red-700",
};

export function OrderStatusBadge({ status, className }: { status: OrderStatus | string; className?: string }) {
  const t = useTranslations("OrderStatus");
  const known = status in STYLES ? (status as OrderStatus) : null;
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider",
        known ? STYLES[known] : "bg-wavy-surface text-wavy-text-secondary",
        className
      )}
    >
      {known ? t(known) : status}
    </span>
  );
}
