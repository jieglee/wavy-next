"use client";

import { useState, useEffect, useRef } from "react";
import { Search, LayoutGrid, Ticket, User, LogOut } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { WavyIcon } from "@/components/landing/wavy-icon";
import { clearAuthSession } from "@/lib/api";
import { useAuthToken, useAuthUser } from "@/hooks/use-auth-session";
import SearchDropdown from "@/components/nav/search-dropdown";
import AnimatedSearchPlaceholder from "@/components/nav/animated-search-placeholder";

const NAVY = "var(--foreground)";
const PINK = "var(--primary)";

export default function AppNavbar() {
  const t = useTranslations("AppNav");
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  // Read via useSyncExternalStore: no setState in an effect, no hydration mismatch.
  const authToken = useAuthToken();
  const authUser = useAuthUser<{ name?: string; email?: string }>();
  const currentUser = authToken ? authUser : null;
  const menuRef = useRef<HTMLDivElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDown(e: MouseEvent) {
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) setUserOpen(false);
      if (searchWrapRef.current && !searchWrapRef.current.contains(target)) setSearchOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setUserOpen(false);
        setSearchOpen(false);
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
    if (searchQuery.trim()) {
      router.push(`/concerts?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push("/concerts");
    }
  }

  function handleLogout() {
    clearAuthSession();
    fetch("/api/auth/session", { method: "DELETE" }).catch(() => {});
    router.push("/");
  }

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-4 sm:gap-6 sm:px-6">
        <Link href="/home" className="flex shrink-0 items-center gap-2">
          <WavyIcon size={26} />
          <span className="font-display text-xl font-bold tracking-tight" style={{ color: NAVY }}>
            Wavy
          </span>
        </Link>

        <Link
          href="/concerts"
          className="hidden shrink-0 items-center gap-1.5 text-sm font-semibold transition-colors hover:opacity-70 sm:flex"
          style={{ color: NAVY }}
        >
          <LayoutGrid className="h-4 w-4" style={{ color: PINK }} />
          {t("browse")}
        </Link>

        <div ref={searchWrapRef} className="relative mx-auto hidden w-full max-w-xl md:block">
          <form
            onSubmit={handleSearch}
            className="relative flex w-full items-center gap-2 rounded-full border border-border bg-surface px-4 py-2 transition-colors focus-within:border-primary/40 focus-within:bg-white"
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
          href="/tickets"
          className="ml-auto flex shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground md:ml-0"
        >
          <Ticket className="h-4 w-4" style={{ color: PINK }} />
          {t("myTickets")}
        </Link>

        <div ref={menuRef} className="relative shrink-0">
          <button
            onClick={() => setUserOpen(!userOpen)}
            className="flex items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-1.5 text-sm font-semibold text-foreground transition-colors hover:border-primary/40"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-xs text-white">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
            </div>
            <span className="hidden max-w-[100px] truncate md:inline">
              {currentUser?.name || currentUser?.email || "Wavy"}
            </span>
          </button>

          {userOpen && (
            <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-border bg-white py-1 shadow-2xl">
              <div className="border-b border-border px-4 py-2.5">
                <p className="truncate text-sm font-bold text-foreground">{currentUser?.name}</p>
                <p className="truncate text-xs text-muted-foreground/80">{currentUser?.email}</p>
              </div>

              <Link
                href="/me"
                onClick={() => setUserOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface"
              >
                <User className="h-4 w-4 text-primary" />
                {t("profileLevel")}
              </Link>

              <Link
                href="/tickets"
                onClick={() => setUserOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-foreground hover:bg-surface"
              >
                <Ticket className="h-4 w-4 text-foreground" />
                {t("myTickets")}
              </Link>

              <div className="mt-1 border-t border-border pt-1">
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
      </div>
    </header>
  );
}
