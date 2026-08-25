"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  ShoppingBag,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "@/i18n/navigation";
import { WavyIcon } from "@/components/landing/wavy-icon";
import { apiGet, apiPost, getAuthToken } from "@/lib/api";
import type { Order } from "@/types/type";

export default function OrganizerOrdersPage() {
  const router = useRouter();

  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const path = selectedStatus === "all" ? "/organizer/orders" : `/organizer/orders?status=${selectedStatus}`;
      const data = await apiGet<Order[]>(path);
      setOrders(data || []);
    } catch {
      // Fallback demo
      setOrders([
        {
          id: 501,
          customer_id: 1,
          event_id: 1,
          ticket_category_id: 1,
          quantity: 2,
          total_price: 600000,
          status: "pending_payment",
          expires_at: new Date(Date.now() + 10 * 60000).toISOString(),
          created_at: new Date().toISOString(),
        },
        {
          id: 502,
          customer_id: 2,
          event_id: 1,
          ticket_category_id: 1,
          quantity: 1,
          total_price: 300000,
          status: "paid",
          expires_at: new Date().toISOString(),
          created_at: new Date(Date.now() - 3600000).toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus]);

  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/organizer/login");
      return;
    }
    loadOrders();
  }, [router, loadOrders]);

  async function handleVerify(id: number, approve: boolean) {
    setActionLoading(id);
    try {
      await apiPost(`/organizer/orders/${id}/verify`, { approve });
      toast.success(
        approve
          ? "Pembayaran disetujui! E-tiket QR telah diterbitkan untuk pembeli."
          : "Pesanan ditolak. Kuota tiket otomatis ditawarkan ke Waiting List."
      );
      setOrders((prev) =>
        prev.map((o) => (o.id === id ? { ...o, status: approve ? "paid" : "rejected" } : o))
      );
    } catch (err: unknown) {
      toast.error((err as Error).message || "Gagal memverifikasi pesanan");
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
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status: "refunded" } : o)));
    } catch (err: unknown) {
      toast.error((err as Error).message || "Gagal merefund pesanan");
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      {/* Top Bar */}
      <header className="border-b border-[#EDEBF2] bg-white px-6 py-4">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/organizer/dashboard" className="flex items-center gap-2">
              <WavyIcon size={26} />
              <span className="font-display text-lg font-bold text-[#1B1A3A]">Wavy EO Portal</span>
            </Link>
            <span className="text-gray-300">/</span>
            <span className="text-xs font-bold text-[#FF5470]">Verifikasi Pesanan</span>
          </div>

          <Link
            href="/organizer/dashboard"
            className="flex items-center gap-1.5 text-xs font-bold text-[#8B889C] hover:text-[#1B1A3A]"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-2xl font-extrabold text-[#1B1A3A]">
              Daftar Pesanan & Pembayaran
            </h1>
            <p className="text-xs text-[#6B6875]">
              Verifikasi transfer manual, terbitkan e-tiket QR, atau kelola refund pembeli.
            </p>
          </div>

          {/* Status filter chips */}
          <div className="flex gap-1.5 overflow-x-auto rounded-2xl bg-white p-1.5 border border-[#EDEBF2]">
            {["all", "pending_payment", "paid", "rejected", "refunded"].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all ${
                  selectedStatus === st
                    ? "bg-[#1B1A3A] text-white"
                    : "text-[#6B6875] hover:text-[#1B1A3A]"
                }`}
              >
                {st === "all" ? "Semua" : st}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table */}
        {loading ? (
          <div className="h-48 animate-pulse rounded-3xl bg-gray-200" />
        ) : orders.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-[#EDEBF2] bg-white p-12 text-center space-y-3">
            <ShoppingBag className="h-12 w-12 text-[#8B889C] mx-auto" />
            <h3 className="text-base font-bold text-[#1B1A3A]">Tidak Ada Pesanan</h3>
            <p className="text-xs text-[#6B6875]">Belum ada data pesanan pada filter ini.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-3xl border border-[#EDEBF2] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-[#EDEBF2] bg-[#FAFAF8] text-[#8B889C]">
                  <tr>
                    <th className="px-6 py-4 font-bold">No. Order</th>
                    <th className="px-6 py-4 font-bold">Customer ID</th>
                    <th className="px-6 py-4 font-bold">Jumlah & Total</th>
                    <th className="px-6 py-4 font-bold">Status</th>
                    <th className="px-6 py-4 font-bold">Waktu Pesan</th>
                    <th className="px-6 py-4 font-bold text-right">Aksi Verifikasi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EDEBF2]">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[#FAFAF8] transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-sm text-[#1B1A3A]">
                        #{ord.id}
                      </td>
                      <td className="px-6 py-4 font-semibold text-[#1B1A3A]">
                        Customer #{ord.customer_id}
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-bold text-[#1B1A3A]">{ord.quantity} Tiket</span>
                        <p className="font-mono text-xs font-extrabold text-[#FF5470]">
                          Rp{Number(ord.total_price).toLocaleString("id-ID")}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold ${
                            ord.status === "paid"
                              ? "bg-emerald-100 text-emerald-700"
                              : ord.status === "pending_payment"
                              ? "bg-amber-100 text-amber-700"
                              : ord.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-[#8B889C]">
                        {new Date(ord.created_at).toLocaleString("id-ID")}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {ord.status === "pending_payment" && (
                          <>
                            <button
                              onClick={() => handleVerify(ord.id, true)}
                              disabled={actionLoading === ord.id}
                              className="rounded-xl bg-emerald-600 px-3.5 py-1.5 font-bold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleVerify(ord.id, false)}
                              disabled={actionLoading === ord.id}
                              className="rounded-xl bg-red-600 px-3.5 py-1.5 font-bold text-white shadow hover:bg-red-700 disabled:opacity-50"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {ord.status === "paid" && (
                          <button
                            onClick={() => handleRefund(ord.id)}
                            disabled={actionLoading === ord.id}
                            className="rounded-xl border border-gray-300 px-3 py-1.5 font-bold text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                          >
                            <RotateCcw className="inline h-3.5 w-3.5 mr-1" />
                            Refund
                          </button>
                        )}

                        {ord.status !== "pending_payment" && ord.status !== "paid" && (
                          <span className="text-gray-400 font-semibold text-[11px]">Selesai</span>
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
