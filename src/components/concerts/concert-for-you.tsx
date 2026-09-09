"use client";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { MapPin, Calendar } from "lucide-react";
import { apiGet } from "@/lib/api";
import type { Concert } from "@/types/type";

const GRADIENTS = [
  "linear-gradient(135deg,#7DD3E8,#4A90D9)",
  "linear-gradient(135deg,#8B0000,#2B0000)",
  "linear-gradient(135deg,#3D3D3D,#0A0A0A)",
  "linear-gradient(135deg,#1B1A3A,#0D0C1F)",
  "linear-gradient(135deg,#FF5470,#211F2B)",
  "linear-gradient(135deg,#C6395A,#14131C)",
];
const fallback: Concert[] = [
  { id: 1, title: "The Legends Infinity", category: "Festival", venue: "Jakarta Selatan", date: "2026-09-15T19:00:00Z", poster_url: "", status: "published", artist_name: "TRUST Orchestra", organizer_name: "TRUST", min_price: 300000, remaining: 150 },
  { id: 2, title: "Tiffany Young: Edge of Calm", category: "K-Pop", venue: "Jakarta Pusat", date: "2026-10-02T20:00:00Z", poster_url: "", status: "published", artist_name: "Tiffany Young", organizer_name: "Flabbergast", min_price: 2000000, remaining: 80 },
  { id: 3, title: "YE Jakarta 2026", category: "Pop", venue: "Jakarta Pusat", date: "2026-11-20T19:30:00Z", poster_url: "", status: "published", artist_name: "Kanye West", organizer_name: "Raw Vision", min_price: 1875000, remaining: 320 },
  { id: 4, title: "Whisnu Santika Live", category: "EDM", venue: "Bengkel Space, Jakarta", date: "2026-08-30T22:00:00Z", poster_url: "", status: "published", artist_name: "Whisnu Santika", organizer_name: "Bengkel Space", min_price: 150000, remaining: 45 },
  { id: 5, title: "NIKI: Nicole World Tour", category: "Indie", venue: "ICE BSD", date: "2026-12-05T19:00:00Z", poster_url: "", status: "published", artist_name: "NIKI", organizer_name: "Ismaya Live", min_price: 850000, remaining: 500 },
  { id: 6, title: "Jazz Under The Stars", category: "Jazz", venue: "Dago Tea House, Bandung", date: "2026-09-28T18:30:00Z", poster_url: "", status: "published", artist_name: "Tompi & Friends", organizer_name: "Java Festival", min_price: 425000, remaining: 200 },
  { id: 7, title: "Dewa 19 Reunion", category: "Rock", venue: "GBK, Jakarta", date: "2026-10-10T19:00:00Z", poster_url: "", status: "published", artist_name: "Dewa 19", organizer_name: "Rajawali", min_price: 650000, remaining: 90 },
  { id: 8, title: "Coldplay Echoes", category: "Pop", venue: "GBK, Jakarta", date: "2026-11-15T19:00:00Z", poster_url: "", status: "published", artist_name: "Coldplay", organizer_name: "PK Entertainment", min_price: 1800000, remaining: 110 },
];
export default function ConcertForYou({ excludeId }: { excludeId: string | number }) {
  const [items, setItems] = useState<Concert[]>(fallback);
  useEffect(() => {
    apiGet<Concert[]>("/concerts").then((data) => {
      if (Array.isArray(data) && data.length) setItems(data.filter((c) => String(c.id) !== String(excludeId)).slice(0, 8));
    }).catch(() => {});
  }, [excludeId]);
  const list = items.slice(0, 8);
  return (
    <section className="mt-10">
      <h2 className="font-sans text-[18px] font-bold text-[#111827] sm:text-[20px]">Event Untuk Kamu</h2>
      <div className="scrollbar-hide mt-4 flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
        {list.map((c, idx) => {
          const grad = GRADIENTS[idx % GRADIENTS.length];
          const dateStr = new Date(c.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
          const priceStr = c.min_price ? Number(c.min_price).toLocaleString("id-ID") : "150.000";
          return (
            <Link key={c.id} href={`/concerts/${c.id}`} className="group flex w-[280px] shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-[#EDEBF2] bg-white shadow-sm transition-all duration-300 hover:-translate-y-1.5 hover:border-[#FF5470]/40 hover:shadow-xl">
              <div className="relative aspect-video w-full overflow-hidden">
                {c.poster_url ? (
                  <><img src={c.poster_url} alt={c.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" /><div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" /></>
                ) : (
                  <><div className="absolute inset-0 transition-transform duration-500 group-hover:scale-105" style={{ background: grad }} /><div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" /></>
                )}
                <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 text-[11px] font-bold text-white backdrop-blur-md">{c.category}</span>
                {c.remaining !== undefined && <span className="absolute right-3 top-3 rounded-full bg-[#FF5470] px-2.5 py-1 text-[11px] font-bold text-white shadow-sm">Sisa {c.remaining} Tiket</span>}
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <p className="text-xs font-medium text-white/80">{c.artist_name}</p>
                  <h3 className="truncate font-display text-lg font-bold text-white">{c.title}</h3>
                </div>
              </div>
              <div className="flex flex-1 flex-col justify-between p-4">
                <div className="space-y-2"><div className="flex items-center gap-1.5 text-xs text-[#6B6875]"><MapPin className="h-3.5 w-3.5 shrink-0 text-[#FF5470]" /><span className="truncate">{c.venue}</span></div><div className="flex items-center gap-1.5 text-xs text-[#6B6875]"><Calendar className="h-3.5 w-3.5 shrink-0 text-[#1B1A3A]" /><span>{dateStr}</span></div></div>
                <div className="mt-4 flex items-center justify-between border-t border-[#EDEBF2] pt-3"><div><p className="text-[10px] uppercase tracking-wider text-[#8B889C]">Mulai dari</p><p className="font-mono text-base font-extrabold text-[#1B1A3A]">Rp{priceStr}</p></div><span className="rounded-full bg-[#1B1A3A] px-3.5 py-1.5 text-xs font-bold text-white transition-colors group-hover:bg-[#FF5470]">Beli Tiket</span></div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
