"use client";

import { motion } from "motion/react";
import { useReducedMotionSafe } from "@/hooks/use-reduced-motion-safe";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Step = { title: string; body: string[] };

/**
 * Cara beli sebagai kolase tiket asimetris (12 kolom di desktop):
 * 01 besar di kiri (2 baris), 02 & 03 bertumpuk di kanan, 04 & 05 berdampingan di bawah.
 * Tiap kartu punya satu stub terintegrasi; saat masuk viewport stub tersobek tipis dari badan tiket.
 */
const LAYOUT = [
  "sm:col-span-2 lg:col-span-7 lg:row-span-2",
  "lg:col-span-5",
  "lg:col-span-5",
  "lg:col-span-6",
  "lg:col-span-6",
] as const;

function TicketCard({ step, index }: { step: Step; index: number }) {
  const reduce = useReducedMotionSafe();
  const big = index === 0;
  // Pink dan biru bergantian sebagai aksen nomor & garis kecil.
  const pink = index % 2 === 0;
  const num = String(index + 1).padStart(2, "0");

  // Props animasi selalu sama di server & client (hydration aman); reduced-motion hanya
  // membuat transisi instan, jadi kartu langsung di posisi akhir tanpa gerak.
  const tear = {
    initial: { x: 0, y: 0, rotate: 0 },
    whileInView: { x: 3, y: 1, rotate: 2 },
    viewport: { once: true, amount: 0.6 },
    transition: reduce ? { duration: 0 } : { duration: 0.5, delay: 0.15 + index * 0.08, ease: [0.22, 1, 0.36, 1] as const },
  };
  const enter = {
    initial: { opacity: 0, y: 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.3 },
    transition: reduce ? { duration: 0 } : { duration: 0.4, delay: index * 0.06 },
  };

  const edge = "border-border";

  return (
    <motion.li {...enter} className={cn("flex min-w-0", LAYOUT[index])}>
      <div className="group flex min-w-0 flex-1 transition-transform duration-200 hover:-translate-y-0.5">
        {/* badan tiket */}
        <div
          className={cn(
            "flex min-w-0 flex-1 flex-col justify-between gap-4 rounded-l-2xl border-y border-l bg-surface shadow-xs shadow-foreground/5 transition-colors duration-200",
            edge,
            "group-hover:border-foreground/15",
            big ? "p-5 sm:p-6" : "p-4 sm:p-5",
          )}
        >
          <div className="flex items-center gap-2.5">
            <span
              className={cn(
                "inline-flex h-6 min-w-8 items-center justify-center rounded-full px-2 font-mono text-[11px] font-semibold",
                pink ? "bg-primary/10 text-primary" : "bg-info-subtle text-info",
              )}
            >
              {num}
            </span>
            <span aria-hidden className={cn("h-px w-6 rounded-full", pink ? "bg-primary/40" : "bg-info/40")} />
          </div>
          <div>
            <h3
              className={cn(
                "font-display font-bold tracking-tight text-foreground",
                big ? "text-xl sm:text-2xl" : "text-base sm:text-[17px]",
              )}
            >
              {step.title}
            </h3>
            <p
              className={cn(
                "mt-1.5 text-muted-foreground",
                big ? "max-w-md text-sm leading-6" : "text-[13px] leading-5",
              )}
            >
              {step.body[0]}
            </p>
          </div>
        </div>

        {/* perforasi + notch sobekan atas/bawah */}
        <div aria-hidden className="relative w-0">
          <span className={cn("absolute -top-px left-1/2 z-10 h-[7px] w-3.5 -translate-x-1/2 rounded-b-full border border-t-0 bg-background", edge)} />
          <span className="absolute inset-y-3 left-1/2 -translate-x-1/2 border-l border-dashed border-foreground/15" />
          <span className={cn("absolute -bottom-px left-1/2 z-10 h-[7px] w-3.5 -translate-x-1/2 rounded-t-full border border-b-0 bg-background", edge)} />
        </div>

        {/* stub */}
        <motion.div
          {...tear}
          aria-hidden
          className={cn(
            "flex w-10 shrink-0 origin-bottom-left items-center justify-center rounded-r-2xl border-y border-r bg-surface shadow-xs shadow-foreground/5 sm:w-11",
            edge,
          )}
        >
          <span className="rotate-90 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.28em] text-muted-foreground/80">
            Wavy · {num}
          </span>
        </motion.div>
      </div>
    </motion.li>
  );
}

export function TornTicketSteps() {
  const t = useTranslations("Landing.steps");
  const steps = (useTranslations("InfoPages.howToBuy").raw("sections") as Step[]).slice(0, 5);

  return (
    <section aria-labelledby="steps-title" className="bg-background px-4 py-12 sm:px-6 sm:py-14 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-primary">{t("eyebrow")}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h2 id="steps-title" className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t("title")}
          </h2>
          <Link href="/how-to-buy" className="text-sm font-semibold text-primary hover:underline">
            {t("more")}
          </Link>
        </div>
        <ol className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-12">
          {steps.map((s, i) => (
            <TicketCard key={s.title} step={s} index={i} />
          ))}
        </ol>
      </div>
    </section>
  );
}
