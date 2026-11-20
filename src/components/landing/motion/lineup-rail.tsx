"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useFormatter, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { AsyncContent, EmptyState } from "@/components/states/async-states";
import { formatIDR } from "@/lib/price";
import type { Concert } from "@/types/type";
import { useLandingConcerts } from "./landing-data";

function PosterCard({ c }: { c: Concert }) {
  const t = useTranslations("Landing.lineup");
  const format = useFormatter();
  return (
    <Link
      href={`/concerts/${c.id}`}
      className="group block w-[240px] shrink-0 sm:w-[280px]"
      aria-label={c.title}
    >
      <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-border bg-gradient-to-br from-stage to-primary-glow">
        {c.poster_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={c.poster_url}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
          />
        ) : (
          <p className="absolute inset-x-4 bottom-4 font-display text-xl font-bold leading-tight text-primary-foreground">{c.title}</p>
        )}
      </div>
      <p className="mt-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        {c.date ? format.dateTime(new Date(c.date), { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" }) : ""}
      </p>
      <h3 className="mt-1 line-clamp-2 font-display text-base font-bold leading-snug text-foreground">{c.title}</h3>
      <p className="mt-1 font-mono text-xs text-muted-foreground">
        {c.min_price ? t("from", { price: formatIDR(Number(c.min_price)) }) : t("noPrice")}
      </p>
    </Link>
  );
}

/** Rel horizontal: scroll vertikal menggeser poster ke kiri (desktop & mobile). */
function ScrollRail({ items }: { items: Concert[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // geser sejauh lebar rel dikurangi satu layar; dihitung dari jumlah kartu agar tanpa pengukuran DOM
  const x = useTransform(scrollYProgress, [0, 1], ["0%", `-${Math.max(0, items.length - 1) * (100 / items.length)}%`]);
  return (
    <div ref={ref} style={{ height: `${Math.min(items.length, 12) * 38 + 60}vh` }} className="relative">
      <div className="sticky top-0 flex h-svh flex-col justify-center overflow-hidden">
        <motion.div style={{ x }} className="flex w-max -rotate-2 gap-6 px-4 sm:px-8">
          {items.map((c) => (
            <PosterCard key={c.id} c={c} />
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
                  <PosterCard key={c.id} c={c} />
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
