"use client";

import { useTranslations } from "next-intl";
import { TrendingUp } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { apiGet } from "@/lib/api";
import { useApiResource } from "@/hooks/use-api-resource";
import { useErrorMessage } from "@/lib/error-message";
import type { Concert } from "@/types/type";
import { EventPoster } from "@/components/concerts/event-poster";

const TRENDING = [
  "ENHYPEN JAKARTA 2027",
  "JGTC 2026",
  "Pestapora 2026",
  "Adili Idola Andre Taulany",
  "ROSETOPIA IN JAKARTA",
  "YE JAKARTA 2026",
  "Snada Indonesia 2026",
  "T.O.P JAKARTA",
  "HWANG IN YOUP FAN MEETING",
  "BIGBANG JAKARTA 2027",
  "GONG YOO JAKARTA 2026",
];

interface Popular {
  id: number;
  title: string;
  venue: string;
  poster_url?: string;
}

// dekorasi thumbnail tanpa poster (bukan data)
function extractConcerts(data: unknown): Concert[] {
  if (Array.isArray(data)) return data as Concert[];
  if (data && typeof data === "object") {
    const d = data as Record<string, unknown>;
    if (Array.isArray(d.concerts)) return d.concerts as Concert[];
    if (Array.isArray(d.data)) return d.data as Concert[];
    if (Array.isArray(d.events)) return d.events as Concert[];
    if (d.concerts && typeof d.concerts === "object" && Array.isArray((d.concerts as Record<string, unknown>).data))
      return (d.concerts as Record<string, unknown>).data as Concert[];
  }
  return [];
}

export default function SearchDropdown({
  query,
  onSelect,
}: {
  query: string;
  onSelect: () => void;
}) {
  const t = useTranslations("Search");
  const errorMessage = useErrorMessage();
  const popularRes = useApiResource("search-popular", async () =>
    extractConcerts(await apiGet<unknown>("/concerts"))
      .slice(0, 5)
      .map<Popular>((c, i) => ({
        id: c.id,
        title: c.title,
        venue: c.venue || "",
        poster_url: c.poster_url || undefined,
      }))
  );
  const popular = popularRes.data ?? [];

  const q = query.trim().toLowerCase();
  const filteredTrending = q ? TRENDING.filter((term) => term.toLowerCase().includes(q)) : TRENDING;
  const filteredPopular = q
    ? popular.filter((p) => p.title.toLowerCase().includes(q) || p.venue.toLowerCase().includes(q))
    : popular;

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-border bg-white shadow-[0_16px_48px_-8px_color-mix(in_oklab,var(--foreground)_22%,transparent)]">
      <div className="max-h-[min(72vh,520px)] overflow-y-auto p-4">
        <p className="mb-3 text-[13px] font-bold text-foreground">Banyak Dicari</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {filteredTrending.length === 0 ? (
            <p className="text-xs text-muted-foreground/80">Tidak ada hasil untuk &quot;{query}&quot;</p>
          ) : (
            filteredTrending.map((term) => (
              <Link
                key={term}
                href={`/concerts?q=${encodeURIComponent(term)}`}
                onClick={onSelect}
                className="inline-flex items-center gap-1.5 rounded-full bg-info-subtle px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-info/15"
              >
                <TrendingUp className="h-3.5 w-3.5 shrink-0 text-info" />
                {term}
              </Link>
            ))
          )}
        </div>

        <div className="rounded-xl border border-border bg-white">
          <p className="px-3 pt-3 text-[13px] font-bold text-foreground sm:px-4">Event Populer</p>
          {popularRes.loading && <p className="px-3 py-3 text-xs text-muted-foreground sm:px-4">{t("loading")}</p>}
          {popularRes.error !== undefined && (
            <div className="flex flex-wrap items-center gap-2 px-3 py-3 text-xs text-muted-foreground sm:px-4" role="alert">
              <span>{errorMessage(popularRes.error)}</span>
              <button type="button" onClick={popularRes.reload} className="font-bold text-primary">
                {t("retry")}
              </button>
            </div>
          )}
          {popularRes.data && popular.length === 0 && (
            <p className="px-3 py-3 text-xs text-muted-foreground sm:px-4">{t("noEvents")}</p>
          )}
          <div className="mt-2 divide-y divide-border">
            {(filteredPopular.length ? filteredPopular : popular).slice(0, 5).map((ev) => (
              <Link
                key={ev.id}
                href={`/concerts/${ev.id}`}
                onClick={onSelect}
                className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-surface sm:px-4"
              >
                <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg border border-border bg-muted">
                  <EventPoster src={ev.poster_url} title={ev.title} size="sm" className="h-full w-full object-cover" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs font-semibold leading-snug text-foreground">{ev.title}</p>
                  <p className="mt-0.5 truncate text-[11px] text-muted-foreground/80">{ev.venue}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
