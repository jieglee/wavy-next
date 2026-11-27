"use client";

import { useTranslations } from "next-intl";
import { Building2, Shield, User } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

const ROLES = [
  { key: "customer", href: "/auth/login", icon: User },
  { key: "organizer", href: "/organizer/login", icon: Building2 },
  { key: "admin", href: "/admin/login", icon: Shield },
] as const;

export type LoginRole = (typeof ROLES)[number]["key"];

/**
 * Pilihan "Masuk sebagai: Pelanggan / Organizer / Admin" di ketiga halaman login.
 * Tiap pilihan adalah tautan ke halaman login role itu (sesi tiap role terpisah).
 */
export function LoginRoleSwitch({ current, className }: { current: LoginRole; className?: string }) {
  const t = useTranslations("Auth.roleSwitch");
  return (
    <nav aria-label={t("label")} className={cn("space-y-1.5", className)}>
      <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">{t("label")}</p>
      <ul className="grid grid-cols-3 gap-1 rounded-lg bg-muted p-1">
        {ROLES.map(({ key, href, icon: Icon }) => {
          const active = key === current;
          return (
            <li key={key} className="min-w-0">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-9 items-center justify-center gap-1.5 rounded-md px-1.5 py-1.5 text-xs font-semibold transition-colors",
                  active ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="hidden h-3.5 w-3.5 shrink-0 min-[400px]:block" aria-hidden />
                <span className="truncate">{t(key)}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
