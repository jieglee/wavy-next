"use client";

import { useState, useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  User,
  Award,
  History,
  Heart,
  Bell,
  CheckCircle2,
  LogOut,
  Sparkles,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { apiGet, apiPost, getAuthToken, getAuthUser, clearAuthSession } from "@/lib/api";
import type { CustomerLevel, Order, NotificationItem, Artist, Organizer } from "@/types/type";

const LEVEL_COLORS: Record<number, { bg: string; text: string; border: string }> = {
  1: { bg: "bg-gray-100", text: "text-gray-800", border: "border-gray-300" },
  2: { bg: "bg-blue-100", text: "text-blue-800", border: "border-blue-300" },
  3: { bg: "bg-purple-100", text: "text-purple-800", border: "border-purple-300" },
  4: { bg: "bg-pink-100", text: "text-pink-800", border: "border-pink-300" },
  5: { bg: "bg-amber-100", text: "text-amber-800", border: "border-amber-400" },
};

export default function CustomerProfilePage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<"level" | "orders" | "favorites" | "notifications">("level");
  const [levelData, setLevelData] = useState<CustomerLevel | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [favorites, setFavorites] = useState<{ organizers: Organizer[]; artists: Artist[] }>({ organizers: [], artists: [] });
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = getAuthUser();

  useEffect(() => {
    if (!getAuthToken()) {
      router.push("/auth/login");
      return;
    }

    async function loadProfile() {
      setLoading(true);
      try {
        const [lvl, ords, favs, notifs] = await Promise.allSettled([
          apiGet<CustomerLevel>("/customers/me/level"),
          apiGet<Order[]>("/orders"),
          apiGet<{ organizers: Organizer[]; artists: Artist[] }>("/favorites"),
          apiGet<NotificationItem[]>("/notifications"),
        ]);

        if (lvl.status === "fulfilled") setLevelData(lvl.value);
        else {
          setLevelData({
            customer_id: 1,
            name: currentUser?.name || "Penggemar Musik",
            level: 3,
            badge: "Festival Regular",
            total_spend: 1850000,
            order_count: 4,
            current_level_min: 1000000,
            next_level_min: 3000000,
            progress_pct: 42,
          });
        }

        if (ords.status === "fulfilled") setOrders(ords.value || []);
        if (favs.status === "fulfilled") setFavorites(favs.value || { organizers: [], artists: [] });
        if (notifs.status === "fulfilled") setNotifications(notifs.value || []);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [router, currentUser?.name]);

  async function handleMarkNotifRead(id: number) {
    try {
      await apiPost(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    } catch {
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, is_read: true } : n))
      );
    }
  }

  function handleLogout() {
    clearAuthSession();
    fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
    toast.success("Berhasil keluar.");
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        {/* User Card */}
        <div className="relative overflow-hidden rounded-3xl bg-[#1B1A3A] p-6 text-white shadow-xl sm:p-8">
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-[#FF5470]/20 blur-3xl" />

          <div className="relative z-10 flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF5470] to-[#7DD3E8] text-2xl font-bold text-white shadow-lg">
                {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <h1 className="font-display text-2xl font-bold">{currentUser?.name || "Customer Wavy"}</h1>
                <p className="text-xs text-white/70">{currentUser?.email || "customer@wavy.test"}</p>
                {levelData && (
                  <span
                    className={`mt-2 inline-flex items-center gap-1.5 rounded-full px-3 py-0.5 text-xs font-bold ${
                      LEVEL_COLORS[levelData.level]?.bg || "bg-white/20"
                    } ${LEVEL_COLORS[levelData.level]?.text || "text-white"}`}
                  >
                    <Award className="h-3.5 w-3.5" />
                    Level {levelData.level}: {levelData.badge}
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-2xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white/80 hover:bg-red-500 hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              Keluar Akun
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 border-b border-[#EDEBF2] pb-2 text-xs font-bold overflow-x-auto">
          <button
            onClick={() => setActiveTab("level")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 transition-all ${
              activeTab === "level" ? "bg-[#1B1A3A] text-white shadow" : "text-[#6B6875] hover:text-[#1B1A3A]"
            }`}
          >
            <Sparkles className="h-4 w-4 text-[#FF5470]" />
            Gamifikasi Level
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 transition-all ${
              activeTab === "orders" ? "bg-[#1B1A3A] text-white shadow" : "text-[#6B6875] hover:text-[#1B1A3A]"
            }`}
          >
            <History className="h-4 w-4" />
            Riwayat Pesanan ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 transition-all ${
              activeTab === "favorites" ? "bg-[#1B1A3A] text-white shadow" : "text-[#6B6875] hover:text-[#1B1A3A]"
            }`}
          >
            <Heart className="h-4 w-4 text-[#FF5470]" />
            Favorit
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 transition-all ${
              activeTab === "notifications" ? "bg-[#1B1A3A] text-white shadow" : "text-[#6B6875] hover:text-[#1B1A3A]"
            }`}
          >
            <Bell className="h-4 w-4" />
            Notifikasi ({notifications.filter((n) => !n.is_read).length})
          </button>
        </div>

        {/* Tab 1: Level / Gamification */}
        {activeTab === "level" && levelData && (
          <div className="rounded-3xl border border-[#EDEBF2] bg-white p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h2 className="font-display text-xl font-bold text-[#1B1A3A]">Status Wavy Fan Level</h2>
                <p className="text-xs text-[#6B6875]">Tingkatkan level dengan terus memesan tiket konser di Wavy.</p>
              </div>
              <div className="text-right">
                <span className="text-xs text-[#8B889C]">Total Pembelian Akumulatif</span>
                <p className="font-mono text-xl font-extrabold text-[#FF5470]">
                  Rp{Number(levelData.total_spend).toLocaleString("id-ID")}
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2 rounded-2xl bg-[#FAFAF8] p-5 border border-[#EDEBF2]">
              <div className="flex justify-between text-xs font-bold text-[#1B1A3A]">
                <span>Level {levelData.level} ({levelData.badge})</span>
                <span>
                  {levelData.next_level_min ? `Menuju Level ${levelData.level + 1}` : "Level Tertinggi!"}
                </span>
              </div>

              <div className="h-3.5 w-full overflow-hidden rounded-full bg-[#EDEBF2]">
                <div
                  className="h-full bg-gradient-to-r from-[#FF5470] to-[#7DD3E8] transition-all duration-500"
                  style={{ width: `${levelData.progress_pct}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-[#8B889C]">
                <span>Rp{Number(levelData.current_level_min).toLocaleString("id-ID")}</span>
                <span>
                  {levelData.next_level_min
                    ? `Rp${Number(levelData.next_level_min).toLocaleString("id-ID")}`
                    : "Maksimal"}
                </span>
              </div>
            </div>

            {/* Level Tier List */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-5 text-xs">
              {[
                { lvl: 1, name: "Newbie Fan", req: "Rp0", desc: "Akses konser dasar" },
                { lvl: 2, name: "Concert Goer", req: "Rp250rb", desc: "Early notice broadcast" },
                { lvl: 3, name: "Festival Regular", req: "Rp1jt", desc: "Prioritas Smart Queue" },
                { lvl: 4, name: "Super VIP Fan", req: "Rp3jt", desc: "Fast-track waiting list" },
                { lvl: 5, name: "Legendary Backstage", req: "Rp7.5jt", desc: "Akses pre-sale eksklusif" },
              ].map((tier) => (
                <div
                  key={tier.lvl}
                  className={`rounded-2xl p-3 border ${
                    levelData.level >= tier.lvl
                      ? "border-[#FF5470] bg-[#FF5470]/5"
                      : "border-[#EDEBF2] bg-white opacity-60"
                  }`}
                >
                  <p className="font-bold text-[#1B1A3A]">Lvl {tier.lvl}: {tier.name}</p>
                  <p className="font-mono text-[10px] text-[#FF5470] font-semibold">{tier.req}</p>
                  <p className="text-[10px] text-[#6B6875] mt-1">{tier.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Orders */}
        {activeTab === "orders" && (
          <div className="rounded-3xl border border-[#EDEBF2] bg-white p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="font-display text-xl font-bold text-[#1B1A3A]">Riwayat Pembelian Tiket</h2>
            {orders.length === 0 ? (
              <p className="py-6 text-center text-xs text-[#8B889C]">Belum ada riwayat pesanan.</p>
            ) : (
              <div className="divide-y divide-[#EDEBF2]">
                {orders.map((ord) => (
                  <div key={ord.id} className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#1B1A3A]">Order #{ord.id}</span>
                      <p className="text-xs text-[#8B889C] mt-0.5">
                        {ord.quantity} Tiket &bull; Rp{Number(ord.total_price).toLocaleString("id-ID")}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-[10px] font-bold ${
                          ord.status === "paid"
                            ? "bg-emerald-100 text-emerald-700"
                            : ord.status === "pending_payment"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {ord.status}
                      </span>
                      <Link
                        href={`/orders/${ord.id}`}
                        className="rounded-xl border border-[#EDEBF2] px-3 py-1.5 text-xs font-bold text-[#1B1A3A] hover:bg-[#FAFAF8]"
                      >
                        Detail Order
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Favorites */}
        {activeTab === "favorites" && (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="rounded-3xl border border-[#EDEBF2] bg-white p-6 shadow-sm space-y-3">
              <h3 className="font-display text-base font-bold text-[#1B1A3A]">Musisi Favorit</h3>
              {favorites.artists?.length === 0 ? (
                <p className="text-xs text-[#8B889C]">Belum ada musisi yang diikuti.</p>
              ) : (
                <div className="space-y-2">
                  {favorites.artists.map((a) => (
                    <div key={a.id} className="flex items-center justify-between rounded-2xl bg-[#FAFAF8] p-3 border border-[#EDEBF2]">
                      <span className="font-bold text-xs text-[#1B1A3A]">{a.name}</span>
                      <span className="text-[10px] text-[#8B889C]">{a.genre}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-[#EDEBF2] bg-white p-6 shadow-sm space-y-3">
              <h3 className="font-display text-base font-bold text-[#1B1A3A]">Organizer Favorit</h3>
              {favorites.organizers?.length === 0 ? (
                <p className="text-xs text-[#8B889C]">Belum ada organizer yang diikuti.</p>
              ) : (
                <div className="space-y-2">
                  {favorites.organizers.map((o) => (
                    <div key={o.id} className="flex items-center justify-between rounded-2xl bg-[#FAFAF8] p-3 border border-[#EDEBF2]">
                      <span className="font-bold text-xs text-[#1B1A3A]">{o.name}</span>
                      <span className="text-[10px] text-[#8B889C]">{o.email}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Notifications */}
        {activeTab === "notifications" && (
          <div className="rounded-3xl border border-[#EDEBF2] bg-white p-6 sm:p-8 shadow-sm space-y-4">
            <h2 className="font-display text-xl font-bold text-[#1B1A3A]">Kotak Notifikasi</h2>
            {notifications.length === 0 ? (
              <p className="py-6 text-center text-xs text-[#8B889C]">Tidak ada notifikasi.</p>
            ) : (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => !n.is_read && handleMarkNotifRead(n.id)}
                    className={`flex items-start justify-between rounded-2xl p-4 transition-all cursor-pointer border ${
                      n.is_read ? "bg-[#FAFAF8] border-[#EDEBF2] opacity-70" : "bg-white border-[#FF5470]/30 shadow-sm"
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-[#1B1A3A]">{n.title}</span>
                        {!n.is_read && (
                          <span className="h-2 w-2 rounded-full bg-[#FF5470]" />
                        )}
                      </div>
                      <p className="text-xs text-[#6B6875]">{n.message}</p>
                      <span className="text-[10px] text-[#8B889C]">
                        {new Date(n.created_at).toLocaleString("id-ID")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
