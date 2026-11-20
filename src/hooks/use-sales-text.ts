import { useFormatter, useTranslations } from "next-intl";
import type { SalesStatus } from "@/types/type";

// Teks status penjualan dari sales_status backend. Tanggal selalu WIB (Asia/Jakarta),
// sama dengan zona yang dipakai halaman konser.
export function useSalesText() {
  const t = useTranslations("Sales");
  const format = useFormatter();

  const date = (iso: string) =>
    format.dateTime(new Date(iso), {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Jakarta",
      timeZoneName: "short",
    });

  return {
    badge: (status: SalesStatus) => t(`badge.${status}`),

    // null kalau event tidak punya batas penjualan sama sekali
    window: (start: string | null, end: string | null) => {
      if (start && end) return t("window.range", { start: date(start), end: date(end) });
      if (end) return t("window.until", { end: date(end) });
      if (start) return t("window.from", { start: date(start) });
      return null;
    },

    // alasan tombol beli nonaktif (status selain open)
    notOpen: (status: Exclude<SalesStatus, "open">, start: string | null) =>
      status === "upcoming" && start ? t("notOpen.upcomingAt", { start: date(start) }) : t(`notOpen.${status}`),
  };
}
