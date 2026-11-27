"use client";

import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, UserCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { adminGet } from "@/lib/admin-session";
import { formatWib } from "@/lib/organizer";
import { cn } from "@/lib/utils";
import { useApiResource } from "@/hooks/use-api-resource";
import { useAdminSession, useAdminUnauthorized } from "@/hooks/use-admin-session";
import { AsyncContent, EmptyState } from "@/components/states/async-states";
import { StudioPageHeader } from "@/components/studio/studio-shell";
import { btn } from "@/components/studio/studio-ui";
import { EmailVerifiedChip, OrganizerReviewActions } from "@/components/admin/organizer-review";
import type { AdminOrganizer } from "@/types/type";

/** Antrean verifikasi organizer (DESIGN §4 Baseline): card list satu kolom, 2 kolom di lg. */
export default function AdminVerificationPage() {
  const t = useTranslations("Admin.verification");
  const session = useAdminSession();
  const queue = useApiResource(session.ready ? "admin-verification" : null, () =>
    adminGet<AdminOrganizer[]>("/admin/organizers?status=pending_verification")
  );
  useAdminUnauthorized(queue.error);

  return (
    <>
      <StudioPageHeader title={t("title")} description={t("subtitle")} />
      <AsyncContent
        resource={queue}
        loadingRows={3}
        empty={<EmptyState icon={<UserCheck className="h-10 w-10" />} title={t("empty")} description={t("emptyText")} />}
      >
        {(orgs) => (
          <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {orgs.map((org) => (
              <li key={org.id}>
                <ApplicationCard org={org} onDone={() => queue.mutate((prev) => prev.filter((o) => o.id !== org.id))} />
              </li>
            ))}
          </ul>
        )}
      </AsyncContent>
    </>
  );
}

function ApplicationCard({ org, onDone }: { org: AdminOrganizer; onDone: () => void }) {
  const t = useTranslations("Admin.verification");
  const td = useTranslations("Admin.organizerDetail");
  const locale = useLocale();
  const rows: { label: string; value: React.ReactNode }[] = [
    { label: td("whatsapp"), value: org.whatsapp ? <span className="font-mono">{org.whatsapp}</span> : "—" },
    { label: td("eventTypes"), value: org.event_types || "—" },
    {
      label: td("social"),
      value: org.social_link ? (
        <a href={org.social_link} target="_blank" rel="noreferrer noopener" className="break-all text-primary hover:underline">
          {org.social_link}
        </a>
      ) : (
        "—"
      ),
    },
  ];

  return (
    <article className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:p-5">
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/admin/organizers/${org.id}`} className="block truncate font-display text-base font-bold tracking-tight text-foreground hover:text-primary">
            {org.name}
          </Link>
          <p className="truncate font-mono text-xs text-muted-foreground">{org.email}</p>
          <p className="mt-1 font-mono text-[11px] text-muted-foreground">{t("submitted", { date: formatWib(org.created_at, locale) })}</p>
        </div>
        <EmailVerifiedChip verifiedAt={org.email_verified_at} />
      </header>

      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
        {rows.map((r) => (
          <div key={r.label} className="min-w-0">
            <dt className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{r.label}</dt>
            <dd className="mt-0.5 min-w-0 break-words text-foreground">{r.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-auto flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href={`/admin/organizers/${org.id}`} className={cn(btn.ghost, "justify-center")}>
          {t("review")}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
        <OrganizerReviewActions organizer={org} onDone={onDone} />
      </div>
    </article>
  );
}
