"use client";

import Link from "next/link";

const countries = [
  { name: "Indonesia", flag: "🇮🇩", count: "120+ konser", gradient: "linear-gradient(135deg,#FF5470,#211F2B)" },
  { name: "Jepang", flag: "🇯🇵", count: "80+ konser", gradient: "linear-gradient(135deg,#1E40AF,#7DD3E8)" },
  { name: "Korea Selatan", flag: "🇰🇷", count: "65+ konser", gradient: "linear-gradient(135deg,#C6395A,#14131C)" },
  { name: "Singapura", flag: "🇸🇬", count: "45+ konser", gradient: "linear-gradient(135deg,#1B1A3A,#4A90D9)" },
  { name: "Malaysia", flag: "🇲🇾", count: "50+ konser", gradient: "linear-gradient(135deg,#FF5470,#C6FF5C)" },
  { name: "Thailand", flag: "🇹🇭", count: "40+ konser", gradient: "linear-gradient(135deg,#4A90D9,#1B1A3A)" },
];

export default function DiscoverCountries() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center gap-2">
          <span className="text-xl">🌏</span>
          <h2 className="font-display text-xl font-bold text-[#1B1A3A] sm:text-2xl">
            Jelajahi Negara
          </h2>
          <span className="ml-2 rounded-full bg-wavy-blue/10 px-2.5 py-1 text-xs font-semibold text-wavy-blue">
            Baru
          </span>
        </div>
        <p className="mb-8 text-sm text-[#6E6B80]">Temukan konser seru di berbagai negara favoritmu</p>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {countries.map((c) => (
            <Link
              key={c.name}
              href={`/concerts?country=${encodeURIComponent(c.name)}`}
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-[#EDEBF2] bg-white shadow-[0_4px_14px_rgba(30,64,175,0.08)] transition-all duration-300 hover:-translate-y-1 hover:border-wavy-blue/30 hover:shadow-[0_16px_32px_-8px_rgba(30,64,175,0.2)]"
            >
              <div className="relative flex h-24 items-center justify-center overflow-hidden sm:h-28" style={{ background: c.gradient }}>
                <span className="text-4xl drop-shadow-md transition-transform duration-300 group-hover:scale-110">{c.flag}</span>
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </div>
              <div className="p-3 text-center sm:p-4">
                <h3 className="font-display text-sm font-bold text-[#1B1A3A] group-hover:text-wavy-blue">{c.name}</h3>
                <p className="mt-1 text-xs text-abu-ungu">{c.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
