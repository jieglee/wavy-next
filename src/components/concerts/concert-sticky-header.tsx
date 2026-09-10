"use client";

import ConcertTabs from "@/components/concerts/concert-tabs";
import { formatIDR } from "@/lib/price";

type Tab = {
  id: string;
  label: string;
  onClick: () => void;
};

export default function ConcertStickyHeader({
  tabs,
  activeTab,
  minPrice,
  onBuy,
  visible,
}: {
  tabs: Tab[];
  activeTab: string;
  minPrice: number;
  onBuy: () => void;
  visible: boolean;
}) {
  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 top-0 z-50 border-b border-[#E5E7EB] bg-white shadow-sm">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <div className="grid h-[64px] items-center lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
          <div className="min-w-0">
            <ConcertTabs tabs={tabs} activeTab={activeTab} />
          </div>

          <div className="hidden items-center justify-between gap-3 px-5 lg:flex">
            <div className="leading-none">
              <p className="text-[11px] text-[#6B7280]">
                Harga mulai dari
              </p>

              <p className="mt-1 text-[15px] font-bold text-[#111827]">
                {formatIDR(minPrice)}
              </p>
            </div>

            <button
              onClick={onBuy}
              className="rounded-lg bg-[#0F56FF] px-6 py-2.5 text-[13px] font-bold text-white transition hover:bg-[#0B46D9]"
            >
              Beli Tiket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}