"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useReducedMotionSafe } from "@/hooks/use-reduced-motion-safe";
import { EVENT_CATEGORIES, countByCategory } from "@/lib/event-categories";
import { useLandingConcerts } from "./motion/landing-data";

/**
 * Discovery di landing (pengganti statistik): carousel banner promo + navigasi kategori.
 * Banner = aset di public/images/banner (rasio 3:1). Ganti/tambah banner cukup di BANNERS.
 */
const BANNERS = [
  { id: "on-sale", src: "/images/banner/ticket-on-sale-now.png", w: 2145, h: 733, href: "/concerts" },
  { id: "bts", src: "/images/banner/your-favorite-bts.png", w: 2172, h: 724, href: "/concerts?q=bts" },
  { id: "eventmu", src: "/images/banner/tampilkan-eventmu.png", w: 2172, h: 724, href: "/organizer-guide" },
] as const;

const AUTO_MS = 6000;
const MAX_TILES = 11;

// Warna tile bergantian tapi tetap dalam palet Wavy (pink, biru, ungu, rose, navy). Token saja.
const TILE_TONES: { bg: string; fg: string }[] = [
  { bg: "color-mix(in oklab, var(--primary) 12%, var(--background))", fg: "var(--primary)" },
  { bg: "var(--info-subtle)", fg: "var(--info)" },
  { bg: "color-mix(in oklab, var(--primary-glow) 12%, var(--background))", fg: "var(--primary-glow)" },
  { bg: "color-mix(in oklab, var(--chart-3) 28%, var(--background))", fg: "color-mix(in oklab, var(--primary) 80%, var(--foreground))" },
  { bg: "color-mix(in oklab, var(--foreground) 7%, var(--background))", fg: "var(--foreground)" },
];

