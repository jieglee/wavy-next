import { Ticket, ShieldCheck, Building2 } from "lucide-react";
import type { ConcertDetail } from "@/types/type";
import { getMinPrice, formatIDR } from "@/lib/price";

export default function ConcertBookingCard({
  concert,
  remaining,
  onBuyClick,
}: {
  concert: ConcertDetail;
  remaining: number | undefined;
  onBuyClick: () => void;
}) {
  const minPrice = getMinPrice(concert);
  const isSoldOut = remaining !== undefined && remaining <= 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-white">
      <div className="p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mulai dari</p>
        <div className="mt-1 flex items-baseline gap-2">
          <p className="text-[24px] font-extrabold leading-none text-foreground">{formatIDR(minPrice)}</p>
          <span className="text-xs text-muted-foreground">/ tiket</span>
        </div>
        {remaining !== undefined && !isSoldOut && (
          <p className="mt-1 text-xs font-medium text-emerald-600">Sisa {remaining} tiket</p>
        )}
        {isSoldOut && <p className="mt-1 text-xs font-bold text-red-600">Tiket Habis</p>}

        <button
          onClick={onBuyClick}
          disabled={isSoldOut}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-3.5 text-sm font-bold text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-50"
        >
          <Ticket className="h-4 w-4" />
          {isSoldOut ? "Tiket Habis" : "Beli Tiket"}
        </button>

        <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-[11px] leading-relaxed text-muted-foreground/70">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
          Tiket resmi • Smart Queue Wavy • Pembayaran aman
        </p>
      </div>

      <div className="flex items-center gap-3 border-t border-border bg-surface px-5 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-foreground text-xs font-extrabold text-white">
          {concert.organizer_name?.slice(0, 2).toUpperCase()}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] text-muted-foreground">Diselenggarakan oleh</p>
          <p className="flex items-center gap-1 truncate text-sm font-bold text-foreground">
            <Building2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            {concert.organizer_name}
          </p>
        </div>
      </div>
    </div>
  );
}
