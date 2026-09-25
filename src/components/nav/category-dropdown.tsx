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
import { useTranslations } from "next-intl";

interface Category {
  key: string;
  icon: React.ElementType;
  href: string;
}

const categories: Category[] = [
  { key: "religion", icon: MoonStar, href: "/concerts?category=Agama" },
  { key: "school", icon: Backpack, href: "/concerts?category=Sekolah" },
  { key: "business", icon: BriefcaseBusiness, href: "/concerts?category=Bisnis" },
  { key: "fashion", icon: Shirt, href: "/concerts?category=Fashion" },
  { key: "hobby", icon: Palette, href: "/concerts?category=Hobi" },
  { key: "family", icon: HeartHandshake, href: "/concerts?category=Keluarga" },
  { key: "health", icon: HeartPulse, href: "/concerts?category=Kesehatan" },
  { key: "comedy", icon: Drama, href: "/concerts?category=Komedi" },
  { key: "environment", icon: Sprout, href: "/concerts?category=Lingkungan" },
  { key: "food", icon: UtensilsCrossed, href: "/concerts?category=Kuliner" },
  { key: "media", icon: Clapperboard, href: "/concerts?category=Media" },
  { key: "music", icon: Music2, href: "/concerts?category=Musik" },
  { key: "sports", icon: Dumbbell, href: "/concerts?category=Olahraga" },
  { key: "automotive", icon: CarFront, href: "/concerts?category=Otomotif" },
  { key: "education", icon: GraduationCap, href: "/concerts?category=Pendidikan" },
  { key: "selfDev", icon: Flag, href: "/concerts?category=Pengembangan%20Diri" },
  { key: "travel", icon: MountainSnow, href: "/concerts?category=Travel" },
  { key: "science", icon: FlaskConical, href: "/concerts?category=Sains" },
  { key: "arts", icon: Brush, href: "/concerts?category=Seni" },
  { key: "social", icon: Scale, href: "/concerts?category=Sosial" },
];

export default function CategoryDropdown({ onSelect }: { onSelect?: () => void }) {
  const t = useTranslations("Navbar");
  return (
    <div className="w-[min(92vw,860px)] rounded-2xl border border-[#EDEBF2] bg-white p-6 shadow-2xl sm:w-[860px]">
      <p className="mb-5 text-[17px] font-bold tracking-tight text-[#111111]">{t("categoryTitle")}</p>
      <div className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-4">
        {categories.map((cat) => (
          <Link
            key={cat.key}
            href={cat.href}
            onClick={onSelect}
            className="flex items-center gap-3 rounded-xl px-1 py-1.5 transition-colors hover:bg-[#FAFAF8]"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[8px] bg-[#EFF6FF] text-[#1E40AF]">
              <cat.icon className="h-[18px] w-[18px]" />
            </div>
            <span className="text-[13px] font-medium leading-tight text-[#1B1A3A]">{t(`categories.${cat.key}`)}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
