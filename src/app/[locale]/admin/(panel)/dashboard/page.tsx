"use client";

import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Building2, UserCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { adminGet } from "@/lib/admin-session";
import { cn } from "@/lib/utils";
import { formatIDR } from "@/lib/price";
import { formatWib } from "@/lib/organizer";
import { EmailVerifiedChip } from "@/components/admin/organizer-review";
import { useApiResource, type ApiResource } from "@/hooks/use-api-resource";
import { useAdminSession, useAdminUnauthorized } from "@/hooks/use-admin-session";
import { EmptyState, ErrorState } from "@/components/states/async-states";
import { StudioPageHeader } from "@/components/studio/studio-shell";
import { btn } from "@/components/studio/studio-ui";
import { BarChart } from "@/components/charts/bar-chart";
import { Bar } from "@/components/charts/bar";
import { BarXAxis } from "@/components/charts/bar-x-axis";
import { Grid } from "@/components/charts/grid";
import { ChartTooltip } from "@/components/charts/tooltip";
import { RingChart } from "@/components/charts/ring-chart";
import { Ring } from "@/components/charts/ring";
import { RingCenter } from "@/components/charts/ring-center";
import type { AdminOrganizer, AdminStats } from "@/types/type";

const STATUS_ORDER = ["active", "suspended", "pending_verification", "rejected"] as const;
const STATUS_COLORS: Record<string, string> = {
  active: "var(--chart-1)",
  suspended: "var(--chart-2)",
  pending_verification: "var(--chart-4)",
  rejected: "var(--chart-5)",
};

/** Dashboard admin (DESIGN §4 Modular): KPI platform → distribusi organizer (4) + pendapatan per organizer (8). */
export default function AdminDashboardPage() {
  const t = useTranslations("Admin.dashboard");
  const session = useAdminSession();
  const stats = useApiResource(session.ready ? "admin-stats" : null, () => adminGet<AdminStats>("/admin/stats"));
  const organizers = useApiResource(session.ready ? "admin-organizers" : null, () => adminGet<AdminOrganizer[]>("/admin/organizers"));
  useAdminUnauthorized(stats.error, organizers.error);

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
        <KpiRow stats={stats} />

        <VerificationQueue organizers={organizers} />

        <Panel className="md:col-span-4" title={t("statusTitle")} caption={t("statusCaption")}>
          <ChartState resource={organizers} isEmpty={(d) => d.length === 0} empty={<EmptyState title={t("organizersEmpty")} />}>
            {(d) => <StatusRing organizers={d} />}
          </ChartState>
        </Panel>

        <Panel className="md:col-span-8" title={t("revenueTitle")} caption={t("revenueCaption")}>
          <ChartState
            resource={organizers}
            isEmpty={(d) => !d.some((o) => Number(o.revenue) > 0)}
            empty={<EmptyState title={t("revenueEmpty")} description={t("revenueEmptyText")} />}
          >
            {(d) => {
              const rows = [...d]
                .filter((o) => Number(o.revenue) > 0)
                .sort((a, b) => Number(b.revenue) - Number(a.revenue))
                .slice(0, 6)
                .map((o) => ({ organizer: o.name, revenue: Number(o.revenue) }));
              return (
                <BarChart data={rows} xDataKey="organizer" aspectRatio="2 / 1">
                  <Grid horizontal />
                  <Bar dataKey="revenue" fill="var(--chart-line-primary)" lineCap="round" />
                  <BarXAxis />
                  <ChartTooltip />
                </BarChart>
              );
            }}
          </ChartState>
        </Panel>
      </div>
    </>
  );
}

