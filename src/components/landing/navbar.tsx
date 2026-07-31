"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

const links = [
  { label: "Cari Konser", href: "featured" },
  { label: "Smart Queue", href: "how-it-works" },
  { label: "Tentang", href: "about" },
];

const WavyIcon = ({ size = 24 }: { size?: number }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    role="img"
    aria-label="Wavy logo"
    className="shrink-0 text-wavy-accent"
  >
    <path d="M0 0h24v24H0z" fill="none" />
    <g fill="currentColor" fillRule="evenodd" clipRule="evenodd">
      <path d="M4.86 9.782a1.93 1.93 0 0 0-1.227-.739c-.1-.18-.17-.37-.28-.549c-.4-.699-.848-1.368-1.248-2.067c0 0-.18-.18-.32-.34h.29c.375-.115.77-.149 1.158-.1a.92.92 0 0 1 .5.32l.34.5l.398.758a.38.38 0 0 0 .5.2a.38.38 0 0 0 .19-.5l-.32-.838l-.34-.659a1.84 1.84 0 0 0-.928-.779a4.1 4.1 0 0 0-1.588-.13q-.482.01-.948.13c-.255.08-.472.25-.61.48a.75.75 0 0 0 0 .689q.296.518.65.998c.549.689 1.138 1.348 1.677 1.997c-.3.17-.998.25-1.328 1.048a1.48 1.48 0 0 0 .11 1.278a1.83 1.83 0 0 0 1.248 1.139a2.28 2.28 0 0 0 1.568-.41a1.647 1.647 0 0 0 .509-2.426M3.684 11.12a1.16 1.16 0 0 1-.7.26c-.289 0-.419-.29-.498-.42s-.21-.36-.12-.519c.187-.304.472-.537.808-.659c.3 0 1.408.869.51 1.338m9.414 3.015a9 9 0 0 0 2.197-1.667a8.9 8.9 0 0 0 1.667-2.247q.37-.75.62-1.547c.229-.769.388-1.548.568-2.327a9.8 9.8 0 0 0 .28-3.494C17.96-.192 15.964-.113 15.175.077A7.5 7.5 0 0 0 11.8 2.424c-.639.788-1.548.998-2.296 1.627q-.345.274-.63.609a5.8 5.8 0 0 0-.898 1.468a5 5 0 0 0-.32 1.677c0 .41.08.859.09 1.298q.015.215 0 .43a.7.7 0 0 1-.1.21c-.21.299-.539.588-.698.868a2.7 2.7 0 0 0-.3 1.847c.54 2.766 3.624 3.185 6.45 1.677M7.756 11.14c.17-.25.49-.48.71-.739v-.08c.289-.13.578-.25.868-.4c.29-.149.45-.269.679-.408q.479-.347.998-.63a.39.39 0 0 0 .28-.469a.38.38 0 0 0-.46-.27a5.6 5.6 0 0 0-1.347.27q-.275.09-.53.23l-.15.11a8 8 0 0 1 0-.859a3.7 3.7 0 0 1 .31-1.258c.179-.43.436-.823.76-1.158c.38-.442.84-.808 1.357-1.079q-.015.17 0 .34q.03.325.12.639a5.1 5.1 0 0 0 .619 1.348a.38.38 0 0 0 .703-.022a.4.4 0 0 0-.004-.288a6 6 0 0 1-.14-.719V4.99c0-.24 0-.46-.05-.69s-.06-.539-.08-.798q.176-.16.33-.34A6.3 6.3 0 0 1 15.414.996a1.44 1.44 0 0 1 1.718.599c.197.443.322.915.37 1.398a8.8 8.8 0 0 1-.47 3.105c-.22.749-.43 1.497-.679 2.226a10 10 0 0 1-.57 1.358a9.3 9.3 0 0 1-1.726 2.297a8.5 8.5 0 0 1-2.357 1.707c-.39.17-3.914 1.617-4.253-1.328a1.8 1.8 0 0 1 .31-1.258z" />
      <path d="M11.141 12.049a2.17 2.17 0 0 0 1.528-.45a9.7 9.7 0 0 0 1.877-2.067a7.1 7.1 0 0 0 .998-2.645a2.16 2.16 0 0 0-.699-1.898a1.14 1.14 0 0 0-1.447.06a.35.35 0 0 0-.1.46a.34.34 0 0 0 .469.1a.44.44 0 0 1 .659.15a1.2 1.2 0 0 1 .08.928q-.13.454-.34.878q-.308.667-.698 1.288a10.7 10.7 0 0 1-1.518 1.997a1.14 1.14 0 0 1-.769.34a.72.72 0 0 1-.679-.35a.37.37 0 0 0-.5-.18a.39.39 0 0 0-.189.5a1.52 1.52 0 0 0 1.328.889" />
      <path d="M23.063 11.08a6.8 6.8 0 0 0-1.408-1.997c-.999-1.048-2.087-1.917-2.287-4.303a.34.34 0 0 0-.679 0a7.1 7.1 0 0 0 .27 2.266a9.4 9.4 0 0 0 1.997 3.066a5.84 5.84 0 0 1 1.288 2.486c.147.632.228 1.278.24 1.927a4 4 0 0 1-.4 1.897c-.24.502-.58.95-.998 1.318a4.6 4.6 0 0 0-1.129-2.237a4.9 4.9 0 0 0-2.805-1.587a8.2 8.2 0 0 0-3.095.08a.33.33 0 1 0 .06.658c.929 0 1.853.148 2.735.44a7 7 0 0 1 1.767.858c.585.384 1.071.9 1.418 1.508q.166.253.23.55a.38.38 0 0 0 .08.309s-.09-.06-.14-.06l-4.992-.15c-1.488 0-2.996-.07-4.463 0c-2.237 0-4.463.22-6.7.36a.34.34 0 0 0 0 .668l1.148.05a5.4 5.4 0 0 0-.2 1.548q.045.551.18 1.088c.1.4.22.78.33 1.168l-1.468.09a.33.33 0 0 0-.33.34a.32.32 0 0 0 .34.33c2.237.07 4.463.219 6.7.249c1.477 0 2.995-.05 4.463-.08c1.168-.06 2.346-.16 3.514-.22h1.488a.38.38 0 0 0 0-.758h-1.398c.06-.41.12-.82.15-1.238v-.69a5 5 0 0 0-.07-.678a11 11 0 0 0-.33-1.169h1.608a.37.37 0 0 0 .39-.359a.32.32 0 0 0-.08-.23l.07.05h.07a.37.37 0 0 0 .518.13a5.1 5.1 0 0 0 1.808-1.897c.408-.707.644-1.5.689-2.316a7.8 7.8 0 0 0-.58-3.465m-5.292 9.885c0 .22 0 .439.08.659c.05.399.12.778.18 1.168l-2.786-.08c-1.488 0-2.996-.06-4.463 0s-2.916.11-4.374.21q.052-.739 0-1.478c0-.35-.08-.689-.14-.999s-.189-.808-.239-1.218c1.588.07 3.175.14 4.763.16c1.587.02 2.995 0 4.463-.08c.868 0 1.727-.1 2.596-.15c0 .4-.07.8-.09 1.219c-.01.17 0 .379.01.589" />
    </g>
  </svg>
);

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setMenuOpen(false);
  };

  return (
    <>
      {/* Desktop */}
      <div
        className={cn(
          "fixed top-0 left-0 right-0 z-50 hidden md:flex justify-center px-6 transition-[padding-top] duration-400 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
          scrolled ? "pt-2.5" : "pt-4.5"
        )}
      >
        <nav
          className={cn(
            "flex items-center h-13 transition-all duration-400 backdrop-blur-[20px] saturate-180",
            scrolled
              ? "w-[min(88%,780px)] max-w-195 rounded-full pl-5 pr-2 bg-wavy-surface/95 shadow-[0_8px_32px_rgba(255,84,112,0.18),inset_0_1px_0_rgba(255,255,255,0.06)]"
              : "w-full max-w-300 rounded-2xl pl-4 pr-2 bg-wavy-surface/70 shadow-[0_4px_24px_rgba(0,0,0,0.25)]"
          )}
        >
          <Link href="/" className="flex items-center gap-2 no-underline shrink-0 mr-1">
            <WavyIcon size={24} />
            <span className="font-display font-semibold text-[0.95rem] tracking-[-0.02em] whitespace-nowrap text-wavy-text-primary">
              Wavy
            </span>
          </Link>

          <div className="w-px h-4.5 shrink-0 mx-4 bg-wavy-border" />

          <div className="flex items-center gap-6 flex-1">
            {links.map((l) => (
              <button
                key={l.label}
                onClick={() => scrollTo(l.href)}
                className="bg-transparent border-0 cursor-pointer text-[0.8rem] font-medium whitespace-nowrap transition-colors duration-200 p-0 text-wavy-text-secondary hover:text-wavy-text-primary"
              >
                {l.label}
              </button>
            ))}
          </div>

          <div className="w-px h-4.5 shrink-0 mr-3 ml-4 bg-wavy-border" />

          <div className="flex items-center gap-1.5 shrink-0">
            <Link
              href="/auth/login"
              className="flex items-center gap-1.5 px-3.5 py-1.75 rounded-[9px] text-[0.75rem] font-semibold whitespace-nowrap no-underline transition-all duration-200 text-wavy-text-secondary hover:text-wavy-text-primary hover:bg-wavy-bg/40"
            >
              <IconLogin size={12} />
              Masuk
            </Link>

            <Link
              href="/auth/register"
              className="flex items-center gap-1.5 px-4 py-2 rounded-[9px] text-[0.75rem] font-bold whitespace-nowrap no-underline transition-[transform,box-shadow] duration-200 hover:-translate-y-px bg-wavy-accent text-wavy-bg shadow-[0_3px_12px_rgba(255,84,112,0.3)] hover:shadow-[0_6px_20px_rgba(255,84,112,0.45)]"
            >
              <IconRegister size={12} />
              Daftar
            </Link>
          </div>
        </nav>
      </div>

      {/* Mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-wavy-surface/95 backdrop-blur-lg shadow-[0_2px_16px_rgba(0,0,0,0.3)]">
        <div className="flex items-center justify-between px-4 h-14">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <WavyIcon size={22} />
            <span className="font-display font-semibold text-[0.95rem] tracking-[-0.02em] text-wavy-text-primary">
              Wavy
            </span>
          </Link>

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="flex flex-col gap-1.25 p-1.5 bg-transparent border-0 cursor-pointer"
            aria-label="Toggle menu"
          >
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className={cn(
                  "block w-5 h-0.5 rounded-sm bg-wavy-text-primary transition-all duration-300 origin-center",
                  i === 0 && menuOpen && "translate-y-1.75 rotate-45",
                  i === 2 && menuOpen && "-translate-y-1.75 -rotate-45",
                  i === 1 && menuOpen && "opacity-0"
                )}
              />
            ))}
          </button>
        </div>

        <div
          className={cn(
            "grid overflow-hidden transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
            menuOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
          )}
        >
          <div className="min-h-0">
            <div className="border-t border-wavy-border px-4 pt-3 pb-4 flex flex-col gap-3">
              {links.map((l) => (
                <button
                  key={l.label}
                  onClick={() => scrollTo(l.href)}
                  className="text-left text-[0.9rem] font-medium text-wavy-text-secondary bg-transparent border-0 cursor-pointer p-0"
                >
                  {l.label}
                </button>
              ))}
              <div className="flex gap-2 mt-1">
                <Link
                  href="/auth/login"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[0.85rem] font-semibold text-wavy-text-secondary no-underline hover:bg-wavy-bg/40"
                >
                  <IconLogin size={14} />
                  Masuk
                </Link>
                <Link
                  href="/auth/register"
                  onClick={() => setMenuOpen(false)}
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[0.85rem] font-bold bg-wavy-accent text-wavy-bg no-underline"
                >
                  <IconRegister size={14} />
                  Daftar
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden h-14" />
    </>
  );
}

function IconLogin({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  );
}

function IconRegister({ size = 13 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  );
}