"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "motion/react";
import { useReducedMotionSafe } from "@/hooks/use-reduced-motion-safe";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

const CROWD_SRC = "/images/banner/orang-konser.png"; // public/images/banner, 2172×724, latar transparan

const mix = (color: string, pct: number) => `color-mix(in oklab, ${color} ${pct}%, transparent)`;
const PINK = "var(--primary)";
const BLUE = "var(--info)";
const WHITE = "var(--background)";

// 1+2. Latar putih bersih + ambient glow tipis (pink kiri, biru kanan), tengah tetap terang.
const BASE: CSSProperties = {
  backgroundColor: WHITE,
  backgroundImage: [
    `radial-gradient(70% 60% at 50% 38%, ${WHITE} 0%, ${mix(WHITE, 0)} 75%)`,
    `radial-gradient(50% 65% at -5% 30%, ${mix(PINK, 16)} 0%, ${mix(PINK, 0)} 70%)`,
    `radial-gradient(50% 65% at 105% 30%, ${mix(BLUE, 15)} 0%, ${mix(BLUE, 0)} 70%)`,
    `linear-gradient(to bottom, ${WHITE} 30%, ${mix(PINK, 7)} 75%, ${mix(BLUE, 10)} 100%)`,
  ].join(","),
};

type Beam = {
  x: string; // posisi sumber dari kiri
  w: string; // lebar ujung cone
  color: string;
  from: string;
  to: string;
  dur: number;
  delay: number;
  op: number;
  primary?: boolean; // berkas utama tampil juga di mobile; sekunder hanya sm+
};

// Sumber lampu di kiri dan kanan atas. CSS rotate negatif = berlawanan jarum jam, jadi berkas
// kiri menyorot ke kanan-bawah dan saling menyilang dengan berkas kanan.
const BEAMS: Beam[] = [
  // sapuan pelan dan tidak jauh dari posisi tengahnya; kiri & kanan beda durasi supaya tidak seragam
  { x: "6%", w: "clamp(180px,26vw,420px)", color: PINK, from: "-42deg", to: "-27deg", dur: 16, delay: 0, op: 0.95, primary: true },
  { x: "14%", w: "clamp(120px,16vw,260px)", color: BLUE, from: "-23deg", to: "-33deg", dur: 21, delay: -7, op: 0.7 },
  { x: "2%", w: "clamp(90px,11vw,180px)", color: PINK, from: "-57deg", to: "-50deg", dur: 26, delay: -3, op: 0.55 },
  { x: "94%", w: "clamp(180px,26vw,420px)", color: BLUE, from: "40deg", to: "25deg", dur: 18, delay: -5, op: 0.95, primary: true },
  { x: "86%", w: "clamp(120px,16vw,260px)", color: PINK, from: "21deg", to: "31deg", dur: 23, delay: -11, op: 0.7 },
  { x: "98%", w: "clamp(90px,11vw,180px)", color: BLUE, from: "55deg", to: "48deg", dur: 29, delay: -14, op: 0.55 },
];

// Partikel cahaya halus di area lampu (posisi tetap supaya SSR = klien). Separuhnya hanya sm+.
const PARTICLES = [
  { l: "12%", t: "30%", s: 6, c: PINK, d: 14, dl: 0, dx: "18px" },
  { l: "22%", t: "52%", s: 4, c: BLUE, d: 18, dl: -5, dx: "-12px" },
  { l: "30%", t: "22%", s: 5, c: PINK, d: 16, dl: -9, dx: "10px" },
  { l: "70%", t: "26%", s: 5, c: BLUE, d: 17, dl: -3, dx: "-16px" },
  { l: "79%", t: "48%", s: 6, c: PINK, d: 15, dl: -11, dx: "14px" },
  { l: "88%", t: "34%", s: 4, c: BLUE, d: 19, dl: -7, dx: "-10px" },
  { l: "8%", t: "60%", s: 4, c: BLUE, d: 20, dl: -13, dx: "12px" },
  { l: "92%", t: "58%", s: 5, c: PINK, d: 21, dl: -2, dx: "-14px" },
];

const vars = (v: Record<string, string | number>) => v as CSSProperties;

