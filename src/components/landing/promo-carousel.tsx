"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

interface PromoSlide {
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  ctaLabel: string;
  ctaHref: string;
  gradient: string;
  image?: string;
  pill?: string;
  pillCTA?: string;
}

const slideGradients = [
  "linear-gradient(135deg, #FF5470 0%, #211F2B 100%)",
  "linear-gradient(135deg, #211F2B 0%, #14131C 100%)",
  "linear-gradient(135deg, #FF5470 0%, #14131C 100%)",
  "linear-gradient(135deg, #14131C 0%, #C6395A 100%)",
  "linear-gradient(135deg, #211F2B 0%, #FF5470 100%)",
  "linear-gradient(135deg, #FF5470 0%, #211F2B 60%, #14131C 100%)",
];

const AUTO_PLAY_MS = 5000;

function ArrowLeftIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" className={className}>
      <path d="M0 0h1024v1024H0z" fill="none" />
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
      <path d="M0 0h1024v1024H0z" fill="none" />
      <path
        fill="currentColor"
        d="M685.2 104.7a64 64 0 0 1 0 90.5L368.4 512l316.8 316.8a64 64 0 0 1-90.4 90.5l-362.1-362a64 64 0 0 1 0-90.5l362-362.1a64 64 0 0 1 90.5 0"
      />
    </svg>
  );
}