function BannerCarousel() {
  const t = useTranslations("Landing.discover");
  const reduce = useReducedMotionSafe();
  const n = BANNERS.length;
  // Banner digandakan 3x supaya loop tak berujung: posisi selalu di salinan tengah, dan saat
  // melewati batas, posisi dilompatkan diam-diam (tanpa transisi) ke slide yang sama di tengah.
  const slides = n > 1 ? [...BANNERS, ...BANNERS, ...BANNERS] : [...BANNERS];
  const [pos, setPos] = useState(n > 1 ? n : 0);
  const [animate, setAnimate] = useState(true);
  const touchX = useRef<number | null>(null);
  const current = pos % n;

  useEffect(() => {
    if (reduce || n < 2) return;
    const id = setInterval(() => setPos((p) => p + 1), AUTO_MS);
    return () => clearInterval(id);
  }, [reduce, n]);

  // nyalakan lagi transisi satu frame setelah lompatan diam-diam
  useEffect(() => {
    if (animate) return;
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    return () => cancelAnimationFrame(raf);
  }, [animate]);

  // setelah transisi (700ms) keluar dari salinan tengah, lompat diam-diam kembali ke tengah.
  // Pakai timer (bukan transitionend) supaya tetap jalan walau tab sempat di latar belakang.
  useEffect(() => {
    if (n < 2 || (pos >= n && pos < 2 * n)) return;
    const id = setTimeout(() => {
      setAnimate(false);
      setPos(n + (((pos % n) + n) % n));
    }, 720);
    return () => clearTimeout(id);
  }, [pos, n]);

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={t("bannersLabel")}
      className="relative"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 40) setPos((p) => p + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      <div className="relative overflow-hidden [--slide:90%] sm:[--slide:80%] lg:[--slide:76%]">
        {/* slide aktif tepat di tengah, tetangga mengintip di kiri-kanan */}
        <div
          className={`flex gap-4 ${animate ? "transition-[translate] duration-700 ease-[cubic-bezier(.65,0,.35,1)]" : ""}`}
          style={{ translate: `calc((100% - var(--slide)) / 2 - ${pos} * (var(--slide) + 1rem))` } as CSSProperties}
        >
          {slides.map((b, i) => {
            const active = i === pos;
            return (
              <Link
                key={`${b.id}-${i}`}
                href={b.href}
                aria-label={t(`banner.${b.id}`)}
                aria-hidden={!active}
                tabIndex={active ? 0 : -1}
                onClick={(e) => {
                  if (!active) {
                    e.preventDefault();
                    setPos(i);
                  }
                }}
                className={`relative block shrink-0 basis-[var(--slide)] overflow-hidden rounded-2xl bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 ${
                  animate ? "transition-[opacity,scale] duration-700" : ""
                } ${active ? "opacity-100" : "scale-[0.96] opacity-55"}`}
              >
                <Image
                  src={b.src}
                  alt={t(`banner.${b.id}`)}
                  width={b.w}
                  height={b.h}
                  sizes="(min-width: 1280px) 940px, (min-width: 640px) 80vw, 90vw"
                  className="aspect-[2.3/1] h-auto w-full object-cover sm:aspect-[3/1]"
                  priority={i === pos}
                />
              </Link>
            );
          })}
        </div>

        {/* indikator putih di dalam banner aktif, tengah bawah */}
        {n > 1 && (
          <div className="absolute bottom-2.5 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-foreground/25 px-2 py-1 backdrop-blur-sm sm:bottom-4">
            {BANNERS.map((b, i) => (
              <button
                key={b.id}
                type="button"
                onClick={() => setPos(n + i)}
                aria-label={t("goTo", { num: i + 1 })}
                aria-current={i === current}
                className={`h-1.5 rounded-full transition-[width,background-color] duration-300 ${
                  i === current ? "w-5 bg-primary-foreground" : "w-1.5 bg-primary-foreground/50 hover:bg-primary-foreground/80"
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryTiles() {
  const t = useTranslations("Landing.discover");
  const tc = useTranslations("EventCategories");
  const concerts = useLandingConcerts();
  const counts = concerts.data ? countByCategory(concerts.data) : null;
  // kategori yang punya event, terbanyak dulu; tanpa data (gagal/memuat) pakai urutan taksonomi
  const cats = (counts
    ? EVENT_CATEGORIES.filter((c) => counts[c.slug] > 0).sort((a, b) => counts[b.slug] - counts[a.slug])
    : EVENT_CATEGORIES
  ).slice(0, MAX_TILES);

  return (
    <div className="mt-8 sm:mt-10">
      <ul
        aria-label={t("categoriesTitle")}
        className="scrollbar-hide -mx-4 flex snap-x gap-2 overflow-x-auto px-4 pb-1 sm:-mx-6 sm:px-6 lg:mx-0 lg:justify-between lg:px-0"
      >
        {concerts.loading && !counts
          ? Array.from({ length: MAX_TILES }, (_, i) => (
              <li key={i} className="flex w-[84px] shrink-0 flex-col items-center gap-2 sm:w-[96px]">
                <span className="size-14 animate-pulse rounded-2xl bg-muted sm:size-16" />
                <span className="h-3 w-14 animate-pulse rounded bg-muted" />
              </li>
            ))
          : cats.map((c, i) => {
              const tone = TILE_TONES[i % TILE_TONES.length];
              return (
                <li key={c.slug} className="w-[80px] shrink-0 snap-start sm:w-[96px]">
                  <Link
                    href={`/concerts?category=${c.slug}`}
                    className="group flex flex-col items-center gap-2 rounded-xl p-1 text-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                  >
                    <span
                      className="flex size-14 items-center justify-center rounded-2xl transition-[translate,box-shadow] duration-200 group-hover:shadow-[0_8px_18px_-10px_color-mix(in_oklab,var(--foreground)_40%,transparent)] motion-safe:group-hover:-translate-y-0.5 sm:size-16"
                      style={{ background: tone.bg, color: tone.fg }}
                    >
                      <c.icon className="size-6 sm:size-7" aria-hidden />
                    </span>
                    <span className="text-[11px] font-semibold leading-tight text-foreground group-hover:text-primary sm:text-xs">
                      {tc(`names.${c.slug}`)}
                    </span>
                  </Link>
                </li>
              );
            })}
      </ul>
    </div>
  );
}

export function DiscoverHighlights() {
  const t = useTranslations("Landing.discover");
  return (
    <section aria-label={t("label")} className="bg-background px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <BannerCarousel />
        <CategoryTiles />
      </div>
    </section>
  );
}
