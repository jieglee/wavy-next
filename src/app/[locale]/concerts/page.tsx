"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Search, MapPin, Calendar, Ticket, ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { apiGet } from "@/lib/api";
import type { Concert } from "@/types/type";

const CATEGORIES = ["Semua", "Rock", "Pop", "Jazz", "EDM", "Indie", "K-Pop", "Festival", "Akustik"];

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

export default function ConcertsPage() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const initialCat = searchParams.get("category") || "Semua";

  const [query, setQuery] = useState(initialQuery);
  const [selectedCat, setSelectedCat] = useState(initialCat);
  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchConcerts() {
      setLoading(true);
      try {
        const catParam = selectedCat !== "Semua" ? `category=${encodeURIComponent(selectedCat)}` : "";
        const qParam = query.trim() ? `q=${encodeURIComponent(query.trim())}` : "";
        const qs = [catParam, qParam].filter(Boolean).join("&");
        const path = `/concerts${qs ? `?${qs}` : ""}`;

        const data = await apiGet<Concert[]>(path);
        if (Array.isArray(data) && data.length > 0) {
          setConcerts(data);
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

        {/* Category Filters */}
        <div className="scrollbar-hide mb-8 flex gap-2 overflow-x-auto pb-2">
          {CATEGORIES.map((cat) => {
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

        {/* Concerts Grid */}
        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse rounded-2xl border border-[#EDEBF2] bg-white p-4 shadow-sm">
                <div className="aspect-video w-full rounded-xl bg-gray-200" />
                <div className="mt-4 h-4 w-3/4 rounded bg-gray-200" />
                <div className="mt-2 h-3 w-1/2 rounded bg-gray-200" />
                <div className="mt-4 h-5 w-1/3 rounded bg-gray-200" />
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
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {concerts.map((concert, idx) => {
              const gradient = GRADIENTS[idx % GRADIENTS.length];
              const dateStr = new Date(concert.date).toLocaleDateString("id-ID", {
                day: "numeric",
                month: "short",
                year: "numeric",
              });
              const priceStr = concert.min_price
                ? Number(concert.min_price).toLocaleString("id-ID")
                : "150.000";

              return (
                <Link
                  key={concert.id}
                  href={`/concerts/${concert.id}`}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-[#EDEBF2] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#FF5470]/40 hover:shadow-xl"
                >
                  {/* Poster / Gradient Header */}
                  <div className="relative aspect-video w-full overflow-hidden">
                    {concert.poster_url ? (
                      <>
                        <img
                          src={concert.poster_url}
                          alt={concert.title}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          loading="lazy"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </>
                    ) : (
                      <>
                        <div
                          className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                          style={{ background: gradient }}
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                      </>
                    )}

                    <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                      {concert.category}
                    </span>

                    {concert.remaining !== undefined && (
                      <span className="absolute right-3 top-3 rounded-full bg-[#FF5470] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">
                        Sisa {concert.remaining} Tiket
                      </span>
                    )}

                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <p className="text-xs font-medium text-white/80">{concert.artist_name}</p>
                      <h2 className="truncate font-display text-lg font-bold text-white">
                        {concert.title}
                      </h2>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="flex flex-1 flex-col justify-between p-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-1.5 text-xs text-[#6B6875]">
                        <MapPin className="h-3.5 w-3.5 shrink-0 text-[#FF5470]" />
                        <span className="truncate">{concert.venue}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[#6B6875]">
                        <Calendar className="h-3.5 w-3.5 shrink-0 text-[#1B1A3A]" />
                        <span>{dateStr}</span>
                      </div>
                    </div>

                    {/* Price & Action */}
                    <div className="mt-4 flex items-center justify-between border-t border-[#EDEBF2] pt-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-[#8B889C]">Mulai dari</p>
                        <p className="font-mono text-base font-extrabold text-[#1B1A3A]">
                          Rp{priceStr}
                        </p>
                      </div>
                      <span className="rounded-full bg-[#1B1A3A] px-3.5 py-1.5 text-xs font-bold text-white transition-colors group-hover:bg-[#FF5470]">
                        Beli Tiket
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
