"use client";

import { useTranslations } from "next-intl";
import { AreaChart, Area } from "@/components/charts/area-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { Bar } from "@/components/charts/bar";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { Grid } from "@/components/charts/grid";
import { XAxis } from "@/components/charts/x-axis";
import { ChartTooltip } from "@/components/charts/tooltip";
import { RingChart } from "@/components/charts/ring-chart";
import { Ring } from "@/components/charts/ring";
import { RingCenter } from "@/components/charts/ring-center";

// Data contoh statis khusus halaman uji. Bukan fallback API.
const SALES = Array.from({ length: 14 }, (_, i) => ({
  date: new Date(2026, 10, 1 + i),
  sold: [12, 18, 15, 22, 30, 26, 41, 38, 35, 52, 48, 61, 57, 70][i],
}));

const REVENUE = [
  { category: "VIP", revenue: 42.8 },
  { category: "Gold", revenue: 31.2 },
  { category: "Reguler", revenue: 24.5 },
  { category: "Festival", revenue: 18.9 },
];

const QUOTA = [
  { label: "VIP", value: 80, maxValue: 100, color: "var(--chart-1)" },
  { label: "Gold", value: 140, maxValue: 200, color: "var(--chart-2)" },
  { label: "Reguler", value: 210, maxValue: 400, color: "var(--chart-3)" },
];

function Panel({ title, caption, children }: { title: string; caption: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4 sm:p-6">
      <h2 className="text-base font-semibold text-foreground">{title}</h2>
      <p className="mt-1 font-mono text-xs uppercase tracking-wider text-muted-foreground">{caption}</p>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function DevChartsDemo() {
  const t = useTranslations("DevCharts");

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        <div className="md:col-span-8">
          <Panel title={t("salesTitle")} caption={t("salesCaption")}>
            <AreaChart data={SALES} aspectRatio="2 / 1">
              <Grid horizontal />
              <Area dataKey="sold" fill="var(--chart-line-primary)" />
              <XAxis />
              <ChartTooltip />
            </AreaChart>
          </Panel>
        </div>

        <div className="md:col-span-4">
          <Panel title={t("quotaTitle")} caption={t("quotaCaption")}>
            <div className="flex justify-center">
              <RingChart data={QUOTA} size={240}>
                {QUOTA.map((item, index) => (
                  <Ring key={item.label} index={index} />
                ))}
                <RingCenter defaultLabel={t("quotaCenter")} />
              </RingChart>
            </div>
          </Panel>
        </div>

        <div className="md:col-span-12">
          <Panel title={t("revenueTitle")} caption={t("revenueCaption")}>
            <BarChart data={REVENUE} xDataKey="category" aspectRatio="3 / 1">
              <Grid horizontal />
              <Bar dataKey="revenue" fill="var(--chart-line-primary)" lineCap="round" />
              <BarXAxis />
              <ChartTooltip />
            </BarChart>
          </Panel>
        </div>
      </div>
    </main>
  );
}
