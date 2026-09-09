"use client";

import {
  MoonStar,
  Backpack,
  BriefcaseBusiness,
  Shirt,
  Palette,
  HeartHandshake,
  HeartPulse,
  Drama,
  Sprout,
  UtensilsCrossed,
  Clapperboard,
  Music2,
  Dumbbell,
  CarFront,
  GraduationCap,
  Flag,
  MountainSnow,
  FlaskConical,
  Brush,
  Scale,
} from "lucide-react";
import { Link } from "@/i18n/navigation";

interface Category {
  name: string;
  icon: React.ElementType;
  href: string;
}

const categories: Category[] = [
  { name: "Agama & Spiritualitas", icon: MoonStar, href: "/concerts?category=Agama" },
  { name: "Aktivitas Sekolah & Kampus", icon: Backpack, href: "/concerts?category=Sekolah" },
  { name: "Bisnis & Keuangan", icon: BriefcaseBusiness, href: "/concerts?category=Bisnis" },
  { name: "Fashion & Kecantikan", icon: Shirt, href: "/concerts?category=Fashion" },
  { name: "Hobi & Gaya Hidup", icon: Palette, href: "/concerts?category=Hobi" },
  { name: "Keluarga & Anak", icon: HeartHandshake, href: "/concerts?category=Keluarga" },
  { name: "Kesehatan & Kebugaran", icon: HeartPulse, href: "/concerts?category=Kesehatan" },
  { name: "Komedi & Pertunjukan", icon: Drama, href: "/concerts?category=Komedi" },
  { name: "Lingkungan & Keberlanjutan", icon: Sprout, href: "/concerts?category=Lingkungan" },
  { name: "Makanan & Minuman", icon: UtensilsCrossed, href: "/concerts?category=Kuliner" },
  { name: "Media & Hiburan", icon: Clapperboard, href: "/concerts?category=Media" },
  { name: "Musik", icon: Music2, href: "/concerts?category=Musik" },
  { name: "Olahraga & Kebugaran", icon: Dumbbell, href: "/concerts?category=Olahraga" },
  { name: "Otomotif", icon: CarFront, href: "/concerts?category=Otomotif" },
  { name: "Pendidikan", icon: GraduationCap, href: "/concerts?category=Pendidikan" },
  { name: "Pengembangan Diri", icon: Flag, href: "/concerts?category=Pengembangan%20Diri" },
  { name: "Perjalanan & Alam Terbuka", icon: MountainSnow, href: "/concerts?category=Travel" },
  { name: "Sains & Teknologi", icon: FlaskConical, href: "/concerts?category=Sains" },
  { name: "Seni & Budaya", icon: Brush, href: "/concerts?category=Seni" },
  { name: "Sosial & Politik", icon: Scale, href: "/concerts?category=Sosial" },
];

export default function CategoryDropdown({ onSelect }: { onSelect?: () => void }) {
  return (
    <div className="w-[min(92vw,860px)] rounded-2xl border border-[#EDEBF2] bg-white p-6 shadow-2xl sm:w-[860px]">
      <p className="mb-5 text-[17px] font-bold tracking-tight text-[#111111]">Kategori Event</p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        {categories.map((cat) => (
          <Link
            key={cat.name}
            href={cat.href}
            onClick={onSelect}
            className="flex items-center gap-3 rounded-xl px-1 py-1.5 transition-colors hover:bg-[#FAFAF8]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#EFF6FF] text-[#1E40AF]">
              <cat.icon className="h-[18px] w-[18px]" />
            </div>
            <span className="text-[13px] font-medium leading-tight text-[#1B1A3A]">{cat.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
