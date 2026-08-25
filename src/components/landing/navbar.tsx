"use client";

import { useState, useEffect } from "react";
import { Search, LayoutGrid, Handshake, Globe, ChevronDown, User, Ticket, LogOut, Shield, Calendar } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { WavyIcon } from "@/components/landing/wavy-icon";
import { getAuthToken, getAuthRole, getAuthUser, clearAuthSession } from "@/lib/api";

const NAVY = "#1B1A3A";
const PINK = "#FF5470";

export default function Navbar() {
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentUser, setCurrentUser] = useState<{ name?: string; email?: string } | null>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const token = getAuthToken();
      if (token) {
        setCurrentUser(getAuthUser());
        setCurrentRole(getAuthRole() || "customer");
      } else {
        setCurrentUser(null);
        setCurrentRole(null);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [pathname]);

  function switchLocale(nextLocale: string) {
    router.replace(pathname, { locale: nextLocale });
    setLangOpen(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/concerts?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/concerts");
    }
  }

  function handleLogout() {
    clearAuthSession();
    fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
    setCurrentUser(null);
    setCurrentRole(null);
    setUserOpen(false);
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-[#EDEBF2] bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-4 sm:gap-6 sm:px-6">
        {/* Logo + nama */}
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <WavyIcon size={26} />
          <span className="font-display text-xl font-bold tracking-tight" style={{ color: NAVY }}>
            Wavy
          </span>
        </Link>

        {/* Kategori / Jelajah */}
        <Link
          href="/concerts"
          className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-70 sm:flex"
          style={{ color: NAVY }}
        >
          <LayoutGrid className="h-4 w-4" style={{ color: PINK }} />
          {t("kategori")}
        </Link>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="mx-auto flex w-full max-w-xl items-center gap-2 rounded-full border border-[#EDEBF2] bg-[#FAFAF8] px-4 py-2 transition-colors focus-within:border-[#FF5470]/40 focus-within:bg-white"
        >
          <Search className="h-4 w-4 shrink-0 text-[#8B889C]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("searchPlaceholder")}
            className="w-full bg-transparent text-sm outline-none placeholder:text-[#8B889C]"
            style={{ color: NAVY }}
          />
        </form>

        {/* Kerjasama EO */}
        <Link
          href="/organizer/login"
          className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-[#6B6875] transition-colors hover:text-[#1B1A3A] lg:flex"
        >
          <Handshake className="h-4 w-4" />
          {t("kerjasama")}
        </Link>

        {/* Bahasa */}
        <div className="relative shrink-0">
          <button
            onClick={() => {
              setLangOpen(!langOpen);
              setUserOpen(false);
            }}
            className="flex items-center gap-1 text-sm font-medium text-[#6B6875] transition-colors hover:text-[#1B1A3A]"
          >
            <Globe className="h-4 w-4" />
            {locale === "id" ? "ID" : "EN"}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {langOpen && (
            <div className="absolute right-0 mt-2 w-28 overflow-hidden rounded-xl border border-[#EDEBF2] bg-white shadow-xl">
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

        {/* Akun / User Dropdown */}
        <div className="relative shrink-0">
          {currentUser ? (
            <button
              onClick={() => {
                setUserOpen(!userOpen);
                setLangOpen(false);
              }}
              className="flex items-center gap-2 rounded-full border border-[#EDEBF2] bg-[#FAFAF8] px-3.5 py-1.5 text-sm font-semibold text-[#1B1A3A] transition-colors hover:border-[#FF5470]/40"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1B1A3A] text-xs text-white">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
              </div>
              <span className="hidden max-w-[100px] truncate md:inline">{currentUser.name || currentUser.email}</span>
              <ChevronDown className="h-3.5 w-3.5 text-[#6B6875]" />
            </button>
          ) : (
            <Link
              href="/auth/login"
              className="flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-110 active:scale-95"
              style={{ backgroundColor: NAVY }}
            >
              <User className="h-3.5 w-3.5" />
              {t("akun")}
            </Link>
          )}

          {userOpen && (
            <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-[#EDEBF2] bg-white py-1 shadow-2xl">
              <div className="border-b border-[#EDEBF2] px-4 py-2.5">
                <p className="text-xs text-[#8B889C]">Masuk sebagai</p>
                <p className="truncate text-sm font-bold text-[#1B1A3A]">{currentUser?.email}</p>
                <span className="mt-1 inline-block rounded-full bg-[#FF5470]/10 px-2 py-0.5 text-[10px] font-semibold text-[#FF5470] uppercase">
                  {currentRole}
                </span>
              </div>

              <Link
                href="/tickets"
                onClick={() => setUserOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-[#1B1A3A] hover:bg-[#FAFAF8]"
              >
                <Ticket className="h-4 w-4 text-[#FF5470]" />
                Tiket Saya
              </Link>

              <Link
                href="/me"
                onClick={() => setUserOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-[#1B1A3A] hover:bg-[#FAFAF8]"
              >
                <User className="h-4 w-4 text-[#1B1A3A]" />
                Profil & Level
              </Link>

              <Link
                href="/organizer/dashboard"
                onClick={() => setUserOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-[#1B1A3A] hover:bg-[#FAFAF8]"
              >
                <Calendar className="h-4 w-4 text-[#1B1A3A]" />
                Portal Organizer
              </Link>

              <Link
                href="/admin/dashboard"
                onClick={() => setUserOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-[#1B1A3A] hover:bg-[#FAFAF8]"
              >
                <Shield className="h-4 w-4 text-[#1B1A3A]" />
                Portal Admin
              </Link>

              <div className="border-t border-[#EDEBF2] mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
