"use client";

import Link from "next/link";

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
    illustration: "/images/negara/south-korea.png",
  },
];

function CityIllustration({ city }: { city: City }) {
  // Fallback emoji map if image not available
  const emojiMap: Record<string, string> = {
    indonesia: "🇮🇩",
    singapore: "🇸🇬",
    malaysia: "🇲🇾",
    thailand: "🇹🇭",
    "south-korea": "🇰🇷",
  };
  return (
    <div className="relative h-20 w-20 shrink-0 sm:h-22 sm:w-22">
      {/* Try real image, hidden fallback emoji stays if image fails */}
      <img
        src={city.illustration}
        alt={city.label2 || city.label1}
        className="h-full w-full object-contain object-bottom drop-shadow-sm"
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).style.display = "none";
          const fallback = (e.currentTarget.nextElementSibling as HTMLElement | null);
          if (fallback) fallback.style.display = "flex";
        }}
      />
      <div
        style={{ display: "none" }}
        className="absolute inset-0 items-center justify-center text-4xl leading-none"
      >
        {emojiMap[city.id] ?? "🏙️"}
      </div>
    </div>
  );
}

export default function DiscoverCountries() {
  return (
    <section className="px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header like Loket: Jelajahi Event di Kotamu */}
        <div className="mb-6">
          <h2 className="font-display text-xl font-bold text-[#1B1A24] sm:text-2xl">
            Jelajahi Event di Kotamu
          </h2>
          <p className="mt-1 text-sm text-[#6E6B80]">Discover concerts from around the world</p>
        </div>

        <div className="scrollbar-hide flex gap-4 overflow-x-auto pb-3 pt-1 snap-x snap-mandatory">
          {cities.map((city) => (
            <Link
              key={city.id}
              href={city.href}
              className={`group relative flex h-[118px] w-[212px] shrink-0 snap-start items-center justify-between overflow-visible rounded-2xl border bg-white px-4 py-3 transition-all duration-200 sm:h-[122px] sm:w-[220px] ${
                city.active
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

              {/* Right: 3D illustration */}
              <CityIllustration city={city} />

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
