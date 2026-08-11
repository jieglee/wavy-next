"use client";

import { useRef, useState, useEffect, useCallback } from "react";

const events = [
    { id: 1, title: "The Legends Infinity", organizer: "TRUST Orchestra", location: "Jakarta Selatan", price: "300.000", gradient: "linear-gradient(135deg,#7DD3E8,#4A90D9)" },
    { id: 2, title: "Tiffany Young: Edge of Calm", organizer: "Flabbergast Productions", location: "Jakarta Pusat", price: "2.000.000", gradient: "linear-gradient(135deg,#8B0000,#2B0000)" },
    { id: 3, title: "YE Jakarta 2026", organizer: "Raw Vision Collective", location: "Jakarta Pusat", price: "1.875.000", gradient: "linear-gradient(135deg,#3D3D3D,#0A0A0A)" },
    { id: 4, title: "Whisnu Santika by Bengkel", organizer: "Bengkel Space", location: "Jakarta Selatan", price: "150.000", gradient: "linear-gradient(135deg,#1B1A3A,#0D0C1F)" },
    { id: 5, title: "NIKI: Nicole Live", organizer: "Ismaya Live", location: "Tangerang", price: "850.000", gradient: "linear-gradient(135deg,#FF5470,#211F2B)" },
    { id: 6, title: "Jazz Under The Stars", organizer: "Java Festival Production", location: "Bandung", price: "425.000", gradient: "linear-gradient(135deg,#C6395A,#14131C)" },
    { id: 7, title: "Coldplay: Music of the Spheres", organizer: "PK Entertainment", location: "Jakarta Pusat", price: "1.200.000", gradient: "linear-gradient(135deg,#FF5470,#14131C)" },
    { id: 8, title: "Indie Sunset Festival", organizer: "Dyandra", location: "Bali", price: "550.000", gradient: "linear-gradient(135deg,#8B889C,#211F2B)" },
    { id: 9, title: "K-Pop Fan Meeting Vol. 3", organizer: "Ismaya Live", location: "Jakarta Selatan", price: "975.000", gradient: "linear-gradient(135deg,#211F2B,#FF5470)" },
    { id: 10, title: "Rock Reunion Night", organizer: "Java Festival Production", location: "Surabaya", price: "300.000", gradient: "linear-gradient(135deg,#14131C,#33313F)" },
    { id: 11, title: "EDM Bass Drop Fest", organizer: "PK Entertainment", location: "Jakarta Pusat", price: "650.000", gradient: "linear-gradient(135deg,#C6FF5C,#211F2B)" },
    { id: 12, title: "Akustik Malam Minggu", organizer: "Bengkel Space", location: "Yogyakarta", price: "180.000", gradient: "linear-gradient(135deg,#FF5470,#8B889C)" },
    { id: 13, title: "Pop Icon Reunion Tour", organizer: "Dyandra", location: "Jakarta Selatan", price: "1.500.000", gradient: "linear-gradient(135deg,#211F2B,#14131C)" },
    { id: 14, title: "Fan Meeting: Behind The Music", organizer: "Ismaya Live", location: "Bandung", price: "725.000", gradient: "linear-gradient(135deg,#33313F,#FF5470)" },
    { id: 15, title: "Festival Musisi Muda 2026", organizer: "Raw Vision Collective", location: "Tangerang", price: "225.000", gradient: "linear-gradient(135deg,#14131C,#C6395A)" },
];

function ArrowLeftIcon({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" className={className}>
            <path
                fill="currentColor"
                d="M685.2 104.7a64 64 0 0 1 0 90.5L368.4 512l316.8 316.8a64 64 0 0 1-90.4 90.5l-362.1-362a64 64 0 0 1 0-90.5l362-362.1a64 64 0 0 1 90.5 0"
            />
        </svg>
    );
}

function ArrowRightIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1024 1024"
            className={className}
            style={{ transform: "scaleX(-1)" }}
        >
            <path
                fill="currentColor"
                d="M685.2 104.7a64 64 0 0 1 0 90.5L368.4 512l316.8 316.8a64 64 0 0 1-90.4 90.5l-362.1-362a64 64 0 0 1 0-90.5l362-362.1a64 64 0 0 1 90.5 0"
            />
        </svg>
    );
}

const SCROLL_AMOUNT = 580;

