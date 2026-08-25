"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  QrCode,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Scan,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "@/i18n/navigation";
import { WavyIcon } from "@/components/landing/wavy-icon";
import { apiPost, getAuthToken } from "@/lib/api";

interface ScanResult {
  message: string;
  ticket?: {
    id: number;
    order_id: number;
    event_id: number;
    title: string;
    date: string;
    venue: string;
  };
  error?: string;
  time: string;
}

export default function OrganizerScanPage() {
  const router = useRouter();

  const [qrInput, setQrInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/organizer/login");
      return;
    }
    inputRef.current?.focus();
  }, [router]);

  async function handleValidate(e?: React.FormEvent) {
    if (e) e.preventDefault();
    if (!qrInput.trim()) return;

    setLoading(true);
    const token = qrInput.trim();
    setQrInput("");

    try {
      const res = await apiPost<{
        message: string;
        ticket: {
          id: number;
          order_id: number;
          event_id: number;
          title: string;
          date: string;
          venue: string;
        };
      }>("/organizer/scan/validate", { qr_code: token });

      const successResult: ScanResult = {
        message: res.message || "Tiket Valid",
        ticket: res.ticket,
        time: new Date().toLocaleTimeString("id-ID"),
      };

      setLastResult(successResult);
      setScanHistory((prev) => [successResult, ...prev]);
      toast.success("✓ TIKET VALID — Silakan Masuk!");
    } catch (err: unknown) {
      const errorMsg = (err as Error).message || "QR Code tidak valid atau sudah pernah discan.";
      const failResult: ScanResult = {
        message: "Scan Gagal",
        error: errorMsg,
        time: new Date().toLocaleTimeString("id-ID"),
      };

      setLastResult(failResult);
      setScanHistory((prev) => [failResult, ...prev]);
      toast.error(`❌ ${errorMsg}`);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  return (
    <div className="min-h-screen bg-[#1B1A3A] text-white">
      {/* Top Bar */}
      <header className="border-b border-white/10 bg-black/30 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/organizer/dashboard" className="flex items-center gap-2">
              <WavyIcon size={26} />
              <span className="font-display text-lg font-bold">Wavy Gate Access Scanner</span>
            </Link>
          </div>

          <Link
            href="/organizer/dashboard"
            className="flex items-center gap-1.5 text-xs font-bold text-white/70 hover:text-white"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali ke Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 space-y-8">
        {/* Scanner Input Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-10 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF5470] text-white shadow-lg shadow-[#FF5470]/30 animate-pulse">
              <Scan className="h-8 w-8" />
            </div>
            <h1 className="font-display text-2xl font-extrabold sm:text-3xl">
              Scanner Gerbang Masuk Konser
            </h1>
            <p className="text-xs text-white/70">
              Arahkan scanner barcode/kamera atau ketik token QR Code tiket pengunjung.
            </p>
          </div>

          {/* Form Input for QR Token */}
          <form onSubmit={handleValidate} className="flex gap-2">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-white/20 bg-black/40 px-4 py-3 shadow-inner focus-within:border-[#FF5470]">
              <QrCode className="h-5 w-5 text-[#FF5470]" />
              <input
                ref={inputRef}
                type="text"
                value={qrInput}
                onChange={(e) => setQrInput(e.target.value)}
                placeholder="Scan / Tempelkan token QR Code tiket di sini..."
                className="w-full bg-transparent font-mono text-xs text-white outline-none placeholder:text-white/40"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !qrInput.trim()}
              className="rounded-2xl bg-[#FF5470] px-6 py-3 text-xs font-bold text-white shadow-lg transition-all hover:brightness-110 disabled:opacity-50"
            >
              {loading ? "Memvalidasi..." : "Validasi"}
            </button>
          </form>

          {/* Result Card Display */}
          {lastResult && (
            <div
              className={`rounded-3xl p-6 border text-left transition-all ${
                lastResult.ticket
                  ? "bg-emerald-500/10 border-emerald-500/40 text-emerald-300"
                  : "bg-red-500/10 border-red-500/40 text-red-300"
              }`}
            >
              <div className="flex items-center gap-3">
                {lastResult.ticket ? (
                  <CheckCircle2 className="h-8 w-8 text-emerald-400 shrink-0" />
                ) : (
                  <XCircle className="h-8 w-8 text-red-400 shrink-0" />
                )}
                <div>
                  <h3 className="font-display text-lg font-bold text-white">
                    {lastResult.ticket ? "✓ TIKET VALID — AKSES DIIZINKAN" : "❌ TIKET DITOLAK"}
                  </h3>
                  <p className="text-xs">{lastResult.ticket ? lastResult.message : lastResult.error}</p>
                </div>
              </div>

              {lastResult.ticket && (
                <div className="mt-4 grid grid-cols-2 gap-3 border-t border-emerald-500/20 pt-4 text-xs text-white">
                  <div>
                    <span className="text-[10px] text-emerald-400/80 block">Event:</span>
                    <strong className="text-sm">{lastResult.ticket.title}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-400/80 block">ID Tiket:</span>
                    <strong className="font-mono text-sm">#{lastResult.ticket.id}</strong>
                  </div>
                  <div className="col-span-2">
                    <span className="text-[10px] text-emerald-400/80 block">Lokasi:</span>
                    <span>{lastResult.ticket.venue}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Scan History */}
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h2 className="font-display text-sm font-bold">Riwayat Scan Sesi Ini</h2>
            <span className="text-xs text-white/50">{scanHistory.length} scan tercatat</span>
          </div>

          {scanHistory.length === 0 ? (
            <p className="text-center py-6 text-xs text-white/40">Belum ada aktivitas scan pada sesi ini.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {scanHistory.map((h, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-xl bg-black/20 p-3 text-xs border border-white/5"
                >
                  <div className="flex items-center gap-2">
                    {h.ticket ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-400" />
                    )}
                    <span className="font-bold">{h.ticket ? h.ticket.title : h.error}</span>
                  </div>
                  <span className="font-mono text-[10px] text-white/50">{h.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
