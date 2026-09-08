import ConcertTabs from "@/components/concerts/concert-tabs";
import { formatIDR } from "@/lib/price";

type Tab = { id: string; label: string; onClick: () => void };

export default function ConcertStickyHeader({
  tabs,
  activeTab,
  minPrice,
  onBuy,
}: {
  tabs: Tab[];
  activeTab: string;
  minPrice: number;
  onBuy: () => void;
}) {
  return (
    <div className="sticky top-0 z-30 w-full border-b border-[#E5E7EB] bg-white">
      <div className="mx-auto max-w-[1180px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-6">
          <div className="min-w-0">
            <ConcertTabs tabs={tabs} activeTab={activeTab} />
          </div>
          <div className="hidden items-center justify-between gap-3 px-5 lg:flex">
            <div className="text-right leading-none">
              <p className="text-[11px] text-[#6B7280]">Harga mulai dari</p>
              <p className="mt-0.5 text-[15px] font-bold text-[#111827]">{formatIDR(minPrice)}</p>
            </div>
            <button onClick={onBuy} className="rounded-lg bg-[#0F56FF] px-6 py-2.5 text-[13px] font-bold text-white hover:bg-[#0B46D9]">
              Beli Tiket
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
