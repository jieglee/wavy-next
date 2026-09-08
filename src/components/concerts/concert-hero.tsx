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
  const timeStr = dateObj.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short",
  });

  return (
    <section className="relative w-full overflow-hidden">
      {/* Blurred poster background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${banner})` }}
      />
      <div
        className="absolute inset-0 bg-black/30"
        style={{ backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)" }}
      />

      {/* Content */}
      <div className="relative mx-auto flex max-w-[1180px] flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10 lg:px-8 lg:py-10">
        {/* Left: Event info */}
        <div className="min-w-0 flex-1 text-white lg:pt-2">
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
                {dateStr}, {timeStr}
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

        {/* Right: Poster card (desktop only) */}
        <div className="hidden lg:block lg:w-[340px] lg:shrink-0">
          <div className="overflow-hidden rounded-xl shadow-lg">
            <img
              src={banner}
              alt={concert.title}
              className="block h-auto w-full object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