function Panel({ title, caption, className, children }: { title: string; caption?: string; className?: string; children: React.ReactNode }) {
  return (
    <section className={cn("min-w-0 rounded-xl border border-border bg-card p-4 sm:p-6", className)}>
      <div className="mb-4">
        <h2 className="font-display text-base font-bold tracking-tight text-foreground">{title}</h2>
        {caption && <p className="mt-1 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{caption}</p>}
      </div>
      {children}
    </section>
  );
}

/** loading (skeleton) / kosong / error (coba lagi) — DESIGN §5. */
function ChartState<T>({ resource, isEmpty, empty, children }: { resource: ApiResource<T>; isEmpty: (d: T) => boolean; empty: React.ReactNode; children: (d: T) => React.ReactNode }) {
  if (resource.loading) return <div className="aspect-2/1 w-full animate-pulse rounded-lg bg-muted" role="status" aria-busy />;
  if (resource.error !== undefined || resource.data === undefined) return <ErrorState error={resource.error} onRetry={resource.reload} className="border-0 py-6" />;
  if (isEmpty(resource.data)) return <>{empty}</>;
  return <>{children(resource.data)}</>;
}

function KpiRow({ stats }: { stats: ApiResource<AdminStats> }) {
  const t = useTranslations("Admin.dashboard");
  if (stats.loading)
    return (
      <div className="grid grid-cols-2 gap-4 md:col-span-12 lg:grid-cols-4" role="status" aria-busy>
        {Array.from({ length: 4 }, (_, i) => <div key={i} className="h-28 animate-pulse rounded-xl bg-muted" />)}
      </div>
    );
  if (stats.error !== undefined || !stats.data) return <ErrorState className="md:col-span-12" error={stats.error} onRetry={stats.reload} />;
  const d = stats.data;
  return (
    <div className="grid grid-cols-2 gap-4 md:col-span-12 lg:grid-cols-4">
      <Kpi label={t("revenue")} value={formatIDR(Number(d.revenue))} note={t("revenueNote")} />
      <Kpi label={t("orders")} value={String(d.order_count)} note={t("ticketsNote", { n: d.ticket_sold })} />
      <Kpi label={t("events")} value={String(d.event_count)} />
      <Kpi label={t("users")} value={String(d.organizer_count + d.customer_count)} note={t("usersNote", { organizers: d.organizer_count, customers: d.customer_count })} />
    </div>
  );
}

function Kpi({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-border bg-card p-4 sm:p-5">
      <p className="truncate font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground sm:text-[11px]">{label}</p>
      <p className="mt-2 truncate font-display text-xl font-bold tracking-tight text-foreground sm:text-3xl">{value}</p>
      {note && <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">{note}</p>}
    </div>
  );
}

function StatusRing({ organizers }: { organizers: AdminOrganizer[] }) {
  const t = useTranslations("Admin");
  const counts = STATUS_ORDER.map((s) => ({ status: s, n: organizers.filter((o) => o.status === s).length })).filter((c) => c.n > 0);
  const total = organizers.length;
  const data = counts.map((c) => ({ label: t(`status.${c.status}`), value: c.n, maxValue: Math.max(total, 1), color: STATUS_COLORS[c.status] }));
  return (
    <div className="flex flex-col items-center gap-4">
      <RingChart data={data} size={220}>
        {data.map((item, index) => (
          <Ring key={item.label} index={index} />
        ))}
        <RingCenter defaultLabel={t("dashboard.statusCenter", { n: total })} />
      </RingChart>
      <ul className="w-full space-y-1.5">
        {counts.map((c) => (
          <li key={c.status} className="flex items-center gap-2 text-xs">
            <i className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: STATUS_COLORS[c.status] }} aria-hidden />
            <span className="min-w-0 flex-1 truncate text-foreground">{t(`status.${c.status}`)}</span>
            <span className="font-mono text-muted-foreground">{c.n}/{total}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Kartu antrean verifikasi: 5 pengajuan terlama + tautan ke antrean penuh. */
function VerificationQueue({ organizers }: { organizers: ApiResource<AdminOrganizer[]> }) {
  const t = useTranslations("Admin.dashboard");
  const tv = useTranslations("Admin.verification");
  const locale = useLocale();
  const pending = (organizers.data ?? [])
    .filter((o) => o.status === "pending_verification")
    .sort((a, b) => (Date.parse(a.created_at ?? "") || 0) - (Date.parse(b.created_at ?? "") || 0) || a.id - b.id);
  return (
    <Panel className="md:col-span-12" title={t("queueTitle")} caption={organizers.data ? t("queueCaption", { n: pending.length }) : undefined}>
      <ChartState
        resource={organizers}
        isEmpty={(d) => !d.some((o) => o.status === "pending_verification")}
        empty={<EmptyState className="border-0 py-6" icon={<UserCheck className="h-8 w-8" />} title={t("queueEmpty")} />}
      >
        {() => (
          <div className="space-y-3">
            <ul className="divide-y divide-border">
              {pending.slice(0, 5).map((o) => (
                <li key={o.id} className="flex flex-col gap-2 py-3 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <Link href={`/admin/organizers/${o.id}`} className="block truncate font-semibold text-foreground hover:text-primary">
                      {o.name}
                    </Link>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {o.email} · {tv("submitted", { date: formatWib(o.created_at, locale) })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <EmailVerifiedChip verifiedAt={o.email_verified_at} />
                    <Link href={`/admin/organizers/${o.id}`} className={cn(btn.primary, "px-3 py-1.5 text-xs")}>
                      {tv("review")}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
            <Link href="/admin/verification" className={cn(btn.ghost, "w-full sm:w-auto")}>
              {t("queueAll")}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </ChartState>
    </Panel>
  );
}
