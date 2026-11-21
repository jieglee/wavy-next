"use client";

import { MapPin } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { EventPoster } from "@/components/concerts/event-poster";
import SalesBadge from "@/components/concerts/sales-badge";
import type { SalesStatus } from "@/types/type";

interface ConcertCardProps {
  id: number;
  title: string;
  location: string;
  organizer: string;
  /** null = backend belum punya harga; jangan diisi angka karangan */
  price: string | null;
  poster_url?: string;
  /** ISO tanggal konser; kosong = tidak ditampilkan */
  date?: string | null;
  /** status penjualan dari backend; kosong = badge tidak ditampilkan */
  salesStatus?: SalesStatus;
  className?: string;
}

/**
 * Kartu konser. Poster tidak dipotong: gambar utuh (object-contain) di atas latar blur dari
 * poster yang sama, jadi poster portrait, persegi, maupun landscape tampil lengkap.
 * Di bawah 640px kartu horizontal (poster kecil kiri, info kanan) supaya tidak terlalu tinggi.
 */
export default function ConcertCard({
  id,
  title,
  location,
  organizer,
  price,
  poster_url,
  date,
  salesStatus,
  className,
}: ConcertCardProps) {
  const t = useTranslations("FeaturedEvents");
  const format = useFormatter();
  const when = date && !isNaN(new Date(date).getTime())
    ? format.dateTime(new Date(date), { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" })
    : null;

  return (
    <Link href={`/concerts/${id}`} className={`group flex gap-3 sm:flex-col sm:gap-0 ${className ?? ""}`}>
      <div className="w-28 shrink-0 self-start transition-transform duration-300 ease-out motion-safe:group-hover:-translate-y-1.5 sm:w-auto sm:self-auto">
        <div className="relative aspect-4/5 overflow-hidden rounded-xl border border-border bg-stage shadow-[0_4px_14px_color-mix(in_oklab,var(--foreground)_12%,transparent)] transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-[0_16px_32px_-8px_color-mix(in_oklab,var(--foreground)_28%,transparent)]">
          {poster_url && (
            <EventPoster
              src={poster_url}
              title={title}
              alt=""
              className="pointer-events-none absolute inset-0 h-full w-full scale-125 object-cover opacity-70 blur-2xl"
            />
          )}
          <EventPoster
            src={poster_url}
            title={title}
            className="absolute inset-0 h-full w-full object-contain transition-transform duration-500 ease-out motion-safe:group-hover:scale-[1.03]"
          />
          <div className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out motion-safe:group-hover:translate-x-full" />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
      <div className="flex min-h-6 flex-wrap items-center justify-between gap-x-2 gap-y-1 sm:mt-3 sm:flex-nowrap">
        <p className="truncate font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{when}</p>
        {salesStatus && <SalesBadge status={salesStatus} />}
      </div>
      <h3 className="mt-1 line-clamp-2 font-display text-sm font-bold leading-snug text-foreground transition-colors duration-300 group-hover:text-primary">
        {title}
      </h3>
      {location && (
        <p className="mt-1 flex min-w-0 items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
          <span className="truncate">{location}</span>
        </p>
      )}
      {organizer && (
        <p className="mt-0.5 truncate text-xs text-muted-foreground/80">{t("byOrganizer", { organizer })}</p>
      )}
      <div className="mt-auto pt-2 sm:pt-3">
        <div className="border-t border-border pt-2.5">
          {price ? (
            <>
              <p className="text-[0.65rem] text-muted-foreground/80">{t("startingFrom")}</p>
              <p className="font-mono text-sm font-bold text-foreground">Rp{price}</p>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">{t("priceUnavailable")}</p>
          )}
        </div>
      </div>
      </div>
    </Link>
  );
}
