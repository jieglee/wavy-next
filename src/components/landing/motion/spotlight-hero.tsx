"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { useReducedMotionSafe } from "@/hooks/use-reduced-motion-safe";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { HeroCrowd } from "./hero-crowd";

const mix = (color: string, pct: number) => `color-mix(in oklab, ${color} ${pct}%, transparent)`;
const PINK = "var(--primary)";
const BLUE = "var(--info)";
const WHITE = "var(--background)";

// Latar: putih bersih di tengah, semburat pink di kiri dan biru di kanan.
const BASE: CSSProperties = {
  backgroundColor: WHITE,
  backgroundImage: [
    `radial-gradient(60% 55% at 50% 42%, ${WHITE} 0%, ${mix(WHITE, 0)} 70%)`,
    `radial-gradient(55% 70% at 0% 15%, ${mix(PINK, 22)} 0%, ${mix(PINK, 0)} 70%)`,
    `radial-gradient(55% 70% at 100% 15%, ${mix(BLUE, 20)} 0%, ${mix(BLUE, 0)} 70%)`,
    `linear-gradient(to bottom, ${WHITE} 0%, ${mix(PINK, 8)} 70%, ${mix(BLUE, 12)} 100%)`,
  ].join(","),
};

// Berkas sorot panggung: kerucut conic dari sudut atas, dipudarkan dengan mask radial.
function beams(side: "left" | "right"): CSSProperties {
  const at = side === "left" ? "0% 0%" : "100% 0%";
  // sudut conic: 0deg = ke atas, searah jarum jam. Kiri menyorot ke kanan-bawah, kanan sebaliknya.
  const rays =
    side === "left"
      ? [[112, 8, PINK, 34], [128, 4, WHITE, 90], [140, 7, BLUE, 26], [156, 5, PINK, 22]]
      : [[204, 5, BLUE, 22], [220, 7, PINK, 26], [232, 4, WHITE, 90], [248, 8, BLUE, 34]];
  const stops = rays
    .map(([deg, w, c, a]) => {
      const d = deg as number;
      const half = (w as number) / 2;
      return `${mix(c as string, 0)} ${d - half - 3}deg, ${mix(c as string, a as number)} ${d - half}deg, ${mix(c as string, a as number)} ${d + half}deg, ${mix(c as string, 0)} ${d + half + 3}deg`;
    })
    .join(",");
  const fade = `radial-gradient(120% 115% at ${at}, black 0%, ${mix("black", 55)} 45%, transparent 85%)`;
  return {
    backgroundImage: `conic-gradient(from 0deg at ${at}, transparent 0deg, ${stops}, transparent 360deg)`,
    maskImage: fade,
    WebkitMaskImage: fade,
    transformOrigin: at,
  };
}

/**
 * Hero di-pin: suasana konser terang (lampu panggung pink-putih-biru dari kiri dan kanan,
 * haze, dan siluet penonton di bawah). Urutan lapisan: latar → lampu/haze → crowd → konten.
 * Saat scroll, lampu meredup dan judul mundur; reduced-motion = statis.
 */
