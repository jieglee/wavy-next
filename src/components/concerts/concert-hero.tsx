"use client";

import { MapPin, Calendar, Layers } from "lucide-react";
import type { ConcertDetail } from "@/types/type";

export default function ConcertHero({ concert }: { concert: ConcertDetail }) {
  const banner =
    concert.poster_url ||
    concert.photo_url ||
    "https://assets.loket.com/neo/production/images/banner/20260722120040_6a604e781ffbd.jpg";

  const dateObj = new Date(concert.date);
  const dateStr = dateObj.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  // Format: "19:00 - 21:00 WIB"
  const startHour = dateObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
  const endDate = new Date(dateObj.getTime() + 2 * 60 * 60 * 1000); // +2h
  const endHour = endDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <section className="relative w-full">
      {/* Poster as blurred background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${banner})`, filter: "blur(40px) brightness(0.4)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-black/30" />
      </div>

      {/* Content */}
      <div className="relative mx-auto max-w-[1180px] px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
          {/* Left: Event info */}
          <div className="min-w-0 text-white lg:pt-2">
            <h1 className="text-[22px] font-bold leading-tight tracking-[-0.01em] sm:text-[26px] lg:text-[28px]">
              {concert.title}
            </h1>
            <div className="mt-5 space-y-3">
              <div className="flex items-center gap-3 text-[14px]">
                <MapPin className="h-5 w-5 shrink-0 text-white/80" strokeWidth={1.8} />
                <span className="font-medium">{concert.venue}</span>
              </div>
              <div className="flex items-center gap-3 text-[14px]">
                <Calendar className="h-5 w-5 shrink-0 text-white/80" strokeWidth={1.8} />
                <span className="font-medium">
                  {dateStr}, {startHour} - {endHour} WIB
                </span>
              </div>
              <div className="flex items-center gap-3 text-[14px]">
                <Layers className="h-5 w-5 shrink-0 text-white/80" strokeWidth={1.8} />
                <span className="font-medium tracking-wide">
                  {concert.category} &nbsp;•&nbsp; Musik &nbsp;•&nbsp; {concert.genre || "K-Pop"}
                </span>
              </div>
            </div>
          </div>

          {/* Right: empty spacer on desktop for overlapping unified poster card */}
          <div className="hidden lg:block" />
        </div>
      </div>
    </section>
  );
}
