"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import toast from "react-hot-toast";
import { Check, RotateCcw, X } from "lucide-react";
import { adminGet, adminPost } from "@/lib/admin-session";
import { cn } from "@/lib/utils";
import { formatIDR } from "@/lib/price";
import { formatWib, toNumber, type StudioOrder, type StudioOrderDetail } from "@/lib/backoffice";
import { useApiResource } from "@/hooks/use-api-resource";
import { useAdminSession } from "@/hooks/use-admin-session";
import { useAdminError } from "@/hooks/use-admin-error";
import { AsyncContent, EmptyState } from "@/components/states/async-states";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { AdminPageHeader } from "@/components/admin/admin-ui";
import { btn, labelCls } from "@/components/admin/admin-ui";

const FILTERS = ["pending_payment", "paid", "expired", "rejected", "refunded", "cancelled", "all"] as const;
type Filter = (typeof FILTERS)[number];

/** Verifikasi pembayaran (DESIGN §4: Baseline) — antrian + panel detail (drawer di mobile). */
export default function StudioOrdersPage() {
  const t = useTranslations("Studio.orders");
  const tStatus = useTranslations("OrderStatus");
  const locale = useLocale();
  const authed = useAdminSession().ready;
  const [filter, setFilter] = useState<Filter>("pending_payment");
  const [selected, setSelected] = useState<number | null>(null);
  const path = filter === "all" ? "/admin/orders" : `/admin/orders?status=${filter}`;
  const orders = useApiResource(authed ? path : null, () => adminGet<StudioOrder[]>(path));

  return (
    <>
      <AdminPageHeader title={t("title")} description={t("subtitle")} />

      <div role="tablist" aria-label={t("filterLabel")} className="-mx-4 mb-4 flex gap-1 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
        {FILTERS.map((f) => (
          <button
            key={f}
            role="tab"
            type="button"
            aria-selected={filter === f}
            onClick={() => {
              setFilter(f);
              setSelected(null);
            }}
            className={cn(
              "shrink-0 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors",
              filter === f ? "border-foreground bg-foreground text-background" : "border-border bg-background text-muted-foreground hover:text-foreground"
            )}
          >
            {f === "all" ? t("all") : tStatus(f)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <div className={cn("lg:col-span-7 xl:col-span-8", selected === null && "lg:col-span-12 xl:col-span-12")}>
          <AsyncContent
            resource={orders}
            empty={<EmptyState title={t("emptyTitle")} description={filter === "pending_payment" ? t("emptyPending") : t("emptyText")} />}
          >
            {(list) => (
              <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-background">
                {list.map((o) => (
                  <li key={o.id}>
                    <button
                      type="button"
                      onClick={() => setSelected(o.id)}
                      aria-current={selected === o.id ? "true" : undefined}
                      className={cn(
                        "grid w-full grid-cols-[1fr_auto] gap-x-4 gap-y-1 px-4 py-3 text-left transition-colors hover:bg-surface",
                        selected === o.id && "bg-surface"
                      )}
                    >
                      <span className="min-w-0">
                        <span className="block font-mono text-xs text-muted-foreground">
                          #{o.id} · {formatWib(o.created_at, locale)}
                        </span>
                        <span className="mt-0.5 block truncate text-sm font-semibold text-foreground">
                          {o.event_title ?? t("eventN", { id: o.event_id })}
                        </span>
                        <span className="block truncate text-xs text-muted-foreground">
                          {[o.category_name, `${o.quantity}×`, o.customer_name || o.customer_email].filter(Boolean).join(" · ")}
                        </span>
                      </span>
                      <span className="flex flex-col items-end gap-1">
                        <OrderStatusBadge status={o.status} />
                        <span className="font-mono text-sm font-medium text-foreground">{formatIDR(toNumber(o.total_price))}</span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </AsyncContent>
        </div>

        {selected !== null && (
          <OrderPanel
            key={selected}
            id={selected}
            onClose={() => setSelected(null)}
            onChanged={() => {
              orders.reload();
            }}
          />
        )}
      </div>
    </>
  );
}

function OrderPanel({ id, onClose, onChanged }: { id: number; onClose: () => void; onChanged: () => void }) {
  const t = useTranslations("Studio.orders");
  const locale = useLocale();
  const adminError = useAdminError();
  const detail = useApiResource(`studio-order-${id}`, () => adminGet<StudioOrderDetail>(`/admin/orders/${id}`));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function act(path: string, body: unknown, success: string, confirmText: string) {
    if (!window.confirm(confirmText)) return;
    setBusy(true);
    setError(null);
    try {
      await adminPost(path, body);
      toast.success(success);
      detail.reload();
      onChanged();
    } catch (err) {
      setError(adminError(err));
      detail.reload();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* backdrop drawer mobile */}
      <button type="button" aria-label={t("close")} onClick={onClose} className="fixed inset-0 z-40 bg-foreground/40 lg:hidden" />
      <aside
        aria-label={t("detailTitle", { id })}
        className="fixed inset-x-0 bottom-0 z-50 max-h-[85dvh] overflow-y-auto rounded-t-2xl border-t border-border bg-background p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] lg:sticky lg:top-6 lg:z-auto lg:col-span-5 lg:max-h-none lg:self-start lg:rounded-xl lg:border xl:col-span-4"
      >
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="font-display text-lg font-bold tracking-tight text-foreground">{t("detailTitle", { id })}</h2>
          <button type="button" onClick={onClose} className={btn.ghost} aria-label={t("close")}>
            <X className="h-4 w-4" />
          </button>
        </div>

        <AsyncContent resource={detail} isEmpty={() => false} loadingRows={2}>
          {(o) => (
            <div className="space-y-4">
              <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                <Row label={t("status")}>
                  <OrderStatusBadge status={o.status} />
                </Row>
                <Row label={t("total")}>
                  <span className="font-mono">{formatIDR(toNumber(o.total_price))}</span>
                </Row>
                <Row label={t("event")} wide>
                  {o.event_title ?? `#${o.event_id}`}
                </Row>
                <Row label={t("category")}>{o.category_name ?? `#${o.ticket_category_id}`}</Row>
                <Row label={t("quantity")}>
                  <span className="font-mono">{o.quantity}</span>
                </Row>
                <Row label={t("customer")} wide>
                  <span className="block truncate">{o.customer_name || "—"}</span>
                  {o.customer_email && <span className="block truncate font-mono text-xs text-muted-foreground">{o.customer_email}</span>}
                </Row>
                <Row label={t("createdAt")}>
                  <span className="font-mono text-xs">{formatWib(o.created_at, locale)}</span>
                </Row>
                {o.status === "pending_payment" ? (
                  <Row label={t("expiresAt")}>
                    <span className="font-mono text-xs">{formatWib(o.expires_at, locale)}</span>
                  </Row>
                ) : (
                  <Row label={t("paidAt")}>
                    <span className="font-mono text-xs">{formatWib(o.paid_at, locale)}</span>
                  </Row>
                )}
                {o.tickets && o.tickets.length > 0 && (
                  <Row label={t("tickets")} wide>
                    <span className="font-mono text-xs">
                      {t("ticketsSummary", { total: o.tickets.length, scanned: o.tickets.filter((x) => x.is_scanned).length })}
                    </span>
                  </Row>
                )}
              </dl>

              <p className="rounded-lg bg-surface px-3 py-2 text-xs text-muted-foreground">{t("manualNote")}</p>

              {error && (
                <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {error}
                </p>
              )}

              {o.status === "pending_payment" && (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    className={btn.danger}
                    onClick={() => act(`/admin/orders/${o.id}/verify`, { approve: false }, t("rejected"), t("confirmReject", { id: o.id }))}
                  >
                    <X className="h-4 w-4" />
                    {t("reject")}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    className={btn.primary}
                    onClick={() => act(`/admin/orders/${o.id}/verify`, { approve: true }, t("approved"), t("confirmApprove", { id: o.id }))}
                  >
                    <Check className="h-4 w-4" />
                    {t("approve")}
                  </button>
                </div>
              )}
              {o.status === "paid" && (
                <button
                  type="button"
                  disabled={busy}
                  className={`${btn.danger} w-full`}
                  onClick={() => act(`/admin/orders/${o.id}/refund`, undefined, t("refunded"), t("confirmRefund", { id: o.id }))}
                >
                  <RotateCcw className="h-4 w-4" />
                  {t("refund")}
                </button>
              )}
            </div>
          )}
        </AsyncContent>
      </aside>
    </>
  );
}

function Row({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) {
  return (
    <div className={cn("min-w-0", wide && "col-span-2")}>
      <dt className={labelCls}>{label}</dt>
      <dd className="text-foreground">{children}</dd>
    </div>
  );
}
