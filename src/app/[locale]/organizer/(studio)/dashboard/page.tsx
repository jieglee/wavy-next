"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { apiGet } from "@/lib/api";
import { formatIDR } from "@/lib/price";
import { useApiResource } from "@/hooks/use-api-resource";
import { useAuthToken } from "@/hooks/use-auth-session";
import { AsyncContent } from "@/components/states/async-states";
import { StudioPageHeader } from "@/components/studio/studio-shell";
import type { OrganizerDashboardStats } from "@/types/type";

export default function OrganizerDashboardPage() {
  const t = useTranslations("Studio.dashboard");
  const authed = !!useAuthToken();
  const stats = useApiResource(authed ? "organizer-dashboard" : null, () =>
    apiGet<OrganizerDashboardStats>("/organizer/dashboard")
  );

  return (
    <>
      <StudioPageHeader
        title={t("title")}
        description={t("subtitle")}
        actions={
          <Link
            href="/organizer/events/new"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:brightness-110"
          >
            {t("newEvent")}
          </Link>
        }
      />
      <AsyncContent resource={stats} loadingRows={1} isEmpty={() => false}>
        {(s) => (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Kpi label={t("revenue")} value={formatIDR(s.revenue)} />
            <Kpi label={t("sold")} value={String(s.ticket_sold)} />
            <Kpi label={t("remaining")} value={String(s.remaining_ticket)} />
            <Kpi label={t("peakHour")} value={`${String(s.peak_purchase_hour).padStart(2, "0")}:00`} />
          </div>
        )}
      </AsyncContent>
    </>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-background p-5">
      <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="mt-2 font-display text-2xl font-bold tracking-tight text-foreground">{value}</p>
    </div>
  );
}
