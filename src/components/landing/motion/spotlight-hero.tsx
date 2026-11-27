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
// Turunan token: campuran oklch pink→biru lewat jalur hue magenta/violet (bukan abu-abu).
const MAGENTA = `color-mix(in oklch, ${PINK} 68%, ${BLUE})`;
const VIOLET = `color-mix(in oklch, ${PINK} 38%, ${BLUE})`;

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
  w: string; // lebar kotak berkas (cone-nya sendiri ditentukan `spread`)
  color: string;
  spread: number; // setengah sudut bukaan cone (deg)
  a: number; // tiga titik sapuan (deg): a → b → c → a
  b: number;
  c: number;
  dur: number; // durasi satu siklus sapuan (s)
  delay: number;
  pulse: number; // durasi siklus intensitas (s), sengaja tidak kelipatan `dur`
  op: number;
  tier: "main" | "side" | "back"; // main tampil di mobile; side & back hanya sm+
};

// Sumber lampu di kiri, kanan, dan dua lampu belakang yang tipis. CSS rotate negatif = berlawanan
// jarum jam, jadi berkas kiri menyorot ke kanan-bawah dan menyilang dengan berkas kanan.
// Durasi, delay, dan arah tiap berkas berbeda supaya tidak pernah bergerak serempak.
const W = { main: "clamp(320px,46vw,760px)", side: "clamp(220px,32vw,520px)", back: "clamp(140px,20vw,320px)" };
const BEAMS: Beam[] = [
  { x: "5%", w: W.main, color: PINK, spread: 10, a: -38, b: -23, c: -32, dur: 9, delay: 0, pulse: 4.2, op: 0.9, tier: "main" },
  { x: "12%", w: W.side, color: VIOLET, spread: 6, a: -19, b: -34, c: -25, dur: 7.4, delay: -3, pulse: 3.4, op: 0.7, tier: "side" },
  { x: "1%", w: W.side, color: MAGENTA, spread: 5, a: -56, b: -46, c: -59, dur: 10.6, delay: -6, pulse: 5.1, op: 0.55, tier: "side" },
  { x: "95%", w: W.main, color: BLUE, spread: 10, a: 36, b: 22, c: 31, dur: 9.8, delay: -2.5, pulse: 4.7, op: 0.9, tier: "main" },
  { x: "88%", w: W.side, color: MAGENTA, spread: 6, a: 18, b: 33, c: 24, dur: 8.1, delay: -5, pulse: 3.7, op: 0.7, tier: "side" },
  { x: "99%", w: W.side, color: VIOLET, spread: 5, a: 53, b: 44, c: 58, dur: 11.2, delay: -8, pulse: 5.5, op: 0.55, tier: "side" },
  // lampu belakang: tipis, redup, saling menyilang di atas — memberi kedalaman tanpa menutupi judul
  { x: "34%", w: W.back, color: VIOLET, spread: 3.5, a: -14, b: 9, c: -5, dur: 6.6, delay: -1.5, pulse: 3.1, op: 0.32, tier: "back" },
  { x: "66%", w: W.back, color: PINK, spread: 3.5, a: 13, b: -9, c: 4, dur: 7.2, delay: -4.2, pulse: 2.9, op: 0.32, tier: "back" },
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
    "--spread": `${b.spread}deg`,
    "--a": `${b.a}deg`,
    "--b": `${b.b}deg`,
    "--c": `${b.c}deg`,
    "--dur": `${b.dur}s`,
    "--delay": `${b.delay}s`,
    "--pulse": `${b.pulse}s`,
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
            style={{ ...vars({ "--dur": "6s", "--lo": 0.4, "--hi": 0.9 }), background: `radial-gradient(closest-side, ${mix(PINK, 16)}, ${mix(MAGENTA, 6)} 60%, transparent)` }}
          />
          <div
            className="hero-breathe absolute -right-[10%] top-[10%] h-[70%] w-[45%]"
            style={{ ...vars({ "--dur": "7s", "--delay": "-3s", "--lo": 0.4, "--hi": 0.9 }), background: `radial-gradient(closest-side, ${mix(BLUE, 15)}, ${mix(VIOLET, 6)} 60%, transparent)` }}
          />
          {/* rona violet tipis di atas tengah, menyatukan sisi pink & biru */}
          <div
            className="hero-breathe absolute left-1/2 -top-[20%] h-[55%] w-[70%] -translate-x-1/2"
            style={{ ...vars({ "--dur": "5s", "--delay": "-2s", "--lo": 0.3, "--hi": 0.7 }), background: `radial-gradient(closest-side, ${mix(VIOLET, 12)}, transparent)` }}
          />
          {BEAMS.map((b, i) => (
            <span key={i} className={`hero-beam ${b.tier === "main" ? "" : "max-sm:hidden"}`} style={beamStyle(b)} />
          ))}
          {/* glow di sumber cahaya, berdenyut seirama intensitas berkasnya */}
          {BEAMS.filter((b) => b.tier !== "back").map((b, i) => (
            <span
              key={i}
              className={`hero-breathe absolute -top-12 -translate-x-1/2 rounded-full ${b.tier === "main" ? "size-28 sm:size-40" : "size-20 max-sm:hidden"}`}
              style={{
                ...vars({ "--dur": `${b.pulse / 2}s`, "--delay": `${b.delay}s`, "--lo": 0.65, "--hi": 1 }),
                left: b.x,
                background: `radial-gradient(circle, ${WHITE} 0%, ${mix(b.color, 60)} 28%, ${mix(b.color, 18)} 50%, transparent 70%)`,
              }}
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
            style={{ background: `linear-gradient(to top, ${mix(PINK, 14)} 0%, ${mix(VIOLET, 10)} 30%, ${mix(BLUE, 7)} 55%, transparent 100%)` }}
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
                ...vars({ "--dur": "4.5s", "--lo": 0.5, "--hi": 0.95 }),
                background: `radial-gradient(40% 100% at 25% 60%, ${mix(PINK, 40)}, transparent), radial-gradient(30% 90% at 50% 70%, ${mix(VIOLET, 30)}, transparent), radial-gradient(40% 100% at 75% 60%, ${mix(BLUE, 40)}, transparent)`,
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
                Intensitasnya naik-turun seirama denyut berkas utama kiri (4.2s) dan kanan (4.7s). */}
            {[
              { bg: `linear-gradient(90deg, ${mix(PINK, 50)} 0%, ${mix(MAGENTA, 15)} 30%, transparent 48%)`, dur: "4.2s", delay: "0s" },
              { bg: `linear-gradient(270deg, ${mix(BLUE, 50)} 0%, ${mix(VIOLET, 15)} 30%, transparent 48%)`, dur: "4.7s", delay: "-2.5s" },
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
