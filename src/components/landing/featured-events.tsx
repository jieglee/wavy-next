"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

export default function FeaturedEvents() {
    const scrollerRef = useRef<HTMLDivElement>(null);

    const scrollByCard = (dir: number) => {
        const el = scrollerRef.current;
        if (!el) return;
        el.scrollBy({ left: dir * 300, behavior: "smooth" });
    };

    return (
        <section className="px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                <div className="mb-6 flex items-center gap-2">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FF5470" strokeWidth="2">
                        <path d="M3 11l18-7-7 18-2-8-8-2z" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <h2 className="font-display text-xl font-bold text-wavy-text-primary sm:text-2xl">
                        Event Seru Untukmu
                    </h2>
                </div>

                <div className="relative">
                    <div
                        ref={scrollerRef}
                        className="scrollbar-hide flex gap-4 overflow-x-auto pb-2"
                    >
                        {events.map((event) => (
                            <a
                                key={event.id}
                                href="#"
                                className="group w-[260px] shrink-0 transition-transform duration-300 ease-out hover:-translate-y-1.5 sm:w-[280px]"
                            >
                                <div className="relative aspect-video overflow-hidden rounded-lg border-l-2 border-dashed border-wavy-border">
                                    <div
                                        className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105"
                                        style={{ background: event.gradient }}
                                    />
                                    <div className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                                    <div className="pointer-events-none absolute inset-0 bg-wavy-accent/25 opacity-0 backdrop-blur-[1px] transition-opacity duration-500 group-hover:opacity-100" />
                                </div>

                                <p className="mt-3 text-xs text-wavy-text-secondary">{event.location}</p>
                                <h3 className="mt-1 truncate font-display text-sm font-bold text-wavy-text-primary transition-colors group-hover:text-wavy-accent">
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

                    <button
                        onClick={() => scrollByCard(-1)}
                        aria-label="Sebelumnya"
                        className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-wavy-text-primary shadow-md transition-colors hover:brightness-95 sm:left-5"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                        onClick={() => scrollByCard(1)}
                        aria-label="Berikutnya"
                        className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-wavy-text-primary shadow-md transition-colors hover:brightness-95 sm:right-5"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </section>
    );
}
