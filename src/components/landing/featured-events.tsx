"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import ConcertCard from "@/components/concerts/concert-card";
import { apiGet } from "@/lib/api";
import { useApiResource } from "@/hooks/use-api-resource";
import { EmptyState, ErrorState } from "@/components/states/async-states";
import type { Concert, SalesStatus } from "@/types/type";

interface DisplayEvent {
  id: number;
  title: string;
  organizer: string;
  location: string;
  price: string | null;
  poster_url?: string;
  date: string;
  salesStatus?: SalesStatus;
}

// dekorasi kartu tanpa poster (bukan data)
const extractConcerts = (data: unknown): Concert[] => {
  if (Array.isArray(data)) return data as Concert[];
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.concerts)) return d.concerts as Concert[];
    if (Array.isArray(d.data)) return d.data as Concert[];
    if (Array.isArray(d.featured_events)) return d.featured_events as Concert[];
    if (Array.isArray(d.events)) return d.events as Concert[];
    if (d.concerts && typeof d.concerts === "object" && Array.isArray((d.concerts as Record<string, unknown>).data)) {
      return (d.concerts as Record<string, unknown>).data as Concert[];
    }
  }
  return [];
};

const toDisplay = (c: Concert): DisplayEvent => ({
  id: c.id,
  title: c.title,
  organizer: c.artist_name || "",
  location: c.venue || "",
  price: c.min_price ? Number(c.min_price).toLocaleString("id-ID") : null,
  poster_url: c.poster_url,
  date: c.date,
  salesStatus: c.sales_status,
});

// /concerts dulu; kalau kosong pakai featured di /homepage. Tanpa data karangan.
async function loadFeatured(): Promise<DisplayEvent[]> {
  const concerts = extractConcerts(await apiGet<unknown>("/concerts"));
  const list = concerts.length > 0 ? concerts : extractConcerts(await apiGet<unknown>("/homepage"));
  return list.slice(0, 20).map(toDisplay);
}

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" className={className}>
      <path
        fill="currentColor"
        d="M685.2 104.7a64 64 0 0 1 0 90.5L368.4 512l316.8 316.8a64 64 0 0 1-90.4 90.5l-362.1-362a64 64 0 0 1 0-90.5l362-362.1a64 64 0 0 1 90.5 0"
      />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" className={className} style={{ transform: "scaleX(-1)" }}>
      <path
        fill="currentColor"
        d="M685.2 104.7a64 64 0 0 1 0 90.5L368.4 512l316.8 316.8a64 64 0 0 1-90.4 90.5l-362.1-362a64 64 0 0 1 0-90.5l362-362.1a64 64 0 0 1 90.5 0"
      />
    </svg>
  );
}

export default function FeaturedEvents() {
  const t = useTranslations("FeaturedEvents");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const featured = useApiResource("featured-events", loadFeatured);
  const events = featured.data ?? [];

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, events.length]);

  const scrollByCard = (dir: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const gap = 16; // gap-4
    const cardWidth = card?.offsetWidth ?? (window.innerWidth < 640 ? 290 : 320);
    const amount = cardWidth + gap;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center gap-2">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            viewBox="0 0 24 24"
            className="animate-megaphone text-primary"
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
              <path d="m5.549 10.819l-1.826 1.615a1.414 1.414 0 0 0-.288 1.77l1.653 2.9a1.404 1.404 0 0 0 1.662.629l2.297-.783z" />
              <path d="M9.258 4.59a26.7 26.7 0 0 1-1.71 4.072a7.2 7.2 0 0 1-2 2.157l3.499 6.112a7.3 7.3 0 0 1 2.882-.668c1.464.066 2.92.25 4.353.552" />
              <path d="m9.253 4.591l1.215-.706a1.395 1.395 0 0 1 1.917.517l5.607 9.774a1.42 1.42 0 0 1-.519 1.92l-1.215.707zM3.56 14.416l-.606.358a1.4 1.4 0 0 0-.658.86a1.4 1.4 0 0 0 .149 1.074a1.4 1.4 0 0 0 .854.662a1.38 1.38 0 0 0 1.068-.149l.567-.358m4.804-.203l1.701 2.97a1.44 1.44 0 0 1-.509 1.933a1.404 1.404 0 0 1-1.922-.522l-1.922-3.414m12.55-10.735l-2.498 1.45m4.612 3.531h-2.883M16.225 2.25l-1.442 2.515" />
            </g>
          </svg>
          <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">
            {t("title")}
          </h2>
        </div>

        {featured.loading ? (
          <div className="flex gap-3 overflow-hidden pb-2 pt-2 sm:gap-4" role="status" aria-label={t("loading")}>
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="w-[260px] shrink-0 animate-pulse sm:w-[280px] lg:w-[270px]">
                <div className="aspect-4/5 w-full rounded-xl bg-muted" />
                <div className="mt-3 h-3 w-1/2 rounded bg-muted" />
                <div className="mt-2 h-4 w-3/4 rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : featured.error ? (
          <ErrorState error={featured.error} onRetry={featured.reload} />
        ) : events.length === 0 ? (
          <EmptyState title={t("empty")} />
        ) : (
        <div className="relative">
          {canScrollLeft && (
            <button
              onClick={() => scrollByCard(-1)}
              aria-label={t("prev")}
              className="absolute -left-4 top-17.5 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground shadow-lg transition-transform hover:scale-105 sm:top-44"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={() => scrollByCard(1)}
              aria-label={t("next")}
              className="absolute -right-4 top-17.5 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-foreground shadow-lg transition-transform hover:scale-105 sm:top-44"
            >
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          )}

          <div ref={scrollerRef} className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 pt-2 sm:gap-4">
            {events.map((event) => (
              <ConcertCard
                key={event.id}
                id={event.id}
                title={event.title}
                location={event.location}
                organizer={event.organizer}
                price={event.price}
                poster_url={event.poster_url}
                date={event.date}
                salesStatus={event.salesStatus}
                className="w-[300px] shrink-0 snap-start sm:w-[280px] lg:w-[270px] xl:w-[calc((100%-48px)/4)]"
              />
            ))}
          </div>
        </div>
        )}
      </div>
    </section>
  );
}