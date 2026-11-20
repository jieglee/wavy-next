"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowDownRight, ArrowUpRight, CalendarPlus } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { apiGet } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatIDR } from "@/lib/price";
import { formatWib, toNumber, type SalesPoint, type StudioDashboard } from "@/lib/organizer";
import { useApiResource, type ApiResource } from "@/hooks/use-api-resource";
import { useAuthToken } from "@/hooks/use-auth-session";
import { EmptyState, ErrorState } from "@/components/states/async-states";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { StudioPageHeader } from "@/components/studio/studio-shell";
import { btn } from "@/components/studio/studio-ui";
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

const RANGES = [7, 30, 90] as const;
const RING_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

/** Dashboard EO (DESIGN §4: Modular bento) — KPI → penjualan (8) + kuota (4) → order terbaru. */
export default function OrganizerDashboardPage() {
  const t = useTranslations("Studio.dashboard");
  const authed = !!useAuthToken();
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const stats = useApiResource(authed ? "studio-dashboard" : null, () => apiGet<StudioDashboard>("/organizer/dashboard"));
  const sales = useApiResource(authed ? `studio-sales-${days}` : null, () =>
    apiGet<SalesPoint[]>(`/organizer/dashboard/sales?days=${days}`)
  );

  const newEvent = (
    <Link href="/organizer/events/new" className={btn.primary}>
      <CalendarPlus className="h-4 w-4" />
      {t("newEvent")}
    </Link>
  );

  return (
    <>
      <StudioPageHeader title={t("title")} description={t("subtitle")} actions={newEvent} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <KpiRow stats={stats} />

        <Panel className="md:col-span-8" title={t("salesTitle")} caption={t("salesCaption", { days })}
          action={
            <div role="group" aria-label={t("rangeLabel")} className="inline-flex rounded-lg border border-border p-0.5">
              {RANGES.map((r) => (
                <button
                  key={r}
                  type="button"
                  aria-pressed={days === r}
                  onClick={() => setDays(r)}
                  className={cn(
                    "rounded-md px-2 py-1 font-mono text-[11px] transition-colors",
                    days === r ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {t("rangeDays", { n: r })}
                </button>
              ))}
            </div>
          }
        >
          <ChartState resource={sales} isEmpty={(d) => d.every((p) => p.tickets === 0)} empty={<EmptyState title={t("salesEmpty")} description={t("salesEmptyText")} action={newEvent} />}>
            {(data) => (
              <AreaChart data={data.map((p) => ({ date: new Date(`${p.date}T00:00:00+07:00`), tickets: p.tickets }))} aspectRatio="2 / 1">
                <Grid horizontal />
                <Area dataKey="tickets" fill="var(--chart-line-primary)" />
                <XAxis />
                <ChartTooltip />
              </AreaChart>
            )}
          </ChartState>
        </Panel>

        <Panel className="md:col-span-4" title={t("quotaTitle")} caption={t("quotaCaption")}>
          <ChartState resource={stats} isEmpty={(d) => !d.per_category?.length} empty={<EmptyState title={t("quotaEmpty")} action={newEvent} />}>
            {(d) => <QuotaRing stats={d} />}
          </ChartState>
        </Panel>

        <Panel className="md:col-span-12" title={t("revenueTitle")} caption={t("revenueCaption")}>
          <ChartState resource={stats} isEmpty={(d) => !d.per_category?.some((c) => c.revenue > 0)} empty={<EmptyState title={t("revenueEmpty")} />}>
            {(d) => {
              const rows = [...(d.per_category ?? [])]
                .filter((c) => c.revenue > 0)
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, 8)
                .map((c) => ({ category: c.name, revenue: c.revenue }));
              return (
                <BarChart data={rows} xDataKey="category" aspectRatio="3 / 1">
                  <Grid horizontal />
                  <Bar dataKey="revenue" fill="var(--chart-line-primary)" lineCap="round" />
                  <BarXAxis />
                  <ChartTooltip />
                </BarChart>
              );
            }}
          </ChartState>
        </Panel>

        <RecentOrders className="md:col-span-12" stats={stats} />
      </div>
    </>
  );
}

function Panel({ title, caption, action, className, children }: { title: string; caption?: string; action?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <section className={cn("min-w-0 rounded-xl border border-border bg-card p-4 sm:p-6", className)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div>
          <h2 className="font-display text-base font-bold tracking-tight text-foreground">{title}</h2>
          {caption && <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{caption}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** loading (skeleton) / kosong (pesan + CTA) / error (coba lagi) — DESIGN §5. */
function ChartState<T>({ resource, isEmpty, empty, children }: { resource: ApiResource<T>; isEmpty: (d: T) => boolean; empty: React.ReactNode; children: (d: T) => React.ReactNode }) {
  if (resource.loading) return <div className="aspect-2/1 w-full animate-pulse rounded-lg bg-muted" role="status" aria-busy />;
  if (resource.error !== undefined || resource.data === undefined) return <ErrorState error={resource.error} onRetry={resource.reload} className="border-0 py-6" />;
  if (isEmpty(resource.data)) return <>{empty}</>;
  return <>{children(resource.data)}</>;
}

function KpiRow({ stats }: { stats: ApiResource<StudioDashboard> }) {
  const t = useTranslations("Studio.dashboard");
  if (stats.loading)
    return (
      <div className="grid grid-cols-2 gap-4 md:col-span-12 lg:grid-cols-4" role="status" aria-busy>
        {Array.from({ length: 4 }, (_, i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />)}
      </div>
    );
  if (stats.error !== undefined || !stats.data)
    return <ErrorState className="md:col-span-12" error={stats.error} onRetry={stats.reload} />;
  const d = stats.data;
  const k = d.kpi;
  return (
    <div className="grid grid-cols-2 gap-4 md:col-span-12 lg:grid-cols-4">
      <Kpi label={t("revenue")} value={formatIDR(k?.revenue ?? d.revenue)} now={k?.revenue_7d} prev={k?.revenue_prev_7d} />
      <Kpi label={t("sold")} value={String(k?.tickets_sold ?? d.ticket_sold)} now={k?.sold_7d} prev={k?.sold_prev_7d} />
      <Kpi label={t("pending")} value={String(k?.pending_reserved ?? 0)} note={t("pendingNote")} />
      <Kpi
        label={t("checkedIn")}
        value={String(k?.checked_in ?? 0)}
        note={t("checkedInNote", { sold: k?.tickets_sold ?? d.ticket_sold })}
      />
    </div>
  );
}

function Kpi({ label, value, now, prev, note }: { label: string; value: string; now?: number; prev?: number; note?: string }) {
  const t = useTranslations("Studio.dashboard");
  let delta: React.ReactNode = note ? <span className="text-muted-foreground">{note}</span> : null;
  if (now !== undefined && prev !== undefined) {
    const diff = now - prev;
    const pct = prev > 0 ? Math.round((diff / prev) * 100) : null;
    const up = diff >= 0;
    delta = (
      <span className={cn("inline-flex items-center gap-0.5", diff === 0 ? "text-muted-foreground" : up ? "text-success" : "text-destructive")}>
        {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
        {pct === null ? t("deltaNew") : t("delta", { pct: `${up ? "+" : ""}${pct}` })}
      </span>
    );
  }
  return (
    <div className="min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5">
      <p className="truncate font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground sm:text-[11px]">{label}</p>
      <p className="mt-2 truncate font-display text-xl font-bold tracking-tight text-foreground sm:text-3xl">{value}</p>
      <p className="mt-1 truncate font-mono text-[11px]">{delta}</p>
    </div>
  );
}

function QuotaRing({ stats }: { stats: StudioDashboard }) {
  const t = useTranslations("Studio.dashboard");
  const cats = [...(stats.per_category ?? [])].sort((a, b) => b.quota - a.quota);
  const top = cats.slice(0, 4);
  const quota = cats.reduce((s, c) => s + c.quota, 0);
  const filled = cats.reduce((s, c) => s + c.sold + c.pending, 0);
  const pct = quota > 0 ? Math.round((filled / quota) * 100) : 0;
  const data = top.map((c, i) => ({
    label: `${c.name} · ${c.event_title}`,
    value: c.sold + c.pending,
    maxValue: Math.max(c.quota, 1),
    color: RING_COLORS[i],
  }));
  return (
    <div className="flex flex-col items-center gap-4">
      <RingChart data={data} size={220}>
        {data.map((item, index) => (
          <Ring key={item.label} index={index} />
        ))}
        <RingCenter defaultLabel={t("quotaCenter", { pct })} />
      </RingChart>
      <ul className="w-full space-y-1.5">
        {top.map((c, i) => (
          <li key={c.category_id} className="flex items-center gap-2 text-xs">
            <i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: RING_COLORS[i] }} aria-hidden />
            <span className="min-w-0 flex-1 truncate text-foreground">{c.name} <span className="text-muted-foreground">· {c.event_title}</span></span>
            <span className="font-mono text-muted-foreground">{c.sold + c.pending}/{c.quota}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RecentOrders({ stats, className }: { stats: ApiResource<StudioDashboard>; className?: string }) {
  const t = useTranslations("Studio.dashboard");
  const locale = useLocale();
  return (
    <Panel className={className} title={t("recentTitle")} action={<Link href="/organizer/orders" className={btn.ghost}>{t("recentAll")}</Link>}>
      <ChartState resource={stats} isEmpty={(d) => !d.recent_orders?.length} empty={<EmptyState title={t("recentEmpty")} />}>
        {(d) => (
          <ul className="-mx-4 divide-y divide-border sm:-mx-6">
            {(d.recent_orders ?? []).map((o) => (
              <li key={o.id} className="flex items-center justify-between gap-4 px-4 py-3 sm:px-6">
                <span className="min-w-0">
                  <span className="block font-mono text-xs text-muted-foreground">#{o.id} · {formatWib(o.created_at, locale)}</span>
                  <span className="block truncate text-sm text-foreground">
                    {o.event_title} <span className="text-muted-foreground">· {o.category_name} · {o.quantity}×</span>
                  </span>
                </span>
                <span className="flex shrink-0 flex-col items-end gap-1 md:flex-row md:items-center md:gap-4">
                  <OrderStatusBadge status={o.status} />
                  <span className="font-mono text-sm text-foreground md:w-32 md:text-right">{formatIDR(toNumber(o.total_price))}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </ChartState>
    </Panel>
  );
}
