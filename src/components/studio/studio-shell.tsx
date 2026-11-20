"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { CalendarDays, LayoutDashboard, LogOut, Mic2, QrCode, ReceiptText } from "lucide-react";
import { Link, usePathname } from "@/i18n/navigation";
import { WavyIcon } from "@/components/landing/wavy-icon";
import { cn } from "@/lib/utils";
import { useOrganizerSession } from "@/hooks/use-organizer-session";

const NAV = [
  { href: "/organizer/dashboard", key: "dashboard", icon: LayoutDashboard },
  { href: "/organizer/events", key: "events", icon: CalendarDays },
  { href: "/organizer/orders", key: "orders", icon: ReceiptText },
  { href: "/organizer/scan", key: "scan", icon: QrCode },
  { href: "/organizer/artists", key: "artists", icon: Mic2 },
] as const;

// Shell Creator Studio (DESIGN §4): sidebar kiri di desktop, bottom nav di mobile.
export function StudioShell({ children }: { children: ReactNode }) {
  const t = useTranslations("Studio");
  const pathname = usePathname();
  const session = useOrganizerSession();
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
            <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              {t("organizer")}
            </p>
            <p className="truncate text-sm font-semibold text-foreground">{session.name || "—"}</p>
          </div>

          <nav aria-label={t("navLabel")} className="space-y-1">
            {NAV.map(({ href, key, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                aria-current={isActive(href) ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors duration-150",
                  isActive(href)
                    ? "bg-foreground text-background"
                    : "text-muted-foreground hover:bg-surface hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {t(`nav.${key}`)}
              </Link>
            ))}
          </nav>
        </div>

        <button
          type="button"
          onClick={session.logout}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          {t("logout")}
        </button>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur md:hidden">
          <Link href="/" className="flex items-center gap-2">
            <WavyIcon size={22} />
            <span className="font-display font-bold text-foreground">{t("brand")}</span>
          </Link>
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-xs font-medium text-muted-foreground">{session.name}</span>
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
            className={cn(
              "flex flex-col items-center gap-1 py-2 text-[11px] font-medium",
              isActive(href) ? "text-primary" : "text-muted-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            <span className="max-w-full truncate px-1">{t(`navShort.${key}`)}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}

/** Header halaman studio: judul display + aksi utama di kanan. */
export function StudioPageHeader({
  title,
  description,
  actions,
  back,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  back?: ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {back}
        <h1 className="font-display text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
