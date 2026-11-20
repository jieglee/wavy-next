"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Award, Bell, Heart, History, LogOut, Sparkles, Ticket } from "lucide-react";
import toast from "react-hot-toast";
import { Link, useRouter } from "@/i18n/navigation";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { EmptyState, ErrorState, LoadingState } from "@/components/states/async-states";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";
import { useApiResource } from "@/hooks/use-api-resource";
import { useAuthToken, useAuthUser } from "@/hooks/use-auth-session";
import { useErrorMessage } from "@/lib/error-message";
import { formatIDR } from "@/lib/price";
import { cn } from "@/lib/utils";
import { apiGet, apiPost, clearAuthSession, getAuthToken } from "@/lib/api";
import type { CustomerLevel, FavoritesResponse, NotificationItem, Order } from "@/types/type";

// Minimal konser (order paid, event berbeda) untuk level 1..5.
// Harus sama dengan customerService.level di wavy-backend.
const LEVEL_THRESHOLDS = [0, 1, 3, 5, 10];

type Tab = "level" | "orders" | "favorites" | "notifications";

const tabCls = (active: boolean) =>
  cn(
    "flex shrink-0 items-center gap-1.5 rounded-lg px-4 py-2.5 transition-colors",
    active ? "bg-wavy-text-primary text-white" : "text-wavy-text-secondary hover:text-wavy-text-primary"
  );
const panelCls = "rounded-2xl border border-wavy-border bg-wavy-bg p-4 sm:p-8 space-y-4";

