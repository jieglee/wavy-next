"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Building2, Receipt, UserCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { adminGet } from "@/lib/admin-session";
import { cn } from "@/lib/utils";
import { formatIDR } from "@/lib/price";
import { formatWib } from "@/lib/organizer";
import { useApiResource, type ApiResource } from "@/hooks/use-api-resource";
import { useAdminSession, useAdminUnauthorized } from "@/hooks/use-admin-session";
import { EmptyState, ErrorState } from "@/components/states/async-states";
import { StudioPageHeader } from "@/components/studio/studio-shell";
import { btn } from "@/components/studio/studio-ui";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { EmailVerifiedChip } from "@/components/admin/organizer-review";
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
import type { AdminDailyPoint, AdminOrganizer, AdminRecentOrder, AdminStats, AdminTopEvent } from "@/types/type";

const RANGES = [7, 30, 90] as const;
const ORDER_STATUSES = ["paid", "pending_payment", "expired", "rejected", "refunded"] as const;
const ORDER_COLORS: Record<(typeof ORDER_STATUSES)[number], string> = {
  paid: "var(--chart-1)",
  pending_payment: "var(--chart-4)",
  expired: "var(--chart-5)",
  rejected: "var(--chart-2)",
  refunded: "var(--chart-3)",
};

/**
 * Dashboard admin (DESIGN §4 Modular, pola sama dengan dashboard EO):
 * KPI platform → pendapatan per hari (8) + order per status (4) → event terlaris (7) + antrean verifikasi (5) → order terbaru (12).
 */
