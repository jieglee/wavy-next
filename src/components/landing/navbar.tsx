"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { WavyIcon } from "@/components/landing/wavy-icon";

const links = [
  { label: "Cari Konser", href: "featured" },
  { label: "Smart Queue", href: "how-it-works" },
  { label: "Tentang", href: "about" },
];

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
            ? "w-[min(88%,780px)] max-w-195 rounded-full pl-5 pr-2 bg-wavy-surface/95 shadow-[0_8px_32px_rgba(255,84,112,0.18),inset_0_1px_0_rgba(255,255,255,0.8)]"
            : "w-full max-w-300 rounded-2xl pl-4 pr-2 bg-wavy-surface/70 shadow-[0_4px_24px_rgba(27,26,36,0.06)]"
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
              className="flex items-center gap-1.5 px-3.5 py-1.75 rounded-[9px] text-[0.75rem] font-semibold whitespace-nowrap no-underline transition-all duration-200 text-wavy-text-secondary hover:text-wavy-text-primary hover:bg-wavy-text-primary/5"
            >
              <IconLogin size={12} />
              Masuk
            </Link>
          </div>
        </nav>
      </div>

      {/* Mobile */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-wavy-surface/95 backdrop-blur-lg shadow-[0_2px_16px_rgba(27,26,36,0.08)]">
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
                  className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[0.85rem] font-semibold text-wavy-text-secondary no-underline hover:bg-wavy-text-primary/5"
                >
                  <IconLogin size={14} />
                  Masuk
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