export default function PromoCarousel() {
  const t = useTranslations("PromoCarousel");
  const slides: PromoSlide[] = useMemo(
    () => [
      {
        id: "ticket-onsale",
        eyebrow: t("banner1.eyebrow"),
        title: t("banner1.title"),
        subtitle: t("banner1.subtitle"),
        ctaLabel: t("banner1.ctaLabel"),
        ctaHref: "/concerts",
        gradient: slideGradients[0],
        image: "/images/banner/ticket-on-sale-now.png",
        pill: t("banner1.pill"),
        pillCTA: t("banner1.pillCTA"),
      },
      {
        id: "bts-banner",
        eyebrow: t("banner2.eyebrow"),
        title: t("banner2.title"),
        subtitle: t("banner2.subtitle"),
        ctaLabel: t("banner2.ctaLabel"),
        ctaHref: "/concerts",
        gradient: slideGradients[0],
        image: "/images/banner/your-favorite-bts.png",
        pill: t("banner2.pill"),
        pillCTA: t("banner2.pillCTA"),
      },
      {
        id: "tampilkan-eventmu",
        eyebrow: t("banner3.eyebrow"),
        title: t("banner3.title"),
        subtitle: t("banner3.subtitle"),
        ctaLabel: t("banner3.ctaLabel"),
        ctaHref: "/concerts",
        gradient: slideGradients[0],
        image: "/images/banner/tampilkan-eventmu.png",
        pill: t("banner3.pill"),
        pillCTA: t("banner3.pillCTA"),
      },
      {
        id: "promo-1",
        eyebrow: t("slide1.eyebrow"),
        title: t("slide1.title"),
        subtitle: t("slide1.subtitle"),
        ctaLabel: t("slide1.ctaLabel"),
        ctaHref: "#",
        gradient: slideGradients[0],
      },
      {
        id: "promo-2",
        eyebrow: t("slide2.eyebrow"),
        title: t("slide2.title"),
        subtitle: t("slide2.subtitle"),
        ctaLabel: t("slide2.ctaLabel"),
        ctaHref: "#",
        gradient: slideGradients[1],
      },
      {
        id: "promo-3",
        eyebrow: t("slide3.eyebrow"),
        title: t("slide3.title"),
        subtitle: t("slide3.subtitle"),
        ctaLabel: t("slide3.ctaLabel"),
        ctaHref: "#",
        gradient: slideGradients[2],
      },
      {
        id: "promo-4",
        eyebrow: t("slide4.eyebrow"),
        title: t("slide4.title"),
        subtitle: t("slide4.subtitle"),
        ctaLabel: t("slide4.ctaLabel"),
        ctaHref: "#",
        gradient: slideGradients[3],
      },
      {
        id: "promo-5",
        eyebrow: t("slide5.eyebrow"),
        title: t("slide5.title"),
        subtitle: t("slide5.subtitle"),
        ctaLabel: t("slide5.ctaLabel"),
        ctaHref: "#",
        gradient: slideGradients[4],
      },
      {
        id: "promo-6",
        eyebrow: t("slide6.eyebrow"),
        title: t("slide6.title"),
        subtitle: t("slide6.subtitle"),
        ctaLabel: t("slide6.ctaLabel"),
        ctaHref: "#",
        gradient: slideGradients[5],
      },
    ],
    [t]
  );

  const [index, setIndex] = useState(0);

  const goTo = useCallback((i: number) => {
    setIndex((i + slides.length) % slides.length);
  }, [slides.length]);

  const next = useCallback(() => goTo(index + 1), [index, goTo]);
  const prev = useCallback(() => goTo(index - 1), [index, goTo]);

  useEffect(() => {
    const timer = setInterval(next, AUTO_PLAY_MS);
    return () => clearInterval(timer);
  }, [next]);

  return (
    <div data-aos="fade-in" data-aos-duration="900" className="relative w-full overflow-hidden">
      <div
        className="flex transition-transform duration-500 ease-[cubic-bezier(.65,0,.35,1)]"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className="relative flex h-55 w-full shrink-0 items-center justify-center overflow-hidden sm:h-70 md:h-85"
            style={{ background: slide.gradient }}
          >
            <Sparkles className="absolute right-16 top-8 h-6 w-6 text-white/20" />
            <Sparkles className="absolute bottom-10 right-40 h-4 w-4 text-white/15" />
            <Sparkles className="absolute left-1/3 top-12 h-5 w-5 text-white/10" />

            {slide.image ? (
              <>
                <img src={slide.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
                <a
                  href={slide.ctaHref}
                  className="absolute bottom-3 left-1/2 z-10 flex w-[70%] max-w-xl -translate-x-1/2 items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/85 px-4 py-2.5 text-center shadow-lg backdrop-blur-md sm:bottom-6 sm:px-6 sm:py-3"
                >
                  <p className="text-xs font-medium leading-snug text-[#374151] sm:text-sm">
                    {slide.pill ?? t("fallbackPill", { title: slide.title || slide.eyebrow })}
                    <span className="font-semibold text-[#1E40AF]"> {slide.pillCTA ?? t("fallbackPillCTA")}</span>
                  </p>
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-[#1E40AF]">
                    <path d="M0 0h24v24H0z" fill="none" />
                    <path fill="currentColor" d="M12.449 2.654a2.25 2.25 0 0 1 3.181 0l1.255 1.255c.449.449.336 1.105-.016 1.456A1.25 1.25 0 0 0 17.75 7.5c.344 0 .654-.141.882-.37l.07-.064c.338-.282.886-.364 1.3-.031l.087.078l1.248 1.248l.155.17a2.25 2.25 0 0 1-.155 3.011l-9.793 9.793a2.25 2.25 0 0 1-3.181 0l-1.25-1.249c-.448-.448-.336-1.104.017-1.455l.082-.09a1.23 1.23 0 0 0 .287-.792a1.25 1.25 0 0 0-2.134-.882c-.35.352-1.007.464-1.456.015l-1.254-1.255a2.25 2.25 0 0 1 0-3.181zm2.12 1.06a.75.75 0 0 0-1.06 0L11.142 6.08l.828.829a.75.75 0 0 1-1.06 1.06l-.829-.828l-6.365 6.366a.75.75 0 0 0 0 1.06l.942.943A2.75 2.75 0 0 1 9 17.75c0 .595-.193 1.142-.512 1.59l.936.936a.75.75 0 0 0 1.06 0l6.366-6.366l-.82-.82a.75.75 0 1 1 1.061-1.06l.82.819l2.367-2.366a.75.75 0 0 0 0-1.06l-.937-.937c-.448.32-.995.514-1.59.514A2.75 2.75 0 0 1 15 6.25c0-.594.19-1.144.511-1.593zM13.032 9.03a.75.75 0 0 1 1.06 0l.88.879a.75.75 0 0 1-1.061 1.06l-.88-.879a.75.75 0 0 1 0-1.06" />
                  </svg>
                </a>
              </>
            ) : (
              <div className="relative z-10 max-w-lg px-8 sm:px-16">
                <span className="inline-block rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">{slide.eyebrow}</span>
                <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-white sm:text-3xl md:text-4xl">{slide.title}</h2>
                {slide.subtitle && <p className="mt-2 text-sm text-white/70 sm:text-base">{slide.subtitle}</p>}
                <a
                  href={slide.ctaHref}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-semibold text-wavy-text-primary transition-transform hover:-translate-y-0.5 sm:text-sm"
                >
                  {slide.ctaLabel}
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Panah kiri-kanan */}
      <button
        onClick={prev}
        aria-label={t("prev")}
        className="absolute left-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-wavy-text-primary shadow-md transition-colors hover:brightness-95 sm:left-5"
      >
        <ArrowLeftIcon className="h-4 w-4" />
      </button>
      <button
        onClick={next}
        aria-label={t("next")}
        className="absolute right-3 top-1/2 z-20 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-white text-wavy-text-primary shadow-md transition-colors hover:brightness-95 sm:right-5"
      >
        <ArrowRightIcon className="h-4 w-4" />
      </button>

      {/* Dot indicator */}
      <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 gap-1.5">
        {slides.map((slide, i) => (
          <button
            key={slide.id}
            onClick={() => goTo(i)}
            aria-label={t("goToSlide", { num: i + 1 })}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/60"
            }`}
          />
        ))}
      </div>
    </div>
  );
}