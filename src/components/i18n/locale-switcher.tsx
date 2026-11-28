"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ChevronDown, Globe } from "lucide-react";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

type Locale = (typeof routing.locales)[number];

/**
 * Ganti bahasa lewat route locale (/id/... ↔ /en/...). next-intl menyimpan pilihan di cookie NEXT_LOCALE
 * (1 tahun, lihat i18n/routing.ts), jadi kunjungan berikutnya ke "/" atau "/admin" ikut bahasa ini.
 * Query string halaman (filter, pencarian) dipertahankan.
 */
function useSwitchLocale() {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();
  const switchTo = (next: Locale) =>
    startTransition(() => {
      const search = typeof window !== "undefined" ? window.location.search : "";
      router.replace(`${pathname}${search}`, { locale: next, scroll: false });
    });
  return { switchTo, pending };
}

/** Tombol segmented ID | EN — dipakai di menu user, /me, shell admin, dan halaman login. */
export function LocaleToggle({ className, tone = "default" }: { className?: string; tone?: "default" | "onDark" }) {
  const t = useTranslations("Locale");
  const locale = useLocale() as Locale;
  const { switchTo, pending } = useSwitchLocale();
  return (
    <div
      role="radiogroup"
      aria-label={t("label")}
      aria-busy={pending || undefined}
      className={cn("inline-flex rounded-lg border p-0.5", tone === "onDark" ? "border-background/30" : "border-border", className)}
    >
      {routing.locales.map((l) => {
        const active = l === locale;
        return (
          <button
            key={l}
            type="button"
            role="radio"
            aria-checked={active}
            lang={l}
            title={t(`name.${l}`)}
            disabled={pending}
            onClick={() => !active && switchTo(l)}
            className={cn(
              "min-w-9 rounded-md px-2 py-1 font-mono text-[11px] font-semibold uppercase transition-colors disabled:opacity-60",
              active
                ? tone === "onDark"
                  ? "bg-background text-foreground"
                  : "bg-foreground text-background"
                : tone === "onDark"
                  ? "text-background/80 hover:text-background"
                  : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t(`short.${l}`)}
          </button>
        );
      })}
    </div>
  );
}

/** Dropdown bahasa (ikon globe) untuk navbar publik. */
export function LocaleMenu({ className, onOpen }: { className?: string; onOpen?: () => void }) {
  const t = useTranslations("Locale");
  const locale = useLocale() as Locale;
  const { switchTo } = useSwitchLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  return (
    <div ref={ref} className={cn("relative shrink-0", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("label")}
        onClick={() => {
          setOpen((v) => !v);
          onOpen?.();
        }}
        className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <Globe className="h-4 w-4" />
        {t(`short.${locale}`)}
        <ChevronDown className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div role="menu" className="absolute right-0 z-50 mt-2 w-36 overflow-hidden rounded-xl border border-border bg-background shadow-xl">
          {routing.locales.map((l) => (
            <button
              key={l}
              type="button"
              role="menuitemradio"
              aria-checked={l === locale}
              lang={l}
              onClick={() => {
                setOpen(false);
                if (l !== locale) switchTo(l);
              }}
              className={cn(
                "block w-full px-3 py-2 text-left text-sm hover:bg-surface",
                l === locale ? "font-medium text-foreground" : "text-muted-foreground"
              )}
            >
              {t(`name.${l}`)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
