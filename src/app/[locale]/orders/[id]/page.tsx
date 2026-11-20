"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  Clock,
  AlertCircle,
  Info,
  Ticket,
  RefreshCw,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { apiGet, getAuthToken } from "@/lib/api";
import { MIDTRANS_ENABLED } from "@/lib/midtrans";
import { PayNowButton } from "@/components/orders/pay-now-button";
import { useErrorMessage } from "@/lib/error-message";
import { useFormatter, useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { formatIDR } from "@/lib/price";
import { useApiResource } from "@/hooks/use-api-resource";
import { ErrorState, LoadingState } from "@/components/states/async-states";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatCountdown, useNow } from "@/hooks/use-now";
import type { Order } from "@/types/type";
import { EventPoster } from "@/components/concerts/event-poster";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const tOrder = useTranslations("OrderDetail");
  const format = useFormatter();

  const orderRes = useApiResource(`order-${id}`, () => apiGet<Order>(`/orders/${id}`));
  const order = orderRes.data ?? null;

  // Countdown ke expires_at (bukan angka tetap). Lewat batas -> tampil expired, sama dengan
  // aturan lazy expiry backend (pending & expires_at <= now dianggap expired).
  const expiresAtMs = order?.expires_at ? Date.parse(order.expires_at) : NaN;
  const ticking = order?.status === "pending_payment" && Number.isFinite(expiresAtMs);
  const now = useNow(1000, ticking);
  const remainingMs = ticking ? Math.max(0, expiresAtMs - now) : 0;
  const status = ticking && remainingMs <= 0 ? "expired" : order?.status;

  useEffect(() => {
    if (!getAuthToken()) router.push("/auth/login");
  }, [router]);

  const errorMessage = useErrorMessage();
  const [checking, setChecking] = useState(false);
  const [checkError, setCheckError] = useState<string | null>(null);

  // Tanya status pembayaran ke backend (yang meneruskan ke Midtrans) lalu muat ulang order.
  const handleRefresh = async () => {
    setChecking(true);
    setCheckError(null);
    try {
      if (MIDTRANS_ENABLED) await apiGet(`/orders/${id}/payment-status`);
    } catch (err) {
      setCheckError(errorMessage(err));
    } finally {
      setChecking(false);
      orderRes.reload();
    }
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="mx-auto max-w-3xl px-4 py-12">
          {orderRes.loading ? (
            <LoadingState label={tOrder("loading")} />
          ) : (
            <ErrorState error={orderRes.error} onRetry={orderRes.reload} />
          )}
        </div>
      </div>
    );
  }

  const isPaid = status === "paid";
  const isPending = status === "pending_payment";
  const isExpired = status === "expired";

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <Link href="/orders" className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          {tOrder("back")}
        </Link>
        <div className="space-y-6">
          {/* Header Card */}
          <div className="rounded-xl border border-border bg-background p-5 sm:p-8">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
              <div>
                <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{tOrder("number")}</span>
                <h1 className="font-mono text-2xl font-extrabold text-foreground">#{order.id}</h1>
              </div>

              {/* Status Badge */}
              <OrderStatusBadge status={status ?? order.status} className="px-4 py-1.5 text-xs" />
            </div>

            {/* Countdown ke batas bayar (order pending) */}
            {isPending && ticking && (
              <div className="mt-6 flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-warning/30 bg-warning/5 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-warning">
                  <Clock className="h-4 w-4 shrink-0 text-warning" />
                  <span>{tOrder("payBefore")}</span>
                </div>
                <div
                  role="timer"
                  aria-label={tOrder("timeLeft")}
                  className={`font-mono text-lg font-extrabold ${remainingMs < 60_000 ? "text-destructive" : "text-warning"}`}
                >
                  {formatCountdown(remainingMs)}
                </div>
              </div>
            )}

            {/* Lewat batas waktu */}
            {isExpired && (
              <div role="status" className="mt-6 space-y-2 rounded-2xl border border-border bg-muted p-4">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <AlertCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                  {tOrder("expiredTitle")}
                </div>
                <p className="text-xs text-muted-foreground">{tOrder("expiredBody")}</p>
                <Link
                  href={`/concerts/${order.event_id}`}
                  className="inline-flex rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground hover:brightness-110"
                >
                  {tOrder("orderAgain")}
                </Link>
              </div>
            )}

            {/* Order Items Summary */}
            <div className="mt-6 space-y-3">
              <h2 className="font-display text-sm font-bold text-foreground">{tOrder("summary")}</h2>
              <div className="rounded-2xl bg-surface p-4 border border-border space-y-2">
                <div className="flex gap-3 border-b border-border pb-3">
                  <EventPoster src={order.poster_url} title={order.event_title || tOrder("eventUnavailable")} alt="" size="sm" className="h-16 w-12 shrink-0 rounded-md object-cover" />
                  <div className="min-w-0 space-y-0.5">
                    {order.event_title ? (
                      <Link href={`/concerts/${order.event_id}`} className="block font-display text-sm font-bold text-foreground hover:text-primary">
                        {order.event_title}
                      </Link>
                    ) : (
                      <p className="text-sm font-semibold text-muted-foreground">{tOrder("eventUnavailable")}</p>
                    )}
                    {(order.event_date || order.venue) && (
                      <p className="text-xs text-muted-foreground">
                        {order.event_date &&
                          format.dateTime(new Date(order.event_date), { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Jakarta" })}
                        {order.event_date && order.venue && " · "}
                        {order.venue}
                      </p>
                    )}
                  </div>
                </div>
                {order.category_name && (
                  <div className="flex justify-between gap-4 text-sm">
                    <span className="font-bold text-foreground">{tOrder("category")}</span>
                    <span className="min-w-0 truncate text-right text-foreground">{order.category_name}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-foreground">{tOrder("quantity")}</span>
                  <span className="font-mono font-bold text-foreground">{tOrder("tickets", { count: order.quantity })}</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{tOrder("serviceFee")}</span>
                  <span className="font-mono font-bold uppercase text-success">{tOrder("free")}</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between text-base font-extrabold text-foreground">
                  <span>{tOrder("total")}</span>
                  <span className="font-mono text-lg text-primary">
                    {formatIDR(Number(order.total_price))}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method / Instructions if pending */}
            {isPending && (
              <div className="mt-8 space-y-4">
                <h2 className="font-display text-sm font-bold text-foreground">{tOrder("instructions")}</h2>
                
                <div className="flex items-start gap-3 rounded-xl border border-border bg-surface p-5">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    {MIDTRANS_ENABLED ? tOrder("paymentOnline") : tOrder("paymentManual")}
                  </p>
                </div>

                {MIDTRANS_ENABLED && <PayNowButton orderId={order.id} onSettled={orderRes.reload} />}

                <button
                  type="button"
                  onClick={handleRefresh}
                  disabled={checking}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-background py-3 text-sm font-semibold text-foreground hover:bg-surface disabled:opacity-60"
                >
                  <RefreshCw className={`h-4 w-4 ${checking ? "animate-spin" : ""}`} />
                  {tOrder("checkStatus")}
                </button>
                {checkError && (
                  <p role="alert" className="text-xs font-semibold text-destructive">
                    {checkError}
                  </p>
                )}
                {MIDTRANS_ENABLED && <p className="text-[11px] text-muted-foreground">{tOrder("manualFallback")}</p>}
              </div>
            )}

            {/* Action buttons if paid */}
            {isPaid && (
              <div className="mt-8 space-y-3">
                <Link
                  href="/tickets"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-center text-sm font-bold text-primary-foreground hover:brightness-110"
                >
                  <Ticket className="h-4 w-4" />
                  {tOrder("openTickets")}
                </Link>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
