"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import Link from "next/link";

interface Hotel {
  id: number;
  name: string;
  location: string;
  price: string;
  rating: string;
  image?: string;
  gradient: string;
}

const mockHotels: Hotel[] = [
  { id: 1, name: "Hotel Mulia Senayan", location: "Jakarta Pusat", price: "850.000", rating: "4.5", gradient: "linear-gradient(135deg,#7DD3E8,#4A90D9)" },
  { id: 2, name: "Ibis Jakarta Gambir", location: "Jakarta Pusat", price: "420.000", rating: "4.0", gradient: "linear-gradient(135deg,#FF5470,#211F2B)" },
  { id: 3, name: "Amaris Hotel Sudirman", location: "Jakarta Selatan", price: "380.000", rating: "3.8", gradient: "linear-gradient(135deg,#1B1A3A,#0D0C1F)" },
  { id: 4, name: "Favehotel Bandung", location: "Bandung", price: "310.000", rating: "4.1", gradient: "linear-gradient(135deg,#C6395A,#14131C)" },
  { id: 5, name: "POP! Hotel Surabaya", location: "Surabaya", price: "290.000", rating: "3.9", gradient: "linear-gradient(135deg,#8B0000,#2B0000)" },
  { id: 6, name: "Hotel Santika Bogor", location: "Bogor", price: "350.000", rating: "4.2", gradient: "linear-gradient(135deg,#3D3D3D,#0A0A0A)" },
  { id: 7, name: "D'primahotel Yogyakarta", location: "Yogyakarta", price: "275.000", rating: "4.0", gradient: "linear-gradient(135deg,#7DD3E8,#4A90D9)" },
  { id: 8, name: "Hilton Bali Resort", location: "Bali", price: "1.200.000", rating: "4.7", gradient: "linear-gradient(135deg,#FF5470,#211F2B)" },
];

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" className={className}>
      <path d="M0 0h1024v1024H0z" fill="none" />
      <path fill="currentColor" d="M685.2 104.7a64 64 0 0 1 0 90.5L368.4 512l316.8 316.8a64 64 0 0 1-90.4 90.5l-362.1-362a64 64 0 0 1 0-90.5l362-362.1a64 64 0 0 1 90.5 0" />
    </svg>
  );
}

function ArrowRightIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" className={className} style={{ transform: "scaleX(-1)" }}>
      <path d="M0 0h1024v1024H0z" fill="none" />
      <path fill="currentColor" d="M685.2 104.7a64 64 0 0 1 0 90.5L368.4 512l316.8 316.8a64 64 0 0 1-90.4 90.5l-362.1-362a64 64 0 0 1 0-90.5l362-362.1a64 64 0 0 1 90.5 0" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className={className} fill="#FFB800" stroke="none">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function TravelerModeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" className={className}>
      <path d="M0 0h24v24H0z" fill="none" />
      <path fill="currentColor" d="M5 10s3-1.81 3-5c0-1.65-1.35-3-3-3S2 3.35 2 5c0 3.19 3 5 3 5m0-6.5c.83 0 1.5.67 1.5 1.5S5.83 6.5 5 6.5S3.5 5.83 3.5 5S4.17 3.5 5 3.5M19 14c-1.65 0-3 1.35-3 3c0 3.19 3 5 3 5s3-1.81 3-5c0-1.65-1.35-3-3-3m0 4.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5s1.5.67 1.5 1.5s-.67 1.5-1.5 1.5" />
      <path fill="currentColor" d="M4 17.5A2.5 2.5 0 0 1 6.5 15h7c1.93 0 3.5-1.57 3.5-3.5S15.43 8 13.5 8H8v2h5.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-7C4.02 13 2 15.02 2 17.5S4.02 22 6.5 22H16v-2H6.5A2.5 2.5 0 0 1 4 17.5" />
    </svg>
  );
}

export default function TravelerMode() {
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
    const el = scrollerRef.current;
    if (!el) return;
    const card = el.firstElementChild as HTMLElement | null;
    const gap = 16;
    const cardWidth = card?.offsetWidth ?? 260;
    el.scrollBy({ left: dir * (cardWidth + gap), behavior: "smooth" });
  };

  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TravelerModeIcon className="text-[#FF5470]" />
            <h2 className="font-display text-xl font-bold text-[#1B1A3A] sm:text-2xl">
              Make It a Trip
            </h2>
          </div>
          <Link href="#" className="text-sm font-medium text-[#1B1A3A] underline underline-offset-4 transition-colors hover:text-[#FF5470]">
            Lihat semua &rarr;
          </Link>
        </div>

        <div className="relative">
          {canScrollLeft && (
            <button
              onClick={() => scrollByCard(-1)}
              aria-label="Previous"
              className="absolute -left-4 top-15.75 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#1B1A3A] shadow-lg transition-transform hover:scale-105 sm:top-17.5"
            >
              <ArrowLeftIcon className="h-4 w-4" />
            </button>
          )}

          {canScrollRight && (
            <button
              onClick={() => scrollByCard(1)}
              aria-label="Next"
              className="absolute -right-4 top-15.75 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[#1B1A3A] shadow-lg transition-transform hover:scale-105 sm:top-17.5"
            >
              <ArrowRightIcon className="h-4 w-4" />
            </button>
          )}

          <div ref={scrollerRef} className="scrollbar-hide flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth pb-2 pt-2 sm:gap-4">
            {mockHotels.map((hotel) => (
              <div key={hotel.id} className="w-[260px] shrink-0 snap-start sm:w-[280px] lg:w-[270px] xl:w-[calc((100%-48px)/4)]">
                <Link href={`/hotels/${hotel.id}`} className="group block">
                  <div className="transition-transform duration-300 ease-out group-hover:-translate-y-2">
                    <div className="relative aspect-16/7 overflow-hidden rounded-xl border border-[#EDEBF2] shadow-[0_4px_14px_rgba(30,64,175,0.12)] transition-all duration-300 group-hover:border-wavy-blue/30 group-hover:shadow-[0_16px_32px_-8px_rgba(30,64,175,0.28)]">
                      {hotel.image ? (
                        <img
                          src={hotel.image}
                          alt={hotel.name}
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="absolute inset-0 transition-transform duration-500 ease-out group-hover:scale-105" style={{ background: hotel.gradient }} />
                      )}
                      <div className="pointer-events-none absolute inset-0 -translate-x-full skew-x-[-20deg] bg-linear-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 ease-out group-hover:translate-x-full" />
                    </div>
                  </div>
                  <p className="mt-3 truncate text-xs text-[#8B889C]">{hotel.location}</p>
                  <h3 className="mt-1 block w-full truncate font-display text-sm font-bold text-[#1B1A3A] transition-all duration-300 group-hover:text-[#FF5470]">{hotel.name}</h3>
                  <div className="mt-1 flex items-center gap-1">
                    <StarIcon className="h-3.5 w-3.5" />
                    <span className="text-xs font-semibold text-[#1B1A3A]">{hotel.rating}</span>
                  </div>
                  <div className="mt-3 border-t border-[#EDEBF2] pt-2.5">
                    <p className="text-[0.65rem] text-[#8B889C]">Mulai dari</p>
                    <p className="font-mono text-sm font-bold text-[#1B1A3A]">Rp{Number(hotel.price).toLocaleString("id-ID")}/malam</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
