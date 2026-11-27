"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useScroll, useTransform } from "motion/react";
import { useReducedMotionSafe } from "@/hooks/use-reduced-motion-safe";
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
    <Link href={`/concerts/${c.id}`} className="group block w-[260px] shrink-0 sm:w-[300px]">
      <div className="flex flex-col gap-3">
        <div className="relative rounded-lg transition-[transform,box-shadow] duration-300 motion-safe:group-hover:-translate-y-1 group-hover:shadow-[0_18px_30px_-18px_color-mix(in_oklab,var(--primary)_65%,transparent)]">
          <div className="relative aspect-[2.26/1] overflow-hidden rounded-lg bg-muted transition-[filter] duration-300 group-hover:brightness-110 group-hover:saturate-110">
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
 * Rel horizontal yang di-pin: scroll vertikal menggeser kartu ke kiri.
 * Jarak geser = lebar track − lebar viewport (diukur dengan ResizeObserver), jadi kartu terakhir
 * berhenti tepat di padding kanan yang sama dengan padding kiri, tanpa ruang kosong di ujung.
 * Tinggi section = 1 layar + jarak geser, sehingga geser horizontal sebanding 1:1 dengan scroll.
 */
function ScrollRail({ items }: { items: Concert[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [distance, setDistance] = useState(0);
  const distanceMv = useMotionValue(0);

  useEffect(() => {
    const viewport = viewportRef.current;
    const track = trackRef.current;
    if (!viewport || !track) return;
    const ro = new ResizeObserver(() => {
      const d = Math.max(0, Math.ceil(track.scrollWidth - viewport.clientWidth));
      distanceMv.set(d);
      setDistance(d);
    });
    ro.observe(viewport);
    ro.observe(track);
    return () => ro.disconnect();
  }, [distanceMv]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const x = useTransform(() => -scrollYProgress.get() * distanceMv.get());

  return (
    <div ref={ref} style={{ height: `calc(100svh + ${distance}px)` }} className="relative" data-rail>
      <div ref={viewportRef} className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <motion.div ref={trackRef} style={{ x }} className="flex w-max gap-6 px-4 sm:px-8" data-rail-track>
          {items.map((c) => (
            <RailCard key={c.id} c={c} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}

export function LineupRail() {
  const t = useTranslations("Landing.lineup");
  const concerts = useLandingConcerts();
  const reduce = useReducedMotionSafe();

  return (
    <section aria-labelledby="lineup-title" className="relative overflow-x-clip bg-background">
      <div className="mx-auto max-w-7xl px-4 pt-16 sm:px-6 lg:px-8">
        <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-primary">{t("eyebrow")}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h2 id="lineup-title" className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            {t("title")}
          </h2>
          <Link href="/concerts" className="text-sm font-semibold text-primary hover:underline">
            {t("all")}
          </Link>
        </div>
      </div>
      <div className="pb-8 pt-6">
        <AsyncContent
          resource={concerts}
          loadingRows={2}
          empty={<EmptyState title={t("empty")} />}
        >
          {(list) => {
            const items = list.slice(0, 10);
            return reduce ? (
              <div className="flex gap-6 overflow-x-auto px-4 pb-4 sm:px-8">
                {items.map((c) => (
                  <RailCard key={c.id} c={c} />
                ))}
              </div>
            ) : (
              <ScrollRail items={items} />
            );
          }}
        </AsyncContent>
      </div>
    </section>
  );
}
