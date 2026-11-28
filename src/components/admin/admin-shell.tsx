"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CalendarDays, LayoutDashboard, LogOut, Mic2, QrCode, ReceiptText } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { WavyIcon } from "@/components/landing/wavy-icon";
import { LocaleToggle } from "@/components/i18n/locale-switcher";
import { cn } from "@/lib/utils";
import { adminGet } from "@/lib/admin-session";
import { useApiResource } from "@/hooks/use-api-resource";
import { useAdminSession, useAdminUnauthorized } from "@/hooks/use-admin-session";

const NAV = [
  { href: "/admin/dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/admin/events", key: "events", icon: CalendarDays },
  { href: "/admin/orders", key: "orders", icon: ReceiptText },
  { href: "/admin/scan", key: "scan", icon: QrCode },
  { href: "/admin/artists", key: "artists", icon: Mic2 },
] as const;

// Shell portal admin (DESIGN §4): sidebar kiri di desktop, bottom nav di mobile.
export function AdminShell({ children }: { children: ReactNode }) {
  const t = useTranslations("Admin");
  const pathname = usePathname();
  const session = useAdminSession();
  // profil dari GET /admin/me (bukan hanya data login yang tersimpan); 401 -> ke login admin
  const me = useApiResource(session.ready ? "admin-me" : null, () => adminGet<{ id: number; name: string; email: string }>("/admin/me"));
  useAdminUnauthorized(me.error);
  const adminName = me.data?.name || me.data?.email || session.name || session.email;
  const isActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <div className="flex min-h-dvh bg-surface">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col justify-between border-r border-border bg-background p-4 md:flex">
        <div className="space-y-6">
          <Link href="/" className="flex items-center gap-2 px-2 pt-2">
            <WavyIcon size={28} />
            <span className="font-display text-lg font-bold tracking-tight text-foreground">{t("brand")}</span>
          </Link>

          <div className="rounded-xl border border-border bg-surface px-3 py-2">
            <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{t("role")}</p>
            {me.loading && !adminName ? (
              <div className="mt-1 h-4 w-24 animate-pulse rounded bg-muted" aria-hidden />
            ) : (
              <p className="truncate text-sm font-semibold text-foreground">{adminName || "—"}</p>
            )}
          </div>

          <nav aria-label={t("navLabel")} className="space-y-1">
            {NAV.map(({ href, key, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
                  isActive(href) ? "bg-foreground text-background" : "text-muted-foreground hover:bg-surface hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                <span className="min-w-0 flex-1 truncate">{t(`nav.${key}`)}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 px-3">
            <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{t("language")}</span>
            <LocaleToggle />
          </div>
          <button
          type="button"
          onClick={session.logout}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          {t("logout")}
        </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <WavyIcon size={22} />
            <span className="font-display font-bold text-foreground">{t("brand")}</span>
          </Link>
          <div className="flex min-w-0 items-center gap-2">
            <LocaleToggle className="shrink-0" />
            <span className="hidden truncate text-xs font-medium text-muted-foreground min-[400px]:inline">{adminName}</span>
            <button
              type="button"
              onClick={session.logout}
              aria-label={t("logout")}
              className="rounded-lg p-2 text-destructive hover:bg-destructive/10"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </header>

        <main className="mx-auto w-full max-w-7xl flex-1 px-4 pb-28 pt-6 sm:px-6 md:pb-10 lg:px-8">{children}</main>
      </div>

      <nav
        aria-label={t("navLabel")}
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        {NAV.map(({ href, key, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            aria-current={isActive(href) ? "page" : undefined}
            className={cn("flex flex-col items-center gap-1 py-2 text-[11px] font-medium", isActive(href) ? "text-primary" : "text-muted-foreground")}
          >
            <Icon className="h-5 w-5" />
            <span className="max-w-full truncate px-1">{t(`navShort.${key}`)}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
