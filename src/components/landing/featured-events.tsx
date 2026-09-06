"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { apiGet } from "@/lib/api";
import type { Concert } from "@/types/type";

interface DisplayEvent {
  id: number;
  title: string;
  organizer: string;
  location: string;
  price: string;
  gradient: string;
  poster_url?: string;
}

const fallbackEvents: DisplayEvent[] = [
  { id: 1, title: "The Legends Infinity", organizer: "TRUST Orchestra", location: "Jakarta Selatan", price: "300.000", gradient: "linear-gradient(135deg,#7DD3E8,#4A90D9)" },
  { id: 2, title: "Tiffany Young: Edge of Calm", organizer: "Flabbergast Productions", location: "Jakarta Pusat", price: "2.000.000", gradient: "linear-gradient(135deg,#8B0000,#2B0000)" },
  { id: 3, title: "YE Jakarta 2026", organizer: "Raw Vision Collective", location: "Jakarta Pusat", price: "1.875.000", gradient: "linear-gradient(135deg,#3D3D3D,#0A0A0A)" },
  { id: 4, title: "Whisnu Santika by Bengkel", organizer: "Bengkel Space", location: "Jakarta Selatan", price: "150.000", gradient: "linear-gradient(135deg,#1B1A3A,#0D0C1F)" },
  { id: 5, title: "NIKI: Nicole Live", organizer: "Ismaya Live", location: "Tangerang", price: "850.000", gradient: "linear-gradient(135deg,#FF5470,#211F2B)" },
  { id: 6, title: "Jazz Under The Stars", organizer: "Java Festival Production", location: "Bandung", price: "425.000", gradient: "linear-gradient(135deg,#C6395A,#14131C)" },
  { id: 7, title: "Sunset Symphony Orchestra", organizer: "Aditya Music Collective", location: "Jakarta Barat", price: "600.000", gradient: "linear-gradient(135deg,#7DD3E8,#4A90D9)" },
  { id: 8, title: "Indie Pop Extravaganza", organizer: "LocalFest Indonesia", location: "Yogyakarta", price: "250.000", gradient: "linear-gradient(135deg,#8B0000,#2B0000)" },
  { id: 9, title: "Metal Mayhem 2026", organizer: "HellStage Production", location: "Bandung", price: "500.000", gradient: "linear-gradient(135deg,#3D3D3D,#0A0A0A)" },
  { id: 10, title: "K-Pop Dreamscape Live", organizer: "StarWave Entertainment", location: "Jakarta Pusat", price: "1.200.000", gradient: "linear-gradient(135deg,#1B1A3A,#0D0C1F)" },
  { id: 11, title: "Acoustic Night Serenade", organizer: "SoulSpace Collective", location: "Bali", price: "300.000", gradient: "linear-gradient(135deg,#FF5470,#211F2B)" },
  { id: 12, title: "Electronic Pulse Festival", organizer: "Neon Collective", location: "Surabaya", price: "750.000", gradient: "linear-gradient(135deg,#C6395A,#14131C)" },
  { id: 13, title: "Classical Harmony Gala", organizer: "Jakarta Philharmonic", location: "Jakarta Selatan", price: "400.000", gradient: "linear-gradient(135deg,#7DD3E8,#4A90D9)" },
  { id: 14, title: "Rock Revival Hits", organizer: "Nostalgia Records", location: "Semarang", price: "350.000", gradient: "linear-gradient(135deg,#8B0000,#2B0000)" },
  { id: 15, title: "Dangdut Karnaval Akbar", organizer: "Pantura Production", location: "Bekasi", price: "100.000", gradient: "linear-gradient(135deg,#3D3D3D,#0A0A0A)" },
  { id: 16, title: "Hip Hop Block Party", organizer: "Urban Beats ID", location: "Jakarta Utara", price: "275.000", gradient: "linear-gradient(135deg,#1B1A3A,#0D0C1F)" },
  { id: 17, title: "Folk & Roots Gathering", organizer: "Nusantara Folk", location: "Ubud", price: "200.000", gradient: "linear-gradient(135deg,#FF5470,#211F2B)" },
  { id: 18, title: "Starlight Orchestra Gala", organizer: "Grand Symphony", location: "Jakarta Pusat", price: "900.000", gradient: "linear-gradient(135deg,#C6395A,#14131C)" },
  { id: 19, title: "Summer Groove Fest", organizer: "Beachside EO", location: "Bali", price: "550.000", gradient: "linear-gradient(135deg,#7DD3E8,#4A90D9)" },
  { id: 20, title: "Midnight Jazz Sessions", organizer: "Blue Note Jakarta", location: "Jakarta Selatan", price: "475.000", gradient: "linear-gradient(135deg,#8B0000,#2B0000)" },
];

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" className={className}>
      <path
        fill="currentColor"
        d="M685.2 104.7a64 64 0 0 1 0 90.5L368.4 512l316.8 316.8a64 64 0 0 1-90.4 90.5l-362.1-362a64 64 0 0 1 0-90.5l362-362.1a64 64 0 0 1 90.5 0"
      />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" className={className} style={{ transform: "scaleX(-1)" }}>
      <path
        fill="currentColor"
        d="M685.2 104.7a64 64 0 0 1 0 90.5L368.4 512l316.8 316.8a64 64 0 0 1-90.4 90.5l-362.1-362a64 64 0 0 1 0-90.5l362-362.1a64 64 0 0 1 90.5 0"
      />
    </svg>
  );
}

