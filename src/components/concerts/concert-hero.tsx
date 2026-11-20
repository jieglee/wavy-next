"use client";

import { MapPin, Calendar, Layers } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";
import type { ConcertDetail } from "@/types/type";
import { categoryLabels } from "@/lib/concert-labels";
import { EventPoster } from "@/components/concerts/event-poster";

export default function ConcertHero({ concert }: { concert: ConcertDetail }) {
  // tanpa gambar: latar polos bg-stage + poster pengganti (EventPoster), bukan banner situs lain
  const banner = concert.poster_url || concert.photo_url || "";

  const t = useTranslations("ConcertDetail");
  const format = useFormatter();
  const dateObj = new Date(concert.date);
  const endDate = new Date(dateObj.getTime() + 2 * 60 * 60 * 1000);
  const time = { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Jakarta" } as const;
  const schedule = t("schedule", {
    date: format.dateTime(dateObj, { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" }),
    start: format.dateTime(dateObj, time),
    end: format.dateTime(endDate, time),
  });

  return (
    <section
      id="concert-hero"
      className="relative w-full overflow-visible bg-stage lg:h-[300px]"
    >
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        {banner && (
          <div
            className="absolute inset-0 scale-110 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url(${banner})`,
              filter: "blur(40px) brightness(0.4)",
            }}
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-black/40" />
      </div>

            <div className="relative mx-auto flex h-full max-w-[1440px] items-center px-2 py-8 sm:px-4 lg:items-stretch lg:px-6 lg:py-0">
        <div className="grid w-full grid-cols-1 items-center gap-4 lg:grid-cols-[minmax(0,1fr)_520px] lg:items-start lg:gap-4">
          <div className="min-w-0 text-white lg:pt-10">
          <h1 className="text-[22px] font-bold leading-tight tracking-tight sm:text-[26px] lg:text-[30px]">
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
                {schedule}
              </span>
            </div>

            <div className="flex items-center gap-3 text-[14px]">
              <Layers
                className="h-5 w-5 shrink-0 text-white/80"
                strokeWidth={1.8}
              />

              <span className="font-medium tracking-wide">
                {categoryLabels(concert.category, concert.genre).join("  •  ")}
              </span>
            </div>
          </div>
          </div>

          <div className="relative z-10 hidden h-[460px] w-[520px] translate-y-[-160px] items-end justify-end justify-self-end self-end overflow-hidden rounded-t-xl pr-2 lg:flex">
            <EventPoster
              src={banner}
              title={concert.title}
              size="lg"
              loading="eager"
              className="block h-full w-full object-contain object-right-bottom"
            />
          </div>
        </div>
      </div>
    </section>
  );
}