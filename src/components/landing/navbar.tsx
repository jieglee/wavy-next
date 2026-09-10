"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Handshake, Globe, ChevronDown, User, Ticket, LogOut, Shield, Calendar } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { WavyIcon } from "@/components/landing/wavy-icon";
import { getAuthToken, getAuthRole, getAuthUser, clearAuthSession } from "@/lib/api";
import CategoryDropdown from "@/components/nav/category-dropdown";
import SearchDropdown from "@/components/nav/search-dropdown";
import AnimatedSearchPlaceholder from "@/components/nav/animated-search-placeholder";

const NAVY = "#1B1A3A";
const PINK = "#FF5470";
const WAVY_BLUE = "#FF5470";

export default function Navbar({ sticky = true }: { sticky?: boolean }) {
  const t = useTranslations("Navbar");
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const [langOpen, setLangOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name?: string; email?: string } | null>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
  const langRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    function onDown(e: MouseEvent) {
      const target = e.target as Node;
      if (catRef.current && !catRef.current.contains(target)) setCatOpen(false);
      if (searchWrapRef.current && !searchWrapRef.current.contains(target)) setSearchOpen(false);
      if (langRef.current && !langRef.current.contains(target)) setLangOpen(false);
      if (userRef.current && !userRef.current.contains(target)) setUserOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setCatOpen(false);
        setSearchOpen(false);
        setLangOpen(false);
        setUserOpen(false);
      }
    }
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  function switchLocale(nextLocale: string) {
    router.replace(pathname, { locale: nextLocale });
    setLangOpen(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchOpen(false);
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

  const showBackdrop = catOpen || searchOpen;

  return (
    <>
      {showBackdrop && (
        <button
          aria-label="Close dropdown"
          onClick={() => { setCatOpen(false); setSearchOpen(false); }}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity"
        />
      )}
      <header className={`${sticky ? "sticky top-0 z-50" : "relative z-50"} border-b border-[#EDEBF2] bg-white/95 backdrop-blur-md`}>
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-4 sm:gap-6 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <WavyIcon size={26} />
          <span className="font-display text-xl font-bold tracking-tight" style={{ color: NAVY }}>
            Wavy
          </span>
        </Link>

        <div ref={catRef} className="relative hidden shrink-0 sm:block">
          <button
            type="button"
            onClick={() => {
              setCatOpen((v) => !v);
              setLangOpen(false);
              setUserOpen(false);
              setSearchOpen(false);
            }}
            aria-expanded={catOpen}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-base font-bold transition-colors ${catOpen ? "bg-[#EFF6FF] ring-1 ring-[#DBEAFE]" : "hover:opacity-70"}`}
            style={{ color: "#1B1A3A" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" style={{ color: "#1B1A3A" }}>
              <path d="M0 0h24v24H0z" fill="none" />
              <path fill="currentColor" d="m12 2l-5.5 9h11zm0 3.84L13.93 9h-3.87zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5s4.5-2.01 4.5-4.5s-2.01-4.5-4.5-4.5m0 7a2.5 2.5 0 0 1 0-5a2.5 2.5 0 0 1 0 5M3 21.5h8v-8H3zm2-6h4v4H5z" />
            </svg>
            {t("kategori")}
          </button>
          {catOpen && (
            <div className="absolute left-0 top-full z-50 mt-3">
              <CategoryDropdown onSelect={() => setCatOpen(false)} />
            </div>
          )}
        </div>

        <div ref={searchWrapRef} className="relative mx-auto flex w-full max-w-xl">
          <form
            onSubmit={handleSearch}
            className="relative flex w-full items-center gap-2 rounded-full border border-[#EDEBF2] bg-[#FAFAF8] px-4 py-2 transition-colors focus-within:border-[#FF5470]/40 focus-within:bg-white"
          >
            <Search className="relative z-10 h-4 w-4 shrink-0 text-[#8B889C]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              placeholder=""
              aria-label={t("searchPlaceholder")}
              className="relative z-10 w-full bg-transparent text-sm outline-none"
              style={{ color: NAVY }}
            />
            <div className="pointer-events-none absolute inset-0 left-11 flex items-center overflow-hidden pr-4">
              {!searchQuery && <AnimatedSearchPlaceholder active={!searchQuery} />}
            </div>
          </form>
          {searchOpen && (
            <div className="absolute inset-x-0 top-full z-50 mt-3">
              <SearchDropdown query={searchQuery} onSelect={() => setSearchOpen(false)} />
            </div>
          )}
        </div>

        <Link
          href="/organizer/login"
          className="hidden shrink-0 items-center gap-1.5 text-base font-bold transition-colors hover:opacity-70 lg:flex"
          style={{ color: "#1B1A3A" }}
        >
          <Handshake className="h-4 w-4" style={{ color: "#1B1A3A" }} />
          {t("kerjasama")}
        </Link>

        <div ref={langRef} className="relative shrink-0">
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
            <div className="absolute right-0 mt-2 w-32 overflow-hidden rounded-xl border border-[#EDEBF2] bg-white shadow-xl">
              <button
                onClick={() => switchLocale("id")}
                className={`block w-full px-3 py-2 text-left text-sm hover:bg-[#FAFAF8] ${locale === "id" ? "font-medium text-[#1B1A3A]" : "text-[#6B6875]"}`}
              >
                Indonesia
              </button>
              <button
                onClick={() => switchLocale("en")}
                className={`block w-full px-3 py-2 text-left text-sm hover:bg-[#FAFAF8] ${locale === "en" ? "font-medium text-[#1B1A3A]" : "text-[#6B6875]"}`}
              >
                English
              </button>

            </div>
          )}
        </div>

        <div ref={userRef} className="relative shrink-0">
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
              className="flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-bold text-white shadow-sm transition-all hover:brightness-110 active:scale-95"
              style={{ backgroundColor: WAVY_BLUE }}
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
    </>
  );
}
