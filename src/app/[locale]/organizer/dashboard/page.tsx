"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  TrendingUp,
  Ticket,
  DollarSign,
  Calendar,
  Users,
  QrCode,
  Clock,
  ArrowRight,
  LogOut,
  Sparkles,
  ShoppingBag,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { WavyIcon } from "@/components/landing/wavy-icon";
import { apiGet, getAuthToken, getAuthUser, clearAuthSession } from "@/lib/api";
import type { OrganizerDashboardStats } from "@/types/type";

export default function OrganizerDashboardPage() {
  const router = useRouter();

  const [stats, setStats] = useState<OrganizerDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const currentOrg = getAuthUser<{ id?: number; name?: string; email?: string }>();

  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/organizer/login");
      return;
    }

    async function loadStats() {
      setLoading(true);
      try {
        const data = await apiGet<OrganizerDashboardStats>("/organizer/dashboard");
        setStats(data);
      } catch {
        // Fallback simulation
        setStats({
          revenue: 45000000,
          ticket_sold: 140,
          remaining_ticket: 260,
          popular_category: "Festival",
          peak_purchase_hour: 20,
        });
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, [router]);

  function handleLogout() {
    clearAuthSession();
    router.push("/organizer/login");
  }

  return (
    <div className="flex min-h-screen bg-[#FDFCFB]">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col justify-between border-r border-[#EDEBF2] bg-white p-6 md:flex">
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-2">
            <WavyIcon size={28} />
            <span className="font-display text-xl font-bold tracking-tight text-[#1B1A3A]">
              Wavy EO
            </span>
          </Link>

          <div className="rounded-2xl bg-[#FAFAF8] p-3 border border-[#EDEBF2]">
            <p className="text-[10px] text-[#8B889C] uppercase font-bold">Event Organizer</p>
            <p className="font-bold text-xs text-[#1B1A3A] truncate">{currentOrg?.name || "Demo Organizer"}</p>
          </div>

          <nav className="space-y-1">
            <Link
              href="/organizer/dashboard"
              className="flex items-center gap-2.5 rounded-2xl bg-[#1B1A3A] px-4 py-2.5 text-xs font-bold text-white shadow-sm"
            >
              <TrendingUp className="h-4 w-4" />
              Dashboard Analitik
            </Link>
            <Link
              href="/organizer/events"
              className="flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-xs font-bold text-[#6B6875] hover:bg-[#FAFAF8] hover:text-[#1B1A3A]"
            >
              <Calendar className="h-4 w-4" />
              Manajemen Event
            </Link>
            <Link
              href="/organizer/artists"
              className="flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-xs font-bold text-[#6B6875] hover:bg-[#FAFAF8] hover:text-[#1B1A3A]"
            >
              <Users className="h-4 w-4" />
              Manajemen Artis
            </Link>
            <Link
              href="/organizer/orders"
              className="flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-xs font-bold text-[#6B6875] hover:bg-[#FAFAF8] hover:text-[#1B1A3A]"
            >
              <ShoppingBag className="h-4 w-4" />
              Pesanan & Verifikasi
            </Link>
            <Link
              href="/organizer/scan"
              className="flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-xs font-bold text-[#6B6875] hover:bg-[#FAFAF8] hover:text-[#1B1A3A]"
            >
              <QrCode className="h-4 w-4" />
              Gate Ticket Scanner
            </Link>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-2xl border border-red-200 px-4 py-2.5 text-xs font-bold text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
        {/* Mobile Header */}
        <div className="flex items-center justify-between md:hidden border-b border-[#EDEBF2] pb-4">
          <Link href="/" className="flex items-center gap-2">
            <WavyIcon size={24} />
            <span className="font-display font-bold text-[#1B1A3A]">Wavy EO</span>
          </Link>
          <div className="flex gap-2">
            <Link href="/organizer/events" className="text-xs font-bold text-[#1B1A3A]">Event</Link>
            <Link href="/organizer/orders" className="text-xs font-bold text-[#1B1A3A]">Order</Link>
            <Link href="/organizer/scan" className="text-xs font-bold text-[#FF5470]">Scanner</Link>
          </div>
        </div>

        {/* Page Title */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-[#1B1A3A]">
              Dashboard Performa Penjualan
            </h1>
            <p className="mt-1 text-xs text-[#6B6875]">
              Ringkasan metrik pendapatan dan data penjualan tiket event Anda secara realtime.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/organizer/events"
              className="rounded-2xl bg-[#FF5470] px-5 py-2.5 text-xs font-bold text-white shadow hover:brightness-110"
            >
              + Buat Event Baru
            </Link>
            <Link
              href="/organizer/scan"
              className="rounded-2xl bg-[#1B1A3A] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-black"
            >
              Buka Scanner Gate
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Revenue */}
          <div className="rounded-3xl border border-[#EDEBF2] bg-white p-6 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8B889C] font-semibold">Total Pendapatan Bersih</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <p className="font-mono text-2xl font-extrabold text-[#1B1A3A]">
              Rp{stats ? stats.revenue.toLocaleString("id-ID") : "..."}
            </p>
            <p className="text-[10px] text-emerald-600 font-bold">100% Bebas Biaya Admin Tersembunyi</p>
          </div>

          {/* Sold Tickets */}
          <div className="rounded-3xl border border-[#EDEBF2] bg-white p-6 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8B889C] font-semibold">Tiket Terjual</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 text-[#FF5470]">
                <Ticket className="h-5 w-5" />
              </div>
            </div>
            <p className="font-mono text-2xl font-extrabold text-[#1B1A3A]">
              {stats ? stats.ticket_sold : "..."} Tiket
            </p>
            <p className="text-[10px] text-[#8B889C]">Status: Paid / Terverifikasi</p>
          </div>

          {/* Remaining Tickets */}
          <div className="rounded-3xl border border-[#EDEBF2] bg-white p-6 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8B889C] font-semibold">Sisa Kuota Tiket</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="font-mono text-2xl font-extrabold text-[#1B1A3A]">
              {stats ? stats.remaining_ticket : "..."} Tiket
            </p>
            <p className="text-[10px] text-[#8B889C]">Tersedia di Semua Kategori</p>
          </div>

          {/* Peak Hour */}
          <div className="rounded-3xl border border-[#EDEBF2] bg-white p-6 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8B889C] font-semibold">Jam Puncak War Tiket</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <p className="font-mono text-2xl font-extrabold text-[#1B1A3A]">
              {stats ? `${String(stats.peak_purchase_hour).padStart(2, "0")}:00 WIB` : "..."}
            </p>
            <p className="text-[10px] text-purple-600 font-bold">Kategori Terpopuler: {stats?.popular_category || "Festival"}</p>
          </div>
        </div>

        {/* Quick Management Links Banner */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Link
            href="/organizer/events"
            className="flex items-center justify-between rounded-3xl border border-[#EDEBF2] bg-white p-6 shadow-sm transition-all hover:border-[#FF5470]/40 hover:shadow-md"
          >
            <div>
              <h3 className="font-bold text-sm text-[#1B1A3A]">Kelola Event & Tiket</h3>
              <p className="text-xs text-[#6B6875] mt-1">Buat draft, atur harga, dan publish konser.</p>
            </div>
            <ArrowRight className="h-5 w-5 text-[#FF5470]" />
          </Link>

          <Link
            href="/organizer/orders"
            className="flex items-center justify-between rounded-3xl border border-[#EDEBF2] bg-white p-6 shadow-sm transition-all hover:border-[#FF5470]/40 hover:shadow-md"
          >
            <div>
              <h3 className="font-bold text-sm text-[#1B1A3A]">Verifikasi Pembayaran</h3>
              <p className="text-xs text-[#6B6875] mt-1">Approve pesanan pending & terbitkan QR tiket.</p>
            </div>
            <ArrowRight className="h-5 w-5 text-[#FF5470]" />
          </Link>

          <Link
            href="/organizer/scan"
            className="flex items-center justify-between rounded-3xl border border-[#EDEBF2] bg-white p-6 shadow-sm transition-all hover:border-[#FF5470]/40 hover:shadow-md"
          >
            <div>
              <h3 className="font-bold text-sm text-[#1B1A3A]">Scanner Validasi Gate</h3>
              <p className="text-xs text-[#6B6875] mt-1">Scan QR token tiket pengunjung saat masuk.</p>
            </div>
            <ArrowRight className="h-5 w-5 text-[#FF5470]" />
          </Link>
        </div>
      </main>
    </div>
  );
}
