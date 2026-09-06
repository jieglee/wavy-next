"use client";

import Link from "next/link";
import Image from "next/image";
import { Compass, ArrowUpRight, ChevronRight } from "lucide-react";

interface Country {
  id: string;
  name: string;
  image: string;
  href: string;
  gradient: string;
}

const countries: Country[] = [
  { id: "id", name: "Indonesia", image: "/images/negara/indonesia.png", href: "/concerts?country=id", gradient: "linear-gradient(90deg,#FF5470,#C6FF5C)" },
  { id: "sg", name: "Singapore", image: "/images/negara/singapore.png", href: "/concerts?country=sg", gradient: "linear-gradient(90deg,#FF5470,#FF8FA3)" },
  { id: "my", name: "Malaysia", image: "/images/negara/malaysia.png", href: "/concerts?country=my", gradient: "linear-gradient(90deg,#8B889C,#C6FF5C)" },
  { id: "th", name: "Thailand", image: "/images/negara/thailand.png", href: "/concerts?country=th", gradient: "linear-gradient(90deg,#C6FF5C,#FF5470)" },
  { id: "kr", name: "South Korea", image: "/images/negara/south-korea.png", href: "/concerts?country=kr", gradient: "linear-gradient(90deg,#FF5470,#8B889C)" },
  { id: "jp", name: "Japan", image: "/images/negara/japan.png", href: "/concerts?country=jp", gradient: "linear-gradient(90deg,#C6395A,#FF5470)" },
];

const SELECTED_ID = "id"; // Indonesia disorot karena home base Wavy

export default function DiscoverCountries() {
  return (
    <section className="px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Compass className="h-5 w-5 text-wavy-accent" />
            <h2 className="font-display text-xl font-bold text-wavy-text-primary sm:text-2xl">
              Discover concerts from around the world
            </h2>
          </div>
          <Link
            href="/concerts"
            className="flex shrink-0 items-center gap-1 text-sm font-semibold text-wavy-accent hover:underline"
          >
            Lihat Semua
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-1">
          {countries.map((country) => {
            const isSelected = country.id === SELECTED_ID;
            return (
              <Link
                key={country.id}
                href={country.href}
                className={`group relative h-[190px] w-[220px] shrink-0 overflow-hidden rounded-xl border bg-wavy-surface p-5 transition-colors sm:w-[240px] ${
                  isSelected
                    ? "border-wavy-accent"
                    : "border-wavy-border hover:border-wavy-text-secondary"
                }`}
              >
                <div className="relative z-10">
                  <h3
                    className={`font-display text-lg font-bold leading-snug ${
                      isSelected ? "text-wavy-accent" : "text-wavy-text-primary"
                    }`}
                  >
                    {country.name}
                  </h3>
                  <ArrowUpRight
                    className={`mt-2 h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 ${
                      isSelected ? "text-wavy-accent" : "text-wavy-text-secondary"
                    }`}
                  />
                </div>

                {/* Ilustrasi negara */}
                <div className="pointer-events-none absolute bottom-2 right-0 h-24 w-28 transition-transform duration-300 group-hover:scale-110">
                  <Image
                    src={country.image}
                    alt={country.name}
                    fill
                    className="object-contain object-bottom"
                    sizes="140px"
                  />
                </div>

                {/* Garis gradient bawah */}
                <div
                  className="absolute inset-x-0 bottom-0 h-1"
                  style={{ background: country.gradient }}
                />
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}