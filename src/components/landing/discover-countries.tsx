"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";

function AnimatedOffIcon({
  size = 26,
  color = "#FF5470",
  className = "",
}: {
  size?: number;
  color?: string;
  className?: string;
}) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 2048 2048"
      aria-hidden
    >
      <path d="M0 0h2048v2048H0z" fill="none" />
      <path
        fill={color}
        d="M1897 1572q0 26-19 45t-45 19q-15 0-31-10t-31-23t-28-29t-23-25q-106 94-232 151t-267 77v143h187v128H896v-128h197v-134q-134 0-257-34t-230-96t-196-149t-150-194t-97-230t-35-257q0-177 61-337t176-295q-9-8-18-17t-18-19t-14-21t-6-25q0-26 19-45t45-19q27 0 46 19l222 221q95-78 209-119t238-41q97 0 187 25t168 71t143 110t110 142t71 169t25 187q0 123-41 237t-119 210l246 247q19 19 19 46M512 832q0 81 23 161l129-130q-37-55-66-113t-49-122q-37 100-37 204m244-431q-51 0-75 24t-24 76q0 33 9 69t23 71t32 69t36 61l270-270q-28-18-61-36t-69-32t-71-23t-70-9m663 492l-270 270q28 18 61 35t68 32t72 24t69 9q52 0 76-24t24-76q0-33-9-69t-23-71t-32-69t-36-61m-376 195l301-301q-95-116-211-211L832 877q95 116 211 211M741 967l-152 153q38 66 91 119t120 92l153-152q-117-95-212-212m316 289l-130 129q80 23 161 23q104 0 204-37q-63-20-121-49t-114-66m570-220q37-100 37-204q0-81-23-161l-129 130q37 55 66 113t49 122m-40-492q-38-66-91-119t-120-92l-153 152q117 95 212 212zm-338-265q-80-23-161-23q-104 0-204 37q63 20 121 49t114 66zm-161 1379q149 0 288-51t253-149l-87-87q-97 80-212 122t-242 43q-97 0-187-25t-168-71t-143-110t-110-142t-71-169t-25-187q0-127 42-242t123-212l-93-93q-97 114-148 253t-52 289q0 115 29 221t84 198t130 168t168 130t199 84t222 30"
      />
    </svg>
  );
}

interface City {
    id: string;
    label1: string;
    label2: string;
    href: string;
    accent: string;
    active?: boolean;
    illustration: string;
}

// Loket-style: white card, left text, right 3D landmark, bottom colored bar
// Hanya 5 negara sesuai request: Indonesia, Singapore, Malaysia, Thailand, South Korea (Japan dihapus)
// Ambil dari /images/negara/* - fallback ke emoji kalau file belum ada
const cities: City[] = [
    {
        id: "indonesia",
        label1: "Indonesia",
        label2: "",
        href: "/concerts?country=id",
        accent: "#FF8A65",
        active: true,
        illustration: "/images/negara/indonesia.png",
    },
    {
        id: "singapore",
        label1: "Singapore",
        label2: "",
        href: "/concerts?country=sg",
        accent: "#FF3B30",
        illustration: "/images/negara/singapore.png",
    },
    {
        id: "malaysia",
        label1: "Malaysia",
        label2: "",
        href: "/concerts?country=my",
        accent: "#FF7A7A",
        illustration: "/images/negara/malaysia.png",
    },
    {
        id: "thailand",
        label1: "Thailand",
        label2: "",
        href: "/concerts?country=th",
        accent: "#7AA8FF",
        illustration: "/images/negara/thailand.png",
    },
    {
        id: "south-korea",
        label1: "South",
        label2: "Korea",
        href: "/concerts?country=kr",
        accent: "#7FC4A0",
        illustration: "/images/negara/korea.png",
    },
];

