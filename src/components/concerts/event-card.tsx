"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { EventPoster } from "@/components/concerts/event-poster";
import type { Concert } from "@/types/type";

/**
 * Kartu event ala daftar event Loket: banner lebar 2.26:1 tanpa border, lalu lokasi, judul,
 * organizer, garis putus-putus, dan harga "Mulai dari".
 * Hover: kartu naik + bayangan primary, banner lebih terang, kilau kaca lewat kiri→kanan,
 * judul terangkat 3D. Transisi memakai properti `translate` karena Tailwind v4
 * menggerakkan translate-* lewat properti itu, bukan `transform`.
 * `data-banner` dipakai carousel untuk menaruh tombol panah di tengah banner.
 */
export default function EventCard({ concert: c, className }: { concert: Concert; className?: string }) {
  const t = useTranslations("FeaturedEvents");
  const organizer = c.organizer_name || c.artist_name || "";
  const price = c.min_price ? Number(c.min_price).toLocaleString("id-ID") : null;
  return (
    <Link href={`/concerts/${c.id}`} className={`group block h-full ${className ?? ""}`}>
      <div className="flex flex-col gap-3">
        <div className="relative rounded-lg transition-[translate,box-shadow] duration-300 ease-out motion-safe:group-hover:-translate-y-1 group-hover:shadow-[0_18px_30px_-18px_color-mix(in_oklab,var(--primary)_65%,transparent)]">
          <div data-banner className="relative aspect-[2.26/1] overflow-hidden rounded-lg bg-muted transition-[filter] duration-300 group-hover:brightness-110 group-hover:saturate-110">
            <EventPoster
              src={c.poster_url || undefined}
              title={c.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          {/* efek kaca: kilau miring lewat dari kiri ke kanan saat di-hover */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-lg">
            <div className="absolute inset-0 -translate-x-full bg-[linear-gradient(115deg,transparent_30%,color-mix(in_oklab,white_26%,transparent)_50%,transparent_72%)] opacity-0 transition-[translate,opacity] duration-700 ease-out group-hover:translate-x-full group-hover:opacity-100" />
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <p className="line-clamp-1 min-h-6 text-sm text-muted-foreground">{c.venue}</p>
          <h3 className="line-clamp-1 transform-gpu text-[18px] font-semibold leading-7 text-foreground transition-[transform,text-shadow,color] duration-300 ease-out group-hover:text-primary group-hover:[text-shadow:0_8px_18px_color-mix(in_oklab,var(--primary)_26%,transparent)] group-hover:[transform:perspective(900px)_translateZ(12px)_rotateX(4deg)]">
            {c.title}
          </h3>
          {organizer && <p className="line-clamp-1 text-sm text-muted-foreground">{t("byOrganizer", { organizer })}</p>}
          <div className="mt-1 border-t border-dashed border-border pt-3">
            {price ? (
              <>
                <p className="text-sm text-muted-foreground/80">{t("startingFrom")}</p>
                <p className="mt-1 text-base font-semibold leading-6 text-foreground">Rp{price}</p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">{t("priceUnavailable")}</p>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
