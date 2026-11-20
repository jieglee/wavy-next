"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface ConcertCardProps {
  id: number;
  title: string;
  location: string;
  organizer: string;
  /** null = backend belum punya harga; jangan diisi angka karangan */
  price: string | null;
  gradient: string;
  poster_url?: string;
  className?: string;
}

export default function ConcertCard({
  id,
  title,
  location,
  organizer,
  price,
  gradient,
  poster_url,
  className,
}: ConcertCardProps) {
  const t = useTranslations("FeaturedEvents");
  return (
    <Link href={`/concerts/${id}`} className={`group block ${className ?? ""}`}>
      <div className="transition-transform duration-300 ease-out group-hover:-translate-y-2">
        <div className="relative aspect-16/7 overflow-hidden rounded-xl border border-border shadow-[0_4px_14px_color-mix(in_oklab,var(--foreground)_12%,transparent)] transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-[0_16px_32px_-8px_color-mix(in_oklab,var(--foreground)_28%,transparent)]">
          {poster_url ? (
            <img
              src={poster_url}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div
              className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105"
              style={{ background: gradient }}
            />
          )}
          <div className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
        </div>
      </div>
      <p className="mt-3 truncate text-xs text-muted-foreground/80">{location}</p>
      <h3 className="mt-1 block w-full truncate font-display text-sm font-bold text-foreground transition-all duration-300 group-hover:text-primary">
        {title}
      </h3>
      <p className="mt-0.5 truncate text-xs text-muted-foreground">
        {t("byOrganizer", { organizer })}
      </p>
      <div className="mt-3 border-t border-border pt-2.5">
        {price ? (
          <>
            <p className="text-[0.65rem] text-muted-foreground/80">{t("startingFrom")}</p>
            <p className="font-mono text-sm font-bold text-foreground">Rp{price}</p>
          </>
        ) : (
          <p className="text-xs text-muted-foreground">{t("priceUnavailable")}</p>
        )}
      </div>
    </Link>
  );
}
