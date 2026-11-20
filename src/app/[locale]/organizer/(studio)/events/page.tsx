"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { CalendarPlus, LayoutGrid, List, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { apiGet } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatWib, type StudioEvent } from "@/lib/organizer";
import { useApiResource } from "@/hooks/use-api-resource";
import { useAuthToken } from "@/hooks/use-auth-session";
import { AsyncContent, EmptyState } from "@/components/states/async-states";
import { StudioPageHeader } from "@/components/studio/studio-shell";
import { btn, EventBadges, QuotaBar } from "@/components/studio/studio-ui";

type View = "grid" | "table";

export default function StudioEventsPage() {
  const t = useTranslations("Studio.events");
  const locale = useLocale();
  const authed = !!useAuthToken();
  const [view, setView] = useState<View>("grid");
  const events = useApiResource(authed ? "studio-events" : null, () => apiGet<StudioEvent[]>("/organizer/events"));

  const newBtn = (
    <Link href="/organizer/events/new" className={btn.primary}>
      <CalendarPlus className="h-4 w-4" />
      {t("new")}
    </Link>
  );

  return (
    <>
      <StudioPageHeader
        title={t("title")}
        description={t("subtitle")}
        actions={
          <>
            <div role="group" aria-label={t("viewLabel")} className="inline-flex rounded-lg border border-border bg-background p-0.5">
              {(["grid", "table"] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setView(v)}
                  aria-pressed={view === v}
                  aria-label={t(v === "grid" ? "viewGrid" : "viewTable")}
                  className={cn(
                    "rounded-md p-1.5 transition-colors",
                    view === v ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {v === "grid" ? <LayoutGrid className="h-4 w-4" /> : <List className="h-4 w-4" />}
                </button>
              ))}
            </div>
            {newBtn}
          </>
        }
      />

      <AsyncContent
        resource={events}
        empty={<EmptyState title={t("emptyTitle")} description={t("emptyText")} action={newBtn} />}
      >
        {(list) =>
          view === "grid" ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((ev) => (
                <Link
                  key={ev.id}
                  href={`/organizer/events/${ev.id}`}
                  className="group flex flex-col overflow-hidden rounded-xl border border-border bg-background transition-colors hover:border-primary/40"
                >
                  <div className="relative aspect-16/7 bg-stage">
                    {ev.poster_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={ev.poster_url} alt="" className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-4">
                    <EventBadges status={ev.status} salesStatus={ev.sales_status} />
                    <div className="min-w-0">
                      <h2 className="truncate font-display text-base font-bold text-foreground group-hover:text-primary">{ev.title}</h2>
                      <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {ev.venue}
                      </p>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">{formatWib(ev.date, locale)}</p>
                    </div>
                    {ev.total_quota !== undefined && (
                      <QuotaBar
                        className="mt-auto"
                        quota={ev.total_quota}
                        sold={ev.total_sold ?? 0}
                        pending={ev.total_pending ?? 0}
                      />
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border bg-background">
              <table className="hidden w-full text-left text-sm md:table">
                <thead className="border-b border-border font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">{t("colEvent")}</th>
                    <th className="px-4 py-3 font-medium">{t("colDate")}</th>
                    <th className="px-4 py-3 font-medium">{t("colStatus")}</th>
                    <th className="w-56 px-4 py-3 font-medium">{t("colQuota")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {list.map((ev) => (
                    <tr key={ev.id} className="hover:bg-surface">
                      <td className="max-w-xs px-4 py-3">
                        <Link href={`/organizer/events/${ev.id}`} className="block truncate font-semibold text-foreground hover:text-primary">
                          {ev.title}
                        </Link>
                        <span className="block truncate text-xs text-muted-foreground">{ev.venue}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">{formatWib(ev.date, locale)}</td>
                      <td className="px-4 py-3">
                        <EventBadges status={ev.status} salesStatus={ev.sales_status} />
                      </td>
                      <td className="px-4 py-3">
                        {ev.total_quota !== undefined ? (
                          <QuotaBar quota={ev.total_quota} sold={ev.total_sold ?? 0} pending={ev.total_pending ?? 0} />
                        ) : (
                          "—"
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* < md: tabel jadi card list (DESIGN §6) */}
              <ul className="divide-y divide-border md:hidden">
                {list.map((ev) => (
                  <li key={ev.id}>
                    <Link href={`/organizer/events/${ev.id}`} className="block space-y-2 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <span className="min-w-0 truncate font-semibold text-foreground">{ev.title}</span>
                      </div>
                      <EventBadges status={ev.status} salesStatus={ev.sales_status} />
                      <p className="font-mono text-xs text-muted-foreground">{formatWib(ev.date, locale)}</p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )
        }
      </AsyncContent>
    </>
  );
}
