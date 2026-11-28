"use client";

import { useState, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Search, ChevronDown, User, Ticket, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { WavyIcon } from "@/components/landing/wavy-icon";
import { getAuthToken, getAuthRole, getAuthUser, clearAuthSession } from "@/lib/api";
import CategoryDropdown from "@/components/nav/category-dropdown";
import SearchDropdown from "@/components/nav/search-dropdown";
import AnimatedSearchPlaceholder from "@/components/nav/animated-search-placeholder";
import { LocaleMenu, LocaleToggle } from "@/components/i18n/locale-switcher";

const NAVY = "var(--foreground)";
const PINK = "var(--primary)";
const WAVY_BLUE = "var(--primary)";

export default function Navbar({ sticky = true, hideUser = false }: { sticky?: boolean; hideUser?: boolean } = {}) {
  const t = useTranslations("Navbar");
  const pathname = usePathname();
  const router = useRouter();

  const [userOpen, setUserOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name?: string; email?: string } | null>(null);
  const [currentRole, setCurrentRole] = useState<string | null>(null);
  const catRef = useRef<HTMLDivElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);
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
      if (userRef.current && !userRef.current.contains(target)) setUserOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setCatOpen(false);
        setSearchOpen(false);
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

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearchOpen(false);
    // di /concerts, kategori & negara yang sedang aktif tetap dipakai bersama kata kunci baru
    const params = new URLSearchParams();
    if (pathname === "/concerts") {
      const current = new URLSearchParams(window.location.search);
      for (const k of ["category", "country"]) {
        const v = current.get(k);
        if (v) params.set(k, v);
      }
    }
    if (searchQuery.trim()) params.set("q", searchQuery.trim());
    const qs = params.toString();
    if (pathname === "/concerts") {
      // halaman /concerts mengambil data sendiri dari URL; History API cukup dan langsung terasa
      window.history.pushState(null, "", `${window.location.pathname}${qs ? `?${qs}` : ""}`);
    } else {
      router.push(`/concerts${qs ? `?${qs}` : ""}`);
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
      <AnimatePresence>
        {showBackdrop && (
          <motion.button
            key="nav-backdrop"
            aria-label={t("closeMenu")}
            onClick={() => { setCatOpen(false); setSearchOpen(false); }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 z-40 cursor-default bg-foreground/25 backdrop-blur-[2px]"
          />
        )}
      </AnimatePresence>
      <header className={`${sticky ? "sticky top-0 z-50" : "relative z-50"} border-b border-border bg-white/95 backdrop-blur-md`}>
      <div className="mx-auto grid h-auto max-w-7xl grid-cols-[1fr_auto_auto] items-center gap-x-2 gap-y-2 px-3 py-2.5 sm:flex sm:h-[72px] sm:flex-nowrap sm:gap-4 sm:px-6 sm:py-0 sm:gap-x-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <WavyIcon size={26} />
          <span className="font-display text-xl font-bold tracking-tight" style={{ color: NAVY }}>
            Wavy
          </span>
        </Link>

        {/* Di bawah lg panel diposisikan terhadap header (lebar penuh) supaya tidak keluar layar;
            mulai lg menempel di bawah tombol. */}
        <div ref={catRef} className="shrink-0 max-sm:col-start-3 max-sm:row-start-1 max-sm:justify-self-end lg:relative">
          <button
            type="button"
            onClick={() => {
              setCatOpen((v) => !v);
              setUserOpen(false);
              setSearchOpen(false);
            }}
            aria-expanded={catOpen}
            aria-haspopup="dialog"
            aria-label={t("kategori")}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-base font-bold transition-colors ${catOpen ? "bg-info-subtle ring-1 ring-info/20" : "hover:opacity-70"}`}
            style={{ color: "var(--foreground)" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" style={{ color: "var(--foreground)" }}>
              <path d="M0 0h24v24H0z" fill="none" />
              <path fill="currentColor" d="m12 2l-5.5 9h11zm0 3.84L13.93 9h-3.87zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5s4.5-2.01 4.5-4.5s-2.01-4.5-4.5-4.5m0 7a2.5 2.5 0 0 1 0-5a2.5 2.5 0 0 1 0 5M3 21.5h8v-8H3zm2-6h4v4H5z" />
            </svg>
            <span className="hidden sm:inline">{t("kategori")}</span>
          </button>
          <AnimatePresence>
            {catOpen && (
              <motion.div
                key="category-panel"
                initial={{ opacity: 0, y: -6, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.985 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
                className="absolute inset-x-3 top-full z-50 mt-2 origin-top sm:inset-x-6 lg:inset-x-auto lg:left-0 lg:mt-3 lg:w-[880px] lg:origin-top-left"
              >
                <CategoryDropdown onSelect={() => setCatOpen(false)} onClose={() => setCatOpen(false)} />
              </motion.div>
            )}
          </AnimatePresence>
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

        <LocaleMenu onOpen={() => setUserOpen(false)} />

        {!hideUser && (
        <div ref={userRef} className="relative shrink-0">
          {currentUser ? (
            <button
              onClick={() => setUserOpen(!userOpen)}
              aria-haspopup="menu"
              aria-expanded={userOpen}
              aria-label={t("accountMenu")}
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
                <p className="text-xs text-muted-foreground/80">{t("signedInAs")}</p>
                <p className="truncate text-sm font-bold text-foreground">{currentUser?.email}</p>
                <span className="mt-1 inline-block rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase">
                  {currentRole === "customer" ? t("roleCustomer") : currentRole}
                </span>
              </div>

              <Link
                href="/tickets"
                onClick={() => setUserOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface"
              >
                <Ticket className="h-4 w-4 text-primary" />
                {t("tickets")}
              </Link>

              <Link
                href="/me"
                onClick={() => setUserOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface"
              >
                <User className="h-4 w-4 text-foreground" />
                {t("profile")}
              </Link>

              <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-2.5">
                <span className="text-xs text-muted-foreground">{t("language")}</span>
                <LocaleToggle />
              </div>

              <div className="border-t border-border pt-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm font-semibold text-destructive hover:bg-destructive/5"
                >
                  <LogOut className="h-4 w-4" />
                  {t("logout")}
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
