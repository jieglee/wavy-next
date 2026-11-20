import { formatIDR } from "@/lib/price";

type Props = {
  minPrice: number;
  soldOut: boolean;
  onBuy: () => void;
};

export default function ConcertStickyBar({ minPrice, soldOut, onBuy }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground">Mulai dari</p>
          <p className="truncate text-lg font-extrabold leading-tight text-foreground">{formatIDR(minPrice)}</p>
        </div>
        <button
          onClick={onBuy}
          disabled={soldOut}
          className="shrink-0 rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"
        >
          {soldOut ? "Habis" : "Beli Tiket"}
        </button>
      </div>
    </div>
  );
}
