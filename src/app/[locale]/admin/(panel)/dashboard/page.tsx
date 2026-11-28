"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowDownRight, ArrowRight, ArrowUpRight, CalendarPlus, Receipt, ReceiptText } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { adminGet } from "@/lib/admin-session";
import { cn } from "@/lib/utils";
import { formatIDR } from "@/lib/price";
import { formatWib, type SalesDashboard } from "@/lib/backoffice";
import { useApiResource, type ApiResource } from "@/hooks/use-api-resource";
import { useAdminSession, useAdminUnauthorized } from "@/hooks/use-admin-session";
import { EmptyState, ErrorState } from "@/components/states/async-states";
import { AdminPageHeader, btn } from "@/components/admin/admin-ui";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
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
import type { AdminDailyPoint, AdminRecentOrder, AdminStats, AdminTopEvent } from "@/types/type";

const RANGES = [7, 30, 90] as const;
const ORDER_STATUSES = ["paid", "pending_payment", "expired", "rejected", "refunded"] as const;
const ORDER_COLORS: Record<(typeof ORDER_STATUSES)[number], string> = {
  paid: "var(--chart-1)",
  pending_payment: "var(--chart-4)",
  expired: "var(--chart-5)",
  rejected: "var(--chart-2)",
  refunded: "var(--chart-3)",
};
const QUOTA_COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)"];

/**
 * Dashboard admin gabungan (DESIGN §4 Modular bento): ringkasan platform + penjualan (dulu dashboard EO).
 * KPI (8) → pendapatan per hari (8) + kuota terisi (4) → event terlaris (7) + order per status (5) → order terbaru (12).
 */
export default function AdminDashboardPage() {
  const t = useTranslations("Admin.dashboard");
  const ready = useAdminSession().ready;
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const stats = useApiResource(ready ? "admin-stats" : null, () => adminGet<AdminStats>("/admin/stats"));
  const sales = useApiResource(ready ? "admin-sales-dashboard" : null, () => adminGet<SalesDashboard>("/admin/dashboard"));
  const daily = useApiResource(ready ? `admin-daily-${days}` : null, () => adminGet<AdminDailyPoint[]>(`/admin/stats/daily?days=${days}`));
  const top = useApiResource(ready ? "admin-top-events" : null, () => adminGet<AdminTopEvent[]>("/admin/stats/top-events?limit=5"));
  const recent = useApiResource(ready ? "admin-recent-orders" : null, () => adminGet<AdminRecentOrder[]>("/admin/orders/recent?limit=8"));
  useAdminUnauthorized(stats.error, sales.error, daily.error, top.error, recent.error);

  const newEvent = (
    <Link href="/admin/events/new" className={btn.primary}>
      <CalendarPlus className="h-4 w-4" />
      {t("newEvent")}
    </Link>
  );
  const actions = (
    <>
      <Link href="/admin/orders" className={btn.outline}>
        <ReceiptText className="h-4 w-4" />
        {t("verifyPayments")}
      </Link>
      {newEvent}
    </>
  );

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("subtitle")} actions={actions} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <KpiGrid stats={stats} sales={sales} />

        <Panel
          className="md:col-span-8"
          title={t("dailyTitle")}
          caption={t("dailyCaption", { days })}
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
          <ChartState
            resource={daily}
            isEmpty={(d) => d.every((p) => p.revenue === 0)}
            empty={<EmptyState title={t("dailyEmpty")} description={t("dailyEmptyText")} />}
          >
            {(d) => <DailyChart data={d} />}
          </ChartState>
        </Panel>

        <Panel className="md:col-span-4" title={t("quotaTitle")} caption={t("quotaCaption")}>
          <ChartState
            resource={sales}
            isEmpty={(d) => !d.per_category?.length}
            empty={<EmptyState title={t("quotaEmpty")} description={t("quotaEmptyText")} action={newEvent} />}
          >
            {(d) => <QuotaRing stats={d} />}
          </ChartState>
        </Panel>

        <Panel className="md:col-span-7" title={t("topTitle")} caption={t("topCaption")}>
          <ChartState
            resource={top}
            isEmpty={(d) => d.length === 0}
            empty={<EmptyState title={t("topEmpty")} description={t("topEmptyText")} />}
          >
            {(d) => <TopEvents events={d} />}
          </ChartState>
        </Panel>

        <Panel className="md:col-span-5" title={t("ordersTitle")} caption={t("ordersCaption")}>
          <ChartState resource={stats} isEmpty={(d) => d.order_count === 0} empty={<EmptyState title={t("ordersEmpty")} />}>
            {(d) => <OrderStatusRing stats={d} />}
          </ChartState>
        </Panel>

        <RecentOrders className="md:col-span-12" orders={recent} />
      </div>
    </>
  );
}

