"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { apiGet } from "@/lib/api";
import { useApiResource } from "@/hooks/use-api-resource";
import { EmptyState, ErrorState, LoadingState } from "@/components/states/async-states";
import type { Concert } from "@/types/type";

export interface PickEvent {
    id: string;
    day: string;
    month: string;
    title: string;
    meta: string;
    /** "" = konser belum punya poster (tidak diisi gambar acak) */
    image: string;
    href: string;
    /** nama hari dari tanggal konser yang sebenarnya */
    weekday: string;
    /** epoch ms tanggal konser; NaN kalau tidak valid */
    ts: number;
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
        image: c.poster_url || "",
        href: `/concerts/${c.id}`,
        weekday: valid ? d.toLocaleDateString("id-ID", { weekday: "short" }).toUpperCase().replace(".", "") : "",
        ts: d.getTime(),
    };
}

async function loadPicks(): Promise<PickEvent[]> {
    const data = await apiGet<unknown>("/concerts");
    const list: Concert[] = Array.isArray(data)
        ? (data as Concert[])
        : ((data as Record<string, unknown>)?.concerts as Concert[]) ?? ((data as Record<string, unknown>)?.data as Concert[]) ?? [];
    return list.map(toPick);
}

const WEEK_MS = 7 * 24 * 3600 * 1000;

function PickThumb({ src, className }: { src: string; className: string }) {
    return src ? <img src={src} alt="" className={className} /> : <div className={`${className} bg-muted`} aria-hidden />;
}