export default function FeaturedEvents() {
  const t = useTranslations("FeaturedEvents");
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [events, setEvents] = useState<DisplayEvent[]>(fallbackEvents);

  useEffect(() => {
    async function fetchFeatured() {
      try {
        const data = await apiGet<{ featured_events?: Concert[] }>("/homepage");
        if (data?.featured_events && data.featured_events.length > 0) {
          let mapped: DisplayEvent[] = data.featured_events.map((e, idx) => ({
            id: e.id,
            title: e.title,
            organizer: e.organizer_name || "Event Organizer",
            location: e.venue || "Indonesia",
            price: e.min_price ? Number(e.min_price).toLocaleString("id-ID") : "150.000",
            gradient: fallbackEvents[idx % fallbackEvents.length].gradient,
            poster_url: e.poster_url,
          }));
          // Pad to always show 20 cards
          if (mapped.length < 20) {
            const existingIds = new Set(mapped.map((m) => m.id));
            const extras = fallbackEvents
              .filter((f) => !existingIds.has(f.id))
              .slice(0, 20 - mapped.length);
            // If still not enough (IDs overlapped), fill remaining with fallback copies with offset IDs
            let padded = [...mapped, ...extras];
            if (padded.length < 20) {
              const remaining = 20 - padded.length;
              const more = fallbackEvents.slice(0, remaining).map((f, i) => ({
                ...f,
                id: 10000 + i,
              }));
              padded = [...padded, ...more];
            }
            mapped = padded;
          }
          setEvents(mapped.slice(0, 20));
        }
      } catch {
        // use fallbackEvents
      }
    }
    fetchFeatured();
  }, []);

  const updateArrows = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollerRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows]);

  const scrollByCard = (dir: number) => {
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const gap = 16; // gap-4
    const cardWidth = card?.offsetWidth ?? (window.innerWidth < 640 ? 290 : 320);
    const amount = cardWidth + gap;
    el.scrollBy({ left: dir * amount, behavior: "smooth" });
  };

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="30"
              height="30"
              viewBox="0 0 24 24"
              className="animate-megaphone text-[#FF5470]"
            >
              <path d="M0 0h24v24H0z" fill="none" />
              <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                <path d="m5.549 10.819l-1.826 1.615a1.414 1.414 0 0 0-.288 1.77l1.653 2.9a1.404 1.404 0 0 0 1.662.629l2.297-.783z" />
                <path d="M9.258 4.59a26.7 26.7 0 0 1-1.71 4.072a7.2 7.2 0 0 1-2 2.157l3.499 6.112a7.3 7.3 0 0 1 2.882-.668c1.464.066 2.92.25 4.353.552" />
                <path d="m9.253 4.591l1.215-.706a1.395 1.395 0 0 1 1.917.517l5.607 9.774a1.42 1.42 0 0 1-.519 1.92l-1.215.707zM3.56 14.416l-.606.358a1.4 1.4 0 0 0-.658.86a1.4 1.4 0 0 0 .149 1.074a1.4 1.4 0 0 0 .854.662a1.38 1.38 0 0 0 1.068-.149l.567-.358m4.804-.203l1.701 2.97a1.44 1.44 0 0 1-.509 1.933a1.404 1.404 0 0 1-1.922-.522l-1.922-3.414m12.55-10.735l-2.498 1.45m4.612 3.531h-2.883M16.225 2.25l-1.442 2.515" />
              </g>
            </svg>
            <h2 className="font-display text-xl font-bold text-[#1B1A3A] sm:text-2xl">
              {t("title")}
            </h2>
          </div>

          <Link
            href="/concerts"
            className="text-sm font-semibold text-[#FF5470] hover:underline"
          >
            Lihat Semua &rarr;
          </Link>
        </div>

        <div className="relative">
          {canScrollLeft && (
            <button
              onClick={() => scrollByCard(-1)}
              aria-label={t("prev")}
              className="absolute -left-4 top-[63px] z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#1B1A3A] shadow-lg transition-transform hover:scale-105 sm:top-[70px]"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={() => scrollByCard(1)}
              aria-label={t("next")}
              className="absolute -right-4 top-[63px] z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#1B1A3A] shadow-lg transition-transform hover:scale-105 sm:top-[70px]"
            >
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          )}

          <div ref={scrollerRef} className="scrollbar-hide flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 pt-2">
            {events.map((event) => (
              <Link key={event.id} href={`/concerts/${event.id}`} className="group w-[290px] shrink-0 snap-start sm:w-[320px]">
                <div className="transition-transform duration-300 ease-out group-hover:-translate-y-2">
                  <div className="relative aspect-[16/7] overflow-hidden rounded-xl border border-[#EDEBF2] shadow-sm transition-all duration-300 group-hover:shadow-[0_16px_28px_-8px_rgba(27,26,58,0.25)]">
                    {event.poster_url ? (
                      <img
                        src={event.poster_url}
                        alt={event.title}
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div
                        className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105"
                        style={{ background: event.gradient }}
                      />
                    )}
                    <div className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                  </div>
                </div>

                <p className="mt-3 text-xs text-[#8B889C]">{event.location}</p>
                <h3 className="mt-1 block w-full truncate font-display text-sm font-bold text-[#1B1A3A] transition-all duration-300 group-hover:text-[#FF5470]">
                  {event.title}
                </h3>
                <p className="mt-0.5 truncate text-xs text-[#6B6875]">
                  {t("byOrganizer", { organizer: event.organizer })}
                </p>

                <div className="mt-3 border-t border-[#EDEBF2] pt-2.5">
                  <p className="text-[0.65rem] text-[#8B889C]">{t("startingFrom")}</p>
                  <p className="font-mono text-sm font-bold text-[#1B1A3A]">
                    Rp{event.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}