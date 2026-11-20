import { formatIDR } from "@/lib/price";

type Props = {
  minPrice: number;
  priceLabel: string;
  buyLabel: string;
  // alasan tombol nonaktif (status penjualan selain open); null = bisa beli
  blockedReason: string | null;
  onBuy: () => void;
};

export default function ConcertStickyBar({ minPrice, priceLabel, buyLabel, blockedReason, onBuy }: Props) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white lg:hidden" style={{ paddingBottom: "env(safe-area-inset-bottom)" }}>
      {blockedReason && (
        <p role="status" className="border-b border-border bg-destructive/5 px-4 py-2 text-[12px] font-medium text-destructive sm:px-6">
          {blockedReason}
        </p>
      )}
      <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground">{priceLabel}</p>
          <p className="truncate font-mono text-lg font-extrabold leading-tight text-foreground">{formatIDR(minPrice)}</p>
        </div>
        <button
          onClick={onBuy}
          disabled={!!blockedReason}
          className="shrink-0 rounded-full bg-primary px-8 py-3 text-sm font-bold text-primary-foreground disabled:cursor-not-allowed disabled:bg-muted-foreground/70"
        >
          {buyLabel}
        </button>
      </div>
    </div>
  );
}