const beamStyle = (b: Beam) =>
  ({
    left: b.x,
    width: b.w,
    opacity: b.op,
    "--beam": b.color,
    "--from": b.from,
    "--to": b.to,
    "--dur": `${b.dur}s`,
    "--delay": `${b.delay}s`,
    "--op": b.op,
  }) as CSSProperties;

// Bagian atas gambar kosong ±46%; mask memudarkan ujung tangan ke latar supaya tidak ada garis potong.
const CROWD_MASK = "linear-gradient(to bottom, transparent 40%, black 66%)";

/**
 * Hero di-pin: suasana konser terang. Lapisan: latar → ambient glow → sorot lampu bergerak →
 * haze tipis → crowd (orang-konser.png) → konten. Saat scroll, lampu meredup dan judul mundur.
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

  const glow = useTransform(scrollYProgress, [0, 0.7], [1, 0.4]);
  const crowdY = useTransform(scrollYProgress, [0, 0.7], ["0%", "6%"]);
  const titleScale = useTransform(scrollYProgress, [0, 0.7], [1, 0.9]);
  const titleY = useTransform(scrollYProgress, [0, 0.7], ["0%", "-12%"]);
  const fade = useTransform(scrollYProgress, [0.45, 0.8], [1, 0]);

  return (
    <section ref={ref} className={reduce ? "relative" : "relative h-[170svh]"} aria-labelledby="hero-title">
      <div
        className="sticky flex min-h-[600px] items-center justify-center overflow-hidden"
        style={{ ...BASE, top: navH, height: `calc(100svh - ${navH}px)` }}
      >
        {/* 3. sorot lampu + 4. haze */}
        <motion.div aria-hidden style={reduce ? undefined : { opacity: glow }} className="pointer-events-none absolute inset-0">
          {/* ambient glow pink & biru di sisi, intensitas naik-turun perlahan */}
          <div
            className="hero-breathe absolute -left-[10%] top-[10%] h-[70%] w-[45%]"
            style={{ ...vars({ "--dur": "11s", "--lo": 0.35, "--hi": 0.9 }), background: `radial-gradient(closest-side, ${mix(PINK, 16)}, transparent)` }}
          />
          <div
            className="hero-breathe absolute -right-[10%] top-[10%] h-[70%] w-[45%]"
            style={{ ...vars({ "--dur": "13s", "--delay": "-6s", "--lo": 0.35, "--hi": 0.9 }), background: `radial-gradient(closest-side, ${mix(BLUE, 15)}, transparent)` }}
          />
          {BEAMS.map((b, i) => (
            <span key={i} className={`hero-beam ${b.primary ? "" : "max-sm:hidden"}`} style={beamStyle(b)} />
          ))}
          {/* glow hanya di sumber cahaya */}
          {BEAMS.filter((b) => b.primary).map((b, i) => (
            <span
              key={i}
              className="hero-breathe absolute -top-12 size-28 -translate-x-1/2 rounded-full blur-xl sm:size-40"
              style={{ ...vars({ "--dur": `${b.dur / 2}s`, "--lo": 0.7, "--hi": 1 }), left: b.x, background: `radial-gradient(circle, ${WHITE} 0%, ${mix(b.color, 55)} 35%, transparent 70%)` }}
            />
          ))}
          {/* area tengah tetap bersih & terang di belakang headline (berkas memudar di sini) */}
          <div
            className="absolute left-1/2 top-[44%] h-[62%] w-[min(1000px,130vw)] -translate-x-1/2 -translate-y-1/2"
            style={{ background: `radial-gradient(closest-side, ${mix(WHITE, 88)} 0%, ${mix(WHITE, 70)} 45%, ${mix(WHITE, 0)} 100%)` }}
          />
          {/* partikel cahaya halus */}
          {PARTICLES.map((p, i) => (
            <span
              key={i}
              className={`hero-particle ${i % 2 ? "max-sm:hidden" : ""}`}
              style={{ ...vars({ "--p": p.c, "--dur": `${p.d}s`, "--delay": `${p.dl}s`, "--dx": p.dx }), left: p.l, top: p.t, width: p.s, height: p.s }}
            />
          ))}
          {/* haze tipis di atas kerumunan, tanpa blur */}
          <div
            className="absolute inset-x-0 bottom-0 h-[45%]"
            style={{ background: `linear-gradient(to top, ${mix(PINK, 14)} 0%, ${mix(BLUE, 8)} 45%, transparent 100%)` }}
          />
        </motion.div>

        {/* 5. crowd: panoramic; di layar sempit sisi kiri-kanan dipotong agar tetap detail */}
        <motion.div
          aria-hidden
          style={reduce ? undefined : { y: crowdY }}
          className="pointer-events-none absolute bottom-0 left-1/2 w-[max(100%,860px,120svh)] -translate-x-1/2"
        >
          <div className="relative" style={{ maskImage: CROWD_MASK, WebkitMaskImage: CROWD_MASK }}>
            {/* depth: cahaya panggung di belakang kerumunan, mengintip di sela tangan */}
            <div
              className="hero-breathe absolute inset-x-0 top-[44%] h-[34%] blur-2xl"
              style={{
                ...vars({ "--dur": "9s", "--lo": 0.45, "--hi": 0.9 }),
                background: `radial-gradient(40% 100% at 25% 60%, ${mix(PINK, 40)}, transparent), radial-gradient(40% 100% at 75% 60%, ${mix(BLUE, 40)}, transparent)`,
              }}
            />
            <Image
              src={CROWD_SRC}
              alt=""
              width={2172}
              height={724}
              priority
              sizes="(max-width: 860px) 860px, 100vw"
              className="block h-auto w-full"
            />
            {/* pantulan lampu hanya pada bentuk crowd: pink dari kiri, biru dari kanan.
                Intensitasnya naik-turun seirama durasi berkas utama kiri (16s) dan kanan (18s). */}
            {[
              { bg: `linear-gradient(90deg, ${mix(PINK, 50)} 0%, transparent 45%)`, dur: "8s", delay: "0s" },
              { bg: `linear-gradient(270deg, ${mix(BLUE, 50)} 0%, transparent 45%)`, dur: "9s", delay: "-5s" },
            ].map((r, i) => (
              <div
                key={i}
                className="hero-breathe absolute inset-0 mix-blend-screen"
                style={{
                  ...vars({ "--dur": r.dur, "--delay": r.delay, "--lo": 0.6, "--hi": 1 }),
                  background: r.bg,
                  maskImage: `url(${CROWD_SRC})`,
                  WebkitMaskImage: `url(${CROWD_SRC})`,
                  maskSize: "100% 100%",
                  WebkitMaskSize: "100% 100%",
                }}
              />
            ))}
          </div>
          {/* depth: dasar crowd lebih gelap navy */}
          <div
            className="absolute inset-x-0 bottom-0 h-1/4"
            style={{ background: `linear-gradient(to top, ${mix("var(--foreground)", 85)}, transparent)` }}
          />
        </motion.div>

        {/* 6. konten */}
        <motion.div
          style={reduce ? undefined : { scale: titleScale, y: titleY, opacity: fade }}
          className="relative z-10 flex max-w-3xl flex-col items-center px-5 pb-[clamp(110px,17vw,230px)] text-center"
        >
          <p className="rounded-full border border-primary/20 bg-background/80 px-3.5 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.3em] text-primary backdrop-blur-sm">
            {t("eyebrow")}
          </p>
          <h1
            id="hero-title"
            className="mt-5 font-display text-[2.5rem] font-extrabold leading-[1.05] tracking-tight text-foreground sm:text-6xl lg:text-[4.25rem]"
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
              className="rounded-full border border-foreground/15 bg-background/80 px-6 py-3 text-sm font-semibold text-foreground backdrop-blur-sm transition-colors hover:border-info/40 hover:bg-background hover:text-info"
            >
              {t("secondary")}
            </Link>
          </div>
        </motion.div>

        {/* indikator scroll di atas crowd */}
        <motion.div
          aria-hidden
          style={reduce ? undefined : { opacity: fade }}
          className="pointer-events-none absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 flex-col items-center gap-2 text-primary-foreground/85"
        >
          <span className="flex h-8 w-5 justify-center rounded-full border border-primary-foreground/60 pt-1.5">
            <span className="h-1.5 w-0.5 rounded-full bg-primary-foreground motion-safe:animate-bounce" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em]">{t("scroll")}</span>
        </motion.div>
      </div>
    </section>
  );
}
