"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useTranslations } from "next-intl";
import { ArrowDown } from "lucide-react";
import { Link } from "@/i18n/navigation";

/**
 * Hero di-pin (grid axial, DESIGN §4): satu sumbu vertikal di tengah = sorot lampu.
 * Saat scroll, kerucut cahaya menyempit dan judul mundur; reduced-motion = statis.
 */
export function SpotlightHero() {
  const t = useTranslations("Landing.hero");
  const ref = useRef<HTMLElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });

  const beam = useTransform(scrollYProgress, [0, 0.7], [1, 0.28]);
  const glow = useTransform(scrollYProgress, [0, 0.7], [0.55, 0.9]);
  const titleScale = useTransform(scrollYProgress, [0, 0.7], [1, 0.86]);
  const titleY = useTransform(scrollYProgress, [0, 0.7], ["0%", "-12%"]);
  const fade = useTransform(scrollYProgress, [0.45, 0.8], [1, 0]);

  return (
    <section ref={ref} className={reduce ? "relative" : "relative h-[170svh]"} aria-labelledby="hero-title">
      <div className="sticky top-0 flex h-svh min-h-[560px] items-center justify-center overflow-hidden bg-stage">
        {/* kerucut sorot lampu dari atas */}
        <motion.div
          aria-hidden
          style={reduce ? undefined : { scaleX: beam, opacity: glow }}
          className="pointer-events-none absolute inset-x-0 top-0 mx-auto h-full w-[min(1100px,140vw)] origin-top bg-[radial-gradient(ellipse_at_top,var(--primary-glow)_0%,transparent_65%)] opacity-60 [clip-path:polygon(44%_0,56%_0,100%_100%,0_100%)]"
        />
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-stage to-transparent" />
        {/* sumbu */}
        <div aria-hidden className="absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-primary-foreground/10" />

        <motion.div
          style={reduce ? undefined : { scale: titleScale, y: titleY, opacity: fade }}
          className="relative z-10 flex max-w-3xl flex-col items-center px-4 text-center"
        >
          <p className="font-mono text-[11px] font-medium uppercase tracking-[0.3em] text-primary">{t("eyebrow")}</p>
          <h1
            id="hero-title"
            className="mt-4 font-display text-5xl font-bold leading-[1.05] tracking-tight text-primary-foreground sm:text-7xl"
          >
            {t("title")}
          </h1>
          <p className="mt-6 max-w-xl text-base leading-7 text-primary-foreground/70 sm:text-lg">{t("subtitle")}</p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/concerts"
              className="rounded-lg bg-primary px-6 py-3 text-sm font-bold text-primary-foreground transition hover:brightness-110"
            >
              {t("cta")}
            </Link>
            <Link
              href="/how-to-buy"
              className="rounded-lg border border-primary-foreground/25 px-6 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary-foreground/10"
            >
              {t("secondary")}
            </Link>
          </div>
          <p className="mt-12 flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-primary-foreground/50">
            <ArrowDown className="h-3.5 w-3.5" />
            {t("scroll")}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
