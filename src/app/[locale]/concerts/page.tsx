"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Ticket, ArrowLeft, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import {
  EVENT_CATEGORIES,
  countByCategory,
  getEventCategory,
  matchesCategory,
  resolveCategorySlug,
  type EventCategorySlug,
} from "@/lib/event-categories";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import EventCard from "@/components/concerts/event-card";
import { apiGet } from "@/lib/api";
import { useApiResource } from "@/hooks/use-api-resource";
import { ErrorState } from "@/components/states/async-states";
import type { Concert } from "@/types/type";

function extractConcerts(data: unknown): Concert[] {
  if (Array.isArray(data)) return data as Concert[];
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.concerts)) return d.concerts as Concert[];
    if (Array.isArray(d.data)) return d.data as Concert[];
    if (Array.isArray(d.events)) return d.events as Concert[];
    if (d.concerts && typeof d.concerts === "object" && Array.isArray((d.concerts as Record<string, unknown>).data)) {
      return (d.concerts as Record<string, unknown>).data as Concert[];
    }
  }
  return [];
}

// nama negara dari Intl sesuai bahasa aktif (id: "Korea Selatan", en: "South Korea")
const countryName = (code: string, locale: string) => {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(code.toUpperCase()) ?? code;
  } catch {
    return code;
  }
};

const COUNTRY_KEYWORDS: Record<string, string[]> = {
  id: ["jakarta", "bandung", "tangerang", "bogor", "surabaya", "yogyakarta", "bali", "medan", "semarang", "indonesia", "ice bsd", "jiexpo", "kemayoran", "senayan", "gbk", "bengkel"],
  sg: ["singapore"],
  my: ["kuala lumpur", "bukit jalil", "malaysia", "selangor"],
  th: ["bangkok", "rajamangala", "thailand"],
  kr: ["seoul", "gocheok", "korea", "incheon", "busan"],
};

function byCountry(c: Concert, country: string): boolean {
  const kws = COUNTRY_KEYWORDS[country];
  if (!kws) return true;
  const venue = (c.venue || "").toLowerCase();
  return kws.some((k) => venue.includes(k));
}