function CityIllustration({ city, idx }: { city: City; idx: number }) {
    // Fallback emoji map if image not available
    const emojiMap: Record<string, string> = {
        indonesia: "🇮🇩",
        singapore: "🇸🇬",
        malaysia: "🇲🇾",
        thailand: "🇹🇭",
        "south-korea": "🇰🇷",
    };
    // Shadow pink/biru selang-seling, miring lucu ke kanan
    const isPink = idx % 2 === 0;
    const shadowClass = isPink
        ? "group-hover:drop-shadow-[0_12px_22px_rgba(255,84,112,0.42)]"
        : "group-hover:drop-shadow-[0_12px_22px_rgba(30,64,175,0.42)]";
    const tiltClass = "group-hover:-rotate-[6deg]";

  return (
    <div className="relative z-10 h-[88px] w-[88px] shrink-0 overflow-visible sm:h-[96px] sm:w-[96px]">
      {/* Glow shadow menyeluruh di belakang gambar - pink/biru Wavy, baru keliatan pas hover */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[18px] blur-[18px] opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105"
        style={{ background: isPink ? "rgba(255,84,112,0.38)" : "rgba(30,64,175,0.35)" }}
      />
            {/* Zoom miring lucu + shadow - trigger pas card kena kursor (group-hover) */}
            <img
                src={city.illustration}
                alt={city.label2 || city.label1}
                className={`relative z-10 h-full w-full origin-bottom object-contain object-bottom drop-shadow-sm transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:scale-[1.28] ${tiltClass} ${shadowClass}`}
                style={{ filter: undefined }}
                onError={(e) => {
                    (e.currentTarget as HTMLImageElement).style.display = "none";
                    const fallback = (e.currentTarget.nextElementSibling as HTMLElement | null);
                    if (fallback) fallback.style.display = "flex";
                }}
            />
      <div
        style={{ display: "none" }}
        className={`absolute inset-0 z-10 items-center justify-center text-4xl leading-none transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] will-change-transform group-hover:scale-[1.28] ${tiltClass} ${shadowClass}`}
      >
        {emojiMap[city.id] ?? "🏙️"}
      </div>
    </div>
    );
}

export default function DiscoverCountries() {
    const t = useTranslations("DiscoverCountries");
    return (
        <section className="px-4 py-10 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
                {/* Header like Loket: Jelajahi Event di Kotamu */}
                <div className="mb-6 flex items-center gap-2">
                    <AnimatedOffIcon />
                    <h2 className="font-display text-xl font-bold text-[#1B1A24] sm:text-2xl">
                        {t("title")}
                    </h2>
                </div>

                <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {cities.map((city, idx) => (
                        <Link
                            key={city.id}
                            href={city.href}
                            className={`group relative flex h-[112px] w-full items-center justify-between overflow-visible rounded-2xl border bg-white px-5 py-3 transition-all duration-200 sm:h-[118px] ${city.active
                                    ? "border-wavy-blue shadow-[0_6px_20px_rgba(30,64,175,0.12)]"
                                    : "border-[#E6E4F0] shadow-sm hover:border-[#D8D5E8] hover:shadow-md"
                                }`}
                        >
                            {/* Left: text */}
                            <div className="flex flex-col justify-center">
                                <p className={`font-display text-[15px] font-bold leading-tight ${city.active ? "text-wavy-blue" : "text-[#1B1A24]"}`}>
                                    {city.label1}
                                </p>
                                {city.label2 && (
                                    <p className={`font-display text-[15px] font-bold leading-tight ${city.active ? "text-wavy-blue" : "text-[#1B1A24]"}`}>
                                        {city.label2}
                                    </p>
                                )}
                            </div>

                            {/* Right: 3D illustration - zoom keluar card saat hover di area gambar */}
                            <CityIllustration city={city} idx={idx} />

                            {/* Bottom colored bar like Loket */}
                            <div
                                className="absolute -bottom-[1px] left-3 right-3 h-[3px] rounded-full"
                                style={{ background: city.accent }}
                            />
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
