"use client";

import { useEffect, useMemo, useState } from "react";

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
    popular: PickEvent[];
    thisWeek: PickEvent[];
    viewAllHref?: string;
    className?: string;
}

export default function FeaturedPicks({
    popular,
    thisWeek,
    viewAllHref = "#",
    className = "",
}: FeaturedPicksProps) {
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
                    <h3 className="text-lg font-semibold text-[#14121A]">Konser pilihan</h3>
                    <a href={viewAllHref} className="text-sm font-medium text-[#FF2E88] hover:text-[#E01974]">
                        Lihat semua →
                    </a>
                </div>

                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                    {(["popular", "thisWeek"] as const).map((key) => (
                        <button
                            key={key}
                            onClick={() => setTab(key)}
                            className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-sm transition-colors ${tab === key
                                    ? "border-[#FF2E88] bg-[#FF2E88] text-white"
                                    : "border-[#E7E2EF] text-[#6B6673] hover:border-[#C7BEDA]"
                                }`}
                        >
                            {key === "popular" ? "Populer" : "Minggu ini"}
                        </button>
                    ))}
                </div>

                <div className="mt-2">
                    {items.slice(0, 5).map((ev) => (
                        <a
                            key={ev.id}
                            href={ev.href}
                            className="grid grid-cols-[52px_1fr_auto] items-center gap-3 border-b border-[#F0ECF7] py-3 last:border-none hover:bg-[#FAF7FC] sm:grid-cols-[56px_1fr_76px] sm:gap-4"
                        >
                            <div className="relative flex flex-col items-center justify-center rounded-xl bg-[#F3EEFA] py-2 text-center">
                                <span className="text-[10px] uppercase tracking-wide text-[#FF2E88]">{ev.month}</span>
                                <span className="text-base font-semibold text-[#14121A]">{ev.day}</span>
                                <span className="absolute -right-[7px] top-1/2 h-3 w-3 -translate-y-1/2 rounded-full bg-white" />
                            </div>
                            <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-[#14121A]">{ev.title}</p>
                                <p className="truncate text-xs text-[#6B6673]">{ev.meta}</p>
                            </div>
                            <img
                                src={ev.image}
                                alt=""
                                className="hidden h-12 w-[76px] rounded-lg object-cover sm:block"
                            />
                        </a>
                    ))}
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