function ConcertsPageInner() {
  const t = useTranslations("ConcertsExplore");
  const tc = useTranslations("EventCategories");
  const locale = useLocale();
  const searchParams = useSearchParams();

  // URL = satu-satunya sumber state filter, jadi modal Category / search di navbar langsung
  // mengubah daftar walau halaman ini sudah terbuka.
  const rawCat = searchParams.get("category");
  const selectedCat = resolveCategorySlug(rawCat);
  const query = (searchParams.get("q") || "").trim();
  const country = searchParams.get("country") || "";

  const setFilters = (next: { category?: EventCategorySlug | null; q?: string; country?: string }) => {
    const params = new URLSearchParams();
    const cat = next.category === undefined ? selectedCat : next.category;
    const q = next.q === undefined ? query : next.q;
    const ctry = next.country === undefined ? country : next.country;
    if (cat) params.set("category", cat);
    if (q) params.set("q", q);
    if (ctry) params.set("country", ctry);
    const qs = params.toString();
    // History API asli: langsung sinkron dengan useSearchParams tanpa render ulang di server,
    // jadi filter terasa instan; tombol Back tetap kembali ke filter sebelumnya.
    window.history.pushState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
  };

  // Backend mencari teks (judul/artis); kategori dicocokkan di sini dengan aturan
  // src/lib/event-categories.ts karena kolom category di database terlalu kasar.
  const listPath = `/concerts${query ? `?q=${encodeURIComponent(query)}` : ""}`;
  const listRes = useApiResource(listPath, () => apiGet<unknown>(listPath).then(extractConcerts));
  const loading = listRes.loading;
  // tanpa useMemo manual: React Compiler sudah memoize perhitungan ini
  const all = listRes.data ?? [];
  const base = country ? all.filter((c) => byCountry(c, country)) : all;
  const counts = countByCategory(base);
  const concerts = selectedCat ? base.filter((c) => matchesCategory(c, selectedCat)) : base;
  // chip: kategori yang punya event untuk pencarian/negara saat ini, plus yang sedang dipilih
  const chips = EVENT_CATEGORIES.filter((c) => counts[c.slug] > 0 || c.slug === selectedCat).sort(
    (a, b) => counts[b.slug] - counts[a.slug]
  );
  const selectedLabel = selectedCat ? tc(`names.${selectedCat}`) : "";
  const SelectedIcon = selectedCat ? getEventCategory(selectedCat).icon : Ticket;

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Title */}
        <div className="mb-8">
          <div>
            <Link
              href="/"
              className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground/80 hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              {t("backHome")}
            </Link>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              {t("title")}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
          </div>
        </div>

        {/* Category chips — kategori yang sama dengan modal Category di navbar */}
        <div className="scrollbar-hide mb-6 flex gap-2 overflow-x-auto pb-2">
          {[null, ...chips].map((cat) => {
            const active = selectedCat === (cat?.slug ?? null);
            const Icon = cat?.icon;
            return (
              <button
                key={cat?.slug ?? "all"}
                type="button"
                onClick={() => setFilters({ category: cat?.slug ?? null })}
                aria-pressed={active}
                className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-colors ${
                  active
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "border border-border bg-white text-muted-foreground hover:border-primary/30 hover:text-foreground"
                }`}
              >
                {Icon && <Icon className="size-3.5" aria-hidden />}
                {cat ? tc(`names.${cat.slug}`) : t("all")}
                {cat && !listRes.loading && (
                  <span className={active ? "text-primary-foreground/80" : "text-muted-foreground/70"}>{counts[cat.slug]}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Filter aktif: pencarian & negara */}
        {(query || country) && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            {query && (
              <span className="inline-flex items-center gap-2 rounded-full bg-info-subtle py-1.5 pl-4 pr-1.5 text-xs font-bold text-info">
                {t("searchResult", { q: query })}
                <button
                  type="button"
                  onClick={() => setFilters({ q: "" })}
                  aria-label={t("clearSearch")}
                  className="flex size-5 items-center justify-center rounded-full hover:bg-info/15"
                >
                  <X className="size-3" aria-hidden />
                </button>
              </span>
            )}
            {country && (
              <>
                <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary">
                  {t("countryChip", { country: countryName(country, locale) })}
                </span>
                <button
                  onClick={() => setFilters({ country: "" })}
                  className="rounded-full border border-border bg-white px-4 py-2 text-xs font-bold text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                >
                  {t("clearCountry")}
                </button>
              </>
            )}
          </div>
        )}

        {/* Concerts Grid — same card as landing (FeaturedEvents) */}
        {loading ? (
          <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2.26/1] w-full rounded-lg bg-border" />
                <div className="mt-3 h-3 w-1/2 rounded bg-border" />
                <div className="mt-2 h-4 w-3/4 rounded bg-border" />
                <div className="mt-1 h-3 w-2/3 rounded bg-border" />
                <div className="mt-3 border-t border-dashed border-border pt-3">
                  <div className="h-3 w-16 rounded bg-border" />
                  <div className="mt-1 h-4 w-24 rounded bg-border" />
                </div>
              </div>
            ))}
          </div>
        ) : listRes.error ? (
          <ErrorState error={listRes.error} onRetry={listRes.reload} />
        ) : concerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-white px-6 py-16 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-info-subtle text-info">
              <SelectedIcon className="size-7" aria-hidden />
            </span>
            <h3 className="mt-4 text-lg font-bold text-foreground">
              {query && selectedCat
                ? t("emptySearchTitle")
                : selectedCat
                  ? t("emptyCategoryTitle", { category: selectedLabel })
                  : t("emptyTitle")}
            </h3>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {query && selectedCat
                ? t("emptySearchBody", { q: query })
                : selectedCat
                  ? t("emptyCategoryBody")
                  : country
                    ? t("emptyCountry", { country: countryName(country, locale) })
                    : t("emptyBody")}
            </p>
            <button
              type="button"
              onClick={() => setFilters({ category: null, q: "", country: "" })}
              className="mt-5 rounded-full bg-primary px-5 py-2.5 text-xs font-bold text-primary-foreground transition-[filter] hover:brightness-110"
            >
              {t("seeAll")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {concerts.map((concert) => (
              <EventCard key={concert.id} concert={concert} />
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default function ConcertsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <ConcertsPageInner />
    </Suspense>
  );
}