export default function FeaturedEvents() {
    const scrollerRef = useRef<HTMLDivElement>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(true);

    const updateArrows = useCallback(() => {
        const el = scrollerRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
    }, []);

    useEffect(() => {
        updateArrows();
        const el = scrollerRef.current;
        if (!el) return;
        el.addEventListener("scroll", updateArrows, { passive: true });
        window.addEventListener("resize", updateArrows);
        return () => {
            el.removeEventListener("scroll", updateArrows);
            window.removeEventListener("resize", updateArrows);
        };
    }, [updateArrows]);

    const scrollByCard = (dir: number) => {
        scrollerRef.current?.scrollBy({ left: dir * SCROLL_AMOUNT, behavior: "smooth" });
    };

    return (
        <section className="px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex items-center gap-2">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="30"
                        height="30"
                        viewBox="0 0 24 24"
                        className="animate-megaphone text-wavy-accent"
                    >
                        <path d="M0 0h24v24H0z" fill="none" />
                        <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5">
                            <path d="m5.549 10.819l-1.826 1.615a1.414 1.414 0 0 0-.288 1.77l1.653 2.9a1.404 1.404 0 0 0 1.662.629l2.297-.783z" />
                            <path d="M9.258 4.59a26.7 26.7 0 0 1-1.71 4.072a7.2 7.2 0 0 1-2 2.157l3.499 6.112a7.3 7.3 0 0 1 2.882-.668c1.464.066 2.92.25 4.353.552" />
                            <path d="m9.253 4.591l1.215-.706a1.395 1.395 0 0 1 1.917.517l5.607 9.774a1.42 1.42 0 0 1-.519 1.92l-1.215.707zM3.56 14.416l-.606.358a1.4 1.4 0 0 0-.658.86a1.4 1.4 0 0 0 .149 1.074a1.4 1.4 0 0 0 .854.662a1.38 1.38 0 0 0 1.068-.149l.567-.358m4.804-.203l1.701 2.97a1.44 1.44 0 0 1-.509 1.933a1.404 1.404 0 0 1-1.922-.522l-1.922-3.414m12.55-10.735l-2.498 1.45m4.612 3.531h-2.883M16.225 2.25l-1.442 2.515" />
                        </g>
                    </svg>
                    <h2 className="font-display text-xl font-bold text-wavy-text-primary sm:text-2xl">
                        Event Seru Untukmu
                    </h2>
                </div>

                <div className="relative">
                    {canScrollLeft && (
                        <button
                            onClick={() => scrollByCard(-1)}
                            aria-label="Sebelumnya"
                            className="absolute -left-4 top-[73px] z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-wavy-bg shadow-lg transition-transform hover:scale-105 sm:top-[79px]"
                        >
                            <ArrowLeftIcon className="h-4 w-4" />
                        </button>
                    )}

                    {canScrollRight && (
                        <button
                            onClick={() => scrollByCard(1)}
                            aria-label="Berikutnya"
                            className="absolute -right-4 top-[73px] z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-wavy-bg shadow-lg transition-transform hover:scale-105 sm:top-[79px]"
                        >
                            <ArrowRightIcon className="h-4 w-4" />
                        </button>
                    )}

                    {/* pt-2 & pb-4 tambahan biar ada ruang buat shadow gambar pas naik, gak kepotong parent */}
                    <div ref={scrollerRef} className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth pb-2 pt-2">
                        {events.map((event) => (
                            <a key={event.id} href="#" className="group w-[260px] shrink-0 sm:w-[280px]">
                                {/* Shadow + translate ditaro di wrapper LUAR (gak overflow-hidden), rounded+overflow-hidden dipindah ke dalam */}
                                <div className="transition-transform duration-300 ease-out group-hover:-translate-y-2">
                                    <div className="relative aspect-video overflow-hidden rounded-lg border-l-2 border-dashed border-wavy-border shadow-none transition-shadow duration-300 ease-out group-hover:shadow-[0_16px_28px_-8px_rgba(0,0,0,0.5)]">
                                        <div
                                            className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105"
                                            style={{ background: event.gradient }}
                                        />
                                        <div className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                                    </div>
                                </div>

                                <p className="mt-3 text-xs text-wavy-text-secondary">{event.location}</p>
                                <h3 className="mt-1 inline-block origin-left truncate font-display text-sm font-bold text-wavy-text-primary transition-all duration-300 group-hover:scale-[1.03] group-hover:text-wavy-accent">
                                    {event.title}
                                </h3>
                                <p className="mt-0.5 truncate text-xs text-wavy-text-secondary">
                                    Oleh {event.organizer}
                                </p>

                                <div className="mt-3 border-t border-wavy-border pt-2.5">
                                    <p className="text-[0.65rem] text-wavy-text-secondary">Mulai dari</p>
                                    <p className="font-mono text-sm font-semibold text-wavy-text-primary">
                                        Rp{event.price}
                                    </p>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}