export default function FeaturedPicks({
    popular: popularProp,
    thisWeek: thisWeekProp,
    viewAllHref = "#",
    className = "",
}: FeaturedPicksProps) {
    const t = useTranslations("FeaturedPicks");
    const fromProps = !!(popularProp && thisWeekProp);
    // data asli saja; kalau sedikit ya tampil sedikit (tanpa mengisi dengan event karangan)
    const picksRes = useApiResource(fromProps ? "featured-picks-props" : "featured-picks", () =>
        fromProps ? Promise.resolve([...(popularProp ?? []), ...(thisWeekProp ?? [])]) : loadPicks()
    );
    const all = useMemo(() => picksRes.data ?? [], [picksRes.data]);
    const [now] = useState(() => Date.now());
    const popular = popularProp ?? all.slice(0, 5);
    const thisWeek = thisWeekProp ?? all.filter((e) => e.ts >= now && e.ts < now + WEEK_MS).slice(0, 5);

    const [tab, setTab] = useState<"popular" | "thisWeek">("popular");
    const [showAll, setShowAll] = useState(false);
    const items = tab === "popular" ? popular : thisWeek;
    const allItems = all;

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
        <div className={`grid grid-cols-1 gap-5 md:grid-cols-[360px_1fr] ${className}`}>
            <div className="flex justify-end self-start">
                <div className="group w-full max-w-[360px] translate-x-3 overflow-hidden rounded-3xl sm:max-w-[380px] md:translate-x-4">
                    <video
                        src="/event4u.mp4"
                        // Cloudinary URL after manual upload: https://res.cloudinary.com/pbzbhdg3/video/upload/v1/wavy/event4u.mp4
                        autoPlay
                        loop
                        muted
                        playsInline
                        preload="metadata"
                        className="w-full origin-center object-contain transition-transform duration-500 ease-out group-hover:scale-110"
                    />
                </div>
            </div>

            <div className="ml-6 sm:ml-12">
                <div className="flex items-center justify-between">
                    <h3 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 1024 1024" className="shrink-0 text-primary">
                            <path d="M0 0h1024v1024H0z" fill="none" />
                            <path fill="currentColor" d="M128 384v512h768V192H768v32a32 32 0 1 1-64 0v-32H320v32a32 32 0 0 1-64 0v-32H128v128h768v64zm192-256h384V96a32 32 0 1 1 64 0v32h160a32 32 0 0 1 32 32v768a32 32 0 0 1-32 32H96a32 32 0 0 1-32-32V160a32 32 0 0 1 32-32h160V96a32 32 0 0 1 64 0zm-32 384h64a32 32 0 0 1 0 64h-64a32 32 0 0 1 0-64m0 192h64a32 32 0 1 1 0 64h-64a32 32 0 1 1 0-64m192-192h64a32 32 0 0 1 0 64h-64a32 32 0 0 1 0-64m0 192h64a32 32 0 1 1 0 64h-64a32 32 0 1 1 0-64m192-192h64a32 32 0 1 1 0 64h-64a32 32 0 0 1 0-64m0 192h64a32 32 0 1 1 0 64h-64a32 32 0 1 1 0-64" />
                        </svg>
                        Event4u
                    </h3>
                    <button onClick={() => setShowAll(true)} className="text-sm font-medium text-primary hover:underline">
                        Lebih Banyak Event ›
                    </button>
                </div>

                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {(["popular", "thisWeek"] as const).map((key) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border-2 px-5 py-2 text-xs font-bold leading-none transition-all ${tab === key
                                ? "border-primary bg-white text-primary shadow-[0_2px_8px_color-mix(in_oklab,var(--primary)_14%,transparent)]"
                                : "border-border bg-white text-muted-foreground hover:border-input"
                                }`}
                        >
                            {key === "popular" ? "🔥 Populer" : "🏆 Minggu ini"}
                        </button>
                    ))}
                </div>

                <div className="mt-1">
                    {picksRes.loading ? (
                        <LoadingState rows={3} label={t("loading")} />
                    ) : picksRes.error ? (
                        <ErrorState error={picksRes.error} onRetry={picksRes.reload} />
                    ) : items.length === 0 ? (
                        <EmptyState title={tab === "thisWeek" ? t("emptyThisWeek") : t("empty")} />
                    ) : (() => {
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
                                            <div className="relative z-[1] flex w-[52px] flex-col items-center justify-center rounded-[10px] border border-border bg-surface px-1 py-[10px] text-center shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:w-[56px]">
                                                <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">{ev.month}</span>
                                                <span className="mt-[2px] text-[20px] font-extrabold leading-none text-foreground">{ev.day}</span>
                                                <span className="mt-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground/70">{ev.weekday}</span>
                                            </div>
                                        ) : (
                                            <div className="w-[52px] sm:w-[56px]" aria-hidden />
                                        )}
                                        <div
                                            className="pointer-events-none absolute left-1/2 w-px -translate-x-1/2"
                                            style={{
                                                top: showDate ? 62 : -18,
                                                bottom: isLast ? -6 : -34,
                                                backgroundImage: "repeating-linear-gradient(to bottom, var(--input) 0 4px, transparent 4px 8px)",
                                                opacity: 0.7,
                                            }}
                                            aria-hidden
                                        />
                                    </div>
                                    <div className="min-w-0 pb-1 pl-3 pt-1">
                                        <p className={`line-clamp-2 text-[15px] font-bold leading-[1.35] ${isBlue ? "text-primary group-hover:text-primary/80" : "text-foreground group-hover:text-primary"}`}>
                                            {ev.title}
                                        </p>
                                        <p className="mt-[6px] truncate text-[12.5px] leading-none text-muted-foreground/70">{ev.meta}</p>
                                    </div>
                                    <div className="flex justify-end pt-1">
                                        <PickThumb
                                            src={ev.image}
                                            className="h-[56px] w-[116px] rounded-[10px] object-cover shadow-sm ring-1 ring-black/5 sm:h-[60px] sm:w-[132px]"
                                        />
                                    </div>
                                    <div
                                        className="pointer-events-none absolute inset-x-0 bottom-0 h-px"
                                        style={{
                                            marginLeft: 60,
                                            backgroundImage: "repeating-linear-gradient(to right, var(--border) 0 4px, transparent 4px 8px)",
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
        }F
      `}</style>

            {showAll && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <button aria-label="Close" onClick={() => setShowAll(false)} className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
                    <div className="relative flex max-h-[85vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl">
                        <div className="flex items-center justify-between border-b border-border px-6 py-4">
                            <h4 className="text-base font-bold text-foreground">Semua Event</h4>
                            <button onClick={() => setShowAll(false)} className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-border">✕</button>
                        </div>
                        <div className="overflow-y-auto px-6 py-2">
                            {(() => {
                                let last = "";
                                return allItems.map((ev, idx) => {
                                    const key = `${ev.month}-${ev.day}`;
                                    const showDate = key !== last;
                                    const isLast = idx === allItems.length - 1;
                                    last = key;
                                    return (
                                        <a key={`all-${ev.id}`} href={ev.href} className="group relative grid grid-cols-[52px_1fr_96px] items-start gap-4 py-4 hover:bg-surface">
                                            <div className="relative flex flex-col items-center self-stretch">
                                                {showDate ? (
                                                    <div className="relative z-[1] flex w-[48px] flex-col items-center justify-center rounded-[10px] border border-border bg-surface px-1 py-2 text-center shadow-sm">
                                                        <span className="text-[9px] font-semibold uppercase tracking-wide text-muted-foreground/70">{ev.month}</span>
                                                        <span className="text-base font-extrabold leading-none text-foreground">{ev.day}</span>
                                                        <span className="mt-0.5 text-[9px] font-medium uppercase text-muted-foreground/70">{ev.weekday}</span>
                                                    </div>
                                                ) : (
                                                    <div className="w-[48px]" aria-hidden />
                                                )}
                                                <div
                                                    className="pointer-events-none absolute left-1/2 w-px -translate-x-1/2"
                                                    style={{ top: showDate ? 56 : -16, bottom: isLast ? -6 : -28, backgroundImage: "repeating-linear-gradient(to bottom, var(--input) 0 4px, transparent 4px 8px)", opacity: 0.6 }}
                                                    aria-hidden
                                                />
                                            </div>
                                            <div className="min-w-0 py-1">
                                                <p className="line-clamp-2 text-sm font-bold leading-tight text-foreground group-hover:text-primary">{ev.title}</p>
                                                <p className="mt-1 truncate text-xs text-muted-foreground/70">{ev.meta}</p>
                                            </div>
                                            <PickThumb src={ev.image} className="h-14 w-24 shrink-0 self-center rounded-lg object-cover ring-1 ring-black/5" />
                                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px" style={{ marginLeft: 52, backgroundImage: "repeating-linear-gradient(to right, var(--border) 0 4px, transparent 4px 8px)" }} aria-hidden />
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