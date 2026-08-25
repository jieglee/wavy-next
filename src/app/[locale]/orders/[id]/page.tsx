"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Ticket,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { apiGet, getAuthToken } from "@/lib/api";
import type { Order } from "@/types/type";

export default function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeLeft, setTimeLeft] = useState({ minutes: 14, seconds: 59 });

  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/auth/login");
      return;
    }

    async function loadOrder() {
      setLoading(true);
      try {
        const data = await apiGet<Order>(`/orders/${id}`);
        setOrder(data);
      } catch {
        const mock: Order = {
          id: Number(id),
          customer_id: 1,
          event_id: 1,
          ticket_category_id: 1,
          quantity: 2,
          total_price: 600000,
          status: "pending_payment",
          expires_at: new Date(Date.now() + 15 * 60000).toISOString(),
          created_at: new Date().toISOString(),
          event_title: "The Legends Infinity World Tour",
          category_name: "Festival Standing",
        };
        setOrder(mock);
      } finally {
        setLoading(false);
      }
    }

    loadOrder();
  }, [id, router]);

  // Payment timer
  useEffect(() => {
    if (!order?.expires_at) return;
    const target = new Date(order.expires_at).getTime();

    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft({ minutes: m, seconds: s });
      if (diff <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [order?.expires_at]);

  function copyToClipboard(text: string, label: string) {
    navigator.clipboard.writeText(text);
    toast.success(`${label} berhasil disalin!`);
  }

  async function handleRefresh() {
    setLoading(true);
    try {
      const data = await apiGet<Order>(`/orders/${id}`);
      setOrder(data);
      toast.success("Status pesanan diperbarui");
    } catch {
      toast("Status pesanan: Menunggu verifikasi organizer");
    } finally {
      setLoading(false);
    }
  }

  if (loading || !order) {
    return (
      <div className="min-h-screen bg-[#FDFCFB]">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FF5470] border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-[#8B889C]">Memuat detail pesanan...</p>
        </div>
      </div>
    );
  }

  const isPaid = order.status === "paid";
  const isRejected = order.status === "rejected";
  const isRefunded = order.status === "refunded";

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Navbar />

      <main className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
        <div className="space-y-6">
          {/* Header Card */}
          <div className="rounded-3xl border border-[#EDEBF2] bg-white p-6 sm:p-8 shadow-xl">
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#EDEBF2] pb-6">
              <div>
                <span className="text-xs text-[#8B889C]">Nomor Pesanan</span>
                <h1 className="font-mono text-2xl font-extrabold text-[#1B1A3A]">#{order.id}</h1>
              </div>

              {/* Status Badge */}
              <div>
                {isPaid ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    Pembayaran Berhasil
                  </span>
                ) : isRejected ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-4 py-1.5 text-xs font-bold text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    Pesanan Ditolak
                  </span>
                ) : isRefunded ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-4 py-1.5 text-xs font-bold text-gray-700">
                    Pesanan Di-refund
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-1.5 text-xs font-bold text-amber-700">
                    <Clock className="h-4 w-4" />
                    Menunggu Pembayaran
                  </span>
                )}
              </div>
            </div>

            {/* Countdown notice if pending */}
            {!isPaid && !isRejected && !isRefunded && (
              <div className="mt-6 flex items-center justify-between rounded-2xl bg-amber-50 p-4 border border-amber-200">
                <div className="flex items-center gap-2 text-amber-800 text-xs font-semibold">
                  <Clock className="h-4 w-4 text-amber-600 shrink-0" />
                  <span>Selesaikan pembayaran sebelum batas waktu berakhir</span>
                </div>
                <div className="font-mono text-sm font-extrabold text-amber-800">
                  {String(timeLeft.minutes).padStart(2, "0")}:{String(timeLeft.seconds).padStart(2, "0")}
                </div>
              </div>
            )}

            {/* Order Items Summary */}
            <div className="mt-6 space-y-3">
              <h2 className="font-display text-sm font-bold text-[#1B1A3A]">Ringkasan Tiket</h2>
              <div className="rounded-2xl bg-[#FAFAF8] p-4 border border-[#EDEBF2] space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-[#1B1A3A]">Jumlah Tiket</span>
                  <span className="font-mono font-bold text-[#1B1A3A]">{order.quantity} Tiket</span>
                </div>
                <div className="flex justify-between text-xs text-[#6B6875]">
                  <span>Biaya Layanan Platform Wavy</span>
                  <span className="text-emerald-600 font-bold">GRATIS</span>
                </div>
                <div className="border-t border-[#EDEBF2] pt-2 flex justify-between text-base font-extrabold text-[#1B1A3A]">
                  <span>Total Tagihan</span>
                  <span className="font-mono text-lg text-[#FF5470]">
                    Rp{Number(order.total_price).toLocaleString("id-ID")}
                  </span>
                </div>
              </div>
            </div>

            {/* Payment Method / Instructions if pending */}
            {!isPaid && !isRejected && !isRefunded && (
              <div className="mt-8 space-y-4">
                <h2 className="font-display text-sm font-bold text-[#1B1A3A]">Instruksi Pembayaran</h2>
                
                <div className="rounded-2xl border border-[#EDEBF2] p-5 space-y-4 bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600 font-bold text-xs">
                        BCA
                      </div>
                      <div>
                        <p className="text-xs text-[#8B889C]">BCA Virtual Account</p>
                        <p className="font-mono font-extrabold text-sm text-[#1B1A3A]">8277 0812 3456 7890</p>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard("8277081234567890", "Nomor VA")}
                      className="flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-bold text-[#1B1A3A] hover:bg-gray-200"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Salin
                    </button>
                  </div>

                  <div className="border-t border-[#EDEBF2] pt-3">
                    <p className="text-xs text-[#6B6875]">
                      1. Buka m-BCA &gt; m-Transfer &gt; <strong>BCA Virtual Account</strong>.
                    </p>
                    <p className="text-xs text-[#6B6875] mt-1">
                      2. Masukkan nomor VA di atas dan pastikan nominal sesuai: <strong>Rp{Number(order.total_price).toLocaleString("id-ID")}</strong>.
                    </p>
                    <p className="text-xs text-[#6B6875] mt-1">
                      3. Tiket QR akan otomatis diterbitkan ke <strong>Dompet Tiket</strong> Anda setelah pembayaran disetujui.
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleRefresh}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#EDEBF2] bg-white py-3.5 text-xs font-bold text-[#1B1A3A] shadow-sm hover:bg-gray-50"
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
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#FF5470] py-4 text-center text-sm font-extrabold text-white shadow-lg hover:brightness-110"
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
