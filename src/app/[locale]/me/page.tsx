"use client";

import { useEffect, useState } from "react";
import { useFormatter, useTranslations } from "next-intl";
import { Bell, Heart, History, LogOut, Ticket } from "lucide-react";
import toast from "react-hot-toast";
import { Link, useRouter } from "@/i18n/navigation";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { EmptyState, ErrorState, LoadingState } from "@/components/states/async-states";
import { OrderHistoryList } from "@/components/orders/order-history-list";
import { RingChart } from "@/components/charts/ring-chart";
import { Ring } from "@/components/charts/ring";
import { useApiResource } from "@/hooks/use-api-resource";
import { useAuthToken } from "@/hooks/use-auth-session";
import { ProfileName } from "@/components/profile/profile-name";
import { LocaleToggle } from "@/components/i18n/locale-switcher";
import type { CustomerProfile } from "@/lib/profile";
import { useErrorMessage } from "@/lib/error-message";
import { cn } from "@/lib/utils";
import { apiGet, apiPost, clearAuthSession, getAuthToken } from "@/lib/api";
import type { CustomerLevel, FavoritesResponse, NotificationItem, Order } from "@/types/type";

// Minimal konser (order paid, event berbeda) untuk level 1..5.
// Harus sama dengan customerService.level di wavy-backend.
const LEVEL_THRESHOLDS = [0, 1, 3, 5, 10];

type Tab = "orders" | "favorites" | "notifications";

const tabCls = (active: boolean) =>
  cn(
    "flex shrink-0 items-center gap-1.5 rounded-lg px-4 py-2.5 transition-colors",
    active ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
  );
const panelCls = "rounded-2xl border border-border bg-background p-4 sm:p-8 space-y-4";

