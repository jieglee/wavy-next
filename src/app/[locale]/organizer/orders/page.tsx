"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  ShoppingBag,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "@/i18n/navigation";
import { WavyIcon } from "@/components/landing/wavy-icon";
import { ErrorState } from "@/components/states/async-states";
import { ApiError, apiGet, apiPost, getAuthToken } from "@/lib/api";
import { useApiResource } from "@/hooks/use-api-resource";
import { useAuthToken } from "@/hooks/use-auth-session";
import { isKnownErrorCode, useErrorMessage } from "@/lib/error-message";
import type { Order } from "@/types/type";

export default function OrganizerOrdersPage() {
  const router = useRouter();

  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const errorMessage = useErrorMessage();

  const authed = !!useAuthToken();
  const ordersPath = selectedStatus === "all" ? "/organizer/orders" : `/organizer/orders?status=${selectedStatus}`;
  const ordersRes = useApiResource(authed ? ordersPath : null, () => apiGet<Order[]>(ordersPath));
  const orders = ordersRes.data ?? [];
  const loading = ordersRes.loading;
  const loadError = ordersRes.error;

  useEffect(() => {
    if (!getAuthToken()) router.push("/organizer/login");
  }, [router]);

  // kode aturan bisnis (mis. ORDER_EXPIRED) pakai teks terjemahan; selain itu pesan backend
  const actionError = (err: unknown, fallback: string) =>
    err instanceof ApiError && isKnownErrorCode(err.code) ? errorMessage(err) : (err as Error).message || fallback;

  async function handleVerify(id: number, approve: boolean) {
    setActionLoading(id);
    try {
      await apiPost(`/organizer/orders/${id}/verify`, { approve });
      toast.success(
        approve
          ? "Pembayaran disetujui! E-tiket QR telah diterbitkan untuk pembeli."
          : "Pesanan ditolak. Kuota tiket otomatis ditawarkan ke Waiting List."
      );
      ordersRes.mutate((prev) => prev.map((o) => (o.id === id ? { ...o, status: approve ? "paid" : "rejected" } : o)));
    } catch (err: unknown) {
      toast.error(actionError(err, "Gagal memverifikasi pesanan"));
      // order bisa sudah expired (lazy expiry di backend) -> segarkan status di tabel
      if (err instanceof ApiError && err.code === "ORDER_EXPIRED") ordersRes.reload();
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRefund(id: number) {
    if (!confirm("Yakin ingin merefund pesanan ini? Tiket pembeli akan dinonaktifkan.")) return;
    setActionLoading(id);
    try {
      await apiPost(`/organizer/orders/${id}/refund`);
      toast.success("Pesanan direfund. Slot tiket kembali tersedia & Waiting List ternotifikasi.");
      ordersRes.mutate((prev) => prev.map((o) => (o.id === id ? { ...o, status: "refunded" } : o)));
    } catch (err: unknown) {
      toast.error(actionError(err, "Gagal merefund pesanan"));
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      {/* Top Bar */}
      <header className="border-b border-border bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/organizer/dashboard" className="flex items-center gap-2">
              <WavyIcon size={26} />
              <span className="font-display text-lg font-bold text-foreground">Wavy EO Portal</span>
            </Link>
            <span className="text-muted-foreground/40">/</span>
            <span className="text-xs font-bold text-primary">Verifikasi Pesanan</span>
          </div>

          <Link
            href="/organizer/dashboard"
            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground/80 hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-foreground">
              Daftar Pesanan & Pembayaran
            </h1>
            <p className="text-xs text-muted-foreground">
              Verifikasi transfer manual, terbitkan e-tiket QR, atau kelola refund pembeli.
            </p>
          </div>

          {/* Status filter chips */}
          <div className="flex gap-1.5 overflow-x-auto rounded-2xl bg-white p-1.5 border border-border">
            {["all", "pending_payment", "paid", "rejected", "refunded"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  selectedStatus === st
                    ? "bg-foreground text-white"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {st === "all" ? "Semua" : st}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="h-48 animate-pulse rounded-3xl bg-border" />
        ) : loadError ? (
          <ErrorState error={loadError} onRetry={ordersRes.reload} />
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-border bg-white p-12 text-center space-y-3">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/80 mx-auto" />
            <h3 className="text-base font-bold text-foreground">Tidak Ada Pesanan</h3>
            <p className="text-xs text-muted-foreground">Belum ada data pesanan pada filter ini.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-border bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-border bg-surface text-muted-foreground/80">
                  <tr>
                    <th className="px-6 py-4 font-bold">No. Order</th>
                    <th className="px-6 py-4 font-bold">Customer ID</th>
                    <th className="px-6 py-4 font-bold">Jumlah & Total</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Waktu Pesan</th>
                    <th className="px-6 py-4 font-bold text-right">Aksi Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-surface transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-sm text-foreground">
                        #{ord.id}
                      </td>
                      <td className="px-6 py-4 font-semibold text-foreground">
                        Customer #{ord.customer_id}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-foreground">{ord.quantity} Tiket</span>
                        <p className="font-mono text-xs font-extrabold text-primary">
                          Rp{Number(ord.total_price).toLocaleString("id-ID")}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold ${
                            ord.status === "paid"
                              ? "bg-success/10 text-success"
                              : ord.status === "pending_payment"
                              ? "bg-warning/10 text-warning"
                              : ord.status === "rejected"
                              ? "bg-destructive/10 text-destructive"
                              : "bg-muted text-foreground/85"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground/80">
                        {new Date(ord.created_at).toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {ord.status === "pending_payment" && (
                          <>
                            <button
                              onClick={() => handleVerify(ord.id, true)}
                              disabled={actionLoading === ord.id}
                              className="rounded-xl bg-success px-3.5 py-1.5 font-bold text-white shadow hover:bg-success/90 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleVerify(ord.id, false)}
                              disabled={actionLoading === ord.id}
                              className="rounded-xl bg-destructive px-3.5 py-1.5 font-bold text-white shadow hover:bg-destructive/90 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {ord.status === "paid" && (
                          <button
                            onClick={() => handleRefund(ord.id)}
                            disabled={actionLoading === ord.id}
                            className="rounded-xl border border-input px-3 py-1.5 font-bold text-foreground/85 hover:bg-muted disabled:opacity-50"
                          >
                            <RotateCcw className="inline h-3.5 w-3.5 mr-1" />
                            Refund
                          </button>
                        )}

                        {ord.status !== "pending_payment" && ord.status !== "paid" && (
                          <span className="text-muted-foreground/70 font-semibold text-[11px]">Selesai</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
