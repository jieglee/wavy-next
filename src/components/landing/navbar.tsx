"use client";

import { useState } from "react";
import { Search, LayoutGrid, Handshake, Globe, ChevronDown, User } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { WavyIcon } from "@/components/landing/wavy-icon";

const NAVY = "#1B1A3A";
const PINK = "#FF5470";

export default function Navbar() {
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [langOpen, setLangOpen] = useState(false);

  function switchLocale(nextLocale: string) {
    router.replace(pathname, { locale: nextLocale });
    setLangOpen(false);
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#EDEBF2] bg-white">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-6 px-6">
        {/* Logo + nama */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <WavyIcon size={26} />
          <span className="font-brand text-xl tracking-tight" style={{ color: NAVY }}>
            Wavy
          </span>
        </Link>

        {/* Kategori */}
        <button
          className="flex shrink-0 items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-70"
          style={{ color: NAVY }}
        >
          <LayoutGrid className="h-4 w-4" style={{ color: PINK }} />
          {t("kategori")}
        </button>

        {/* Search — tengah, jadi fokus utama */}
        <div className="mx-auto flex w-full max-w-xl items-center gap-2 rounded-full border border-[#EDEBF2] bg-[#FAFAF8] px-4 py-2.5 transition-colors focus-within:border-[#FF5470]/40 focus-within:bg-white">
          <Search className="h-4 w-4 shrink-0 text-[#8B889C]" />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            className="w-full bg-transparent text-sm outline-none placeholder:text-[#8B889C]"
            style={{ color: NAVY }}
          />
        </div>

        {/* Kerjasama */}
        <button className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-[#6B6875] transition-colors hover:text-[#1B1A3A] lg:flex">
          <Handshake className="h-4 w-4" />
          {t("kerjasama")}
        </button>

        {/* Bahasa */}
        <div className="relative shrink-0">
          <button
            onClick={() => setLangOpen(!langOpen)}
            className="flex items-center gap-1 text-sm font-medium text-[#6B6875] transition-colors hover:text-[#1B1A3A]"
          >
            <Globe className="h-4 w-4" />
            {locale === "id" ? "ID" : "EN"}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {langOpen && (
            <div className="absolute right-0 mt-2 w-28 overflow-hidden rounded-lg border border-[#EDEBF2] bg-white shadow-lg">
              <button
                onClick={() => switchLocale("id")}
                className="block w-full px-3 py-2 text-left text-sm font-medium text-[#1B1A3A] hover:bg-[#FAFAF8]"
              >
                Indonesia
              </button>
              <button
                onClick={() => switchLocale("en")}
                className="block w-full px-3 py-2 text-left text-sm text-[#6B6875] hover:bg-[#FAFAF8]"
              >
                English
              </button>
            </div>
          )}
        </div>

        {/* Akun */}
        <Link
          href="/auth/login"
          className="flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white transition-colors hover:brightness-110"
          style={{ backgroundColor: NAVY }}
        >
          <User className="h-3.5 w-3.5" />
          {t("akun")}
        </Link>
      </div>
    </header>
  );
}
