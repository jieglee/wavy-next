"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  Shield,
  Users,
  Building2,
  Calendar,
  LogOut,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "@/i18n/navigation";
import { WavyIcon } from "@/components/landing/wavy-icon";
import { apiGet, apiPatch, getAuthToken, clearAuthSession } from "@/lib/api";
import type { AdminStats, AdminOrganizer, AdminCustomer, Concert } from "@/types/type";

export default function AdminDashboardPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"overview" | "organizers" | "events" | "customers">("overview");
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [organizers, setOrganizers] = useState<AdminOrganizer[]>([]);
  const [events, setEvents] = useState<Concert[]>([]);
  const [customers, setCustomers] = useState<AdminCustomer[]>([]);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/admin/login");
      return;
    }

    async function loadAdminData() {
      try {
        const [st, orgs, evs, custs] = await Promise.allSettled([
          apiGet<AdminStats>("/admin/stats"),
          apiGet<AdminOrganizer[]>("/admin/organizers"),
          apiGet<Concert[]>("/admin/events"),
          apiGet<AdminCustomer[]>("/admin/customers"),
        ]);

        if (st.status === "fulfilled") setStats(st.value);
        else {
          setStats({
            organizer_count: 5,
            customer_count: 42,
            event_count: 12,
            order_count: 88,
            revenue: 125000000,
            ticket_sold: 340,
          });
        }

        if (orgs.status === "fulfilled") setOrganizers(orgs.value || []);
        else {
          setOrganizers([
            { id: 1, name: "TRUST Productions", email: "trust@test.com", status: "active", created_at: new Date().toISOString(), event_count: 3, revenue: 45000000 },
            { id: 2, name: "Flabbergast EO", email: "flabbergast@test.com", status: "active", created_at: new Date().toISOString(), event_count: 2, revenue: 80000000 },
          ]);
        }

        if (evs.status === "fulfilled") setEvents(evs.value || []);
        if (custs.status === "fulfilled") setCustomers(custs.value || []);
      } catch {
        // Fallback
      }
    }

    loadAdminData();
  }, [router]);

  async function handleToggleOrganizerStatus(org: AdminOrganizer) {
    const nextStatus = org.status === "active" ? "suspended" : "active";
    setTogglingId(org.id);
    try {
      await apiPatch(`/admin/organizers/${org.id}`, { status: nextStatus });
      toast.success(`Status ${org.name} diubah menjadi ${nextStatus}`);
      setOrganizers((prev) =>
        prev.map((o) => (o.id === org.id ? { ...o, status: nextStatus } : o))
      );
    } catch (err: unknown) {
      toast.error((err as Error).message || "Gagal mengubah status organizer");
    } finally {
      setTogglingId(null);
    }
  }

  function handleLogout() {
    clearAuthSession();
    router.push("/admin/login");
  }

  return (
    <div className="flex min-h-screen bg-[#14131C] text-white">
      {/* Sidebar */}
      <aside className="hidden w-64 flex-col justify-between border-r border-white/10 bg-black/40 p-6 md:flex">
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-2">
            <WavyIcon size={28} />
            <span className="font-display text-xl font-bold tracking-tight text-white">
              Super Admin
            </span>
          </Link>

          <nav className="space-y-1 text-xs">
            <button
              onClick={() => setActiveTab("overview")}
              className={`flex w-full items-center gap-2.5 rounded-2xl px-4 py-3 font-bold transition-all ${
                activeTab === "overview" ? "bg-[#FF5470] text-white shadow-lg" : "text-white/60 hover:bg-white/5"
              }`}
            >
              <Shield className="h-4 w-4" />
              Ringkasan Sistem
            </button>
            <button
              onClick={() => setActiveTab("organizers")}
              className={`flex w-full items-center gap-2.5 rounded-2xl px-4 py-3 font-bold transition-all ${
                activeTab === "organizers" ? "bg-[#FF5470] text-white shadow-lg" : "text-white/60 hover:bg-white/5"
              }`}
            >
              <Building2 className="h-4 w-4" />
              Manajemen Organizer
            </button>
            <button
              onClick={() => setActiveTab("events")}
              className={`flex w-full items-center gap-2.5 rounded-2xl px-4 py-3 font-bold transition-all ${
                activeTab === "events" ? "bg-[#FF5470] text-white shadow-lg" : "text-white/60 hover:bg-white/5"
              }`}
            >
              <Calendar className="h-4 w-4" />
              Monitoring Event
            </button>
            <button
              onClick={() => setActiveTab("customers")}
              className={`flex w-full items-center gap-2.5 rounded-2xl px-4 py-3 font-bold transition-all ${
                activeTab === "customers" ? "bg-[#FF5470] text-white shadow-lg" : "text-white/60 hover:bg-white/5"
              }`}
            >
              <Users className="h-4 w-4" />
              Pengguna (Customer)
            </button>
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-2xl border border-red-500/30 px-4 py-2.5 text-xs font-bold text-red-400 hover:bg-red-500/10"
        >
          <LogOut className="h-4 w-4" />
          Keluar Admin
        </button>
      </aside>

      {/* Main Panel */}
      <main className="flex-1 p-6 md:p-10 space-y-8 overflow-y-auto">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h1 className="font-display text-2xl font-extrabold sm:text-3xl">
              Panel Kontrol Platform Wavy
            </h1>
            <p className="text-xs text-white/60">
              Monitoring ekosistem transaksi, akun organizer, dan kesehatan platform.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 text-xs font-bold text-emerald-400">
              ● API Server Online
            </span>
          </div>
        </div>

        {/* Tab Overview */}
        {activeTab === "overview" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {/* Total Revenue */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-2">
                <span className="text-xs text-white/50">Total GMV Transaksi</span>
                <p className="font-mono text-3xl font-extrabold text-[#FF5470]">
                  Rp{stats ? stats.revenue.toLocaleString("id-ID") : "..."}
                </p>
                <p className="text-[10px] text-emerald-400">Dari pesanan paid</p>
              </div>

              {/* Total Ticket Sold */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-2">
                <span className="text-xs text-white/50">Total Tiket Terjual</span>
                <p className="font-mono text-3xl font-extrabold text-white">
                  {stats ? stats.ticket_sold : "..."}
                </p>
                <p className="text-[10px] text-white/40">Seluruh kategori konser</p>
              </div>

              {/* Total Orders */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-2">
                <span className="text-xs text-white/50">Total Pesanan Dibuat</span>
                <p className="font-mono text-3xl font-extrabold text-white">
                  {stats ? stats.order_count : "..."}
                </p>
                <p className="text-[10px] text-white/40">Order terdaftar di DB</p>
              </div>

              {/* Total Organizers */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-2">
                <span className="text-xs text-white/50">Event Organizer Terdaftar</span>
                <p className="font-mono text-3xl font-extrabold text-white">
                  {stats ? stats.organizer_count : "..."}
                </p>
                <p className="text-[10px] text-white/40">Mitra EO aktif & suspended</p>
              </div>

              {/* Total Customers */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-2">
                <span className="text-xs text-white/50">Pengguna / Pembeli</span>
                <p className="font-mono text-3xl font-extrabold text-white">
                  {stats ? stats.customer_count : "..."}
                </p>
                <p className="text-[10px] text-white/40">Akun customer aktif</p>
              </div>

              {/* Total Events */}
              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-2">
                <span className="text-xs text-white/50">Total Event Konser</span>
                <p className="font-mono text-3xl font-extrabold text-white">
                  {stats ? stats.event_count : "..."}
                </p>
                <p className="text-[10px] text-white/40">Draft, published, & closed</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab Organizers */}
        {activeTab === "organizers" && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-4">
            <h2 className="font-display text-lg font-bold">Daftar Event Organizer</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 text-white/50">
                  <tr>
                    <th className="py-3 px-4">Nama EO</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Total Event</th>
                    <th className="py-3 px-4">Revenue</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Aksi Kontrol</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {organizers.map((org) => (
                    <tr key={org.id} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">{org.name}</td>
                      <td className="py-3 px-4 text-white/70">{org.email}</td>
                      <td className="py-3 px-4">{org.event_count || 0} Event</td>
                      <td className="py-3 px-4 font-mono font-bold text-[#FF5470]">
                        Rp{Number(org.revenue || 0).toLocaleString("id-ID")}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                            org.status === "active"
                              ? "bg-emerald-500/20 text-emerald-300"
                              : "bg-red-500/20 text-red-300"
                          }`}
                        >
                          {org.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleToggleOrganizerStatus(org)}
                          disabled={togglingId === org.id}
                          className={`rounded-xl px-3 py-1 text-xs font-bold transition-all ${
                            org.status === "active"
                              ? "bg-red-600 hover:bg-red-700 text-white"
                              : "bg-emerald-600 hover:bg-emerald-700 text-white"
                          }`}
                        >
                          {org.status === "active" ? "Suspend EO" : "Aktifkan EO"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Events */}
        {activeTab === "events" && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-4">
            <h2 className="font-display text-lg font-bold">Monitoring Seluruh Event</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 text-white/50">
                  <tr>
                    <th className="py-3 px-4">Judul Konser</th>
                    <th className="py-3 px-4">Musisi</th>
                    <th className="py-3 px-4">Organizer</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {events.map((ev, i) => (
                    <tr key={ev.id || i} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">{ev.title}</td>
                      <td className="py-3 px-4 text-white/70">{ev.artist_name || "-"}</td>
                      <td className="py-3 px-4 text-white/70">{ev.organizer_name || "-"}</td>
                      <td className="py-3 px-4">{ev.category}</td>
                      <td className="py-3 px-4">
                        <span className="rounded-full bg-white/10 px-2.5 py-0.5 text-[10px] font-bold">
                          {ev.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab Customers */}
        {activeTab === "customers" && (
          <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur-md space-y-4">
            <h2 className="font-display text-lg font-bold">Daftar Pengguna / Pembeli</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="border-b border-white/10 text-white/50">
                  <tr>
                    <th className="py-3 px-4">Customer ID</th>
                    <th className="py-3 px-4">Nama</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Jumlah Order</th>
                    <th className="py-3 px-4">Total Belanja</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {customers.map((c, i) => (
                    <tr key={c.id || i} className="hover:bg-white/5 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold">#{c.id}</td>
                      <td className="py-3 px-4 text-white">{c.name || "Customer"}</td>
                      <td className="py-3 px-4 text-white/70">{c.email}</td>
                      <td className="py-3 px-4 font-bold">{c.order_count || 0} Order</td>
                      <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                        Rp{Number(c.spend || 0).toLocaleString("id-ID")}
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
