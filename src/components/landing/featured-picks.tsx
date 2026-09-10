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
            { id: "8", day: "14", month: "SEP", title: "Coldplay: Music of the Spheres", meta: "14 Sep 2026 • GBK Main Stadium, Jakarta", image: "https://picsum.photos/seed/coldplay/400/200", href: "/concerts/8" },
            { id: "9", day: "15", month: "SEP", title: "Sheila On 7: Tunggu Aku Di Jakarta", meta: "15 Sep 2026 • JIExpo Kemayoran, Jakarta", image: "https://picsum.photos/seed/sheila/400/200", href: "/concerts/9" },
            { id: "10", day: "15", month: "SEP", title: "Festival Musik Indie Bandung", meta: "15 Sep 2026 • Lapangan Gasibu, Bandung", image: "https://picsum.photos/seed/indiefest/400/200", href: "/concerts/10" },
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
                if (picks.length < 10) return;
                setPopular(picks.slice(0, 5));
                setThisWeek(picks.slice(5, 10));
            } catch { /* keep fallback */ }
        })();
        return () => { cancelled = true; };
    }, [popularProp, thisWeekProp]);

    const [tab, setTab] = useState<"popular" | "thisWeek">("popular");
    const [showAll, setShowAll] = useState(false);
    const items = tab === "popular" ? popular : thisWeek;
    const [allConcerts, setAllConcerts] = useState<PickEvent[] | null>(null);

    useEffect(() => {
        if (!showAll || allConcerts) return;
        (async () => {
            try {
                const data = await apiGet<unknown>("/concerts");
                const list: Concert[] = Array.isArray(data)
                    ? (data as Concert[])
                    : (data as Record<string, unknown>)?.concerts as Concert[] ??
                      (data as Record<string, unknown>)?.data as Concert[] ??
                      [];
                if (list.length) setAllConcerts(list.map(toPick));
            } catch { /* fallback to 10 */ }
        })();
    }, [showAll, allConcerts]);

    const combined = useMemo(() => [...popular, ...thisWeek], [popular, thisWeek]);
    const allItems = allConcerts ?? combined;

    useEffect(() => {
        if (!showAll) return;
        document.body.style.overflow = "hidden";
        const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setShowAll(false); };
        window.addEventListener("keydown", onKey);
        return () => {
            document.body.style.overflow = "";
            window.removeEventListener("keydown", onKey);
        };
    }, [showAll]);

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

            <div className="ml-24 sm:ml-48">
                <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-2xl font-semibold text-[#14121A]">
                            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 1024 1024" className="shrink-0 text-[#FF5470]" style={{ filter: "drop-shadow(0 0 0.6px currentColor)" }}>
                                <path d="M0 0h1024v1024H0z" fill="none" />
                                <path fill="currentColor" d="M128 384v512h768V192H768v32a32 32 0 1 1-64 0v-32H320v32a32 32 0 0 1-64 0v-32H128v128h768v64zm192-256h384V96a32 32 0 1 1 64 0v32h160a32 32 0 0 1 32 32v768a32 32 0 0 1-32 32H96a32 32 0 0 1-32-32V160a32 32 0 0 1 32-32h160V96a32 32 0 0 1 64 0zm-32 384h64a32 32 0 0 1 0 64h-64a32 32 0 0 1 0-64m0 192h64a32 32 0 1 1 0 64h-64a32 32 0 1 1 0-64m192-192h64a32 32 0 0 1 0 64h-64a32 32 0 0 1 0-64m0 192h64a32 32 0 1 1 0 64h-64a32 32 0 1 1 0-64m192-192h64a32 32 0 1 1 0 64h-64a32 32 0 0 1 0-64m0 192h64a32 32 0 1 1 0 64h-64a32 32 0 1 1 0-64" />
                            </svg>
                        Event2Go
                    </h3>
                    <button onClick={() => setShowAll(true)} className="text-sm font-medium text-[#1A4BDE] hover:underline">
                        Lebih Banyak Event ›
                    </button>
                </div>

                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {(["popular", "thisWeek"] as const).map((key) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 px-5 py-2 text-xs font-bold leading-none transition-all ${tab === key
                                    ? "border-[#1A4BDE] bg-white text-[#1A4BDE] shadow-[0_2px_8px_rgba(26,75,222,0.14)]"
                                    : "border-[#E8E3F2] bg-white text-[#6B6673] hover:border-[#D4CFE6]"
                                }`}
                        >
                            {key === "popular" ? "🔥 Populer" : "🏆 Minggu ini"}
                        </button>
                    ))}
                </div>

                <div className="mt-1">
                    {(() => {
                        const weekday = (m: string, d: string) => {
                            try {
                                const monthMap: Record<string, number> = { JAN:0,FEB:1,MAR:2,APR:3,MEI:4,MAY:4,JUN:5,JUL:6,AGU:7,AUG:7,SEP:8,OKT:9,OCT:9,NOV:10,DES:11,DEC:11 };
                                const date = new Date(2026, monthMap[m] ?? 0, parseInt(d,10));
                                return date.toLocaleDateString("id-ID", { weekday: "short" }).toUpperCase().replace(".", "");
                            } catch { return ""; }
                        };
                        let lastKey = "";
                        const sliced = items.slice(0, 5);
                        return sliced.map((ev, idx) => {
                            const key = `${ev.month}-${ev.day}`;
                            const showDate = key !== lastKey;
                            const isLast = idx === sliced.length - 1;
                            lastKey = key;
                            const isBlue = idx === 1;
                            return (
                                <a
                                    key={ev.id}
                                    href={ev.href}
                                    className="group relative grid grid-cols-[56px_1fr_116px] items-start gap-5 py-[18px] sm:grid-cols-[60px_1fr_132px] sm:gap-8"
                                >
                                    <div className="relative flex flex-col items-center self-stretch">
                                        {showDate ? (
                                            <div className="relative z-[1] flex w-[52px] flex-col items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-1 py-[10px] text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:w-[56px]">
                                                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">{ev.month}</span>
                                                <span className="mt-[2px] text-[20px] font-extrabold leading-none text-[#111827]">{ev.day}</span>
                                                <span className="mt-1 text-[10px] font-medium uppercase tracking-wide text-[#9CA3AF]">{weekday(ev.month, ev.day)}</span>
                                            </div>
                                        ) : (
                                            <div className="w-[52px] sm:w-[56px]" aria-hidden />
                                        )}
                                        <div
                                            className="pointer-events-none absolute left-1/2 w-px -translate-x-1/2"
                                            style={{
                                                top: showDate ? 62 : -18,
                                                bottom: isLast ? -6 : -34,
                                                backgroundImage: "repeating-linear-gradient(to bottom, #D1D5DB 0 4px, transparent 4px 8px)",
                                                opacity: 0.7,
                                            }}
                                            aria-hidden
                                        />
                                    </div>
                                    <div className="min-w-0 pb-1 pl-3 pt-1">
                                        <p className={`line-clamp-2 text-[15px] font-bold leading-[1.35] ${isBlue ? "text-[#1A4BDE] group-hover:text-[#1A3AB8]" : "text-[#111827] group-hover:text-[#1A4BDE]"}`}>
                                            {ev.title}
                                        </p>
                                        <p className="mt-[6px] truncate text-[12.5px] leading-none text-[#9CA3AF]">{ev.meta}</p>
                                    </div>
                                    <div className="flex justify-end pt-1">
                                        <img
                                            src={ev.image}
                                            alt=""
                                            className="h-[56px] w-[116px] rounded-[10px] object-cover shadow-sm ring-1 ring-black/5 sm:h-[60px] sm:w-[132px]"
                                        />
                                    </div>
                                    <div
                                        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
                                        style={{
                                            marginLeft: 60,
                                            backgroundImage: "repeating-linear-gradient(to right, #E5E7EB 0 4px, transparent 4px 8px)",
                                        }}
                                        aria-hidden
                                    />
                                </a>
                            );
                        });
                    })()}
                </div>
            </div>

            <style jsx>{`
        @keyframes goyang {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(15deg); }
          50% { transform: rotate(0deg); }
          75% { transform: rotate(-15deg); }
        }
        .animasi-goyang:hover {
          animation: goyang 0.4s ease-in-out infinite;
        }
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

            {showAll && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <button aria-label="Close" onClick={() => setShowAll(false)} className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
                    <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#E5E7EB] px-6 py-4">
                            <h4 className="text-base font-bold text-[#111827]">Semua Event</h4>
                            <button onClick={() => setShowAll(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]">✕</button>
                        </div>
                        <div className="overflow-y-auto px-6 py-2">
                            {(() => {
                                const weekday = (m: string, d: string) => {
                                    try {
                                        const map: Record<string, number> = { JAN:0,FEB:1,MAR:2,APR:3,MEI:4,MAY:4,JUN:5,JUL:6,AGU:7,AUG:7,SEP:8,OKT:9,OCT:9,NOV:10,DES:11,DEC:11 };
                                        return new Date(2026, map[m] ?? 0, parseInt(d,10)).toLocaleDateString("id-ID", { weekday: "short" }).toUpperCase().replace(".", "");
                                    } catch { return ""; }
                                };
                                let last = "";
                                return allItems.map((ev, idx) => {
                                    const key = `${ev.month}-${ev.day}`;
                                    const showDate = key !== last;
                                    const isLast = idx === allItems.length - 1;
                                    last = key;
                                    return (
                                        <a key={`all-${ev.id}`} href={ev.href} className="group relative grid grid-cols-[52px_1fr_96px] items-start gap-4 py-4 hover:bg-[#FAFAFF]">
                                            <div className="relative flex flex-col items-center self-stretch">
                                                {showDate ? (
                                                    <div className="relative z-[1] flex w-[48px] flex-col items-center justify-center rounded-[10px] border border-[#E5E7EB] bg-[#F9FAFB] px-1 py-2 text-center shadow-sm">
                                                        <span className="text-[9px] font-semibold uppercase tracking-wide text-[#9CA3AF]">{ev.month}</span>
                                                        <span className="text-base font-extrabold leading-none text-[#111827]">{ev.day}</span>
                                                        <span className="mt-0.5 text-[9px] font-medium uppercase text-[#9CA3AF]">{weekday(ev.month, ev.day)}</span>
                                                    </div>
                                                ) : (
                                                    <div className="w-[48px]" aria-hidden />
                                                )}
                                                <div
                                                    className="pointer-events-none absolute left-1/2 w-px -translate-x-1/2"
                                                    style={{ top: showDate ? 56 : -16, bottom: isLast ? -6 : -28, backgroundImage: "repeating-linear-gradient(to bottom, #D1D5DB 0 4px, transparent 4px 8px)", opacity: 0.6 }}
                                                    aria-hidden
                                                />
                                            </div>
                                            <div className="min-w-0 py-1">
                                                <p className="line-clamp-2 text-sm font-bold leading-tight text-[#111827] group-hover:text-[#1A4BDE]">{ev.title}</p>
                                                <p className="mt-1 truncate text-xs text-[#9CA3AF]">{ev.meta}</p>
                                            </div>
                                            <img src={ev.image} alt="" className="h-14 w-24 shrink-0 self-center rounded-lg object-cover ring-1 ring-black/5" />
                                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px" style={{ marginLeft: 52, backgroundImage: "repeating-linear-gradient(to right, #E5E7EB 0 4px, transparent 4px 8px)" }} aria-hidden />
                                        </a>
                                    );
                                });
                            })()}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}