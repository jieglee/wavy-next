import { MapPin, Calendar, Clock, Bell, Share2, Music, Ticket } from "lucide-react";
import type { ConcertDetail } from "@/types/type";

interface Props {
    concert: ConcertDetail;
    dateFormatted: string;
    timeFormatted: string;
    countdown: { days: number; hours: number; minutes: number; seconds: number };
    isNotified: boolean;
    onNotify: () => void;
    onBuyClick: () => void;
}

export default function ConcertHero({ concert, dateFormatted, timeFormatted, countdown, isNotified, onNotify, onBuyClick }: Props) {
    return (
        <div className="relative mb-20 sm:mb-24 md:mb-16">
            <div className="relative overflow-hidden rounded-3xl bg-[#1B1A3A] p-6 pb-10 text-white shadow-xl sm:p-8 md:pb-14 md:pr-[300px]">
                <div
                    className="pointer-events-none absolute inset-0 opacity-40"
                    style={{
                        backgroundImage:
                            "radial-gradient(circle at 15% -10%, #FF5470 0%, transparent 55%), radial-gradient(circle at 90% 110%, #7DD3E8 0%, transparent 45%)",
                    }}
                />

                <div className="relative z-10 max-w-xl space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full bg-[#FF5470] px-3 py-1 text-xs font-bold text-white">
                            {concert.category}
                        </span>
                        <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                            Oleh {concert.organizer_name}
                        </span>
                        {countdown.days + countdown.hours + countdown.minutes > 0 && (
                            <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                                <Clock className="h-3 w-3 text-[#FF5470]" />
                                {countdown.days}h {countdown.hours}j lagi
                            </span>
                        )}
                    </div>

                    <h1 className="font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl md:text-4xl">
                        {concert.title}
                    </h1>

                    <div className="flex flex-col gap-2 pt-2 text-sm text-white/80 sm:flex-row sm:flex-wrap sm:gap-4">
                        <div className="flex items-center gap-1.5">
                            <MapPin className="h-4 w-4 shrink-0 text-[#7DD3E8]" />
                            <span>{concert.venue}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 shrink-0 text-[#FF5470]" />
                            <span>{dateFormatted}, {timeFormatted} WIB</span>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 pt-2">
                        <button
                            onClick={onNotify}
                            className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all ${isNotified ? "bg-emerald-600 text-white" : "bg-white/15 text-white hover:bg-white/25"
                                }`}
                        >
                            <Bell className="h-3.5 w-3.5" />
                            {isNotified ? "Pengingat Aktif" : "Ingatkan Saya"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Poster card melayang */}
            <div className="absolute right-4 top-6 w-[220px] overflow-hidden rounded-2xl bg-white shadow-2xl sm:right-8 sm:w-[260px] md:right-10 md:top-8 md:w-[280px]">
                <div className="relative aspect-[3/4] bg-gradient-to-br from-[#8B0000] to-[#2B0000]">
                    {concert.poster_url ? (
                        <img src={concert.poster_url} alt={concert.title} className="absolute inset-0 h-full w-full object-cover" />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Music className="h-10 w-10 text-white/30" />
                        </div>
                    )}
                </div>

                <div className="space-y-3 p-4">
                    <div>
                        <p className="text-[11px] text-[#8B889C]">Harga mulai dari</p>
                        <p className="font-mono text-lg font-extrabold text-[#1B1A3A]">
                            Rp{Number(concert.min_price).toLocaleString("id-ID")}
                        </p>
                    </div>

                    <button
                        onClick={onBuyClick}
                        className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#FF5470] py-2.5 text-xs font-bold text-white shadow-md transition-all hover:brightness-110 active:scale-[.98]"
                    >
                        <Ticket className="h-3.5 w-3.5" />
                        Beli Tiket
                    </button>

                    <div className="flex items-center gap-2 border-t border-[#EDEBF2] pt-3">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1B1A3A] text-[10px] font-bold text-white">
                            {concert.organizer_name?.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="truncate text-[11px] text-[#8B889C]">Diselenggarakan oleh</p>
                            <p className="truncate text-xs font-bold text-[#1B1A3A]">{concert.organizer_name}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 border-t border-[#EDEBF2] pt-3">
                        <span className="text-[11px] text-[#8B889C]">Bagikan:</span>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(window.location.href);
                            }}
                            className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FAFAF8] text-[#1B1A3A] hover:bg-[#EDEBF2]"
                        >
                            <Share2 className="h-3 w-3" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}