function Panel({
  title,
  caption,
  action,
  className,
  children,
}: {
  title: string;
  caption?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("min-w-0 rounded-xl border border-border bg-card p-4 sm:p-6", className)}>
      <div className="mb-4 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h2 className="font-display text-base font-bold tracking-tight text-foreground">{title}</h2>
          {caption && <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{caption}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** loading (skeleton) / kosong / error (coba lagi) — DESIGN §5. */
function ChartState<T>({
  resource,
  isEmpty,
  empty,
  children,
}: {
  resource: ApiResource<T>;
  isEmpty: (d: T) => boolean;
  empty: React.ReactNode;
  children: (d: T) => React.ReactNode;
}) {
  if (resource.loading) return <div className="aspect-2/1 w-full animate-pulse rounded-lg bg-muted" role="status" aria-busy />;
  if (resource.error !== undefined || resource.data === undefined)
    return <ErrorState error={resource.error} onRetry={resource.reload} className="border-0 py-6" />;
  if (isEmpty(resource.data)) return <>{empty}</>;
  return <>{children(resource.data)}</>;
}

// angka besar di tile KPI diringkas (Rp23,2 jt) supaya tidak terpotong; nilai penuh di title
const compactIDR = (value: number, locale: string) =>
  `Rp${new Intl.NumberFormat(locale === "en" ? "en-US" : "id-ID", { notation: "compact", maximumFractionDigits: 1 }).format(value)}`;

/** KPI butuh dua sumber: /admin/stats (platform) dan /admin/dashboard (penjualan). Gagal salah satu = error, tanpa angka setengah. */
function KpiGrid({ stats, sales }: { stats: ApiResource<AdminStats>; sales: ApiResource<SalesDashboard> }) {
  const t = useTranslations("Admin.dashboard");
  const locale = useLocale();
  if (stats.loading || sales.loading)
    return (
      <div className="grid grid-cols-2 gap-4 md:col-span-12 lg:grid-cols-4" role="status" aria-busy>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  if (stats.error !== undefined || sales.error !== undefined || !stats.data || !sales.data) {
    const retry = () => {
      if (stats.error !== undefined || !stats.data) stats.reload();
      if (sales.error !== undefined || !sales.data) sales.reload();
    };
    return <ErrorState className="md:col-span-12" error={stats.error ?? sales.error} onRetry={retry} />;
  }
  const d = stats.data;
  const s = sales.data;
  const k = s.kpi;
  const revenue = Number(d.revenue);
  return (
    <div className="grid grid-cols-2 gap-4 md:col-span-12 lg:grid-cols-4">
      <Kpi
        label={t("revenue")}
        value={revenue >= 10_000_000 ? compactIDR(revenue, locale) : formatIDR(revenue)}
        title={formatIDR(revenue)}
        now={k?.revenue_7d}
        prev={k?.revenue_prev_7d}
      />
      <Kpi label={t("ticketsSold")} value={String(d.ticket_sold)} now={k?.sold_7d} prev={k?.sold_prev_7d} />
      <Kpi
        label={t("pending")}
        value={String(k?.pending_reserved ?? 0)}
        note={t("pendingNote")}
        tone={(k?.pending_reserved ?? 0) > 0 ? "warning" : undefined}
      />
      <Kpi label={t("checkedIn")} value={String(k?.checked_in ?? 0)} note={t("checkedInNote", { sold: d.ticket_sold })} />
      <Kpi label={t("orders")} value={String(d.order_count)} note={t("ordersNote", { n: d.paid_order_count })} />
      <Kpi label={t("publishedEvents")} value={String(d.published_event_count)} note={t("publishedNote", { n: d.event_count })} />
      <Kpi label={t("remaining")} value={String(s.remaining_ticket)} note={t("remainingNote")} />
      <Kpi label={t("customers")} value={String(d.customer_count)} note={t("customersNote")} />
    </div>
  );
}

function Kpi({
  label,
  value,
  title,
  note,
  now,
  prev,
  tone,
}: {
  label: string;
  value: string;
  title?: string;
  note?: string;
  now?: number;
  prev?: number;
  tone?: "warning";
}) {
  const t = useTranslations("Admin.dashboard");
  let foot: React.ReactNode = note ? <span className="text-muted-foreground">{note}</span> : null;
  // tren: 7 hari terakhir vs 7 hari sebelumnya (paid_at)
  if (now !== undefined && prev !== undefined) {
    const diff = now - prev;
    const pct = prev > 0 ? Math.round((diff / prev) * 100) : null;
    const up = diff >= 0;
    foot =
      diff === 0 && prev === 0 ? (
        <span className="text-muted-foreground">{t("deltaNone")}</span>
      ) : (
        <span className={cn("inline-flex items-center gap-0.5", diff === 0 ? "text-muted-foreground" : up ? "text-success" : "text-destructive")}>
          {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
          {pct === null ? t("deltaNew") : t("delta", { pct: `${up ? "+" : ""}${pct}` })}
        </span>
      );
  }
  return (
    <div className="min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5">
      <p className="truncate font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground sm:text-[11px]">{label}</p>
      <p
        title={title}
        className={cn("mt-2 truncate font-display text-xl font-bold tracking-tight sm:text-3xl", tone === "warning" ? "text-warning" : "text-foreground")}
      >
        {value}
      </p>
      {foot && <p className="mt-1 truncate font-mono text-[11px]">{foot}</p>}
    </div>
  );
}

function DailyChart({ data }: { data: AdminDailyPoint[] }) {
  const t = useTranslations("Admin.dashboard");
  const total = data.reduce((s, p) => s + p.revenue, 0);
  const tickets = data.reduce((s, p) => s + p.tickets, 0);
  return (
    <div className="space-y-3">
      <p className="font-mono text-xs text-muted-foreground">
        <span className="font-semibold text-foreground">{formatIDR(total)}</span> · {t("dailyTickets", { n: tickets })}
      </p>
      <AreaChart data={data.map((p) => ({ date: new Date(`${p.date}T00:00:00+07:00`), revenue: p.revenue }))} aspectRatio="2 / 1">
        <Grid horizontal />
        <Area dataKey="revenue" fill="var(--chart-line-primary)" />
        <XAxis />
        <ChartTooltip />
      </AreaChart>
    </div>
  );
}

/** Kuota terisi (terjual + pending aktif / kuota) — 4 kategori dengan kuota terbesar. */
function QuotaRing({ stats }: { stats: SalesDashboard }) {
  const t = useTranslations("Admin.dashboard");
  const cats = [...(stats.per_category ?? [])].sort((a, b) => b.quota - a.quota);
  const top = cats.slice(0, QUOTA_COLORS.length);
  const quota = cats.reduce((s, c) => s + c.quota, 0);
  const filled = cats.reduce((s, c) => s + c.sold + c.pending, 0);
  const pct = quota > 0 ? Math.round((filled / quota) * 100) : 0;
  const data = top.map((c, i) => ({
    label: `${c.name} · ${c.event_title}`,
    value: c.sold + c.pending,
    maxValue: Math.max(c.quota, 1),
    color: QUOTA_COLORS[i],
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
            <i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: QUOTA_COLORS[i] }} aria-hidden />
            <span className="min-w-0 flex-1 truncate text-foreground">
              {c.name} <span className="text-muted-foreground">· {c.event_title}</span>
            </span>
            <span className="font-mono text-muted-foreground">
              {c.sold + c.pending}/{c.quota}
            </span>
          </li>
        ))}
      </ul>
      {cats.length > top.length && (
        <p className="w-full font-mono text-[11px] text-muted-foreground">{t("quotaMore", { n: cats.length - top.length })}</p>
      )}
    </div>
  );
}

function OrderStatusRing({ stats }: { stats: AdminStats }) {
  const t = useTranslations("Admin.dashboard");
  const ts = useTranslations("OrderStatus");
  const total = stats.order_count;
  const rows = ORDER_STATUSES.map((s) => ({ status: s, n: stats.orders_by_status?.[s] ?? 0 })).filter((r) => r.n > 0);
  const data = rows.map((r) => ({ label: ts(r.status), value: r.n, maxValue: Math.max(total, 1), color: ORDER_COLORS[r.status] }));
  return (
    <div className="flex flex-col items-center gap-4">
      <RingChart data={data} size={220}>
        {data.map((item, index) => (
          <Ring key={item.label} index={index} />
        ))}
        <RingCenter defaultLabel={t("ordersCenter", { n: total })} />
      </RingChart>
      <ul className="w-full space-y-1.5">
        {rows.map((r) => (
          <li key={r.status} className="flex items-center gap-2 text-xs">
            <i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: ORDER_COLORS[r.status] }} aria-hidden />
            <span className="min-w-0 flex-1 truncate text-foreground">{ts(r.status)}</span>
            <span className="font-mono text-muted-foreground">
              {r.n}/{total}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function TopEvents({ events }: { events: AdminTopEvent[] }) {
  const t = useTranslations("Admin.dashboard");
  // sumbu memakai peringkat (#1..#5); judul lengkap + artis ada di daftar di bawah chart
  const rows = events.map((e, i) => ({ rank: `#${i + 1}`, tickets: e.tickets_sold }));
  return (
    <div className="space-y-4">
      <BarChart data={rows} xDataKey="rank" aspectRatio="2 / 1">
        <Grid horizontal />
        <Bar dataKey="tickets" fill="var(--chart-line-primary)" lineCap="round" />
        <BarXAxis />
        <ChartTooltip />
      </BarChart>
      <ol className="divide-y divide-border text-sm">
        {events.map((e, i) => (
          <li key={e.id}>
            <Link href={`/admin/events/${e.id}`} className="flex items-center gap-3 py-2 hover:text-primary">
              <span className="w-6 shrink-0 font-mono text-xs text-muted-foreground">#{i + 1}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate font-semibold text-foreground">{e.title}</span>
                {e.artist_name && <span className="block truncate font-mono text-[11px] text-muted-foreground">{e.artist_name}</span>}
              </span>
              <span className="shrink-0 text-right font-mono text-xs">
                <span className="block text-foreground">{t("topTickets", { n: e.tickets_sold })}</span>
                <span className="block text-muted-foreground">{formatIDR(Number(e.revenue))}</span>
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

function RecentOrders({ orders, className }: { orders: ApiResource<AdminRecentOrder[]>; className?: string }) {
  const t = useTranslations("Admin.dashboard");
  const locale = useLocale();
  const all = (
    <Link href="/admin/orders" className={btn.ghost}>
      {t("recentAll")}
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
  return (
    <Panel className={className} title={t("recentTitle")} caption={t("recentCaption")} action={all}>
      <ChartState
        resource={orders}
        isEmpty={(d) => d.length === 0}
        empty={<EmptyState className="border-0 py-6" icon={<Receipt className="h-8 w-8" />} title={t("recentEmpty")} />}
      >
        {(rows) => (
          <>
            {/* md+: tabel */}
            <div className="-mx-4 hidden md:block sm:-mx-6">
              <table className="w-full table-fixed text-left text-sm">
                <thead className="border-y border-border bg-surface">
                  <tr className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    <th className="w-[38%] px-4 py-3 font-medium sm:pl-6">{t("col.event")}</th>
                    <th className="px-4 py-3 font-medium">{t("col.buyer")}</th>
                    <th className="px-4 py-3 font-medium">{t("col.status")}</th>
                    <th className="px-4 py-3 text-right font-medium sm:pr-6">{t("col.total")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {rows.map((o) => (
                    <tr key={o.id} className="align-middle">
                      <td className="px-4 py-3 sm:pl-6">
                        <p className="truncate font-semibold text-foreground">{o.event_title}</p>
                        <p className="truncate font-mono text-xs text-muted-foreground">
                          #{o.id} · {formatWib(o.created_at, locale)}
                        </p>
                      </td>
                      <td className="truncate px-4 py-3 text-foreground">{o.customer_name}</td>
                      <td className="px-4 py-3">
                        <OrderStatusBadge status={o.status} />
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-foreground sm:pr-6">
                        {formatIDR(Number(o.total_price))}
                        <span className="block text-[11px] text-muted-foreground">{t("qty", { n: o.quantity })}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* < md: card list */}
            <ul className="space-y-3 md:hidden">
              {rows.map((o) => (
                <li key={o.id} className="space-y-2 rounded-xl border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <p className="min-w-0 font-semibold text-foreground">{o.event_title}</p>
                    <OrderStatusBadge status={o.status} />
                  </div>
                  <p className="truncate font-mono text-xs text-muted-foreground">
                    #{o.id} · {formatWib(o.created_at, locale)}
                  </p>
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="min-w-0 truncate text-foreground">{o.customer_name}</span>
                    <span className="shrink-0 font-mono text-foreground">{formatIDR(Number(o.total_price))}</span>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </ChartState>
    </Panel>
  );
}
