"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";
import type { Concert } from "@/types/type";

export interface PickEvent {
    id: string;
    day: string;
    month: string;
    title: string;
    meta: string;
    image: string;
    href: string;
}

interface FeaturedPicksProps {
    popular?: PickEvent[];
    thisWeek?: PickEvent[];
    viewAllHref?: string;
    className?: string;
}

function toPick(c: Concert): PickEvent {
    const d = new Date(c.date);
    const valid = !isNaN(d.getTime());
    const day = valid ? String(d.getDate()).padStart(2, "0") : "--";
    const month = valid ? d.toLocaleString("en-US", { month: "short" }).toUpperCase() : "---";
    const dateStr = valid
        ? d.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })
        : c.date;
    return {
        id: String(c.id),
        day,
        month,
        title: c.title,
        meta: `${dateStr} • ${c.venue}`,
        image: c.poster_url || `https://picsum.photos/seed/${c.id}/400/200`,
        href: `/concerts/${c.id}`,
    };
}

function fallbackPicks(): { pop: PickEvent[]; week: PickEvent[] } {
    return {
        pop: [
            { id: "1", day: "11", month: "SEP", title: 'Hillsong Worship Nights Asia Tour Surabaya', meta: "11 Sep 2026 • Graha Unesa Surabaya, Kota Surabaya", image: "https://picsum.photos/seed/hillsong/400/200", href: "/concerts/1" },
            { id: "2", day: "11", month: "SEP", title: 'Drama Musikal "Mutiara Dari Timur: Nyala Perjuangan Martha Christina Tiahahu."', meta: "11 Sep 2026 • Istora Senayan, Jakarta Pusat", image: "https://picsum.photos/seed/mutiara/400/200", href: "/concerts/2" },
            { id: "3", day: "11", month: "SEP", title: "FAM - Fan And Makers Vol. 2", meta: "11-13 Sep 2026 • The Brickhall, Fatmawati, Jakarta Selatan", image: "https://picsum.photos/seed/fam/400/200", href: "/concerts/3" },
            { id: "4", day: "12", month: "SEP", title: "U-KNOW PROJECT 26 : SCENE#1 in JAKARTA", meta: "12 Sep 2026 • JAKARTA CONCERT HALL, Lt 14 & 15 iNews Tower, Jakarta Pusat", image: "https://picsum.photos/seed/uknow/400/200", href: "/concerts/4" },
            { id: "5", day: "12", month: "SEP", title: "RUANG RAYA - KARAWANG", meta: "12 Sep 2026 • KAWASAN 3 BISNIS, KARAWANG, Kab. Karawang", image: "https://picsum.photos/seed/ruangraya/400/200", href: "/concerts/5" },
        ],
        week: [
            { id: "6", day: "13", month: "SEP", title: "NIKI: Nicole Live in Jakarta", meta: "13 Sep 2026 • ICE BSD, Tangerang", image: "https://picsum.photos/seed/niki/400/200", href: "/concerts/6" },
            { id: "7", day: "14", month: "SEP", title: "Tulus: Tur Manusia 2026", meta: "14 Sep 2026 • Tennis Indoor Senayan, Jakarta", image: "https://picsum.photos/seed/tulus/400/200", href: "/concerts/7" },
        ],
    };
}

