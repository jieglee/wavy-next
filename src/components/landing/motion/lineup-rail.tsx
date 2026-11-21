"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AsyncContent, EmptyState } from "@/components/states/async-states";
import type { Concert } from "@/types/type";
import { useLandingConcerts } from "./landing-data";
import ConcertCard from "@/components/concerts/concert-card";

function RailCard({ c }: { c: Concert }) {
  return (
    <ConcertCard
      id={c.id}
      title={c.title}
      location={c.venue}
      organizer={c.organizer_name || c.artist_name || ""}
      price={c.min_price ? Number(c.min_price).toLocaleString("id-ID") : null}
      poster_url={c.poster_url || undefined}
      date={c.date}
      salesStatus={c.sales_status}
      className="w-[300px] shrink-0 sm:w-[280px]"
    />
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
        <motion.div ref={trackRef} style={{ x }} className="flex w-max -rotate-2 gap-6 px-4 sm:px-8" data-rail-track>
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
  const reduce = useReducedMotion();

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
