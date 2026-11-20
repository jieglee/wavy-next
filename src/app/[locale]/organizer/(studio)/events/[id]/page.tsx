"use client";

import { use, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { ArrowLeft, Pencil, Plus, Trash2 } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { apiDelete, apiGet, apiPost, apiPut } from "@/lib/api";
import { formatIDR } from "@/lib/price";
import { formatWib, toNumber, type StudioCategory, type StudioEventDetail } from "@/lib/organizer";
import { useApiResource } from "@/hooks/use-api-resource";
import { useAuthToken } from "@/hooks/use-auth-session";
import { useStudioError } from "@/hooks/use-studio-error";
import { AsyncContent, EmptyState } from "@/components/states/async-states";
import { StudioPageHeader } from "@/components/studio/studio-shell";
import { btn, EventBadges, inputCls, labelCls, QuotaBar } from "@/components/studio/studio-ui";
import SalesBadge from "@/components/concerts/sales-badge";

export default function StudioEventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const t = useTranslations("Studio.detail");
  const locale = useLocale();
  const router = useRouter();
  const studioError = useStudioError();
  const authed = !!useAuthToken();
  const event = useApiResource(authed ? `studio-event-${id}` : null, () => apiGet<StudioEventDetail>(`/organizer/events/${id}`));
  const [busy, setBusy] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function run(key: string, action: () => Promise<unknown>, success: string, after?: () => void) {
    setBusy(key);
    setActionError(null);
    try {
      await action();
      toast.success(success);
      if (after) after();
      else event.reload();
    } catch (err) {
      setActionError(studioError(err));
    } finally {
      setBusy(null);
    }
  }

  return (
    <AsyncContent resource={event} isEmpty={() => false}>
      {(ev) => (
        <>
          <StudioPageHeader
            title={ev.title}
            back={
              <Link href="/organizer/events" className="mb-2 inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-3.5 w-3.5" />
                {t("back")}
              </Link>
            }
            actions={
              <>
                <Link href={`/organizer/events/${ev.id}/edit`} className={btn.outline}>
                  <Pencil className="h-4 w-4" />
                  {t("edit")}
                </Link>
                {ev.status !== "published" ? (
                  <button
                    type="button"
                    disabled={busy !== null}
                    className={btn.primary}
                    onClick={() => run("publish", () => apiPost(`/organizer/events/${ev.id}/publish`), t("published"))}
                  >
                    {ev.status === "closed" ? t("reopen") : t("publish")}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={busy !== null}
                    className={btn.dark}
                    onClick={() => {
                      if (window.confirm(t("confirmClose")))
                        run("close", () => apiPost(`/organizer/events/${ev.id}/close-sales`), t("closed"));
                    }}
                  >
                    {t("close")}
                  </button>
                )}
                <button
                  type="button"
                  disabled={busy !== null}
                  className={btn.danger}
                  onClick={() => {
                    if (window.confirm(t("confirmDelete", { title: ev.title })))
                      run("delete", () => apiDelete(`/organizer/events/${ev.id}`), t("deleted"), () => router.push("/organizer/events"));
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only sm:not-sr-only">{t("delete")}</span>
                </button>
              </>
            }
          />

          {actionError && (
            <p role="alert" className="mb-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {actionError}
            </p>
          )}

          <dl className="mb-6 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
            <Info label={t("status")}>
              <EventBadges status={ev.status} salesStatus={ev.sales_status} />
            </Info>
            <Info label={t("date")}>
              <span className="font-mono text-sm">{formatWib(ev.date, locale)}</span>
            </Info>
            <Info label={t("salesWindow")}>
              <span className="font-mono text-xs leading-5">
                {formatWib(ev.sales_start_at, locale)}
                <br />→ {formatWib(ev.sales_end_at, locale)}
              </span>
            </Info>
            <Info label={t("venue")}>
              <span className="text-sm">{ev.venue}</span>
            </Info>
          </dl>

          <CategorySection event={ev} onChanged={event.reload} />
        </>
      )}
    </AsyncContent>
  );
}

function Info({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="bg-background p-4">
      <dt className={labelCls}>{label}</dt>
      <dd className="min-w-0 text-foreground">{children}</dd>
    </div>
  );
}

type Draft = { name: string; price: string; quota: string };
const emptyDraft: Draft = { name: "", price: "", quota: "" };

/** Kategori tiket & kuota — Baseline: tabel rapat dengan bar kuota, tambah/edit/hapus inline. */
function CategorySection({ event, onChanged }: { event: StudioEventDetail; onChanged: () => void }) {
  const t = useTranslations("Studio.categories");
  const studioError = useStudioError();
  const [editing, setEditing] = useState<number | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cats = event.ticket_categories ?? [];

  function startEdit(c?: StudioCategory) {
    setError(null);
    setEditing(c ? c.id : "new");
    setDraft(c ? { name: c.name, price: String(toNumber(c.price)), quota: String(c.quota) } : emptyDraft);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    const price = Number(draft.price);
    const quota = Number(draft.quota);
    if (!draft.name.trim() || draft.price === "" || !Number.isFinite(price) || price < 0) return setError(t("errPrice"));
    if (!Number.isInteger(quota) || quota < 1) return setError(t("errQuota"));
    setSaving(true);
    setError(null);
    try {
      const body = { name: draft.name.trim(), price, quota };
      if (editing === "new") await apiPost(`/organizer/events/${event.id}/ticket-categories`, body);
      else await apiPut(`/organizer/ticket-categories/${editing}`, body);
      toast.success(editing === "new" ? t("added") : t("updated"));
      setEditing(null);
      onChanged();
    } catch (err) {
      setError(studioError(err));
    } finally {
      setSaving(false);
    }
  }

  async function remove(c: StudioCategory) {
    if (!window.confirm(t("confirmDelete", { name: c.name }))) return;
    setError(null);
    try {
      await apiDelete(`/organizer/ticket-categories/${c.id}`);
      toast.success(t("deleted"));
      onChanged();
    } catch (err) {
      setError(studioError(err));
    }
  }

  const form = (
    <form onSubmit={save} className="grid grid-cols-1 gap-3 border-t border-border bg-surface p-4 sm:grid-cols-[2fr_1fr_1fr_auto] sm:items-end">
      <div>
        <label htmlFor="cat-name" className={labelCls}>{t("name")}</label>
        <input id="cat-name" className={inputCls} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} autoFocus />
      </div>
      <div>
        <label htmlFor="cat-price" className={labelCls}>{t("price")}</label>
        <input id="cat-price" type="number" min={0} step={1000} inputMode="numeric" className={`${inputCls} font-mono`} value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} />
      </div>
      <div>
        <label htmlFor="cat-quota" className={labelCls}>{t("quota")}</label>
        <input id="cat-quota" type="number" min={1} step={1} inputMode="numeric" className={`${inputCls} font-mono`} value={draft.quota} onChange={(e) => setDraft({ ...draft, quota: e.target.value })} />
      </div>
      <div className="flex gap-2">
        <button type="button" className={btn.outline} onClick={() => setEditing(null)}>{t("cancel")}</button>
        <button type="submit" disabled={saving} className={btn.primary}>{saving ? t("saving") : t("save")}</button>
      </div>
    </form>
  );

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-background">
      <div className="flex flex-wrap items-center justify-between gap-3 p-4">
        <div>
          <h2 className="font-display text-lg font-bold tracking-tight text-foreground">{t("title")}</h2>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        {editing === null && (
          <button type="button" className={btn.primary} onClick={() => startEdit()}>
            <Plus className="h-4 w-4" />
            {t("add")}
          </button>
        )}
      </div>

      {error && (
        <p role="alert" className="mx-4 mb-3 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </p>
      )}

      {editing === "new" && form}

      {cats.length === 0 && editing !== "new" ? (
        <div className="p-4 pt-0">
          <EmptyState title={t("emptyTitle")} description={t("emptyText")} />
        </div>
      ) : (
        <ul className="divide-y divide-border border-t border-border">
          {cats.map((c) =>
            editing === c.id ? (
              <li key={c.id}>{form}</li>
            ) : (
              <li key={c.id} className="grid grid-cols-1 gap-3 p-4 md:grid-cols-[minmax(0,1.5fr)_8rem_minmax(0,2fr)_auto] md:items-center">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-foreground">{c.name}</p>
                  {c.sales_status && (
                    <div className="mt-1">
                      <SalesBadge status={c.sales_status} />
                    </div>
                  )}
                </div>
                <p className="font-mono text-sm text-foreground md:text-right">{formatIDR(toNumber(c.price))}</p>
                <QuotaBar quota={c.quota} sold={c.sold} pending={c.pending ?? 0} />
                <div className="flex gap-1 md:justify-end">
                  <button type="button" className={btn.ghost} onClick={() => startEdit(c)} disabled={editing !== null}>
                    <Pencil className="h-3.5 w-3.5" />
                    {t("edit")}
                  </button>
                  <button type="button" className={`${btn.ghost} hover:text-destructive`} onClick={() => remove(c)} disabled={editing !== null}>
                    <Trash2 className="h-3.5 w-3.5" />
                    {t("delete")}
                  </button>
                </div>
              </li>
            )
          )}
        </ul>
      )}
    </section>
  );
}
