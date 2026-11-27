"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AsyncContent, EmptyState } from "@/components/states/async-states";
import type { Concert } from "@/types/type";
import { useLandingConcerts } from "./landing-data";
import { EventPoster } from "@/components/concerts/event-poster";

/**
 * Kartu rel "Now showing": banner lebar 2.26:1 tanpa border, lalu lokasi, judul, organizer,
 * garis putus-putus, dan harga "Mulai dari".
 * Sengaja terpisah dari ConcertCard supaya kartu di halaman lain tidak ikut berubah.
 */
function RailCard({ c }: { c: Concert }) {
  const t = useTranslations("FeaturedEvents");
  const organizer = c.organizer_name || c.artist_name || "";
  const price = c.min_price ? Number(c.min_price).toLocaleString("id-ID") : null;
  return (
    <Link href={`/concerts/${c.id}`} className="group block h-full">
      <div className="flex flex-col gap-3">
        <div className="relative rounded-lg transition-[transform,box-shadow] duration-300 motion-safe:group-hover:-translate-y-1 group-hover:shadow-[0_18px_30px_-18px_color-mix(in_oklab,var(--primary)_65%,transparent)]">
          <div data-banner className="relative aspect-[2.26/1] overflow-hidden rounded-lg bg-muted transition-[filter] duration-300 group-hover:brightness-110 group-hover:saturate-110">
            <EventPoster
              src={c.poster_url || undefined}
              title={c.title}
              className="absolute inset-0 h-full w-full object-cover"
            />
          </div>
          <div className="pointer-events-none absolute inset-0 -translate-x-full rounded-lg bg-[linear-gradient(115deg,transparent_30%,color-mix(in_oklab,var(--background)_26%,transparent)_50%,transparent_72%)] opacity-0 transition-[transform,opacity] duration-500 ease-out motion-safe:group-hover:translate-x-full group-hover:opacity-100" />
        </div>
        <div className="flex flex-col gap-1">
          <p className="line-clamp-1 min-h-6 text-sm text-muted-foreground">{c.venue}</p>
          <h3 className="line-clamp-1 text-[18px] font-semibold leading-7 text-foreground transition-colors duration-300 group-hover:text-primary">
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

/**
 * Carousel biasa: 4 kartu per layar di desktop, ~1,25 kartu di HP (geser dengan jari).
 * Tombol kiri/kanan hanya di md ke atas, muncul saat carousel di-hover, dan hilang di ujung.
 * Posisi vertikal tombol = tengah banner (diukur, karena tinggi banner ikut lebar kartu).
 */
function Carousel({ items }: { items: Concert[] }) {
  const t = useTranslations("FeaturedEvents");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);
  const [arrowTop, setArrowTop] = useState<number | null>(null);

  const update = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    const banner = el.querySelector<HTMLElement>("[data-banner]");
    if (banner) setArrowTop(banner.offsetTop + banner.offsetHeight / 2);
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    el.addEventListener("scroll", update, { passive: true });
    return () => {
      ro.disconnect();
      el.removeEventListener("scroll", update);
    };
  }, [update, items.length]);

  const scrollByPage = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth, behavior: "smooth" });
  };

  const arrowClass =
    "absolute z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background text-primary opacity-0 shadow-[0_4px_8px_color-mix(in_oklab,var(--foreground)_10%,transparent)] transition-opacity hover:opacity-100 focus-visible:opacity-100 group-hover/carousel:opacity-100 md:flex";

  return (
    <div className="group/carousel relative">
      <div
        ref={scrollerRef}
        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth py-2 pl-2 max-md:-mr-4"
      >
        {items.map((c) => (
          <div key={c.id} className="min-w-0 shrink-0 grow-0 basis-[calc(80%-4px)] snap-start md:basis-[calc((100%-48px)/4)]">
            <RailCard c={c} />
          </div>
        ))}
      </div>
      {canPrev && (
        <button
          type="button"
          onClick={() => scrollByPage(-1)}
          aria-label={t("prev")}
          className={`${arrowClass} -left-4`}
          style={{ top: arrowTop ?? "35%" }}
        >
          <ChevronLeft className="size-5" aria-hidden />
        </button>
      )}
      {canNext && (
        <button
          type="button"
          onClick={() => scrollByPage(1)}
          aria-label={t("next")}
          className={`${arrowClass} -right-4`}
          style={{ top: arrowTop ?? "35%" }}
        >
          <ChevronRight className="size-5" aria-hidden />
        </button>
      )}
    </div>
  );
}

export function LineupRail() {
  const t = useTranslations("Landing.lineup");
  const concerts = useLandingConcerts();

  return (
    <section aria-labelledby="lineup-title" className="relative overflow-x-clip bg-background">
      <div className="mx-auto max-w-7xl px-4 pb-12 pt-16 sm:px-6 lg:px-8">
        <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-primary">{t("eyebrow")}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h2 id="lineup-title" className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            {t("title")}
          </h2>
          <Link href="/concerts" className="text-sm font-semibold text-primary hover:underline">
            {t("all")}
          </Link>
        </div>
        <div className="mt-6">
          <AsyncContent
            resource={concerts}
            loadingRows={2}
            empty={<EmptyState title={t("empty")} />}
          >
            {(list) => <Carousel items={list.slice(0, 10)} />}
          </AsyncContent>
        </div>
      </div>
    </section>
  );
}