export default function AdminDashboardPage() {
  const t = useTranslations("Admin.dashboard");
  const session = useAdminSession();
  const ready = session.ready;
  const [days, setDays] = useState<(typeof RANGES)[number]>(30);
  const stats = useApiResource(ready ? "admin-stats" : null, () => adminGet<AdminStats>("/admin/stats"));
  const daily = useApiResource(ready ? `admin-daily-${days}` : null, () => adminGet<AdminDailyPoint[]>(`/admin/stats/daily?days=${days}`));
  const top = useApiResource(ready ? "admin-top-events" : null, () => adminGet<AdminTopEvent[]>("/admin/stats/top-events?limit=5"));
  const recent = useApiResource(ready ? "admin-recent-orders" : null, () => adminGet<AdminRecentOrder[]>("/admin/orders/recent?limit=8"));
  const queue = useApiResource(ready ? "admin-queue" : null, () => adminGet<AdminOrganizer[]>("/admin/organizers?status=pending_verification"));
  useAdminUnauthorized(stats.error, daily.error, top.error, recent.error, queue.error);

  const manage = (
    <Link href="/admin/organizers" className={btn.outline}>
      <Building2 className="h-4 w-4" />
      {t("manageOrganizers")}
    </Link>
  );

  return (
    <>
      <StudioPageHeader title={t("title")} description={t("subtitle")} actions={manage} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <KpiGrid stats={stats} />

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
          <ChartState resource={daily} isEmpty={(d) => d.every((p) => p.revenue === 0)} empty={<EmptyState title={t("dailyEmpty")} description={t("dailyEmptyText")} />}>
            {(d) => <DailyChart data={d} />}
          </ChartState>
        </Panel>

        <Panel className="md:col-span-4" title={t("ordersTitle")} caption={t("ordersCaption")}>
          <ChartState resource={stats} isEmpty={(d) => d.order_count === 0} empty={<EmptyState title={t("ordersEmpty")} />}>
            {(d) => <OrderStatusRing stats={d} />}
          </ChartState>
        </Panel>

        <Panel className="md:col-span-7" title={t("topTitle")} caption={t("topCaption")}>
          <ChartState resource={top} isEmpty={(d) => d.length === 0} empty={<EmptyState title={t("topEmpty")} description={t("topEmptyText")} />}>
            {(d) => <TopEvents events={d} />}
          </ChartState>
        </Panel>

        <VerificationQueue className="md:col-span-5" queue={queue} />

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

function KpiGrid({ stats }: { stats: ApiResource<AdminStats> }) {
  const t = useTranslations("Admin.dashboard");
  const locale = useLocale();
  if (stats.loading)
    return (
      <div className="grid grid-cols-2 gap-4 md:col-span-12 lg:grid-cols-4" role="status" aria-busy>
        {Array.from({ length: 8 }, (_, i) => (
          <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />
        ))}
      </div>
    );
  if (stats.error !== undefined || !stats.data) return <ErrorState className="md:col-span-12" error={stats.error} onRetry={stats.reload} />;
  const d = stats.data;
  return (
    <div className="grid grid-cols-2 gap-4 md:col-span-12 lg:grid-cols-4">
      <Kpi
        label={t("revenue")}
        value={Number(d.revenue) >= 10_000_000 ? compactIDR(Number(d.revenue), locale) : formatIDR(Number(d.revenue))}
        title={formatIDR(Number(d.revenue))}
        note={t("revenueNote")}
      />
      <Kpi label={t("ticketsSold")} value={String(d.ticket_sold)} note={t("ticketsSoldNote")} />
      <Kpi label={t("orders")} value={String(d.order_count)} note={t("ordersNote", { n: d.paid_order_count })} />
      <Kpi label={t("publishedEvents")} value={String(d.published_event_count)} note={t("publishedNote", { n: d.event_count })} />
      <Kpi label={t("customers")} value={String(d.customer_count)} note={t("customersNote")} />
      <Kpi label={t("activeOrganizers")} value={String(d.active_organizer_count)} note={t("organizersNote", { n: d.organizer_count })} />
      <Kpi
        label={t("pendingOrganizers")}
        value={String(d.pending_organizer_count)}
        note={t("pendingNote")}
        href={d.pending_organizer_count > 0 ? "/admin/verification" : undefined}
        tone={d.pending_organizer_count > 0 ? "warning" : undefined}
      />
      <Kpi
        label={t("suspendedOrganizers")}
        value={String(d.suspended_organizer_count)}
        note={t("suspendedNote")}
        tone={d.suspended_organizer_count > 0 ? "destructive" : undefined}
      />
    </div>
  );
}

function Kpi({
  label,
  value,
  note,
  href,
  tone,
  title,
}: {
  label: string;
  value: string;
  title?: string;
  note?: string;
  href?: string;
  tone?: "warning" | "destructive";
}) {
  const body = (
    <>
      <p className="truncate font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground sm:text-[11px]">{label}</p>
      <p
        title={title}
        className={cn(
          "mt-2 truncate font-display text-xl font-bold tracking-tight sm:text-3xl",
          tone === "warning" ? "text-warning" : tone === "destructive" ? "text-destructive" : "text-foreground"
        )}
      >
        {value}
      </p>
      {note && <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">{note}</p>}
    </>
  );
  const cls = "block min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5";
  return href ? (
    <Link href={href} className={cn(cls, "transition-colors hover:border-warning/50")}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
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
  // sumbu memakai peringkat (#1..#5); judul lengkap + organizer ada di daftar di bawah chart
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
          <li key={e.id} className="flex items-center gap-3 py-2">
            <span className="w-6 shrink-0 font-mono text-xs text-muted-foreground">#{i + 1}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold text-foreground">{e.title}</p>
              <p className="truncate font-mono text-[11px] text-muted-foreground">{e.organizer_name}</p>
            </div>
            <div className="shrink-0 text-right font-mono text-xs">
              <p className="text-foreground">{t("topTickets", { n: e.tickets_sold })}</p>
              <p className="text-muted-foreground">{formatIDR(Number(e.revenue))}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}

/** Antrean verifikasi: 5 pengajuan terlama + tautan ke antrean penuh. */
function VerificationQueue({ queue, className }: { queue: ApiResource<AdminOrganizer[]>; className?: string }) {
  const t = useTranslations("Admin.dashboard");
  const tv = useTranslations("Admin.verification");
  const locale = useLocale();
  return (
    <Panel className={className} title={t("queueTitle")} caption={queue.data ? t("queueCaption", { n: queue.data.length }) : undefined}>
      <ChartState
        resource={queue}
        isEmpty={(d) => d.length === 0}
        empty={<EmptyState className="border-0 py-6" icon={<UserCheck className="h-8 w-8" />} title={t("queueEmpty")} />}
      >
        {(pending) => (
          <div className="space-y-3">
            <ul className="divide-y divide-border">
              {pending.slice(0, 5).map((o) => (
                <li key={o.id} className="flex flex-col gap-2 py-3 first:pt-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <Link href={`/admin/organizers/${o.id}`} className="block truncate font-semibold text-foreground hover:text-primary">
                        {o.name}
                      </Link>
                      <p className="truncate font-mono text-xs text-muted-foreground">{o.email}</p>
                    </div>
                    <Link href={`/admin/organizers/${o.id}`} className={cn(btn.primary, "shrink-0 px-3 py-1.5 text-xs")}>
                      {tv("review")}
                    </Link>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <EmailVerifiedChip verifiedAt={o.email_verified_at} />
                    <span className="font-mono text-[11px] text-muted-foreground">{tv("submitted", { date: formatWib(o.created_at, locale) })}</span>
                  </div>
                </li>
              ))}
            </ul>
            <Link href="/admin/verification" className={cn(btn.ghost, "w-full")}>
              {t("queueAll")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </ChartState>
    </Panel>
  );
}

function RecentOrders({ orders, className }: { orders: ApiResource<AdminRecentOrder[]>; className?: string }) {
  const t = useTranslations("Admin.dashboard");
  const locale = useLocale();
  return (
    <Panel className={className} title={t("recentTitle")} caption={t("recentCaption")}>
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
                          #{o.id} · {formatWib(o.created_at, locale)} · {o.organizer_name}
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
