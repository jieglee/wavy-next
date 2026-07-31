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
    viewBox="0 0 512 512"
    role="img"
    aria-label="Wavy logo"
    className="shrink-0 text-wavy-accent"
  >
    <path d="M0 0h512v512H0z" fill="none" />
    <path
      fill="currentColor"
      d="M429.246 276.556c32.29-2.874 57.828 3.454 79.292 14.497c9.163 4.37-1.33 14.103-14.366 7.894c-27.778-9.957-34.29-14.33-65.843-12.865c-9.417-.113-8.475-8.533.917-9.526m-125.798-10.808c-3.908-8.232-18.616-15.07-32.297.983c0 0 7.417-75.495 7.697-82.778c3.462-16.378-16.136-11.32-17.772-9.945c-35.778 23.668-76.65 157.81-76.65 157.81c4.386-62.402 19.779-143.033 30.396-221.867c.798-7.797-13.233-4.015-13.233-4.015c-61.955 22.094-75.166 183.334-90.402 183.998c-4.393-45.143-1.51-51.918-17.772-50.657c-21.91 5.137-15.144 13.582-43.935 38.983c-17.1-5.867-43.194-3.452-43.194-3.452c-8.569 1.538-8.192 8.984 0 9.382c14.218-.84 39.286 2.522 52.099 2.662c16.016-.52 20.19-13.432 26.049-13.867c5.832 67.65 5.52 57.392 22.591 58.126c34.005-7.975 47.835-111.503 76.736-179.62c-16.606 92.058-30.233 184.025-28.8 243.958c.34 14.236 8.074 11.67 18.053 10.739c17.505-1.634 46.822-113.569 77.525-180.745c-2.2 17.509-7.469 82.746-7.469 82.746c1 6.959 21.586 5.36 23.526.886l17.695-28.293c15.959 28.721 17.832 25.35 28.275 25.35c10.523 0 21.28-16.944 21.28-16.944c3.068 4.176 4.792 8.88 6.38 9.883c2.75 2.713 15.659 2.538 19.342.575c0 0 18.85-11.582 33.383-13.447c19.528-1.657 15.278-10.672 0-11.298c-10.511-.513-34.458 7.796-34.458 7.796c-7.737-21.282-3.62-21.247-19.173-21.803c-11.598-.28-26.425 22.176-26.425 22.176s-6.071-10.212-9.447-17.322"
    />
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