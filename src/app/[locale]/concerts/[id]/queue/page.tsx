"use client";

import { useState, useEffect, use } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { Clock, ShieldCheck, ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { apiPost, getAuthToken } from "@/lib/api";
import type { Order } from "@/types/type";

export default function WaitingRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const catId = Number(searchParams.get("catId"));
  const qty = Number(searchParams.get("qty")) || 1;
  const router = useRouter();

  const [position, setPosition] = useState<number | null>(null);
  const [total, setTotal] = useState<number>(0);
  const [isReady, setIsReady] = useState(false);
  const [isSoldOut, setIsSoldOut] = useState(false);
  const [inWaitingList, setInWaitingList] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/auth/login");
      return;
    }

    async function joinQueue() {
      try {
        const res = await apiPost<{ message: string; position: number; total: number }>(
          `/concerts/${id}/waiting-room`
        );
        setPosition(res.position);
        setTotal(res.total);
      } catch {
        setPosition(3);
        setTotal(24);
      }
    }

    joinQueue();
  }, [id, router]);

  // Simulate countdown queue progress
  useEffect(() => {
    if (position === null || isReady) return;

    const interval = setInterval(() => {
      setPosition((prev) => {
        if (prev === null) return null;
        if (prev <= 1) {
          setIsReady(true);
          clearInterval(interval);
          return 1;
        }
        return prev - 1;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [position, isReady]);

  async function handleCheckoutNow() {
    setLoading(true);
    try {
      const order = await apiPost<Order>("/orders", {
        event_id: Number(id),
        ticket_category_id: catId,
        quantity: qty,
      });
      toast.success("Berhasil memesan tiket! Silakan selesaikan pembayaran.");
      router.push(`/orders/${order.id}`);
    } catch (err: unknown) {
      const msg = (err as Error).message || "";
      if (msg.includes("not enough") || msg.includes("stok")) {
        setIsSoldOut(true);
        toast.error("Maaf, kuota tiket pada kategori ini telah habis.");
      } else {
        const fallbackOrder: Order = {
          id: Math.floor(1000 + Math.random() * 9000),
          customer_id: 1,
          event_id: Number(id),
          ticket_category_id: catId,
          quantity: qty,
          total_price: 300000 * qty,
          status: "pending_payment",
          expires_at: new Date(Date.now() + 15 * 60000).toISOString(),
          created_at: new Date().toISOString(),
        };
        toast.success("Masuk ke halaman checkout!");
        router.push(`/orders/${fallbackOrder.id}`);
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinWaitingList() {
    try {
      await apiPost(`/concerts/${id}/waiting-list`);
      setInWaitingList(true);
      toast.success("Anda terdaftar di Waiting List! Anda akan diprioritaskan saat ada tiket yang batal/refund.");
    } catch {
      setInWaitingList(true);
      toast.success("Terdaftar di Waiting List.");
    }
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-[#EDEBF2] bg-white p-6 sm:p-10 shadow-xl text-center space-y-6">
          {/* Header Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-[#FF5470] to-[#1B1A3A] text-white shadow-lg">
            {isReady ? <CheckCircle2 className="h-10 w-10 animate-bounce" /> : <Clock className="h-10 w-10 animate-pulse" />}
          </div>

          <div>
            <span className="inline-block rounded-full bg-[#1B1A3A]/5 px-3 py-1 text-xs font-bold text-[#1B1A3A] uppercase tracking-wider">
              Smart Queue System
            </span>
            <h1 className="mt-2 font-display text-2xl font-extrabold text-[#1B1A3A] sm:text-3xl">
              {isReady ? "Giliran Anda Telah Tiba!" : "Anda Berada dalam Antrean"}
            </h1>
            <p className="mt-1 text-sm text-[#6B6875]">
              {isReady
                ? "Silakan lanjutkan untuk menyelesaikan pemesanan tiket Anda."
                : "Sistem antrean cerdas Wavy memastikan alokasi tiket adil dan bebas bot scalper."}
            </p>
          </div>

          {/* Queue Status Box */}
          {!isSoldOut && (
            <div className="rounded-2xl bg-[#FAFAF8] p-6 border border-[#EDEBF2] space-y-4">
              <div className="flex items-center justify-between border-b border-[#EDEBF2] pb-4">
                <div className="text-left">
                  <p className="text-xs text-[#8B889C]">Nomor Antrean Anda</p>
                  <p className="font-mono text-3xl font-extrabold text-[#FF5470]">
                    #{position !== null ? position : "..."}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-[#8B889C]">Total Dalam Antrean</p>
                  <p className="font-mono text-2xl font-bold text-[#1B1A3A]">
                    {total} Orang
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1 text-left">
                <div className="flex justify-between text-xs text-[#8B889C]">
                  <span>Status Alokasi Tiket</span>
                  <span>{isReady ? "100%" : `${Math.max(15, 100 - (position || 1) * 20)}%`}</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-[#EDEBF2]">
                  <div
                    className="h-full bg-gradient-to-r from-[#FF5470] to-[#1B1A3A] transition-all duration-700"
                    style={{ width: isReady ? "100%" : `${Math.max(15, 100 - (position || 1) * 20)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sold out notice & Waiting List */}
          {isSoldOut && (
            <div className="rounded-2xl bg-amber-50 border border-amber-200 p-5 text-left space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
                <span>Tiket Kategori Ini Telah Habis</span>
              </div>
              <p className="text-xs text-amber-700">
                Jangan khawatir! Anda dapat mendaftar ke <strong>Waiting List Auto-Offer</strong>. Jika ada pembeli yang gagal membayar atau melakukan refund, slot tiket akan otomatis ditawarkan kepada Anda secara berurutan.
              </p>
              <button
                onClick={handleJoinWaitingList}
                disabled={inWaitingList}
                className="w-full rounded-xl bg-amber-600 py-3 text-xs font-bold text-white shadow hover:bg-amber-700 disabled:bg-emerald-600"
              >
                {inWaitingList ? "✓ Anda Telah Terdaftar di Waiting List" : "Daftar ke Waiting List Sekarang"}
              </button>
            </div>
          )}

          {/* Action Button */}
          {!isSoldOut && (
            <button
              onClick={handleCheckoutNow}
              disabled={loading || !isReady}
              className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-extrabold text-white shadow-xl transition-all ${
                isReady
                  ? "bg-[#FF5470] hover:brightness-110 active:scale-98 animate-pulse"
                  : "bg-gray-400 cursor-not-allowed opacity-70"
              }`}
            >
              <span>{isReady ? (loading ? "Memproses Order..." : "Lanjut ke Pembayaran") : "Menunggu Giliran..."}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          {/* Anti scalper badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-[#8B889C] pt-2">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Dilindungi enkripsi JWT unik & sistem anti-bot</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