export default function CustomerProfilePage() {
  const t = useTranslations("Profile");
  const format = useFormatter();
  const router = useRouter();
  const errorMessage = useErrorMessage();
  const [activeTab, setActiveTab] = useState<Tab>("orders");

  // token null (server / render hidrasi pertama) -> semua resource dianggap loading
  const authed = !!useAuthToken();
  // profil dari GET /me (sumber utama), bukan salinan di localStorage
  const me = useApiResource(authed ? "me-profile" : null, () => apiGet<CustomerProfile>("/me"));

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
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:space-y-8 sm:px-6 sm:py-10 lg:px-8">
        {/* Profil (DESIGN §4 Radial): ring level di tengah, statistik mengelilingi */}
        <section className="rounded-2xl border border-border bg-background p-4 sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary font-display text-xl font-bold text-primary-foreground">
                {(me.data?.name || me.data?.email || "W").charAt(0).toUpperCase()}
              </div>
              {me.loading ? (
                <div className="space-y-2" role="status" aria-busy>
                  <div className="h-6 w-40 animate-pulse rounded bg-muted" />
                  <div className="h-3 w-28 animate-pulse rounded bg-muted" />
                </div>
              ) : me.error !== undefined || !me.data ? (
                <ErrorState error={me.error} onRetry={me.reload} className="border-0 p-0 py-2" />
              ) : (
                <ProfileName profile={me.data} onSaved={(p) => me.mutate(() => p)} />
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{t("language")}</span>
                <LocaleToggle />
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 rounded-lg border border-destructive/30 px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-3.5 w-3.5" />
                {t("logout")}
              </button>
            </div>
          </div>

          <div className="mt-6">
            {level.loading ? (
              <LoadingState />
            ) : level.error || !level.data ? (
              <ErrorState error={level.error} onRetry={level.reload} />
            ) : (
              <LevelRadial data={level.data} orders={orders.data?.length} />
            )}
          </div>
        </section>

        {/* Tab */}
        <div className="scrollbar-hide -mx-4 flex gap-2 overflow-x-auto border-b border-border px-4 pb-2 text-xs font-bold sm:mx-0 sm:px-0">
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

        {/* Riwayat order */}
        {activeTab === "orders" && (
          <section className={panelCls}>
            <h2 className="font-display text-xl font-bold text-foreground">{t("orders.title")}</h2>
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
                  <Link href="/concerts" className="rounded-lg bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:brightness-110">
                    {t("orders.browse")}
                  </Link>
                }
              />
            ) : (
              <div className="space-y-3">
                <OrderHistoryList orders={orders.data.slice(0, 5)} />
                {orders.data.length > 5 && (
                  <Link href="/orders" className="inline-flex text-xs font-bold text-primary hover:underline">
                    {t("orders.all")}
                  </Link>
                )}
              </div>
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
            <FavoriteList
              title={t("favorites.artists")}
              empty={t("favorites.artistsEmpty")}
              items={favorites.data.artists.map((a) => ({ id: a.id, name: a.name, meta: a.genre }))}
            />
          ))}

        {/* Notifikasi */}
        {activeTab === "notifications" && (
          <section className={panelCls}>
            <h2 className="font-display text-xl font-bold text-foreground">{t("notifications.title")}</h2>
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
                        n.read ? "border-border bg-muted opacity-70" : "border-primary/30 bg-background hover:bg-muted"
                      )}
                    >
                      <span className="flex items-center gap-2 text-xs font-bold text-foreground">
                        {n.title}
                        {!n.read && <span className="h-2 w-2 rounded-full bg-primary" aria-label={t("notifications.unread")} />}
                      </span>
                      <span className="block text-xs text-muted-foreground">{n.message}</span>
                      <span className="block font-mono text-[10px] text-muted-foreground">
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

function LevelRadial({ data, orders }: { data: CustomerLevel; orders?: number }) {
  const t = useTranslations("Profile.level");
  const next = LEVEL_THRESHOLDS[data.level]; // threshold level berikutnya (index = level saat ini)
  const max = next ?? Math.max(data.attended_concerts, 1);
  const ring = [{ label: t("ringLabel"), value: Math.min(data.attended_concerts, max), maxValue: max, color: "var(--chart-1)" }];
  const stats = [
    { key: "level", label: t("statLevel"), value: data.level_label },
    { key: "attended", label: t("statAttended"), value: String(data.attended_concerts) },
    { key: "next", label: t("statNext"), value: next === undefined ? t("max") : t("remaining", { count: Math.max(0, next - data.attended_concerts) }) },
    { key: "orders", label: t("statOrders"), value: orders === undefined ? "-" : String(orders) },
  ];
  const tile = (s: (typeof stats)[number]) => (
    <div key={s.key} className="min-w-0 rounded-xl border border-border bg-surface p-4 text-center lg:text-left">
      <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{s.label}</p>
      <p className="mt-1 break-words font-display text-lg font-bold leading-tight tracking-tight text-foreground sm:text-xl">{s.value}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 items-center gap-3 lg:grid-cols-[1fr_auto_1fr] lg:gap-8">
        {/* Pusat ring dirender sendiri: render-prop RingCenter (Bklit) hanya dipakai saat hover,
            jadi tanpa hover ia menampilkan total nilai ("1 Total"), bukan level. */}
        <div className="flex flex-col items-center lg:order-2">
          <div className="relative">
            <RingChart data={ring} size={220} strokeWidth={16} baseInnerRadius={80}>
              <Ring index={0} />
            </RingChart>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{t("center")}</span>
              <span className="font-display text-5xl font-bold tracking-tight text-foreground">{data.level}</span>
              <span className="font-mono text-[11px] text-muted-foreground">
                {next === undefined ? t("attended", { count: data.attended_concerts }) : t("progress", { count: data.attended_concerts, target: next })}
              </span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 lg:order-1 lg:grid-cols-1">{stats.slice(0, 2).map(tile)}</div>
        <div className="grid grid-cols-2 gap-3 lg:order-3 lg:grid-cols-1">{stats.slice(2).map(tile)}</div>
      </div>

      <ol className="grid grid-cols-5 gap-1.5 sm:gap-3" aria-label={t("tiersLabel")}>
        {LEVEL_THRESHOLDS.map((min, i) => {
          const lvl = i + 1;
          const reached = data.level >= lvl;
          return (
            <li
              key={lvl}
              className={cn("rounded-lg border px-1 py-2 text-center sm:p-3", reached ? "border-primary bg-primary/5" : "border-border opacity-60")}
            >
              <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-foreground">{t("tierShort", { level: lvl })}</p>
              <p className="mt-0.5 font-mono text-[10px] text-muted-foreground">{t("tierMin", { count: min })}</p>
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
    <section className="space-y-3 rounded-2xl border border-border bg-background p-4 sm:p-6">
      <h3 className="font-display text-base font-bold text-foreground">{title}</h3>
      {items.length === 0 ? (
        <p className="text-xs text-muted-foreground">{empty}</p>
      ) : (
        <ul className="space-y-2">
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between gap-2 rounded-xl border border-border bg-muted p-3">
              <span className="truncate text-xs font-bold text-foreground">{it.name}</span>
              {it.meta && <span className="shrink-0 text-[10px] text-muted-foreground">{it.meta}</span>}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