export default function FeaturedPicks({
    popular: popularProp,
    thisWeek: thisWeekProp,
    viewAllHref = "#",
    className = "",
}: FeaturedPicksProps) {
    const fb = useMemo(() => fallbackPicks(), []);
    const [popular, setPopular] = useState<PickEvent[]>(popularProp ?? fb.pop);
    const [thisWeek, setThisWeek] = useState<PickEvent[]>(thisWeekProp ?? fb.week);

    useEffect(() => {
        if (popularProp && thisWeekProp) return;
        let cancelled = false;
        (async () => {
            try {
                const data = await apiGet<unknown>("/concerts");
                const list: Concert[] = Array.isArray(data)
                    ? (data as Concert[])
                    : (data as Record<string, unknown>)?.concerts as Concert[] ??
                      (data as Record<string, unknown>)?.data as Concert[] ??
                      [];
                if (!list?.length || cancelled) return;
                const picks = list.slice(0, 10).map(toPick);
                setPopular(picks.slice(0, 5));
                setThisWeek(picks.slice(5, 8).length ? picks.slice(5, 8) : picks.slice(0, 3));
            } catch { /* keep fallback */ }
        })();
        return () => { cancelled = true; };
    }, [popularProp, thisWeekProp]);

    const [tab, setTab] = useState<"popular" | "thisWeek">("popular");
    const items = tab === "popular" ? popular : thisWeek;

    const banner = useMemo(() => [...popular, ...thisWeek].slice(0, 5), [popular, thisWeek]);
    const [active, setActive] = useState(0);

    useEffect(() => {
        if (banner.length < 2) return;
        const id = setInterval(() => setActive((i) => (i + 1) % banner.length), 4000);
        return () => clearInterval(id);
    }, [banner.length]);

    const featured = banner[active];

    return (
        <div className={`grid grid-cols-1 gap-5 md:grid-cols-[280px_1fr] ${className}`}>
            <div className="relative flex min-h-[280px] flex-col justify-end overflow-hidden rounded-3xl p-6 sm:min-h-[320px]">
                <div
                    className="absolute inset-0"
                    style={{
                        background:
                            "radial-gradient(120% 100% at 20% 10%, #FF2E88 0%, #C22E8C 45%, #3C1F70 100%)",
                    }}
                />
                <div
                    className="absolute inset-0 opacity-25"
                    style={{
                        backgroundImage: "radial-gradient(rgba(255,255,255,0.6) 1px, transparent 1.5px)",
                        backgroundSize: "14px 14px",
                    }}
                />
                <div className="relative mx-auto mb-6 h-32 w-full max-w-[180px] sm:h-40">
                    {banner.map((ev, i) => {
                        const offset = i - active;
                        const wrapped =
                            offset > banner.length / 2
                                ? offset - banner.length
                                : offset < -banner.length / 2
                                    ? offset + banner.length
                                    : offset;
                        const visible = Math.abs(wrapped) <= 1;
                        return (
                            <img
                                key={ev.id}
                                src={ev.image}
                                alt={ev.title}
                                className="absolute inset-0 h-full w-full rounded-2xl object-cover shadow-[0_14px_28px_rgba(60,31,112,0.45)] transition-all duration-700 ease-out"
                                style={{
                                    transform: `translateX(${wrapped * 16}px) rotate(${wrapped * 6}deg) scale(${wrapped === 0 ? 1 : 0.9
                                        })`,
                                    zIndex: 10 - Math.abs(wrapped),
                                    opacity: visible ? (wrapped === 0 ? 1 : 0.6) : 0,
                                }}
                            />
                        );
                    })}
                </div>
                <p className="relative text-[11px] font-medium uppercase tracking-wide text-white/70">
                    Lagi ramai
                </p>
                <p key={featured?.id} className="pick-fade relative mt-1 text-lg font-semibold leading-snug text-white">
                    {featured?.title}
                </p>
                <p className="relative mt-1 text-sm text-white/75">{featured?.meta}</p>
            </div>

            <div>
                <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-base font-semibold text-[#14121A]">
                        <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-[#EDEEF6] text-[10px]">🗓️</span>
                        Event2Go
                    </h3>
                    <a href={viewAllHref} className="text-sm font-medium text-[#1A4BDE] hover:underline">
                        Lebih Banyak Event ›
                    </a>
                </div>

                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {(["popular", "thisWeek"] as const).map((key) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition-colors ${tab === key
                                    ? "border-[#1A4BDE] bg-white text-[#1A4BDE] shadow-sm ring-1 ring-[#1A4BDE]"
                                    : "border-[#E7E2EF] text-[#6B6673] hover:border-[#C7BEDA]"
                                }`}
                        >
                            {key === "popular" ? "🔥 Populer" : "🏆 Minggu ini"}
                        </button>
                    ))}
                </div>

                <div className="mt-2">
                    {(() => {
                        const weekday = (m: string, d: string) => {
                            try {
                                const monthMap: Record<string, number> = { JAN:0,FEB:1,MAR:2,APR:3,MEI:4,MAY:4,JUN:5,JUL:6,AGU:7,AUG:7,SEP:8,OKT:9,OCT:9,NOV:10,DES:11,DEC:11 };
                                const date = new Date(2026, monthMap[m] ?? 0, parseInt(d,10));
                                return date.toLocaleDateString("id-ID", { weekday: "short" }).toUpperCase();
                            } catch { return ""; }
                        };
                        let lastKey = "";
                        return items.slice(0, 5).map((ev) => {
                            const key = `${ev.month}-${ev.day}`;
                            const showDate = key !== lastKey;
                            lastKey = key;
                            return (
                                <a
                                    key={ev.id}
                                    href={ev.href}
                                    className="grid grid-cols-[52px_1fr_auto] items-start gap-3 border-b border-[#F0ECF7] py-3 last:border-none hover:bg-[#FAF7FC] sm:grid-cols-[56px_1fr_76px] sm:gap-4"
                                >
                                    <div className="relative flex flex-col items-center self-stretch">
                                        {showDate ? (
                                            <div className="flex flex-col items-center justify-center rounded-lg border border-[#E7E2EF] bg-white px-2 py-2 text-center">
                                                <span className="text-[9px] font-medium uppercase tracking-wide text-[#8B86A0]">{ev.month}</span>
                                                <span className="text-base font-bold leading-none text-[#14121A]">{ev.day}</span>
                                                <span className="mt-0.5 text-[9px] font-medium text-[#8B86A0]">{weekday(ev.month, ev.day)}</span>
                                            </div>
                                        ) : (
                                            <div className="w-[52px] sm:w-[56px]" aria-hidden />
                                        )}
                                        <div className="absolute bottom-0 left-1/2 top-[52px] w-px -translate-x-1/2 border-l border-dotted border-[#E0D9EE]" aria-hidden />
                                    </div>
                                    <div className="min-w-0 py-1">
                                        <p className="text-sm font-semibold leading-tight text-[#14121A]">{ev.title}</p>
                                        <p className="mt-1 truncate text-xs text-[#8B86A0]">{ev.meta}</p>
                                    </div>
                                    <img
                                        src={ev.image}
                                        alt=""
                                        className="hidden h-12 w-[76px] rounded-lg object-cover sm:block"
                                    />
                                </a>
                            );
                        });
                    })()}
                </div>
            </div>

            <style jsx>{`
        .pick-fade {
          animation: pickFade 0.5s ease-out;
        }
        @keyframes pickFade {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </div>
    );
}