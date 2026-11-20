"use client";

import { motion, useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

type Step = { title: string; body: string[] };

/**
 * Cara beli sebagai kartu tiket fisik (grid modular / bento 3×2, modul pertama besar).
 * Saat masuk viewport, potongan stub "tersobek" bergeser & miring dari badan tiket.
 */
function TicketCard({ step, index, big }: { step: Step; index: number; big: boolean }) {
  const reduce = useReducedMotion();
  const tear = reduce
    ? {}
    : {
        initial: { x: 0, rotate: 0 },
        whileInView: { x: 16, y: 6, rotate: 9 },
        viewport: { once: true, amount: 0.6 },
        transition: { duration: 0.5, delay: 0.15 + index * 0.08, ease: [0.22, 1, 0.36, 1] as const },
      };
  const enter = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, amount: 0.3 },
        transition: { duration: 0.4, delay: index * 0.06 },
      };

  return (
    <motion.li {...enter} className={cn("flex min-w-0", big && "sm:col-span-2 lg:row-span-2")}>
      <div className="flex min-w-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col justify-between gap-6 rounded-l-xl border-y border-l border-border bg-surface p-5 sm:p-6">
          <span className="font-mono text-xs font-semibold text-primary">{String(index + 1).padStart(2, "0")}</span>
          <div>
            <h3 className={cn("font-display font-bold tracking-tight text-foreground", big ? "text-2xl sm:text-3xl" : "text-lg")}>
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{step.body[0]}</p>
          </div>
        </div>
        {/* perforasi + stub */}
        <div aria-hidden className="w-0 border-l-2 border-dashed border-border" />
        <motion.div
          {...tear}
          aria-hidden
          className="flex w-12 shrink-0 origin-bottom-left items-center justify-center rounded-r-xl border-y border-r border-border bg-surface sm:w-14"
        >
          <span className="rotate-90 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
            Wavy · {String(index + 1).padStart(2, "0")}
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
    <section aria-labelledby="steps-title" className="bg-background px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-primary">{t("eyebrow")}</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-4">
          <h2 id="steps-title" className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">
            {t("title")}
          </h2>
          <Link href="/how-to-buy" className="text-sm font-semibold text-primary hover:underline">
            {t("more")}
          </Link>
        </div>
        <ol className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:grid-rows-2">
          {steps.map((s, i) => (
            <TicketCard key={s.title} step={s} index={i} big={i === 0} />
          ))}
        </ol>
      </div>
    </section>
  );
}
