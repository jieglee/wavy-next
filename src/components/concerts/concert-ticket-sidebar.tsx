"use client";

import { useState } from "react";
import { ChevronDown, Ticket, ShoppingCart } from "lucide-react";
import type { TicketCategory } from "@/types/type";
import { formatIDR } from "@/lib/price";

type TicketSidebarProps = {
  categories: TicketCategory[];
  selectedCategory?: TicketCategory | null;
  onSelectCategory?: (c: TicketCategory) => void;
  quantity?: number;
  onQuantityChange?: (n: number) => void;
  onCheckout?: () => void;
};

export default function ConcertTicketSidebar({ categories }: TicketSidebarProps) {
  const [expanded, setExpanded] = useState(true);
  const minPrice = categories.length ? Math.min(...categories.map((c) => Number(c.price))) : 0;

  return (
    <div>
      <div className="flex items-center gap-2">
        <Ticket className="h-5 w-5 text-[#1A2E6B]" />
        <h2 className="text-[20px] font-bold text-[#1A2E6B]">Ticket</h2>
      </div>

      <div className="mt-3 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <button type="button" onClick={() => setExpanded(!expanded)} className="flex w-full items-center justify-between px-5 py-4 text-left">
          <div>
            <p className="text-[15px] font-bold text-[#111827]">Loket Platform</p>
            <p className="mt-0.5 text-[13px] text-[#9CA3AF]">
              {categories.length} ticket category - Price starting from {formatIDR(minPrice)}
            </p>
          </div>
          <ChevronDown className={`h-5 w-5 shrink-0 text-[#1E40AF] transition-transform duration-300 ${expanded ? "rotate-180" : ""}`} />
        </button>

        <div className={`grid transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
          <div className="min-h-0">
            <div className="border-t border-[#E5E7EB] px-5">
              {categories.map((cat, idx) => {
                const isSoldOut = cat.remaining !== undefined && cat.remaining <= 0;
                const isLast = idx === categories.length - 1;
                return (
                  <div
                    key={cat.id}
                    className={`flex items-center gap-4 py-4 ${!isLast ? "border-b border-dashed border-[#E5E7EB]" : ""}`}
                  >
                    <span className="w-[120px] shrink-0 text-[15px] font-medium text-[#374151]">{formatIDR(Number(cat.price))}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[14px] font-medium text-[#111827]">{cat.name}</span>
                      <span className="mt-0.5 block text-[12px] text-[#9CA3AF]">Sale ends 19 Sep 2026 &nbsp;•&nbsp; 19.00 WIB</span>
                    </span>
                    <span
                      className={`shrink-0 rounded-md px-3 py-1 text-[12px] font-medium ${isSoldOut ? "bg-[#FEE2E2] text-[#991B1B]" : "bg-[#ECFDF5] text-[#065F46]"}`}
                    >
                      {isSoldOut ? "Sold Out" : "Available"}
                    </span>
                  </div>
                );
              })}
              </div>
            </div>

            <div className="px-5 py-4">
              <button
                disabled
                className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0F56FF] py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#0B46D9] disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ShoppingCart className="h-4 w-4" />
                Beli Tiket
              </button>
            </div>
          </div>
        </div>
    </div>
  );
}
