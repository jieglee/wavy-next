"use client";

import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "motion/react";
import { useFormatter, useTranslations } from "next-intl";
import { ErrorState } from "@/components/states/async-states";
import type { Concert } from "@/types/type";
import { useLandingConcerts } from "./landing-data";

function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const format = useFormatter();
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, { duration: 1.4, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setShown(Math.round(v)) });
    return () => controls.stop();
  }, [inView, reduce, value]);

  return <span ref={ref}>{format.number(reduce ? value : shown)}</span>;
}

const stats = (list: Concert[]) => [
  { key: "concerts", value: list.length },
  { key: "venues", value: new Set(list.map((c) => c.venue).filter(Boolean)).size },
  { key: "remaining", value: list.reduce((n, c) => n + (Number(c.remaining) || 0), 0) },
] as const;

/** Angka dari GET /concerts (konser tayang, venue, tiket tersisa) yang menghitung naik saat terlihat. */
export function CountUpStats() {
  const t = useTranslations("Landing.stats");
  const concerts = useLandingConcerts();

  if (concerts.error !== undefined) {
    return (
      <section className="bg-stage px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <ErrorState error={concerts.error} onRetry={concerts.reload} />
        </div>
      </section>
    );
  }

  const list = concerts.data;
  return (
    <section aria-label={t("label")} className="bg-stage px-4 py-14 sm:px-6 lg:px-8">
      <dl className="mx-auto grid max-w-7xl grid-cols-1 gap-8 sm:grid-cols-3">
        {(list ? stats(list) : (["concerts", "venues", "remaining"] as const).map((key) => ({ key, value: null }))).map((s) => (
          <div key={s.key} className="border-t border-primary-foreground/15 pt-4">
            <dt className="font-mono text-[11px] uppercase tracking-widest text-primary-foreground/60">{t(s.key)}</dt>
            <dd className="mt-2 font-display text-5xl font-bold tracking-tight text-primary-foreground sm:text-6xl">
              {s.value === null ? <span className="text-primary-foreground/30">—</span> : <CountUp value={s.value} />}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
