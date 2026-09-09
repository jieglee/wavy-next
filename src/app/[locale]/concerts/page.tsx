"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Ticket, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import ConcertCard from "@/components/concerts/concert-card";
import { apiGet } from "@/lib/api";
import type { Concert } from "@/types/type";

const FALLBACK_CATEGORIES = Array.from(new Set(["Festival", "K-Pop", "Pop", "EDM", "Indie", "Jazz"]));

const GRADIENTS = [
  "linear-gradient(135deg,#7DD3E8,#4A90D9)",
  "linear-gradient(135deg,#8B0000,#2B0000)",
  "linear-gradient(135deg,#3D3D3D,#0A0A0A)",
  "linear-gradient(135deg,#1B1A3A,#0D0C1F)",
  "linear-gradient(135deg,#FF5470,#211F2B)",
  "linear-gradient(135deg,#C6395A,#14131C)",
];

const fallbackConcerts: Concert[] = [
  { id: 1, title: "The Legends Infinity", category: "Festival", venue: "Jakarta Selatan", date: "2026-09-15T19:00:00Z", poster_url: "", status: "published", artist_name: "TRUST Orchestra", organizer_name: "TRUST Productions", min_price: 300000, remaining: 150 },
  { id: 2, title: "Tiffany Young: Edge of Calm", category: "K-Pop", venue: "Jakarta Pusat", date: "2026-10-02T20:00:00Z", poster_url: "", status: "published", artist_name: "Tiffany Young", organizer_name: "Flabbergast Productions", min_price: 2000000, remaining: 80 },
  { id: 3, title: "YE Jakarta 2026", category: "Pop", venue: "Jakarta Pusat", date: "2026-11-20T19:30:00Z", poster_url: "", status: "published", artist_name: "Kanye West", organizer_name: "Raw Vision Collective", min_price: 1875000, remaining: 320 },
  { id: 4, title: "Whisnu Santika Live", category: "EDM", venue: "Bengkel Space, Jakarta", date: "2026-08-30T22:00:00Z", poster_url: "", status: "published", artist_name: "Whisnu Santika", organizer_name: "Bengkel Space", min_price: 150000, remaining: 45 },
  { id: 5, title: "NIKI: Nicole World Tour", category: "Indie", venue: "ICE BSD, Tangerang", date: "2026-12-05T19:00:00Z", poster_url: "", status: "published", artist_name: "NIKI", organizer_name: "Ismaya Live", min_price: 850000, remaining: 500 },
  { id: 6, title: "Jazz Under The Stars", category: "Jazz", venue: "Dago Tea House, Bandung", date: "2026-09-28T18:30:00Z", poster_url: "", status: "published", artist_name: "Tompi & Friends", organizer_name: "Java Festival", min_price: 425000, remaining: 200 },
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

function ConcertsPageInner() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCat = searchParams.get("category") || "Semua";

  const [query, setQuery] = useState(initialQuery);
  const [selectedCat, setSelectedCat] = useState(initialCat);
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [categories, setCategories] = useState<string[]>(["Semua", ...FALLBACK_CATEGORIES]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCategories() {
      try {
        const data = await apiGet<unknown>("/concerts");
        const all = extractConcerts(data);
        const source = all.length > 0 ? all : fallbackConcerts;
        const uniq = uniqueCategories(source);
        setCategories((prev) => {
          const base = uniq.length > 0 ? uniq : uniqueCategories(fallbackConcerts);
          const next = ["Semua", ...base];
          if (initialCat !== "Semua" && !next.some((c) => c.toLowerCase() === initialCat.toLowerCase())) {
            next.splice(1, 0, initialCat);
          }
          if (JSON.stringify(prev) === JSON.stringify(next)) return prev;
          return next;
        });
      } catch {
        // keep fallback categories
      }
    }
    fetchCategories();
  }, [initialCat]);

  useEffect(() => {
    async function fetchConcerts() {
      setLoading(true);
      try {
        const catParam = selectedCat !== "Semua" ? `category=${encodeURIComponent(selectedCat)}` : "";
        const qParam = query.trim() ? `q=${encodeURIComponent(query.trim())}` : "";
        const qs = [catParam, qParam].filter(Boolean).join("&");
        const path = `/concerts${qs ? `?${qs}` : ""}`;

        const data = await apiGet<unknown>(path);
        const list = extractConcerts(data);
        if (list.length > 0) {
          setConcerts(list);
        } else if (!query && selectedCat === "Semua") {
          setConcerts(fallbackConcerts);
        } else {
          // Filter fallback locally
          const filtered = fallbackConcerts.filter((c) => {
            const matchCat = selectedCat === "Semua" || c.category.toLowerCase() === selectedCat.toLowerCase();
            const matchQ = !query || c.title.toLowerCase().includes(query.toLowerCase()) || c.artist_name.toLowerCase().includes(query.toLowerCase());
            return matchCat && matchQ;
          });
          setConcerts(filtered);
        }
      } catch {
        const filtered = fallbackConcerts.filter((c) => {
          const matchCat = selectedCat === "Semua" || c.category.toLowerCase() === selectedCat.toLowerCase();
          const matchQ = !query || c.title.toLowerCase().includes(query.toLowerCase()) || c.artist_name.toLowerCase().includes(query.toLowerCase());
          return matchCat && matchQ;
        });
        setConcerts(filtered);
      } finally {
        setLoading(false);
      }
    }

    const t = setTimeout(fetchConcerts, 200);
    return () => clearTimeout(t);
  }, [query, selectedCat]);

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header Title */}
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <Link
              href="/"
              className="mb-2 inline-flex items-center gap-1.5 text-xs font-semibold text-[#8B889C] hover:text-[#1B1A3A]"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke Beranda
            </Link>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-[#1B1A3A] sm:text-4xl">
              Jelajahi Semua Konser
            </h1>
            <p className="mt-1 text-sm text-[#6B6875]">
              Temukan konser musik terfavorit dari musisi top dunia & Indonesia
            </p>
          </div>

          {/* Search Bar Input */}
          <div className="flex w-full max-w-md items-center gap-2 rounded-full border border-[#EDEBF2] bg-white px-4 py-2.5 shadow-sm transition-all focus-within:border-[#FF5470]/50 focus-within:shadow-md">
            <Search className="h-4 w-4 text-[#8B889C]" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari judul konser, musisi, atau venue..."
              className="w-full bg-transparent text-sm text-[#1B1A3A] outline-none placeholder:text-[#8B889C]"
            />
            {query && (
              <button onClick={() => setQuery("")} className="text-xs text-[#8B889C] hover:text-[#1B1A3A]">
                Reset
              </button>
            )}
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
                    ? "bg-[#1B1A3A] text-white shadow-md"
                    : "border border-[#EDEBF2] bg-white text-[#6B6875] hover:border-[#1B1A3A]/20 hover:text-[#1B1A3A]"
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Concerts Grid — same card as landing (FeaturedEvents) */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-16/7 w-full rounded-xl bg-gray-200" />
                <div className="mt-3 h-3 w-1/2 rounded bg-gray-200" />
                <div className="mt-2 h-4 w-3/4 rounded bg-gray-200" />
                <div className="mt-1 h-3 w-2/3 rounded bg-gray-200" />
                <div className="mt-3 border-t border-[#EDEBF2] pt-2.5">
                  <div className="h-3 w-16 rounded bg-gray-200" />
                  <div className="mt-1 h-4 w-24 rounded bg-gray-200" />
                </div>
              </div>
            ))}
          </div>
        ) : concerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#EDEBF2] bg-white py-16 text-center">
            <Ticket className="h-12 w-12 text-[#8B889C]" />
            <h3 className="mt-3 text-lg font-bold text-[#1B1A3A]">Tidak ada konser ditemukan</h3>
            <p className="mt-1 text-sm text-[#6B6875]">Coba ubah kata kunci pencarian atau kategori filter kamu.</p>
            <button
              onClick={() => {
                setQuery("");
                setSelectedCat("Semua");
              }}
              className="mt-4 rounded-full bg-[#1B1A3A] px-5 py-2 text-xs font-bold text-white hover:bg-black"
            >
              Reset Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {concerts.map((concert, idx) => {
              const gradient = GRADIENTS[idx % GRADIENTS.length];
              const priceStr = concert.min_price
                ? Number(concert.min_price).toLocaleString("id-ID")
                : "150.000";
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
