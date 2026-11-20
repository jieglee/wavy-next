"use client";

import { useEffect } from "react";
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
import { apiGet, getAuthToken, clearAuthSession } from "@/lib/api";
import { useTranslations } from "next-intl";
import { useApiResource } from "@/hooks/use-api-resource";
import { useAuthToken, useAuthUser } from "@/hooks/use-auth-session";
import { AsyncContent } from "@/components/states/async-states";
import type { OrganizerDashboardStats } from "@/types/type";

export default function OrganizerDashboardPage() {
  const router = useRouter();

  const tDash = useTranslations("OrganizerDashboard");
  const authed = !!useAuthToken();
  const statsRes = useApiResource(authed ? "organizer-dashboard" : null, () =>
    apiGet<OrganizerDashboardStats>("/organizer/dashboard")
  );

  // dibaca via useSyncExternalStore -> tidak ada hydration mismatch
  const currentOrg = useAuthUser<{ id?: number; name?: string; email?: string }>();

  useEffect(() => {
    if (!getAuthToken()) router.push("/organizer/login");
  }, [router]);

  function handleLogout() {
    clearAuthSession();
    router.push("/organizer/login");
  }

  return (
    <div className="flex min-h-screen bg-surface">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col justify-between border-r border-border bg-white p-6 md:flex">
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-2">
            <WavyIcon size={28} />
            <span className="font-display text-xl font-bold tracking-tight text-foreground">
              Wavy EO
            </span>
          </Link>

          <div className="rounded-2xl bg-surface p-3 border border-border">
            <p className="text-[10px] text-muted-foreground/80 uppercase font-bold">Event Organizer</p>
            <p className="font-bold text-xs text-foreground truncate">{currentOrg?.name || "Demo Organizer"}</p>
          </div>

          <nav className="space-y-1">
            <Link
              href="/organizer/dashboard"
              className="flex items-center gap-2.5 rounded-2xl bg-foreground px-4 py-2.5 text-xs font-bold text-white shadow-sm"
            >
              <TrendingUp className="h-4 w-4" />
              Dashboard Analitik
            </Link>
            <Link
              href="/organizer/events"
              className="flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-xs font-bold text-muted-foreground hover:bg-surface hover:text-foreground"
            >
              <Calendar className="h-4 w-4" />
              Manajemen Event
            </Link>
            <Link
              href="/organizer/artists"
              className="flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-xs font-bold text-muted-foreground hover:bg-surface hover:text-foreground"
            >
              <Users className="h-4 w-4" />
              Manajemen Artis
            </Link>
            <Link
              href="/organizer/orders"
              className="flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-xs font-bold text-muted-foreground hover:bg-surface hover:text-foreground"
            >
              <ShoppingBag className="h-4 w-4" />
              Pesanan & Verifikasi
            </Link>
            <Link
              href="/organizer/scan"
              className="flex items-center gap-2.5 rounded-2xl px-4 py-2.5 text-xs font-bold text-muted-foreground hover:bg-surface hover:text-foreground"
            >
              <QrCode className="h-4 w-4" />
              Gate Ticket Scanner
            </Link>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-2xl border border-destructive/30 px-4 py-2.5 text-xs font-bold text-destructive hover:bg-destructive/5"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
        {/* Mobile Header */}
        <div className="flex items-center justify-between md:hidden border-b border-border pb-4">
          <Link href="/" className="flex items-center gap-2">
            <WavyIcon size={24} />
            <span className="font-display font-bold text-foreground">Wavy EO</span>
          </Link>
          <div className="flex gap-2">
            <Link href="/organizer/events" className="text-xs font-bold text-foreground">Event</Link>
            <Link href="/organizer/orders" className="text-xs font-bold text-foreground">Order</Link>
            <Link href="/organizer/scan" className="text-xs font-bold text-primary">Scanner</Link>
          </div>
        </div>

        {/* Page Title */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-foreground">
              Dashboard Performa Penjualan
            </h1>
            <p className="mt-1 text-xs text-muted-foreground">
              Ringkasan metrik pendapatan dan data penjualan tiket event Anda secara realtime.
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/organizer/events"
              className="rounded-2xl bg-primary px-5 py-2.5 text-xs font-bold text-white shadow hover:brightness-110"
            >
              + Buat Event Baru
            </Link>
            <Link
              href="/organizer/scan"
              className="rounded-2xl bg-foreground px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-black"
            >
              Buka Scanner Gate
            </Link>
          </div>
        </div>

        {/* Stats Grid — angka asli saja; gagal -> error + coba lagi */}
        <AsyncContent resource={statsRes} loadingRows={2}>
          {(stats) => (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {/* Revenue */}
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground/80 font-semibold">Total Pendapatan Bersih</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/5 text-success">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <p className="font-mono text-2xl font-extrabold text-foreground">
              Rp{stats.revenue.toLocaleString("id-ID")}
            </p>
            <p className="text-[10px] text-success font-bold">100% Bebas Biaya Admin Tersembunyi</p>
          </div>

          {/* Sold Tickets */}
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground/80 font-semibold">Tiket Terjual</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/5 text-primary">
                <Ticket className="h-5 w-5" />
              </div>
            </div>
            <p className="font-mono text-2xl font-extrabold text-foreground">
              {stats.ticket_sold} Tiket
            </p>
            <p className="text-[10px] text-muted-foreground/80">Status: Paid / Terverifikasi</p>
          </div>

          {/* Remaining Tickets */}
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground/80 font-semibold">Sisa Kuota Tiket</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-info-subtle text-info">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="font-mono text-2xl font-extrabold text-foreground">
              {stats.remaining_ticket} Tiket
            </p>
            <p className="text-[10px] text-muted-foreground/80">Tersedia di Semua Kategori</p>
          </div>

          {/* Peak Hour */}
          <div className="rounded-3xl border border-border bg-white p-6 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground/80 font-semibold">Jam Puncak War Tiket</span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary-glow/10 text-primary-glow">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <p className="font-mono text-2xl font-extrabold text-foreground">
              {`${String(stats.peak_purchase_hour).padStart(2, "0")}:00 WIB`}
            </p>
            <p className="text-[10px] text-primary-glow font-bold">Kategori Terpopuler: {stats.popular_category || tDash("noData")}</p>
          </div>
        </div>
          )}
        </AsyncContent>

        {/* Quick Management Links Banner */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Link
            href="/organizer/events"
            className="flex items-center justify-between rounded-3xl border border-border bg-white p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div>
              <h3 className="font-bold text-sm text-foreground">Kelola Event & Tiket</h3>
              <p className="text-xs text-muted-foreground mt-1">Buat draft, atur harga, dan publish konser.</p>
            </div>
            <ArrowRight className="h-5 w-5 text-primary" />
          </Link>

          <Link
            href="/organizer/orders"
            className="flex items-center justify-between rounded-3xl border border-border bg-white p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div>
              <h3 className="font-bold text-sm text-foreground">Verifikasi Pembayaran</h3>
              <p className="text-xs text-muted-foreground mt-1">Approve pesanan pending & terbitkan QR tiket.</p>
            </div>
            <ArrowRight className="h-5 w-5 text-primary" />
          </Link>

          <Link
            href="/organizer/scan"
            className="flex items-center justify-between rounded-3xl border border-border bg-white p-6 shadow-sm transition-all hover:border-primary/40 hover:shadow-md"
          >
            <div>
              <h3 className="font-bold text-sm text-foreground">Scanner Validasi Gate</h3>
              <p className="text-xs text-muted-foreground mt-1">Scan QR token tiket pengunjung saat masuk.</p>
            </div>
            <ArrowRight className="h-5 w-5 text-primary" />
          </Link>
        </div>
      </main>
    </div>
  );
}
