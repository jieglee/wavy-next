"use client";

import { useState, useEffect, use } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { Clock, ShieldCheck, ArrowRight, AlertTriangle, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { ApiError, apiPost, getAuthToken } from "@/lib/api";
import { useErrorMessage } from "@/lib/error-message";
import { ErrorState, LoadingState } from "@/components/states/async-states";
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
  const [joinError, setJoinError] = useState<unknown>(null);
  const [joinNonce, setJoinNonce] = useState(0);
  const errorMessage = useErrorMessage();

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
        setJoinError(null);
      } catch (err: unknown) {
        setJoinError(err);
      }
    }

    joinQueue();
  }, [id, router, joinNonce]);

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
      if (err instanceof ApiError && err.code === "QUOTA_EXCEEDED") setIsSoldOut(true);
      toast.error(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleJoinWaitingList() {
    try {
      await apiPost(`/concerts/${id}/waiting-list`);
      setInWaitingList(true);
      toast.success("Anda terdaftar di Waiting List! Anda akan diprioritaskan saat ada tiket yang batal/refund.");
    } catch (err: unknown) {
      toast.error(errorMessage(err));
    }
  }

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
        <div className="rounded-3xl border border-border bg-white p-6 sm:p-10 shadow-xl text-center space-y-6">
          {/* Header Icon */}
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-primary to-foreground text-white shadow-lg">
            {isReady ? <CheckCircle2 className="h-10 w-10 animate-bounce" /> : <Clock className="h-10 w-10 animate-pulse" />}
          </div>

          <div>
            <span className="inline-block rounded-full bg-foreground/5 px-3 py-1 text-xs font-bold text-foreground uppercase tracking-wider">
              Smart Queue System
            </span>
            <h1 className="mt-2 font-display text-2xl font-extrabold text-foreground sm:text-3xl">
              {isReady ? "Giliran Anda Telah Tiba!" : "Anda Berada dalam Antrean"}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {isReady
                ? "Silakan lanjutkan untuk menyelesaikan pemesanan tiket Anda."
                : "Sistem antrean cerdas Wavy memastikan alokasi tiket adil dan bebas bot scalper."}
            </p>
          </div>

          {joinError !== null && (
            <ErrorState error={joinError} onRetry={() => { setJoinError(null); setJoinNonce((n) => n + 1); }} />
          )}
          {joinError === null && position === null && <LoadingState />}

          {/* Queue Status Box */}
          {!isSoldOut && joinError === null && position !== null && (
            <div className="rounded-2xl bg-surface p-6 border border-border space-y-4">
              <div className="flex items-center justify-between border-b border-border pb-4">
                <div className="text-left">
                  <p className="text-xs text-muted-foreground/80">Nomor Antrean Anda</p>
                  <p className="font-mono text-3xl font-extrabold text-primary">
                    #{position !== null ? position : "..."}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground/80">Total Dalam Antrean</p>
                  <p className="font-mono text-2xl font-bold text-foreground">
                    {total} Orang
                  </p>
                </div>
              </div>

              {/* Progress bar */}
              <div className="space-y-1 text-left">
                <div className="flex justify-between text-xs text-muted-foreground/80">
                  <span>Status Alokasi Tiket</span>
                  <span>{isReady ? "100%" : `${Math.max(15, 100 - (position || 1) * 20)}%`}</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-border">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-foreground transition-all duration-700"
                    style={{ width: isReady ? "100%" : `${Math.max(15, 100 - (position || 1) * 20)}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Sold out notice & Waiting List */}
          {isSoldOut && (
            <div className="rounded-2xl bg-warning/5 border border-warning/30 p-5 text-left space-y-3">
              <div className="flex items-center gap-2 text-warning font-bold text-sm">
                <AlertTriangle className="h-5 w-5 text-warning shrink-0" />
                <span>Tiket Kategori Ini Telah Habis</span>
              </div>
              <p className="text-xs text-warning">
                Jangan khawatir! Anda dapat mendaftar ke <strong>Waiting List Auto-Offer</strong>. Jika ada pembeli yang gagal membayar atau melakukan refund, slot tiket akan otomatis ditawarkan kepada Anda secara berurutan.
              </p>
              <button
                onClick={handleJoinWaitingList}
                disabled={inWaitingList}
                className="w-full rounded-xl bg-warning py-3 text-xs font-bold text-white shadow hover:bg-warning/90 disabled:bg-success"
              >
                {inWaitingList ? "✓ Anda Telah Terdaftar di Waiting List" : "Daftar ke Waiting List Sekarang"}
              </button>
            </div>
          )}

          {/* Action Button */}
          {!isSoldOut && joinError === null && (
            <button
              onClick={handleCheckoutNow}
              disabled={loading || !isReady}
              className={`w-full flex items-center justify-center gap-2 rounded-2xl py-4 text-sm font-extrabold text-white shadow-xl transition-all ${
                isReady
                  ? "bg-primary hover:brightness-110 active:scale-98 animate-pulse"
                  : "bg-muted-foreground/70 cursor-not-allowed opacity-70"
              }`}
            >
              <span>{isReady ? (loading ? "Memproses Order..." : "Lanjut ke Pembayaran") : "Menunggu Giliran..."}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          )}

          {/* Anti scalper badge */}
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground/80 pt-2">
            <ShieldCheck className="h-4 w-4 text-success" />
            <span>Dilindungi enkripsi JWT unik & sistem anti-bot</span>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