export default function CustomerProfilePage() {
  const t = useTranslations("Profile");
  const format = useFormatter();
  const router = useRouter();
  const errorMessage = useErrorMessage();
  const [activeTab, setActiveTab] = useState<Tab>("level");

  // token null (server / render hidrasi pertama) -> semua resource dianggap loading
  const authed = !!useAuthToken();
  const currentUser = useAuthUser<{ name?: string; email?: string }>();

  const level = useApiResource(authed ? "me-level" : null, () => apiGet<CustomerLevel>("/me/level"));
  const orders = useApiResource(authed ? "orders-history" : null, () => apiGet<Order[]>("/orders/history"));
  const favorites = useApiResource(authed ? "favorites" : null, () => apiGet<FavoritesResponse>("/favorites"));
  const notifications = useApiResource(authed ? "notifications" : null, () =>
    apiGet<NotificationItem[]>("/notifications")
  );

  useEffect(() => {
    if (!getAuthToken()) router.push("/auth/login");
  }, [router]);

  async function handleMarkNotifRead(id: number) {
    try {
      await apiPost(`/notifications/${id}/read`);
      notifications.mutate((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      toast.error(errorMessage(err));
    }
  }

  function handleLogout() {
    clearAuthSession();
    fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
    toast.success(t("loggedOut"));
    router.push("/");
  }

  const unread = notifications.data?.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-wavy-bg">
      <Navbar />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:space-y-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Kartu user */}
        <div className="relative overflow-hidden rounded-2xl bg-wavy-text-primary p-5 text-white sm:p-8">
          <div className="relative z-10 flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
            <div className="flex min-w-0 items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-wavy-accent text-2xl font-bold sm:h-16 sm:w-16">
                {(currentUser?.name || currentUser?.email || "W").charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <h1 className="truncate font-display text-xl font-bold sm:text-2xl">{currentUser?.name || t("defaultName")}</h1>
                {currentUser?.email && <p className="truncate text-xs text-white/70">{currentUser.email}</p>}
                {level.data && (
                  <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-0.5 text-xs font-bold">
                    <Award className="h-3.5 w-3.5" />
                    {t("levelBadge", { level: level.data.level, label: level.data.level_label })}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-xs font-bold text-white/80 hover:bg-white/20"
            >
              <LogOut className="h-3.5 w-3.5" />
              {t("logout")}
            </button>
          </div>
        </div>

        {/* Tab */}
        <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto border-b border-wavy-border px-4 pb-2 text-xs font-bold sm:mx-0 sm:px-0">
          <button onClick={() => setActiveTab("level")} className={tabCls(activeTab === "level")}>
            <Sparkles className="h-4 w-4" />
            {t("tabs.level")}
          </button>
          <button onClick={() => setActiveTab("orders")} className={tabCls(activeTab === "orders")}>
            <History className="h-4 w-4" />
            {t("tabs.orders")}
            {orders.data && ` (${orders.data.length})`}
          </button>
          <button onClick={() => setActiveTab("favorites")} className={tabCls(activeTab === "favorites")}>
            <Heart className="h-4 w-4" />
            {t("tabs.favorites")}
          </button>
          <button onClick={() => setActiveTab("notifications")} className={tabCls(activeTab === "notifications")}>
            <Bell className="h-4 w-4" />
            {t("tabs.notifications")}
            {unread !== undefined && unread > 0 && ` (${unread})`}
          </button>
        </div>

        {/* Level */}
        {activeTab === "level" && (
          <section className={panelCls}>
            <div>
              <h2 className="font-display text-xl font-bold text-wavy-text-primary">{t("level.title")}</h2>
              <p className="text-xs text-wavy-text-secondary">{t("level.subtitle")}</p>
            </div>
            {level.loading ? (
              <LoadingState />
            ) : level.error || !level.data ? (
              <ErrorState error={level.error} onRetry={level.reload} />
            ) : (
              <LevelProgress data={level.data} />
            )}
          </section>
        )}

        {/* Riwayat order */}
        {activeTab === "orders" && (
          <section className={panelCls}>
            <h2 className="font-display text-xl font-bold text-wavy-text-primary">{t("orders.title")}</h2>
            {orders.loading ? (
              <LoadingState rows={3} />
            ) : orders.error || !orders.data ? (
              <ErrorState error={orders.error} onRetry={orders.reload} />
            ) : orders.data.length === 0 ? (
              <EmptyState
                icon={<Ticket className="h-10 w-10" />}
                title={t("orders.emptyTitle")}
                description={t("orders.emptyDescription")}
                action={
                  <Link href="/concerts" className="rounded-lg bg-wavy-accent px-5 py-2 text-xs font-bold text-white hover:brightness-110">
                    {t("orders.browse")}
                  </Link>
                }
              />
            ) : (
              <ul className="divide-y divide-wavy-border">
                {orders.data.map((ord) => (
                  <li key={ord.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <span className="font-mono text-xs font-bold text-wavy-text-primary">{t("orders.orderNumber", { id: ord.id })}</span>
                      <p className="mt-0.5 font-mono text-xs text-wavy-text-secondary">
                        {format.dateTime(new Date(ord.created_at), { dateStyle: "medium", timeStyle: "short" })}
                      </p>
                      <p className="mt-0.5 text-xs text-wavy-text-secondary">
                        {t("orders.summary", { quantity: ord.quantity })} &bull;{" "}
                        <span className="font-mono">{formatIDR(Number(ord.total_price))}</span>
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <OrderStatusBadge status={ord.status} />
                      <Link
                        href={`/orders/${ord.id}`}
                        className="rounded-lg border border-wavy-border px-3 py-1.5 text-xs font-bold text-wavy-text-primary hover:bg-wavy-surface"
                      >
                        {t("orders.detail")}
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}

        {/* Favorit */}
        {activeTab === "favorites" &&
          (favorites.loading ? (
            <LoadingState rows={2} />
          ) : favorites.error || !favorites.data ? (
            <ErrorState error={favorites.error} onRetry={favorites.reload} />
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <FavoriteList
                title={t("favorites.artists")}
                empty={t("favorites.artistsEmpty")}
                items={favorites.data.artists.map((a) => ({ id: a.id, name: a.name, meta: a.genre }))}
              />
              <FavoriteList
                title={t("favorites.organizers")}
                empty={t("favorites.organizersEmpty")}
                items={favorites.data.organizers.map((o) => ({ id: o.id, name: o.name }))}
              />
            </div>
          ))}

        {/* Notifikasi */}
        {activeTab === "notifications" && (
          <section className={panelCls}>
            <h2 className="font-display text-xl font-bold text-wavy-text-primary">{t("notifications.title")}</h2>
            {notifications.loading ? (
              <LoadingState rows={3} />
            ) : notifications.error || !notifications.data ? (
              <ErrorState error={notifications.error} onRetry={notifications.reload} />
            ) : notifications.data.length === 0 ? (
              <EmptyState icon={<Bell className="h-10 w-10" />} title={t("notifications.empty")} />
            ) : (
              <ul className="space-y-2">
                {notifications.data.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      disabled={n.read}
                      onClick={() => handleMarkNotifRead(n.id)}
                      className={cn(
                        "w-full space-y-1 rounded-xl border p-4 text-left transition-colors",
                        n.read ? "border-wavy-border bg-wavy-surface opacity-70" : "border-wavy-accent/30 bg-wavy-bg hover:bg-wavy-surface"
                      )}
                    >
                      <span className="flex items-center gap-2 text-xs font-bold text-wavy-text-primary">
                        {n.title}
                        {!n.read && <span className="h-2 w-2 rounded-full bg-wavy-accent" aria-label={t("notifications.unread")} />}
                      </span>
                      <span className="block text-xs text-wavy-text-secondary">{n.message}</span>
                      <span className="block font-mono text-[10px] text-wavy-text-secondary">
                        {format.dateTime(new Date(n.created_at), { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}

function LevelProgress({ data }: { data: CustomerLevel }) {
  const t = useTranslations("Profile.level");
  const next = LEVEL_THRESHOLDS[data.level]; // threshold level berikutnya (index = level saat ini)
  // sama dengan teks "{count} dari {target} konser"
  const pct = next === undefined ? 100 : Math.min(100, Math.round((data.attended_concerts / next) * 100));

  return (
    <div className="space-y-6">
      <div className="space-y-2 rounded-xl border border-wavy-border bg-wavy-surface p-4 sm:p-5">
        <div className="flex flex-wrap justify-between gap-2 text-xs font-bold text-wavy-text-primary">
          <span>{t("current", { level: data.level, label: data.level_label })}</span>
          <span>{next === undefined ? t("max") : t("toNext", { level: data.level + 1 })}</span>
        </div>
        <div
          className="h-3 w-full overflow-hidden rounded-full bg-wavy-border"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={pct}
        >
          <div className="h-full bg-wavy-accent transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>
        <p className="font-mono text-[11px] text-wavy-text-secondary">
          {next === undefined
            ? t("attended", { count: data.attended_concerts })
            : t("progress", { count: data.attended_concerts, target: next })}
        </p>
      </div>

      <ol className="grid grid-cols-1 gap-3 text-xs sm:grid-cols-5">
        {LEVEL_THRESHOLDS.map((min, i) => {
          const lvl = i + 1;
          const reached = data.level >= lvl;
          return (
            <li
              key={lvl}
              className={cn(
                "rounded-xl border p-3",
                reached ? "border-wavy-accent bg-wavy-accent/5" : "border-wavy-border opacity-60"
              )}
            >
              <p className="font-bold text-wavy-text-primary">{t("tier", { level: lvl })}</p>
              <p className="font-mono text-[10px] font-semibold text-wavy-accent">{t("tierRequirement", { count: min })}</p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function FavoriteList({
  title,
  empty,
  items,
}: {
  title: string;
  empty: string;
  items: { id: number; name: string; meta?: string }[];
}) {
  return (
    <section className="space-y-3 rounded-2xl border border-wavy-border bg-wavy-bg p-4 sm:p-6">
      <h3 className="font-display text-base font-bold text-wavy-text-primary">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-wavy-text-secondary">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between gap-2 rounded-xl border border-wavy-border bg-wavy-surface p-3">
              <span className="truncate text-xs font-bold text-wavy-text-primary">{it.name}</span>
              {it.meta && <span className="shrink-0 text-[10px] text-wavy-text-secondary">{it.meta}</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
