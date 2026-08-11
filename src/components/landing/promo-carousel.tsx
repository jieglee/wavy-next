"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

interface PromoSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  ctaLabel: string;
  ctaHref: string;
  gradient: string;
}

const slides: PromoSlide[] = [
  {
    id: "promo-1",
    eyebrow: "Promo Peluncuran",
    title: "Gratis Biaya Layanan",
    subtitle: "Untuk 1.000 tiket pertama di setiap event",
    ctaLabel: "Klik di sini untuk info lanjut",
    ctaHref: "#",
    gradient: "linear-gradient(135deg, #FF5470 0%, #211F2B 100%)",
  },
  {
    id: "promo-2",
    eyebrow: "Buat Event Organizer",
    title: "Cuma 1,5% dari Setiap Tiket Terjual",
    subtitle: "Sudah termasuk PPN, tanpa biaya tersembunyi",
    ctaLabel: "Ajukan kerjasama",
    ctaHref: "#",
    gradient: "linear-gradient(135deg, #211F2B 0%, #14131C 100%)",
  },
  {
    id: "promo-3",
    eyebrow: "Fitur Baru",
    title: "Smart Queue: War Tiket Jadi Adil",
    subtitle: "Antrean acak, bukan siapa cepat dia dapat",
    ctaLabel: "Pelajari cara kerjanya",
    ctaHref: "#",
    gradient: "linear-gradient(135deg, #FF5470 0%, #14131C 100%)",
  },
];

const AUTO_PLAY_MS = 5000;

export default function PromoCarousel() {
  const [index, setIndex] = useState(0);

  const goTo = useCallback((i: number) => {
    setIndex((i + slides.length) % slides.length);
  }, []);

  const next = useCallback(() => goTo(index + 1), [index, goTo]);
  const prev = useCallback(() => goTo(index - 1), [index, goTo]);

  useEffect(() => {
    const timer = setInterval(next, AUTO_PLAY_MS);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div className="relative w-full overflow-hidden">
      <div
        className="flex transition-transform duration-500 ease-[cubic-bezier(.65,0,.35,1)]"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="relative flex h-[220px] w-full shrink-0 items-center overflow-hidden px-8 sm:h-[280px] sm:px-16 md:h-[340px]"
            style={{ background: slide.gradient }}
          >
            {/* Dekorasi sparkle */}
            <Sparkles className="absolute right-16 top-8 h-6 w-6 text-white/20" />
            <Sparkles className="absolute bottom-10 right-40 h-4 w-4 text-white/15" />
            <Sparkles className="absolute left-1/3 top-12 h-5 w-5 text-white/10" />

            <div className="relative z-10 max-w-lg">
              <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                {slide.eyebrow}
              </span>
              <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">
                {slide.title}
              </h2>
              {slide.subtitle && (
                <p className="mt-2 text-sm text-white/70 sm:text-base">{slide.subtitle}</p>
              )}

              <a
                href={slide.ctaHref}
                className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-wavy-bg transition-transform hover:-translate-y-0.5 sm:text-sm"
              >
                {slide.ctaLabel}
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Panah kiri-kanan */}
      <button
        onClick={prev}
        aria-label="Sebelumnya"
        className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-wavy-bg shadow-md transition-colors hover:bg-white sm:left-5"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={next}
        aria-label="Berikutnya"
        className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-wavy-bg shadow-md transition-colors hover:bg-white sm:right-5"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dot indicator */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            onClick={() => goTo(i)}
            aria-label={`Ke slide ${i + 1}`}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}