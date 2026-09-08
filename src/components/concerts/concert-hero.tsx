import { MapPin, Calendar, Layers } from "lucide-react";
import type { ConcertDetail } from "@/types/type";

export default function ConcertHero({ concert }: { concert: ConcertDetail }) {
  return (
    <section className="relative w-full bg-[#0B0B0B]">
      <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, #050507 0%, #1A0D0F 28%, #4A1418 62%, #2A1014 85%, #0B0B0B 100%)" }} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
      <div className="relative mx-auto flex max-w-[1180px] flex-col gap-6 px-4 py-6 sm:px-6 lg:flex-row lg:items-start lg:justify-between lg:gap-10 lg:px-8 lg:pt-8 lg:pb-12">
        <div className="min-w-0 flex-1 text-white lg:pt-1">
          <h1 className="text-[20px] font-bold leading-tight tracking-[-0.02em] sm:text-[24px] lg:text-[26px]">{concert.title || "Tiffany Young: Edge of Calm Tour in Jakarta"}</h1>
          <div className="mt-5 space-y-3.5">
            <div className="flex items-center gap-3 text-[14px]">
              <MapPin className="h-[20px] w-[20px] shrink-0 text-white" strokeWidth={1.8} />
              <span className="font-medium text-white">{concert.venue || "JIEXPO Theatre, Jakarta Pusat"}</span>
            </div>
            <div className="flex items-center gap-3 text-[14px]">
              <Calendar className="h-[20px] w-[20px] shrink-0 text-white" strokeWidth={1.8} />
              <span className="font-medium text-white">19 Sep 2026, 19:00 - 21:00 WIB</span>
            </div>
            <div className="flex items-center gap-3 text-[14px]">
              <Layers className="h-[20px] w-[20px] shrink-0 text-white" strokeWidth={1.8} />
              <span className="font-medium tracking-wide text-white">Konser &nbsp;•&nbsp; Musik &nbsp;•&nbsp; K-Pop</span>
            </div>
          </div>
        </div>
        <div className="hidden lg:block lg:w-[360px] lg:shrink-0" />
      </div>
    </section>
  );
}
