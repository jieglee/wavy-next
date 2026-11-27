"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Ticket } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AsyncContent, EmptyState } from "@/components/states/async-states";
import type { Concert } from "@/types/type";
import { useLandingConcerts } from "./landing-data";
import EventCard from "@/components/concerts/event-card";

/**
 * Carousel biasa: 4 kartu per layar di desktop, ~1,25 kartu di HP (geser dengan jari).
 * Tombol bulat hanya di md ke atas: awalnya cuma tombol kanan; tombol kiri muncul setelah digeser.
 * Sekali klik = geser satu kartu. Tombol kanan hilang di ujung.
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
    // posisi awal bukan 0: snap-start menarik kartu pertama ke tepi, melewati padding kiri scroller.
    // Tombol kiri baru muncul kalau sudah digeser melewati posisi awal itu.
    const first = el.firstElementChild as HTMLElement | null;
    const start = first ? first.offsetLeft - el.offsetLeft : 0;
    setCanPrev(el.scrollLeft > start + 4);
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

  // satu klik = geser satu kartu (lebar kartu + gap 16px)
  const scrollByCard = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    const slide = el?.firstElementChild as HTMLElement | null;
    if (!el || !slide) return;
    el.scrollBy({ left: dir * (slide.offsetWidth + 16), behavior: "smooth" });
  };

  const arrowClass =
    "absolute z-10 hidden size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background text-primary shadow-[0_4px_8px_color-mix(in_oklab,var(--foreground)_10%,transparent)] transition-transform hover:scale-105 md:flex";

  return (
    <div className="group/carousel relative">
      <div
        ref={scrollerRef}
        className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth py-2 pl-2 max-md:-mr-4"
      >
        {items.map((c) => (
          <div key={c.id} className="min-w-0 shrink-0 grow-0 basis-[calc(80%-4px)] snap-start md:basis-[calc((100%-48px)/4)]">
            <EventCard concert={c} />
          </div>
        ))}
      </div>
      {canPrev && (
        <button
          type="button"
          onClick={() => scrollByCard(-1)}
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
          onClick={() => scrollByCard(1)}
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 id="lineup-title" className="flex items-center gap-2 font-display text-xl font-bold tracking-tight text-foreground md:text-2xl">
            <Ticket className="size-6 shrink-0 -rotate-12 text-primary md:size-7" aria-hidden />
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
