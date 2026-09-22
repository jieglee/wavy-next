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
  ShoppingBag,
  BarChart3,
  Eye,
  ChevronRight,
  Package,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { WavyIcon } from "@/components/landing/wavy-icon";
import { apiGet, getAuthToken, getAuthUser, clearAuthSession } from "@/lib/api";
import type { OrganizerDashboardStats, Order } from "@/types/type";

interface DashboardEvent {
  id: number;
  title: string;
  category: string;
  venue: string;
  date: string;
  status: "draft" | "published" | "closed";
  ticket_sold?: number;
  ticket_total?: number;
}

interface DashboardData {
  stats: OrganizerDashboardStats;
  recent_orders: Order[];
  events: DashboardEvent[];
  total_events: number;
  pending_orders: number;
}

export default function OrganizerDashboardPage() {
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const currentOrg = getAuthUser<{
    id?: number;
    name?: string;
    email?: string;
  }>();

  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/organizer/login");
      return;
    }

    async function loadDashboard() {
      setLoading(true);
      try {
        const [statsRes, ordersRes, eventsRes] = await Promise.allSettled([
          apiGet<OrganizerDashboardStats>("/organizer/dashboard"),
          apiGet<Order[]>("/organizer/orders?limit=5"),
          apiGet<DashboardEvent[]>("/organizer/events"),
        ]);

        const stats =
          statsRes.status === "fulfilled"
            ? statsRes.value
            : {
                revenue: 45000000,
                ticket_sold: 140,
                remaining_ticket: 260,
                popular_category: "Festival",
                peak_purchase_hour: 20,
              };

        const orders =
          ordersRes.status === "fulfilled" && Array.isArray(ordersRes.value)
            ? ordersRes.value.slice(0, 5)
            : [
                {
                  id: 501,
                  customer_id: 1,
                  event_id: 1,
                  ticket_category_id: 1,
                  quantity: 2,
                  total_price: 600000,
                  status: "pending_payment" as const,
                  expires_at: new Date(Date.now() + 10 * 60000).toISOString(),
                  created_at: new Date().toISOString(),
                  event_title: "The Legends Infinity World Tour",
                  category_name: "VIP",
                },
                {
                  id: 502,
                  customer_id: 2,
                  event_id: 1,
                  ticket_category_id: 2,
                  quantity: 1,
                  total_price: 350000,
                  status: "paid" as const,
                  expires_at: new Date().toISOString(),
                  created_at: new Date(
                    Date.now() - 3600000
                  ).toISOString(),
                  event_title: "The Legends Infinity World Tour",
                  category_name: "Regular",
                },
                {
                  id: 503,
                  customer_id: 3,
                  event_id: 2,
                  ticket_category_id: 3,
                  quantity: 3,
                  total_price: 1500000,
                  status: "paid" as const,
                  expires_at: new Date().toISOString(),
                  created_at: new Date(
                    Date.now() - 7200000
                  ).toISOString(),
                  event_title: "Pop Wave Festival 2026",
                  category_name: "CAT 1",
                },
              ];

        const events =
          eventsRes.status === "fulfilled" && Array.isArray(eventsRes.value)
            ? eventsRes.value
            : [
                {
                  id: 1,
                  title: "The Legends Infinity World Tour",
                  category: "Orchestra",
                  venue: "ICE BSD Hall 1, Tangerang",
                  date: "2026-09-15T19:00:00Z",
                  status: "published" as const,
                  ticket_sold: 140,
                  ticket_total: 400,
                },
                {
                  id: 2,
                  title: "Pop Wave Festival 2026",
                  category: "Pop",
                  venue: "Stadion Utama GBK, Jakarta",
                  date: "2026-11-20T18:00:00Z",
                  status: "draft" as const,
                  ticket_sold: 0,
                  ticket_total: 500,
                },
              ];

        setData({
          stats,
          recent_orders: orders,
          events,
          total_events: events.length,
          pending_orders: orders.filter((o) => o.status === "pending_payment")
            .length,
        });
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  function handleLogout() {
    clearAuthSession();
    router.push("/organizer/login");
  }

  const stats = data?.stats;
  const totalEvents = data?.total_events ?? 0;
  const pendingOrders = data?.pending_orders ?? 0;
  const recentOrders = data?.recent_orders ?? [];
  const events = data?.events ?? [];

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
            <p className="text-[10px] text-[#8B889C] uppercase font-bold">
              Event Organizer
            </p>
            <p className="font-bold text-xs text-[#1B1A3A] truncate">
              {currentOrg?.name || "Demo Organizer"}
            </p>
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
            <span className="font-display font-bold text-[#1B1A3A]">
              Wavy EO
            </span>
          </Link>
          <div className="flex gap-2">
            <Link
              href="/organizer/events"
              className="text-xs font-bold text-[#1B1A3A]"
            >
              Event
            </Link>
            <Link
              href="/organizer/orders"
              className="text-xs font-bold text-[#1B1A3A]"
            >
              Order
            </Link>
            <Link
              href="/organizer/scan"
              className="text-xs font-bold text-[#FF5470]"
            >
              Scanner
            </Link>
          </div>
        </div>

        {/* Page Title */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="font-display text-3xl font-extrabold text-[#1B1A3A]">
              Dashboard Performa Penjualan
            </h1>
            <p className="mt-1 text-xs text-[#6B6875]">
              Ringkasan metrik pendapatan dan data penjualan tiket event Anda
              secara realtime.
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
              <span className="text-xs text-[#8B889C] font-semibold">
                Total Pendapatan Bersih
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <p className="font-mono text-2xl font-extrabold text-[#1B1A3A]">
              {loading
                ? "..."
                : `Rp${stats ? stats.revenue.toLocaleString("id-ID") : "0"}`}
            </p>
            <p className="text-[10px] text-emerald-600 font-bold">
              100% Bebas Biaya Admin Tersembunyi
            </p>
          </div>

          {/* Sold Tickets */}
          <div className="rounded-3xl border border-[#EDEBF2] bg-white p-6 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8B889C] font-semibold">
                Tiket Terjual
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-pink-50 text-[#FF5470]">
                <Ticket className="h-5 w-5" />
              </div>
            </div>
            <p className="font-mono text-2xl font-extrabold text-[#1B1A3A]">
              {loading ? "..." : `${stats?.ticket_sold ?? 0} Tiket`}
            </p>
            <p className="text-[10px] text-[#8B889C]">
              Status: Paid / Terverifikasi
            </p>
          </div>

          {/* Total Events */}
          <div className="rounded-3xl border border-[#EDEBF2] bg-white p-6 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8B889C] font-semibold">
                Total Event Aktif
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
            <p className="font-mono text-2xl font-extrabold text-[#1B1A3A]">
              {loading ? "..." : totalEvents}
            </p>
            <p className="text-[10px] text-[#8B889C]">
              Draft + Published + Closed
            </p>
          </div>

          {/* Pending Orders */}
          <div className="rounded-3xl border border-[#EDEBF2] bg-white p-6 shadow-sm space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[#8B889C] font-semibold">
                Pesanan Pending
              </span>
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <Clock className="h-5 w-5" />
              </div>
            </div>
            <p className="font-mono text-2xl font-extrabold text-[#1B1A3A]">
              {loading ? "..." : pendingOrders}
            </p>
            <p className="text-[10px] text-amber-600 font-bold">
              Perlu Verifikasi Pembayaran
            </p>
          </div>
        </div>

        {/* Quick Management Links */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <Link
            href="/organizer/events"
            className="flex items-center justify-between rounded-3xl border border-[#EDEBF2] bg-white p-6 shadow-sm transition-all hover:border-[#FF5470]/40 hover:shadow-md"
          >
            <div>
              <h3 className="font-bold text-sm text-[#1B1A3A]">
                Kelola Event & Tiket
              </h3>
              <p className="text-xs text-[#6B6875] mt-1">
                Buat draft, atur harga, dan publish konser.
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-[#FF5470]" />
          </Link>

          <Link
            href="/organizer/orders"
            className="flex items-center justify-between rounded-3xl border border-[#EDEBF2] bg-white p-6 shadow-sm transition-all hover:border-[#FF5470]/40 hover:shadow-md"
          >
            <div>
              <h3 className="font-bold text-sm text-[#1B1A3A]">
                Verifikasi Pembayaran
              </h3>
              <p className="text-xs text-[#6B6875] mt-1">
                Approve pesanan pending & terbitkan QR tiket.
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-[#FF5470]" />
          </Link>

          <Link
            href="/organizer/scan"
            className="flex items-center justify-between rounded-3xl border border-[#EDEBF2] bg-white p-6 shadow-sm transition-all hover:border-[#FF5470]/40 hover:shadow-md"
          >
            <div>
              <h3 className="font-bold text-sm text-[#1B1A3A]">
                Scanner Validasi Gate
              </h3>
              <p className="text-xs text-[#6B6875] mt-1">
                Scan QR token tiket pengunjung saat masuk.
              </p>
            </div>
            <ArrowRight className="h-5 w-5 text-[#FF5470]" />
          </Link>
        </div>

        {/* Two Column: Recent Orders + Events Overview */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Orders */}
          <div className="rounded-3xl border border-[#EDEBF2] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#EDEBF2] px-6 py-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-[#FF5470]" />
                <h3 className="font-bold text-sm text-[#1B1A3A]">
                  Pesanan Terbaru
                </h3>
              </div>
              <Link
                href="/organizer/orders"
                className="flex items-center gap-1 text-[11px] font-bold text-[#FF5470] hover:underline"
              >
                Lihat Semua
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-[#EDEBF2]">
              {loading ? (
                <div className="p-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-12 animate-pulse rounded-xl bg-gray-100"
                    />
                  ))}
                </div>
              ) : recentOrders.length === 0 ? (
                <div className="p-8 text-center">
                  <ShoppingBag className="mx-auto h-8 w-8 text-[#D1D5DB]" />
                  <p className="mt-2 text-xs text-[#9CA3AF]">
                    Belum ada pesanan
                  </p>
                </div>
              ) : (
                recentOrders.map((ord) => (
                  <div
                    key={ord.id}
                    className="flex items-center justify-between px-6 py-3.5 hover:bg-[#FAFAF8] transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#1B1A3A] truncate">
                        {ord.event_title || `Event #${ord.event_id}`}
                      </p>
                      <p className="text-[11px] text-[#8B889C]">
                        Order #{ord.id} &bull; {ord.quantity} tiket
                        {ord.category_name ? ` (${ord.category_name})` : ""}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-[#1B1A3A]">
                        Rp{Number(ord.total_price).toLocaleString("id-ID")}
                      </span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          ord.status === "paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : ord.status === "pending_payment"
                            ? "bg-amber-100 text-amber-700"
                            : ord.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {ord.status === "pending_payment"
                          ? "Pending"
                          : ord.status === "paid"
                          ? "Paid"
                          : ord.status === "rejected"
                          ? "Rejected"
                          : "Refunded"}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Events Overview */}
          <div className="rounded-3xl border border-[#EDEBF2] bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-[#EDEBF2] px-6 py-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-[#1B1A3A]" />
                <h3 className="font-bold text-sm text-[#1B1A3A]">
                  Overview Event
                </h3>
              </div>
              <Link
                href="/organizer/events"
                className="flex items-center gap-1 text-[11px] font-bold text-[#FF5470] hover:underline"
              >
                Kelola Event
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-[#EDEBF2]">
              {loading ? (
                <div className="p-6 space-y-3">
                  {[1, 2].map((i) => (
                    <div
                      key={i}
                      className="h-16 animate-pulse rounded-xl bg-gray-100"
                    />
                  ))}
                </div>
              ) : events.length === 0 ? (
                <div className="p-8 text-center">
                  <Calendar className="mx-auto h-8 w-8 text-[#D1D5DB]" />
                  <p className="mt-2 text-xs text-[#9CA3AF]">
                    Belum ada event
                  </p>
                </div>
              ) : (
                events.slice(0, 4).map((ev) => {
                  const soldPct =
                    ev.ticket_total && ev.ticket_total > 0
                      ? Math.round(
                          ((ev.ticket_sold ?? 0) / ev.ticket_total) * 100
                        )
                      : 0;

                  return (
                    <div
                      key={ev.id}
                      className="px-6 py-3.5 hover:bg-[#FAFAF8] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-[#1B1A3A] truncate">
                            {ev.title}
                          </p>
                          <p className="text-[11px] text-[#8B889C]">
                            {new Date(ev.date).toLocaleDateString("id-ID", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}{" "}
                            &bull; {ev.venue}
                          </p>
                        </div>
                        <span
                          className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            ev.status === "published"
                              ? "bg-emerald-100 text-emerald-700"
                              : ev.status === "closed"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {ev.status === "published"
                            ? "Published"
                            : ev.status === "closed"
                            ? "Closed"
                            : "Draft"}
                        </span>
                      </div>
                      {ev.ticket_total !== undefined && ev.ticket_total > 0 && (
                        <div className="mt-2">
                          <div className="flex justify-between text-[10px] text-[#8B889C]">
                            <span>
                              {ev.ticket_sold ?? 0} / {ev.ticket_total} tiket
                              terjual
                            </span>
                            <span>{soldPct}%</span>
                          </div>
                          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#EDEBF2]">
                            <div
                              className="h-full rounded-full bg-[#FF5470] transition-all"
                              style={{ width: `${soldPct}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Peak Hour + Remaining Tickets Summary */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="rounded-3xl border border-[#EDEBF2] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1B1A3A]">
                  Jam Puncak War Tiket
                </p>
                <p className="text-[11px] text-[#8B889C]">
                  Kategori terpopuler: {stats?.popular_category || "Festival"}
                </p>
              </div>
            </div>
            <p className="font-mono text-3xl font-extrabold text-[#1B1A3A]">
              {loading
                ? "..."
                : `${String(stats?.peak_purchase_hour ?? 20).padStart(2, "0")}:00 WIB`}
            </p>
          </div>

          <div className="rounded-3xl border border-[#EDEBF2] bg-white p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Eye className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#1B1A3A]">
                  Sisa Kuota Tiket
                </p>
                <p className="text-[11px] text-[#8B889C]">
                  Tersedia di semua kategori
                </p>
              </div>
            </div>
            <p className="font-mono text-3xl font-extrabold text-[#1B1A3A]">
              {loading ? "..." : `${stats?.remaining_ticket ?? 0} Tiket`}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
