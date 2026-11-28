"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CalendarClock, ChevronDown, Ticket } from "lucide-react";
import type { SalesStatus, TicketCategory } from "@/types/type";
import { formatIDR } from "@/lib/price";
import { useSalesText } from "@/hooks/use-sales-text";
import SalesBadge from "@/components/concerts/sales-badge";

type TicketSidebarProps = {
  categories: TicketCategory[];
  salesStatus: SalesStatus;
  salesStartAt: string | null;
  salesEndAt: string | null;
  eventTitle: string;
};

export default function ConcertTicketSidebar({ categories, salesStatus, salesStartAt, salesEndAt, eventTitle }: TicketSidebarProps) {
  const [expanded, setExpanded] = useState(true);
  const t = useTranslations("ConcertDetail.ticket");
  const sales = useSalesText();
  const minPrice = categories.length ? Math.min(...categories.map((c) => Number(c.price))) : 0;
  const salesWindow = sales.window(salesStartAt, salesEndAt);

  return (
    <div>
      <div className="flex items-center gap-2">
        <Ticket className="h-5 w-5 text-foreground" />
        <h2 className="text-[20px] font-bold text-foreground">{t("title")}</h2>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-border bg-surface">
        <button type="button" onClick={() => setExpanded(!expanded)} className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left">
          <div className="min-w-0">
            <p className="truncate text-[15px] font-bold text-foreground">{eventTitle}</p>
            <p className="mt-0.5 text-[13px] text-muted-foreground/70">
              {t("summary", { count: categories.length, price: formatIDR(minPrice) })}
            </p>
            {salesWindow && (
              <p className="mt-1.5 flex items-start gap-1.5 text-[12px] text-muted-foreground">
                <CalendarClock className="mt-px h-3.5 w-3.5 shrink-0" />
                <span className="font-mono">{salesWindow}</span>
              </p>
            )}
          </div>
          <ChevronDown className={`h-5 w-5 shrink-0 text-primary transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
        </button>

        <div className={`grid transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
          <div className="min-h-0">
            <div className="border-t border-border px-5">
              {categories.map((cat, idx) => {
                const status: SalesStatus =
                  cat.sales_status ?? (cat.remaining !== undefined && cat.remaining <= 0 ? "sold_out" : salesStatus);
                const isLast = idx === categories.length - 1;
                return (
                  <div
                    key={cat.id}
                    className={`flex items-center gap-4 py-4 ${!isLast ? "border-b border-dashed border-border" : ""}`}
                  >
                    {/* mobile: nama di atas, harga di bawah; sm+: harga | nama | badge */}
                    <div className="min-w-0 flex-1 sm:flex sm:items-center sm:gap-4">
                      <span className="block text-[14px] font-medium text-foreground sm:min-w-0 sm:flex-1">{cat.name}</span>
                      <span className="mt-0.5 block font-mono text-[14px] font-medium text-foreground/85 sm:order-first sm:mt-0 sm:w-[120px] sm:shrink-0 sm:text-[15px]">
                        {formatIDR(Number(cat.price))}
                      </span>
                    </div>
                    <SalesBadge status={status} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
