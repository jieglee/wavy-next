import { formatIDR } from "@/lib/price";

type Props = {
  minPrice: number;
  soldOut: boolean;
  onBuy: () => void;
};

export default function ConcertStickyBar({ minPrice, soldOut, onBuy }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-[#E5E7EB] bg-white lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="text-[11px] text-[#6B7280]">Mulai dari</p>
          <p className="truncate text-lg font-extrabold leading-tight text-[#111827]">{formatIDR(minPrice)}</p>
        </div>
        <button
          onClick={onBuy}
          disabled={soldOut}
          className="shrink-0 rounded-full bg-[#1E40AF] px-8 py-3 text-sm font-bold text-white disabled:opacity-50"
        >
          {soldOut ? "Habis" : "Beli Tiket"}
        </button>
      </div>
    </div>
  );
}
