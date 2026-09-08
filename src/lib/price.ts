import type { ConcertDetail } from "@/types/type";

export function getMinPrice(concert: ConcertDetail): number {
  if (concert.ticket_categories?.length) {
    const prices = concert.ticket_categories.map((c) => Number(c.price)).filter((n) => Number.isFinite(n));
    if (prices.length) return Math.min(...prices);
  }
  const p = Number(concert.min_price);
  return Number.isFinite(p) ? p : 0;
}

export function formatIDR(value: number): string {
  return `Rp${value.toLocaleString("id-ID")}`;
}
