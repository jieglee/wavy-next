"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Building2 } from "lucide-react";
import { Link } from "@/i18n/navigation";
import toast from "react-hot-toast";
import { apiGet, apiPatch } from "@/lib/api";
import { cn } from "@/lib/utils";
import { formatIDR } from "@/lib/price";
import { formatWib } from "@/lib/organizer";
import { useErrorMessage } from "@/lib/error-message";
import { useApiResource } from "@/hooks/use-api-resource";
import { useAdminSession, useAdminUnauthorized } from "@/hooks/use-admin-session";
import { AsyncContent, EmptyState } from "@/components/states/async-states";
import { StudioPageHeader } from "@/components/studio/studio-shell";
import { btn } from "@/components/studio/studio-ui";
import { OrganizerStatusBadge } from "@/components/admin/organizer-status-badge";
import type { AdminOrganizer } from "@/types/type";

type Pending = { org: AdminOrganizer; next: "active" | "suspended" };

/** Kelola organizer (DESIGN §4 Baseline): tabel di md+, card list di bawahnya. */
export default function AdminOrganizersPage() {
  const t = useTranslations("Admin.organizers");
  const locale = useLocale();
  const errorMessage = useErrorMessage();
  const session = useAdminSession();
  const list = useApiResource(session.ready ? "admin-organizers" : null, () => apiGet<AdminOrganizer[]>("/admin/organizers"));
  useAdminUnauthorized(list.error);

  const [confirm, setConfirm] = useState<Pending | null>(null);
  const [busy, setBusy] = useState(false);
  const [rowError, setRowError] = useState<{ id: number; message: string } | null>(null);

  async function apply() {
    if (!confirm) return;
    const { org, next } = confirm;
    setBusy(true);
    setRowError(null);
    try {
      await apiPatch(`/admin/organizers/${org.id}`, { status: next });
      list.mutate((prev) => prev.map((o) => (o.id === org.id ? { ...o, status: next } : o)));
      toast.success(next === "suspended" ? t("suspended", { name: org.name }) : t("activated", { name: org.name }));
      setConfirm(null);
    } catch (err) {
      setRowError({ id: org.id, message: errorMessage(err) });
      setConfirm(null);
    } finally {
      setBusy(false);
    }
  }

  const action = (org: AdminOrganizer) => {
    const next = org.status === "suspended" ? "active" : "suspended";
    return (
      <button
        type="button"
        onClick={() => setConfirm({ org, next })}
        className={cn(next === "suspended" ? btn.danger : btn.outline, "px-3 py-1.5 text-xs")}
      >
        {next === "suspended" ? t("suspend") : t("activate")}
      </button>
    );
  };

  const inlineError = (org: AdminOrganizer) =>
    rowError?.id === org.id ? (
      <p role="alert" className="text-xs text-destructive">
        {rowError.message}
      </p>
    ) : null;

  return (
    <>
      <StudioPageHeader title={t("title")} description={t("subtitle")} />

      <AsyncContent
        resource={list}
        loadingRows={5}
        empty={<EmptyState icon={<Building2 className="h-10 w-10" />} title={t("empty")} />}
      >
        {(orgs) => (
          <>
            {/* md+: tabel baseline */}
            <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-border bg-surface">
                  <tr className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    <th className="px-4 py-3 font-medium">{t("col.organizer")}</th>
                    <th className="px-4 py-3 font-medium">{t("col.joined")}</th>
                    <th className="px-4 py-3 text-right font-medium">{t("col.events")}</th>
                    <th className="px-4 py-3 text-right font-medium">{t("col.revenue")}</th>
                    <th className="px-4 py-3 font-medium">{t("col.status")}</th>
                    <th className="px-4 py-3 text-right font-medium">
                      <span className="sr-only">{t("col.action")}</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orgs.map((org) => (
                    <tr key={org.id} className="align-middle">
                      <td className="max-w-0 px-4 py-3">
                        <Link href={`/admin/organizers/${org.id}`} className="block truncate font-semibold text-foreground hover:text-primary">
                          {org.name}
                        </Link>
                        <p className="truncate font-mono text-xs text-muted-foreground">{org.email}</p>
                        {inlineError(org)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-mono text-xs text-muted-foreground">{formatWib(org.created_at, locale)}</td>
                      <td className="px-4 py-3 text-right font-mono text-foreground">{org.event_count}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-foreground">{formatIDR(Number(org.revenue))}</td>
                      <td className="px-4 py-3">
                        <OrganizerStatusBadge status={org.status} />
                      </td>
                      <td className="px-4 py-3 text-right">{action(org)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* < md: card list */}
            <ul className="space-y-3 md:hidden">
              {orgs.map((org) => (
                <li key={org.id} className="space-y-3 rounded-xl border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <Link href={`/admin/organizers/${org.id}`} className="block truncate font-semibold text-foreground hover:text-primary">
                        {org.name}
                      </Link>
                      <p className="truncate font-mono text-xs text-muted-foreground">{org.email}</p>
                    </div>
                    <OrganizerStatusBadge status={org.status} />
                  </div>
                  <dl className="grid grid-cols-3 gap-2 font-mono text-xs">
                    <div className="min-w-0">
                      <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("col.events")}</dt>
                      <dd className="text-foreground">{org.event_count}</dd>
                    </div>
                    <div className="col-span-2 min-w-0 text-right">
                      <dt className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("col.revenue")}</dt>
                      <dd className="truncate text-foreground">{formatIDR(Number(org.revenue))}</dd>
                    </div>
                  </dl>
                  {inlineError(org)}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-[11px] text-muted-foreground">{formatWib(org.created_at, locale)}</span>
                    {action(org)}
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
      </AsyncContent>

      {confirm && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-foreground/60 backdrop-blur-sm sm:items-center sm:p-4"
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          aria-describedby="confirm-body"
        >
          <div className="w-full max-w-md space-y-4 rounded-t-2xl bg-background p-5 sm:rounded-2xl sm:p-6">
            <h2 id="confirm-title" className="font-display text-lg font-bold tracking-tight text-foreground">
              {confirm.next === "suspended" ? t("confirmSuspendTitle", { name: confirm.org.name }) : t("confirmActivateTitle", { name: confirm.org.name })}
            </h2>
            <p id="confirm-body" className="text-sm text-muted-foreground">
              {confirm.next === "suspended" ? t("confirmSuspendBody") : t("confirmActivateBody")}
            </p>
            <div className="flex gap-2">
              <button type="button" onClick={() => setConfirm(null)} disabled={busy} className={cn(btn.outline, "flex-1")}>
                {t("cancel")}
              </button>
              <button
                type="button"
                onClick={apply}
                disabled={busy}
                className={cn(confirm.next === "suspended" ? btn.danger : btn.primary, "flex-1")}
              >
                {busy ? t("saving") : confirm.next === "suspended" ? t("suspend") : t("activate")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
