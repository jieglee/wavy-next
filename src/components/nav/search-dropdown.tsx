"use client";

import { useEffect, useState } from "react";
import { TrendingUp } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { apiGet } from "@/lib/api";
import type { Concert } from "@/types/type";

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
  gradient: string;
}

const FALLBACK_POPULAR: Popular[] = [
  { id: 101, title: "2026 GONG YOO FAN MEETING <THE LONG TAKE> in Jakarta", venue: "Jakarta Pusat", gradient: "linear-gradient(135deg,#1B1A3A,#2a2a4a)" },
  { id: 102, title: "T.O.P PRE-STUDIO 2026 in Jakarta", venue: "Jakarta Pusat", gradient: "linear-gradient(135deg,#111,#444)" },
  { id: 103, title: "BIGBANG 2026-2027 WORLD TOUR < XX : COSMOS > IN JAKARTA", venue: "Jakarta Utara", gradient: "linear-gradient(135deg,#222,#666)" },
  { id: 104, title: "2026 ByeonWooSeok Asia Fanmeeting Tour <The Secret Library> in Jakarta", venue: "Jakarta Utara", gradient: "linear-gradient(135deg,#1e3a8a,#3b82f6)" },
  { id: 105, title: "Snada Indonesia 2026", venue: "Jakarta Pusat", gradient: "linear-gradient(135deg,#7c3aed,#c084fc)" },
];

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
  const [popular, setPopular] = useState<Popular[]>(FALLBACK_POPULAR);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const data = await apiGet<unknown>("/concerts");
        const list = extractConcerts(data);
        if (!alive || list.length === 0) return;
        const mapped: Popular[] = list.slice(0, 5).map((c, i) => ({
          id: c.id,
          title: c.title,
          venue: c.venue || "Indonesia",
          poster_url: c.poster_url || undefined,
          gradient: FALLBACK_POPULAR[i % FALLBACK_POPULAR.length].gradient,
        }));
        setPopular(mapped);
      } catch {
        // keep fallback
      }
    }
    load();
    return () => {
      alive = false;
    };
  }, []);

  const q = query.trim().toLowerCase();
  const filteredTrending = q ? TRENDING.filter((t) => t.toLowerCase().includes(q)) : TRENDING;
  const filteredPopular = q
    ? popular.filter((p) => p.title.toLowerCase().includes(q) || p.venue.toLowerCase().includes(q))
    : popular;

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-[#EDEBF2] bg-white shadow-[0_16px_48px_-8px_rgba(27,26,58,0.22)]">
      <div className="max-h-[min(72vh,520px)] overflow-y-auto p-4">
        <p className="mb-3 text-[13px] font-bold text-[#1B1A3A]">Banyak Dicari</p>
        <div className="mb-4 flex flex-wrap gap-2">
          {filteredTrending.length === 0 ? (
            <p className="text-xs text-[#8B889C]">Tidak ada hasil untuk &quot;{query}&quot;</p>
          ) : (
            filteredTrending.map((t) => (
              <Link
                key={t}
                href={`/concerts?q=${encodeURIComponent(t)}`}
                onClick={onSelect}
                className="inline-flex items-center gap-1.5 rounded-full bg-[#EFF6FF] px-3 py-1.5 text-xs font-medium text-[#1B1A3A] transition-colors hover:bg-[#DBEAFE]"
              >
                <TrendingUp className="h-3.5 w-3.5 shrink-0 text-[#1E40AF]" />
                {t}
              </Link>
            ))
          )}
        </div>

        <div className="rounded-xl border border-[#EDEBF2] bg-white">
          <p className="px-3 pt-3 text-[13px] font-bold text-[#1B1A3A] sm:px-4">Event Populer</p>
          <div className="mt-2 divide-y divide-[#F0EFF7]">
            {(filteredPopular.length ? filteredPopular : popular).slice(0, 5).map((ev) => (
              <Link
                key={ev.id}
                href={`/concerts/${ev.id}`}
                onClick={onSelect}
                className="flex items-center gap-3 px-3 py-3 transition-colors hover:bg-[#FAFAF8] sm:px-4"
              >
                <div className="relative h-12 w-20 shrink-0 overflow-hidden rounded-lg border border-[#EDEBF2] bg-[#F0EFF7]">
                  {ev.poster_url ? (
                    <img src={ev.poster_url} alt={ev.title} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="h-full w-full" style={{ background: ev.gradient }} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="line-clamp-2 text-xs font-semibold leading-snug text-[#1B1A3A]">{ev.title}</p>
                  <p className="mt-0.5 truncate text-[11px] text-[#8B889C]">{ev.venue}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
