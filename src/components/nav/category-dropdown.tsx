"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Check, LayoutGrid, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { apiGet } from "@/lib/api";
import { useApiResource } from "@/hooks/use-api-resource";
import type { Concert } from "@/types/type";
import {
  EVENT_CATEGORIES,
  countByCategory,
  resolveCategorySlug,
  type EventCategorySlug,
} from "@/lib/event-categories";

function extractConcerts(data: unknown): Concert[] {
  if (Array.isArray(data)) return data as Concert[];
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    for (const k of ["concerts", "data", "events"]) if (Array.isArray(d[k])) return d[k] as Concert[];
  }
  return [];
}

/**
 * Panel kategori di navbar. Link kategori menuju /concerts?category=<slug>; kalau sedang di
 * /concerts, kata kunci (?q) dan negara (?country) ikut dibawa supaya filter tidak saling menimpa.
 * Jumlah event per kategori dihitung dari GET /concerts dengan aturan yang sama dengan filter.
 */
export default function CategoryDropdown({ onSelect, onClose }: { onSelect?: () => void; onClose?: () => void }) {
  const t = useTranslations("EventCategories");
  const locale = useLocale();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const onConcerts = pathname === "/concerts";
  const active = onConcerts ? resolveCategorySlug(searchParams.get("category")) : null;

  const countsRes = useApiResource("category-counts", () => apiGet<unknown>("/concerts").then(extractConcerts));
  const counts = useMemo(() => (countsRes.data ? countByCategory(countsRes.data) : null), [countsRes.data]);

  const items = useMemo(() => {
    const collator = new Intl.Collator(locale);
    return EVENT_CATEGORIES.map((c) => ({ ...c, label: t(`names.${c.slug}`) })).sort((a, b) =>
      collator.compare(a.label, b.label)
    );
  }, [locale, t]);

  const hrefFor = (slug: EventCategorySlug | null) => {
    const params = new URLSearchParams();
    if (slug) params.set("category", slug);
    if (onConcerts) {
      const q = searchParams.get("q");
      const country = searchParams.get("country");
      if (q) params.set("q", q);
      if (country) params.set("country", country);
    }
    const qs = params.toString();
    return `/concerts${qs ? `?${qs}` : ""}`;
  };

  // Sudah di /concerts: cukup ganti query lewat History API (filter dihitung di klien), tanpa
  // menunggu render ulang dari server. Ctrl/Cmd-klik tetap membuka tab baru seperti link biasa.
  const handleClick = (slug: EventCategorySlug | null) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onConcerts && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey && e.button === 0) {
      e.preventDefault();
      const href = hrefFor(slug);
      window.history.pushState(null, "", `${window.location.pathname}${href.slice("/concerts".length)}`);
    }
    onSelect?.();
  };

  return (
    <div
      role="dialog"
      aria-labelledby="category-panel-title"
      className="flex max-h-[min(78dvh,640px)] w-full flex-col overflow-hidden rounded-2xl border border-border bg-background shadow-[0_24px_60px_-24px_color-mix(in_oklab,var(--foreground)_35%,transparent)]"
    >
      <div className="flex items-start justify-between gap-4 border-b border-border px-4 pb-4 pt-4 sm:px-6 sm:pt-5">
        <div className="min-w-0">
          <p id="category-panel-title" className="text-base font-bold tracking-tight text-foreground sm:text-lg">
            {t("title")}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground sm:text-sm">{t("subtitle")}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link
            href={hrefFor(null)}
            onClick={handleClick(null)}
            aria-current={onConcerts && !active ? "page" : undefined}
            className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
              onConcerts && !active
                ? "bg-primary text-primary-foreground"
                : "bg-info-subtle text-info hover:bg-info/15"
            }`}
          >
            <LayoutGrid className="size-3.5" aria-hidden />
            {t("allEvents")}
          </Link>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              aria-label={t("close")}
              className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground sm:hidden"
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </div>
      </div>

      <div className="overflow-y-auto overscroll-contain p-3 sm:p-4">
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((cat) => {
            const selected = active === cat.slug;
            const count = counts?.[cat.slug];
            return (
              <li key={cat.slug}>
                <Link
                  href={hrefFor(cat.slug)}
                  onClick={handleClick(cat.slug)}
                  aria-current={selected ? "page" : undefined}
                  className={`group relative flex h-full flex-col items-start gap-2 rounded-xl border p-3 transition-[background-color,border-color,box-shadow,translate] duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 motion-safe:hover:-translate-y-0.5 sm:flex-row sm:items-center sm:gap-3 ${
                    selected
                      ? "border-primary/30 bg-primary/[0.06] shadow-[0_6px_16px_-10px_color-mix(in_oklab,var(--primary)_60%,transparent)]"
                      : "border-transparent hover:border-primary/15 hover:bg-primary/[0.04] hover:shadow-[0_6px_16px_-12px_color-mix(in_oklab,var(--foreground)_30%,transparent)]"
                  }`}
                >
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors duration-200 sm:size-10 ${
                      selected
                        ? "bg-primary text-primary-foreground"
                        : "bg-info-subtle text-info group-hover:bg-primary/10 group-hover:text-primary"
                    }`}
                  >
                    <cat.icon className="size-[18px]" aria-hidden />
                  </span>
                  <span className={`min-w-0 ${selected ? "pr-4" : ""}`}>
                    <span
                      className={`block text-[13px] font-semibold leading-snug sm:text-sm ${
                        selected ? "text-primary" : "text-foreground"
                      }`}
                    >
                      {cat.label}
                    </span>
                    <span className="mt-0.5 block min-h-4 text-xs text-muted-foreground">
                      {count !== undefined ? t("count", { count }) : countsRes.loading ? (
                        <span className="inline-block h-3 w-12 animate-pulse rounded bg-muted align-middle" />
                      ) : null}
                    </span>
                  </span>
                  {selected && <Check className="absolute right-2.5 top-2.5 size-3.5 text-primary" aria-hidden />}
                </Link>
              </li>
            );
          })}
        </ul>
        {countsRes.error ? <p className="px-1 pt-3 text-xs text-muted-foreground">{t("countError")}</p> : null}
      </div>
    </div>
  );
}
