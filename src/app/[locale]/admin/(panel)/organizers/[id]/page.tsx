"use client";

import { use } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, CalendarX } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { apiGet } from "@/lib/api";
import { formatIDR } from "@/lib/price";
import { formatWib } from "@/lib/organizer";
import { useApiResource } from "@/hooks/use-api-resource";
import { useAdminSession, useAdminUnauthorized } from "@/hooks/use-admin-session";
import { AsyncContent, EmptyState } from "@/components/states/async-states";
import { StudioPageHeader } from "@/components/studio/studio-shell";
import { EventStatusBadge } from "@/components/studio/studio-ui";
import { OrganizerStatusBadge } from "@/components/admin/organizer-status-badge";
import type { AdminOrganizerDetail } from "@/types/type";

/** Detail organizer (DESIGN §4 Modular): profil + KPI penjualan → daftar event (tabel md+, card di bawahnya). */
export default function AdminOrganizerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("Admin.organizerDetail");
  const session = useAdminSession();
  const detail = useApiResource(session.ready ? `admin-organizer-${id}` : null, () =>
    apiGet<AdminOrganizerDetail>(`/admin/organizers/${id}`)
  );
  useAdminUnauthorized(detail.error);

  const back = (
    <Link href="/admin/organizers" className="mb-3 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
      <ArrowLeft className="h-3.5 w-3.5" />
      {t("back")}
    </Link>
  );

  return (
    <AsyncContent resource={detail} loadingRows={5} isEmpty={() => false}>
      {(d) => <Detail data={d} back={back} />}
    </AsyncContent>
  );
}

function Detail({ data, back }: { data: AdminOrganizerDetail; back: React.ReactNode }) {
  const t = useTranslations("Admin.organizerDetail");
  const locale = useLocale();
  const { organizer: org, events, summary } = data;

  const profile: { label: string; value: React.ReactNode }[] = [
    { label: t("email"), value: <span className="font-mono">{org.email}</span> },
    { label: t("whatsapp"), value: org.whatsapp ? <span className="font-mono">{org.whatsapp}</span> : "—" },
    { label: t("eventTypes"), value: org.event_types || "—" },
    {
      label: t("social"),
      value: org.social_link ? (
        <a href={org.social_link} target="_blank" rel="noreferrer noopener" className="break-all text-primary hover:underline">
          {org.social_link}
        </a>
      ) : (
        "—"
      ),
    },
    { label: t("joined"), value: <span className="font-mono">{formatWib(org.created_at, locale)}</span> },
  ];

  return (
    <>
      <StudioPageHeader title={org.name} back={back} actions={<OrganizerStatusBadge status={org.status} />} />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
        <div className="grid grid-cols-2 gap-4 md:col-span-12 lg:grid-cols-4">
          <Kpi label={t("revenue")} value={formatIDR(Number(summary.revenue))} note={t("revenueNote")} />
          <Kpi label={t("ticketsSold")} value={String(summary.ticket_sold)} note={t("paidOrders", { n: summary.paid_order_count })} />
          <Kpi label={t("events")} value={String(summary.event_count)} note={t("published", { n: summary.published_count })} />
          <Kpi label={t("pending")} value={String(summary.pending_order_count)} note={t("pendingNote")} />
        </div>

        <section className="min-w-0 rounded-xl border border-border bg-card p-4 sm:p-6 md:col-span-4">
          <h2 className="mb-4 font-display text-base font-bold tracking-tight text-foreground">{t("profile")}</h2>
          <dl className="space-y-3 text-sm">
            {profile.map((row) => (
              <div key={row.label} className="min-w-0">
                <dt className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{row.label}</dt>
                <dd className="mt-0.5 min-w-0 break-words text-foreground">{row.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="min-w-0 rounded-xl border border-border bg-card md:col-span-8">
          <h2 className="p-4 pb-0 font-display text-base font-bold tracking-tight text-foreground sm:px-6 sm:pt-6">{t("eventsTitle")}</h2>
          {events.length === 0 ? (
            <EmptyState className="border-0" icon={<CalendarX className="h-10 w-10" />} title={t("eventsEmpty")} />
          ) : (
            <>
              {/* md+: tabel baseline */}
              <div className="mt-4 hidden md:block">
                <table className="w-full table-fixed text-left text-sm">
                  <thead className="border-y border-border bg-surface">
                    <tr className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                      <th className="w-[44%] px-4 py-3 font-medium sm:pl-6">{t("col.event")}</th>
                      <th className="px-4 py-3 font-medium">{t("col.status")}</th>
                      <th className="px-4 py-3 text-right font-medium">{t("col.sold")}</th>
                      <th className="px-4 py-3 text-right font-medium sm:pr-6">{t("col.revenue")}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {events.map((ev) => (
                      <tr key={ev.id} className="align-middle">
                        <td className="px-4 py-3 sm:pl-6">
                          <p className="truncate font-semibold text-foreground">{ev.title}</p>
                          <p className="truncate font-mono text-xs text-muted-foreground">
                            {formatWib(ev.date, locale)}
                            {ev.venue && ` · ${ev.venue}`}
                          </p>
                        </td>
                        <td className="px-4 py-3">
                          <EventStatusBadge status={ev.status} />
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-foreground">
                          {ev.sold}/{ev.quota}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-foreground sm:pr-6">{formatIDR(Number(ev.revenue))}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* < md: card list */}
              <ul className="space-y-3 p-4 md:hidden">
                {events.map((ev) => (
                  <li key={ev.id} className="space-y-2 rounded-xl border border-border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 font-semibold text-foreground">{ev.title}</p>
                      <EventStatusBadge status={ev.status} />
                    </div>
                    <p className="truncate font-mono text-xs text-muted-foreground">
                      {formatWib(ev.date, locale)}
                      {ev.venue && ` · ${ev.venue}`}
                    </p>
                    <dl className="grid grid-cols-2 gap-2 font-mono text-xs">
                      <div className="min-w-0">
                        <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("col.sold")}</dt>
                        <dd className="text-foreground">
                          {ev.sold}/{ev.quota}
                        </dd>
                      </div>
                      <div className="min-w-0 text-right">
                        <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("col.revenue")}</dt>
                        <dd className="truncate text-foreground">{formatIDR(Number(ev.revenue))}</dd>
                      </div>
                    </dl>
                  </li>
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </>
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
