'use client'

import Link from 'next/link'
import { useState } from 'react'

const navLinks = [
  { label: 'Beranda', href: '#hero' },
  { label: 'Cari Konser', href: '#featured' },
  { label: 'Tentang', href: '#about' },
]

function scrollTo(id: string) {
  const el = document.querySelector(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border-dark bg-plum-black/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="font-display text-xl font-semibold tracking-tight text-off-white">
          Wavy
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => scrollTo(link.href)}
              className="text-sm font-medium text-lavender-gray transition-colors hover:text-off-white"
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/auth/login"
            className="rounded-lg border border-border-dark px-4 py-2 text-sm font-medium text-lavender-gray transition-colors hover:border-lavender-gray hover:text-off-white"
          >
            Masuk
          </Link>
          <Link
            href="/auth/register"
            className="rounded-lg bg-coral-spotlight px-4 py-2 text-sm font-medium text-plum-black transition-colors hover:brightness-110"
          >
            Daftar
          </Link>
        </div>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center justify-center md:hidden"
          aria-label="Toggle menu"
        >
          <svg
            className="h-6 w-6 text-off-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {menuOpen ? (
              <path strokeLinecap="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-border-dark bg-graphite-plum px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-3 pt-4">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => { scrollTo(link.href); setMenuOpen(false) }}
                className="text-left text-sm font-medium text-lavender-gray transition-colors hover:text-off-white"
              >
                {link.label}
              </button>
            ))}
          </nav>
          <div className="mt-4 flex flex-col gap-2">
            <Link
              href="/auth/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg border border-border-dark px-4 py-2 text-center text-sm font-medium text-lavender-gray transition-colors hover:border-lavender-gray hover:text-off-white"
            >
              Masuk
            </Link>
            <Link
              href="/auth/register"
              onClick={() => setMenuOpen(false)}
              className="rounded-lg bg-coral-spotlight px-4 py-2 text-center text-sm font-medium text-plum-black transition-colors hover:brightness-110"
            >
              Daftar
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
