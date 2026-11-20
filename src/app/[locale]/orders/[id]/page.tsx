"use client";

import { useEffect, use } from "react";
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
import { useTranslations } from "next-intl";
import { useApiResource } from "@/hooks/use-api-resource";
import { ErrorState, LoadingState } from "@/components/states/async-states";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { formatCountdown, useNow } from "@/hooks/use-now";
import type { Order } from "@/types/type";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const tOrder = useTranslations("OrderDetail");

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

  const handleRefresh = orderRes.reload;

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

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="space-y-6">
          {/* Header Card */}
          <div className="rounded-3xl border border-border bg-white p-6 sm:p-8 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-6">
              <div>
                <span className="text-xs text-muted-foreground/80">Nomor Pesanan</span>
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
                  className="inline-flex rounded-lg bg-primary px-4 py-2 text-xs font-bold text-white hover:brightness-110"
                >
                  {tOrder("orderAgain")}
                </Link>
              </div>
            )}

            {/* Order Items Summary */}
            <div className="mt-6 space-y-3">
              <h2 className="font-display text-sm font-bold text-foreground">Ringkasan Tiket</h2>
              <div className="rounded-2xl bg-surface p-4 border border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-foreground">Jumlah Tiket</span>
                  <span className="font-mono font-bold text-foreground">{order.quantity} Tiket</span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Biaya Layanan Platform Wavy</span>
                  <span className="text-success font-bold">GRATIS</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between text-base font-extrabold text-foreground">
                  <span>Total Tagihan</span>
                  <span className="font-mono text-lg text-primary">
                    Rp{Number(order.total_price).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method / Instructions if pending */}
            {isPending && (
              <div className="mt-8 space-y-4">
                <h2 className="font-display text-sm font-bold text-foreground">Instruksi Pembayaran</h2>
                
                <div className="flex items-start gap-3 rounded-2xl border border-border bg-white p-5">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">{tOrder("paymentNotice")}</p>
                </div>

                <button
                  onClick={handleRefresh}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-white py-3.5 text-xs font-bold text-foreground shadow-sm hover:bg-surface"
                >
                  <RefreshCw className="h-4 w-4" />
                  Cek Status Pembayaran
                </button>
              </div>
            )}

            {/* Action buttons if paid */}
            {isPaid && (
              <div className="mt-8 space-y-3">
                <Link
                  href="/tickets"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-4 text-center text-sm font-extrabold text-white shadow-lg hover:brightness-110"
                >
                  <Ticket className="h-4 w-4" />
                  Buka Dompet Tiket Saya (Wavy Wallet)
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
