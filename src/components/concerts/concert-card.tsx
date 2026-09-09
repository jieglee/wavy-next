"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

interface ConcertCardProps {
  id: number;
  title: string;
  location: string;
  organizer: string;
  price: string;
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
        <div className="relative aspect-16/7 overflow-hidden rounded-xl border border-[#EDEBF2] shadow-[0_4px_14px_rgba(30,64,175,0.12)] transition-all duration-300 group-hover:border-wavy-blue/30 group-hover:shadow-[0_16px_32px_-8px_rgba(30,64,175,0.28)]">
          {poster_url ? (
            <img
              src={poster_url}
              alt={title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
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
      <p className="mt-3 truncate text-xs text-[#8B889C]">{location}</p>
      <h3 className="mt-1 block w-full truncate font-display text-sm font-bold text-[#1B1A3A] transition-all duration-300 group-hover:text-[#FF5470]">
        {title}
      </h3>
      <p className="mt-0.5 truncate text-xs text-abu-ungu">
        {t("byOrganizer", { organizer })}
      </p>
      <div className="mt-3 border-t border-[#EDEBF2] pt-2.5">
        <p className="text-[0.65rem] text-[#8B889C]">{t("startingFrom")}</p>
        <p className="font-mono text-sm font-bold text-[#1B1A3A]">Rp{price}</p>
      </div>
    </Link>
  );
}