export function SpotlightHero() {
  const t = useTranslations("Landing.hero");
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotionSafe();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  // Navbar sticky di atas hero: tinggi hero = sisa layar di bawahnya, supaya crowd dan
  // indikator scroll terlihat di layar pertama (navbar mobile lebih tinggi karena 2 baris).
  const [navH, setNavH] = useState(72);
  useEffect(() => {
    const header = document.querySelector("header");
    if (!header) return;
    const ro = new ResizeObserver(() => setNavH(header.getBoundingClientRect().height));
    ro.observe(header);
    return () => ro.disconnect();
  }, []);

  const glow = useTransform(scrollYProgress, [0, 0.7], [1, 0.45]);
  const crowdY = useTransform(scrollYProgress, [0, 0.7], ["0%", "8%"]);
  const titleScale = useTransform(scrollYProgress, [0, 0.7], [1, 0.9]);
  const titleY = useTransform(scrollYProgress, [0, 0.7], ["0%", "-12%"]);
  const fade = useTransform(scrollYProgress, [0.45, 0.8], [1, 0]);

  const sway = (dir: 1 | -1) =>
    reduce ? {} : { animate: { rotate: [0, 4 * dir, 0] }, transition: { duration: 9, repeat: Infinity, ease: "easeInOut" as const } };

  return (
    <section ref={ref} className={reduce ? "relative" : "relative h-[170svh]"} aria-labelledby="hero-title">
      <div
        className="sticky flex min-h-[560px] items-center justify-center overflow-hidden"
        style={{ ...BASE, top: navH, height: `calc(100svh - ${navH}px)` }}
      >
        {/* 1. lampu panggung + haze */}
        <motion.div aria-hidden style={reduce ? undefined : { opacity: glow }} className="pointer-events-none absolute inset-0">
          <motion.div {...sway(1)} style={beams("left")} className="absolute inset-0 blur-[6px] sm:blur-[9px]" />
          <motion.div {...sway(-1)} style={beams("right")} className="absolute inset-0 blur-[6px] sm:blur-[9px]" />
          {/* sumber lampu di sudut */}
          <div className="absolute -left-16 -top-16 size-48 rounded-full blur-2xl sm:size-64" style={{ background: `radial-gradient(circle, ${WHITE} 0%, ${mix(PINK, 45)} 40%, transparent 70%)` }} />
          <div className="absolute -right-16 -top-16 size-48 rounded-full blur-2xl sm:size-64" style={{ background: `radial-gradient(circle, ${WHITE} 0%, ${mix(BLUE, 40)} 40%, transparent 70%)` }} />
          {/* haze di atas kerumunan */}
          <div className="absolute inset-x-[-10%] bottom-[12%] h-[38%] blur-3xl" style={{ background: `radial-gradient(45% 60% at 22% 70%, ${mix(PINK, 30)}, transparent 70%), radial-gradient(45% 60% at 78% 70%, ${mix(BLUE, 28)}, transparent 70%), radial-gradient(40% 50% at 50% 80%, ${mix("var(--primary-glow)", 14)}, transparent 70%)` }} />
          {/* area tengah tetap terang untuk headline */}
          <div className="absolute left-1/2 top-[42%] h-[55%] w-[min(900px,110vw)] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl" style={{ background: `radial-gradient(closest-side, ${mix(WHITE, 92)}, ${mix(WHITE, 0)})` }} />
        </motion.div>

        {/* 2. kerumunan */}
        <motion.div style={reduce ? undefined : { y: crowdY }} className="pointer-events-none absolute inset-x-0 bottom-0 h-[max(165px,min(22.3vw,34svh))]">
          <HeroCrowd className="h-full" />
        </motion.div>

        {/* 3. konten */}
        <motion.div
          style={reduce ? undefined : { scale: titleScale, y: titleY, opacity: fade }}
          className="relative z-10 flex max-w-3xl flex-col items-center px-5 pb-[clamp(96px,20svh,200px)] text-center"
        >
          <p className="rounded-full border border-primary/20 bg-background/70 px-3.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-primary backdrop-blur-sm">
            {t("eyebrow")}
          </p>
          <h1
            id="hero-title"
            className="mt-5 font-display text-[2.6rem] font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-7xl"
          >
            {t.rich("title", { accent: (chunks) => <span className="text-primary">{chunks}</span> })}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-foreground/70 sm:text-lg">{t("subtitle")}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/concerts"
              className="rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-[0_12px_28px_-12px_color-mix(in_oklab,var(--primary)_80%,transparent)] transition-[filter,translate] hover:brightness-110 motion-safe:hover:-translate-y-0.5"
            >
              {t("cta")}
            </Link>
            <Link
              href="/how-to-buy"
              className="rounded-full border border-foreground/15 bg-background/70 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur-sm transition-colors hover:border-info/40 hover:bg-background hover:text-info"
            >
              {t("secondary")}
            </Link>
          </div>
        </motion.div>

        {/* 4. indikator scroll di atas kerumunan */}
        <motion.div
          aria-hidden
          style={reduce ? undefined : { opacity: fade }}
          className="pointer-events-none absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-primary-foreground/80"
        >
          <span className="flex h-8 w-5 justify-center rounded-full border border-primary-foreground/50 pt-1.5">
            <span className="h-1.5 w-0.5 rounded-full bg-primary-foreground motion-safe:animate-bounce" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em]">{t("scroll")}</span>
        </motion.div>
      </div>
    </section>
  );
}
