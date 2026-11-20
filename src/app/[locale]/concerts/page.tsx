"use client";

import { useMemo, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Ticket, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import ConcertCard from "@/components/concerts/concert-card";
import { apiGet } from "@/lib/api";
import { useApiResource } from "@/hooks/use-api-resource";
import { ErrorState } from "@/components/states/async-states";
import type { Concert } from "@/types/type";

const GRADIENTS = [
  "linear-gradient(135deg,#7DD3E8,#4A90D9)",
  "linear-gradient(135deg,#8B0000,#2B0000)",
  "linear-gradient(135deg,#3D3D3D,#0A0A0A)",
  "linear-gradient(135deg,var(--foreground),#0D0C1F)",
  "linear-gradient(135deg,var(--primary),#211F2B)",
  "linear-gradient(135deg,#C6395A,#14131C)",
];

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

function uniqueCategories(concerts: Concert[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const c of concerts) {
    const cat = (c.category || "").trim();
    if (!cat) continue;
    const key = cat.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(cat);
  }
  return out;
}

const COUNTRY_LABELS: Record<string, string> = {
  id: "Indonesia",
  sg: "Singapore",
  my: "Malaysia",
  th: "Thailand",
  kr: "South Korea",
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
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCat = searchParams.get("category") || "Semua";

  const filteredInitialQuery = initialCat !== "Semua" && initialQuery.toLowerCase() === initialCat.toLowerCase() ? "" : initialQuery;

  const [query, setQuery] = useState(filteredInitialQuery);
  const [selectedCat, setSelectedCat] = useState(initialCat);
  const [country, setCountry] = useState(searchParams.get("country") || "");
  // kategori diturunkan dari data asli (tanpa daftar cadangan statis)
  const allRes = useApiResource("concerts-all", () => apiGet<unknown>("/concerts").then(extractConcerts));
  const categories = useMemo(() => {
    const next = ["Semua", ...uniqueCategories(allRes.data ?? [])];
    if (initialCat !== "Semua" && !next.some((c) => c.toLowerCase() === initialCat.toLowerCase())) {
      next.splice(1, 0, initialCat);
    }
    return next;
  }, [allRes.data, initialCat]);

  const catParam = selectedCat !== "Semua" ? `category=${encodeURIComponent(selectedCat)}` : "";
  const qParam = query.trim() ? `q=${encodeURIComponent(query.trim())}` : "";
  const qs = [catParam, qParam].filter(Boolean).join("&");
  const listPath = `/concerts${qs ? `?${qs}` : ""}`;
  const listRes = useApiResource(listPath, () => apiGet<unknown>(listPath).then(extractConcerts));
  const loading = listRes.loading;
  const concerts = useMemo(
    () => (country ? (listRes.data ?? []).filter((c) => byCountry(c, country)) : listRes.data ?? []),
    [listRes.data, country]
  );

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
              Kembali ke Beranda
            </Link>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Jelajahi Semua Konser
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Temukan konser musik terfavorit dari musisi top dunia & Indonesia
            </p>
          </div>
        </div>

        {/* Category Filters — derived from real data */}
        <div className="scrollbar-hide mb-8 flex gap-2 overflow-x-auto pb-2">
          {categories.map((cat) => {
            const active = selectedCat === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`shrink-0 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                  active
                    ? "bg-foreground text-white shadow-md"
                    : "border border-border bg-white text-muted-foreground hover:border-foreground/20 hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Country filter chip (from DiscoverCountries section) */}
        {country && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary">
              Explore: {COUNTRY_LABELS[country] ?? country}
            </span>
            <button
              onClick={() => setCountry("")}
              className="rounded-full border border-border bg-white px-4 py-2 text-xs font-bold text-muted-foreground hover:border-foreground/20 hover:text-foreground"
            >
              Hapus filter negara
            </button>
          </div>
        )}

        {/* Concerts Grid — same card as landing (FeaturedEvents) */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-16/7 w-full rounded-xl bg-gray-200" />
                <div className="mt-3 h-3 w-1/2 rounded bg-gray-200" />
                <div className="mt-2 h-4 w-3/4 rounded bg-gray-200" />
                <div className="mt-1 h-3 w-2/3 rounded bg-gray-200" />
                <div className="mt-3 border-t border-border pt-2.5">
                  <div className="h-3 w-16 rounded bg-gray-200" />
                  <div className="mt-1 h-4 w-24 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : listRes.error ? (
          <ErrorState error={listRes.error} onRetry={listRes.reload} />
        ) : concerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-white py-16 text-center">
            <Ticket className="h-12 w-12 text-muted-foreground/80" />
            <h3 className="mt-3 text-lg font-bold text-foreground">Tidak ada konser ditemukan</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              {country ? `Belum ada konser di ${COUNTRY_LABELS[country] ?? "negara ini"}.` : "Coba ubah kata kunci pencarian atau kategori filter kamu."}
            </p>
            <button
              onClick={() => {
                setQuery("");
                setSelectedCat("Semua");
              }}
              className="mt-4 rounded-full bg-foreground px-5 py-2 text-xs font-bold text-white hover:bg-black"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {concerts.map((concert, idx) => {
              const gradient = GRADIENTS[idx % GRADIENTS.length];
              const priceStr = concert.min_price ? Number(concert.min_price).toLocaleString("id-ID") : null;
              return (
                <ConcertCard
                  key={concert.id}
                  id={concert.id}
                  title={concert.title}
                  location={concert.venue || "Indonesia"}
                  organizer={concert.organizer_name || concert.artist_name || "Event Organizer"}
                  price={priceStr}
                  gradient={gradient}
                  poster_url={concert.poster_url || undefined}
                />
              );
            })}
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
