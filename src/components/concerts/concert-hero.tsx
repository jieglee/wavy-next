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

  const startHour = dateObj.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const endDate = new Date(dateObj.getTime() + 2 * 60 * 60 * 1000);

  const endHour = endDate.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <section
      id="concert-hero"
      className="relative w-full overflow-visible bg-[#10191d] lg:h-[300px]"
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${banner})`,
            filter: "blur(40px) brightness(0.4)",
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-black/40" />
      </div>

      <div className="relative mx-auto flex h-full max-w-[1180px] items-center px-4 py-8 sm:px-6 lg:items-stretch lg:px-8 lg:py-0">
        <div className="grid w-full grid-cols-1 items-center gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-8">
          <div className="min-w-0 text-white lg:pt-10">
          <h1 className="text-[26px] font-bold leading-tight tracking-tight sm:text-[32px] lg:text-[36px]">
            {concert.title}
          </h1>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-3 text-[14px]">
              <MapPin
                className="h-5 w-5 shrink-0 text-white/80"
                strokeWidth={1.8}
              />
              <span className="font-medium">{concert.venue}</span>
            </div>

            <div className="flex items-center gap-3 text-[14px]">
              <Calendar
                className="h-5 w-5 shrink-0 text-white/80"
                strokeWidth={1.8}
              />
              <span className="font-medium">
                {dateStr}, {startHour} - {endHour} WIB
              </span>
            </div>

            <div className="flex items-center gap-3 text-[14px]">
              <Layers
                className="h-5 w-5 shrink-0 text-white/80"
                strokeWidth={1.8}
              />

              <span className="font-medium tracking-wide">
                {concert.category}
                &nbsp; • &nbsp;
                Musik
                &nbsp; • &nbsp;
                {concert.genre || "K-Pop"}
              </span>
            </div>
          </div>
          </div>

          <div className="relative z-10 hidden h-[260px] translate-y-[32px] items-end justify-end self-end lg:flex">
            <img
              src={banner}
              alt={concert.title}
              className="block h-full w-full rounded-lg object-cover object-right"
            />
          </div>
        </div>
      </div>
    </section>
  );
}