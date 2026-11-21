"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Handshake, Globe, ChevronDown, User, Ticket, LogOut, Calendar } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { WavyIcon } from "@/components/landing/wavy-icon";
import { getAuthToken, getAuthRole, getAuthUser, clearAuthSession } from "@/lib/api";
import CategoryDropdown from "@/components/nav/category-dropdown";
import SearchDropdown from "@/components/nav/search-dropdown";
import AnimatedSearchPlaceholder from "@/components/nav/animated-search-placeholder";

const NAVY = "var(--foreground)";
const PINK = "var(--primary)";
const WAVY_BLUE = "var(--primary)";

export default function Navbar({ sticky = true, hideUser = false }: { sticky?: boolean; hideUser?: boolean } = {}) {
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
      <header className={`${sticky ? "sticky top-0 z-50" : "relative z-50"} border-b border-border bg-white/95 backdrop-blur-md`}>
      <div className="mx-auto grid h-auto max-w-7xl grid-cols-[1fr_auto_auto] items-center gap-x-2 gap-y-2 px-3 py-2.5 sm:flex sm:h-[72px] sm:flex-nowrap sm:gap-4 sm:px-6 sm:py-0 sm:gap-x-6">
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
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-base font-bold transition-colors ${catOpen ? "bg-info-subtle ring-1 ring-info/20" : "hover:opacity-70"}`}
            style={{ color: "var(--foreground)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" style={{ color: "var(--foreground)" }}>
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

        <div ref={searchWrapRef} className="relative col-span-3 flex w-full max-w-none sm:col-span-1 sm:mx-auto sm:max-w-xl">
          <form
            onSubmit={handleSearch}
            className="relative flex w-full items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 sm:px-4 sm:py-2 transition-colors focus-within:border-primary/40 focus-within:bg-white"
          >
            <Search className="relative z-10 h-4 w-4 shrink-0 text-muted-foreground/80" />
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
              className="relative z-10 w-full bg-transparent text-xs sm:text-sm outline-none"
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
          className="hidden shrink-0 items-center gap-1.5 text-sm font-bold transition-colors hover:opacity-70 sm:flex lg:text-base"
          style={{ color: "var(--foreground)" }}
        >
          <Handshake className="h-4 w-4" style={{ color: "var(--foreground)" }} />
          {t("kerjasama")}
        </Link>

        <div ref={langRef} className="relative shrink-0">
          <button
            onClick={() => {
              setLangOpen(!langOpen);
              setUserOpen(false);
            }}
            className="flex items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <Globe className="h-4 w-4" />
            {locale === "id" ? "ID" : "EN"}
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
          {langOpen && (
            <div className="absolute right-0 mt-2 w-32 overflow-hidden rounded-xl border border-border bg-white shadow-xl">
              <button
                onClick={() => switchLocale("id")}
                className={`block w-full px-3 py-2 text-left text-sm hover:bg-surface ${locale === "id" ? "font-medium text-foreground" : "text-muted-foreground"}`}
              >
                Indonesia
              </button>
              <button
                onClick={() => switchLocale("en")}
                className={`block w-full px-3 py-2 text-left text-sm hover:bg-surface ${locale === "en" ? "font-medium text-foreground" : "text-muted-foreground"}`}
              >
                English
              </button>

            </div>
          )}
        </div>

        {!hideUser && (
        <div ref={userRef} className="relative shrink-0">
          {currentUser ? (
            <button
              onClick={() => {
                setUserOpen(!userOpen);
                setLangOpen(false);
              }}
              className="flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/40"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-xs text-white">
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
              </div>
              <span className="hidden max-w-[100px] truncate md:inline">{currentUser.name || currentUser.email}</span>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
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
            <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-border bg-white py-1 shadow-2xl">
              <div className="border-b border-border px-4 py-2.5">
                <p className="text-xs text-muted-foreground/80">Masuk sebagai</p>
                <p className="truncate text-sm font-bold text-foreground">{currentUser?.email}</p>
                <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase">
                  {currentRole}
                </span>
              </div>

              <Link
                href="/tickets"
                onClick={() => setUserOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface"
              >
                <Ticket className="h-4 w-4 text-primary" />
                Tiket Saya
              </Link>

              <Link
                href="/me"
                onClick={() => setUserOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface"
              >
                <User className="h-4 w-4 text-foreground" />
                Profil & Level
              </Link>

              <Link
                href="/organizer/dashboard"
                onClick={() => setUserOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface"
              >
                <Calendar className="h-4 w-4 text-foreground" />
                Portal Organizer
              </Link>

              <div className="border-t border-border mt-1 pt-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/5"
                >
                  <LogOut className="h-4 w-4" />
                  Keluar
                </button>
              </div>
            </div>
          )}
          </div>
        )}
      </div>
    </header>
    </>
  );
}
