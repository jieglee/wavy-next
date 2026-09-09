"use client";

import { useState, useEffect, useRef } from "react";
import { Search, LayoutGrid, Ticket, User, LogOut, Calendar } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { WavyIcon } from "@/components/landing/wavy-icon";
import { getAuthToken, getAuthUser, clearAuthSession } from "@/lib/api";
import SearchDropdown from "@/components/nav/search-dropdown";
import AnimatedSearchPlaceholder from "@/components/nav/animated-search-placeholder";

const NAVY = "#1B1A3A";
const PINK = "#FF5470";

export default function AppNavbar() {
  const t = useTranslations("AppNav");
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<{ name?: string; email?: string } | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchWrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (token) setCurrentUser(getAuthUser());
  }, []);

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
    <header className="sticky top-0 z-50 border-b border-[#EDEBF2] bg-white/95 backdrop-blur-md">
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
          href="/tickets"
          className="ml-auto flex shrink-0 items-center gap-1.5 text-sm font-medium text-[#6B6875] transition-colors hover:text-[#1B1A3A] md:ml-0"
        >
          <Ticket className="h-4 w-4" style={{ color: PINK }} />
          {t("myTickets")}
        </Link>

        <div ref={menuRef} className="relative shrink-0">
          <button
            onClick={() => setUserOpen(!userOpen)}
            className="flex items-center gap-2 rounded-full border border-[#EDEBF2] bg-[#FAFAF8] px-3.5 py-1.5 text-sm font-semibold text-[#1B1A3A] transition-colors hover:border-[#FF5470]/40"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#1B1A3A] text-xs text-white">
              {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
            </div>
            <span className="hidden max-w-[100px] truncate md:inline">
              {currentUser?.name || currentUser?.email || "Wavy"}
            </span>
          </button>

          {userOpen && (
            <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-2xl border border-[#EDEBF2] bg-white py-1 shadow-2xl">
              <div className="border-b border-[#EDEBF2] px-4 py-2.5">
                <p className="truncate text-sm font-bold text-[#1B1A3A]">{currentUser?.name}</p>
                <p className="truncate text-xs text-[#8B889C]">{currentUser?.email}</p>
              </div>

              <Link
                href="/me"
                onClick={() => setUserOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-[#1B1A3A] hover:bg-[#FAFAF8]"
              >
                <User className="h-4 w-4 text-[#FF5470]" />
                {t("profileLevel")}
              </Link>

              <Link
                href="/tickets"
                onClick={() => setUserOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-[#1B1A3A] hover:bg-[#FAFAF8]"
              >
                <Ticket className="h-4 w-4 text-[#1B1A3A]" />
                {t("myTickets")}
              </Link>

              <Link
                href="/organizer/dashboard"
                onClick={() => setUserOpen(false)}
                className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-[#1B1A3A] hover:bg-[#FAFAF8]"
              >
                <Calendar className="h-4 w-4 text-[#1B1A3A]" />
                {t("organizerPortal")}
              </Link>

              <div className="mt-1 border-t border-[#EDEBF2] pt-1">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center gap-2.5 px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
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
