import {
  Backpack,
  BriefcaseBusiness,
  Brush,
  CarFront,
  Clapperboard,
  Drama,
  Dumbbell,
  FlaskConical,
  Flag,
  GraduationCap,
  HeartHandshake,
  HeartPulse,
  MoonStar,
  MountainSnow,
  Music2,
  Palette,
  Scale,
  Shirt,
  Sprout,
  UtensilsCrossed,
  type LucideIcon,
} from "lucide-react";
import type { Concert } from "@/types/type";

/**
 * Kategori event untuk modal Category dan filter di /concerts.
 *
 * Backend hanya menyimpan satu kolom `category` bebas (saat ini: Music, Conference, Workshop,
 * Comedy, Lifestyle), dan banyak event non-musik ikut ditandai "Music". Karena itu kategori
 * dicocokkan dari dua sumber:
 *  1. nilai `category` di database (`db`), dan
 *  2. kata kunci di judul / artis / venue.
 * Kategori `exclusive` (olahraga, otomotif) menang atas tag database: event lari yang
 * ditandai "Music" tidak ikut muncul di kategori Musik.
 * Satu event boleh masuk beberapa kategori (mis. konser worship = Musik + Agama).
 */
export type EventCategorySlug =
  | "agama"
  | "sekolah-kampus"
  | "bisnis"
  | "fashion"
  | "hobi"
  | "keluarga"
  | "kesehatan"
  | "komedi"
  | "lingkungan"
  | "kuliner"
  | "media"
  | "musik"
  | "olahraga"
  | "otomotif"
  | "pendidikan"
  | "pengembangan-diri"
  | "travel"
  | "sains"
  | "seni-budaya"
  | "sosial-politik";

type CategoryRule = {
  slug: EventCategorySlug;
  icon: LucideIcon;
  /** nilai kolom `category` di database (case-insensitive) */
  db?: string[];
  title?: RegExp;
  artist?: RegExp;
  venue?: RegExp;
  /** kalau kata kuncinya cocok, tag database event diabaikan */
  exclusive?: boolean;
  /** nilai lama di URL (?category=Musik dsb.) yang diarahkan ke kategori ini */
  aliases?: string[];
};

export const EVENT_CATEGORIES: CategoryRule[] = [
  {
    slug: "agama",
    icon: MoonStar,
    title: /\b(worship|hillsong|rohani|religi|religious|sholawat|shalawat|kajian|pengajian|dzikir|natal|christmas|ramadh?an|gereja|church|spiritual|nasyid|snada)\b/i,
    artist: /\b(church|gereja|ministry|masjid)\b/i,
    aliases: ["agama"],
  },
  {
    slug: "sekolah-kampus",
    icon: Backpack,
    title: /\b(campus|kampus|school|sekolah|schoolicious|university|universitas|mahasiswa|pelajar|graduation|wisuda|osis|pensi)\b/i,
    artist: /\b(school|sekolah|uns|ugm|itb|universitas|university|osis)\b/i,
    venue: /\b(sman|smkn|sma|smk|smp|universitas|kampus|campus)\b/i,
    aliases: ["sekolah"],
  },
  {
    slug: "bisnis",
    icon: BriefcaseBusiness,
    db: ["conference", "business", "bisnis"],
    title: /\b(business|bisnis|finance|financial|keuangan|investasi|investment|startup|networking|entrepreneur|wirausaha|umkm|expo|conference|konferensi|summit|hr|marketing)\b/i,
    aliases: ["bisnis"],
  },
  {
    slug: "fashion",
    icon: Shirt,
    title: /\b(fashion|beauty|make-?up|kecantikan|runway|skincare|cosmetics?|kosmetik)\b/i,
    aliases: ["fashion"],
  },
  {
    slug: "hobi",
    icon: Palette,
    db: ["lifestyle"],
    title: /\b(hobby|hobi|komunitas|community|gathering|workshop|craft|kerajinan|gaming|esports?|board ?games?|karaoke|photography|fotografi|lifestyle|gaya hidup|go-?kart|gokart)\b/i,
    aliases: ["hobi"],
  },
  {
    slug: "keluarga",
    icon: HeartHandshake,
    title: /\b(family|keluarga|kids?|anak|children|parenting|bayi|baby|moms?|dads?)\b/i,
    aliases: ["keluarga"],
  },
  {
    slug: "kesehatan",
    icon: HeartPulse,
    title: /\b(health|kesehatan|sehat|wellness|wellbeing|medical|medis|mental|nutrition|nutrisi|gizi|yoga|meditasi|meditation|healing)\b/i,
    aliases: ["kesehatan"],
  },
  {
    slug: "komedi",
    icon: Drama,
    db: ["comedy"],
    title: /\b(comedy|komedi|stand ?up|standup|comika|roast|lawak|teater|theat(er|re)|drama|pertunjukan)\b/i,
    artist: /\b(comika)\b/i,
    aliases: ["komedi"],
  },
  {
    slug: "lingkungan",
    icon: Sprout,
    title: /\b(eco|green|sustainab\w*|keberlanjutan|lingkungan|environment\w*|climate|iklim|recycle|daur ulang|tanam|pohon|trees?|plasti[ck]|earth|bumi)\b/i,
    aliases: ["lingkungan"],
  },
  {
    slug: "kuliner",
    icon: UtensilsCrossed,
    title: /\b(food|kuliner|culinary|dinner|lunch|brunch|makan|coffee|kopi|bazaa?r|wine|tasting|chef|cooking|masak)\b/i,
    aliases: ["kuliner", "makanan"],
  },
  {
    slug: "media",
    icon: Clapperboard,
    title: /\b(fan ?meeting|fanmeet|fancon|awards?|convention|screening|film|movie|cinema|nobar|cosplay|anime|komik|celebrity|selebriti|talk ?show|variety)\b/i,
    aliases: ["media"],
  },
  {
    slug: "musik",
    icon: Music2,
    db: ["music", "musik", "concert", "konser", "festival", "jazz", "k-pop", "rock", "pop", "edm"],
    title: /\b(konser|concert|music|musik|jazz|recital|festival|fest|showcase|karaoke|orchestra|orkestra|edm|k-?pop)\b/i,
    aliases: ["musik", "music"],
  },
  {
    slug: "olahraga",
    icon: Dumbbell,
    title: /\b(run|running|lari|berlari|marathon|padel|tennis|futsal|football|sepak ?bola|badminton|basket(ball)?|voli|volleyball|go-?kart|gokart|karting|cycling|sepeda|gowes|fitness|gym|pilates|sports?|olahraga|turnamen|tournament)\b/i,
    // "sports" sengaja tidak dicek di nama artis (terlalu umum)
    artist: /\b(padel|running|fitness)\b/i,
    exclusive: true,
    aliases: ["olahraga", "sport", "sports"],
  },
  {
    slug: "otomotif",
    icon: CarFront,
    title: /\b(otomotif|automotive|auto ?show|cars?|mobil|motor|motorcycle|go-?kart|gokart|karting|racing|balap|drift|modifikasi)\b/i,
    exclusive: true,
    aliases: ["otomotif"],
  },
  {
    slug: "pendidikan",
    icon: GraduationCap,
    title: /\b(edu|education|edukasi|pendidikan|belajar|seminar|webinar|kelas|class|course|kursus|training|pelatihan|literasi|bootcamp)\b/i,
    aliases: ["pendidikan"],
  },
  {
    slug: "pengembangan-diri",
    icon: Flag,
    db: ["workshop"],
    title: /\b(self|motivasi|motivation(al)?|personal growth|leadership|leading|career|karie?r|mindset|productivity|public speaking|coaching|growth|performance)\b/i,
    aliases: ["pengembangan diri"],
  },
  {
    slug: "travel",
    icon: MountainSnow,
    title: /\b(travel|trip|wisata|camping|hiking|trekking|outdoor|adventure|petualangan|pendakian)\b/i,
    aliases: ["travel"],
  },
  {
    slug: "sains",
    icon: FlaskConical,
    title: /\b(tech|technology|teknologi|ai|artificial intelligence|coding|hackathon|developer|programming|science|sains|robot(ics)?|cyber|digital)\b/i,
    aliases: ["sains"],
  },
  {
    slug: "seni-budaya",
    icon: Brush,
    title: /\b(arts?|seni|budaya|culture|cultural|exhibition|pameran|museum|gallery|galeri|tari|dance|wayang|batik|recital|showcase|puisi|poetry|sastra|heritage)\b/i,
    aliases: ["seni"],
  },
  {
    slug: "sosial-politik",
    icon: Scale,
    title: /\b(social|sosial|politik|politics|political|charity|amal|donasi|fundraising|kampanye|campaign|diskusi|discussion|debat|debate|kemanusiaan|volunteer|relawan|pemilu)\b/i,
    aliases: ["sosial"],
  },
];

const BY_SLUG = new Map(EVENT_CATEGORIES.map((c) => [c.slug, c]));

export function getEventCategory(slug: EventCategorySlug) {
  return BY_SLUG.get(slug)!;
}

/**
 * Nilai `?category=` → slug. Menerima slug, alias lama dari modal sebelumnya (Musik, Agama, …),
 * dan nilai database (Music, Comedy, …). Tidak dikenal → null.
 */
export function resolveCategorySlug(value: string | null | undefined): EventCategorySlug | null {
  const v = (value ?? "").trim().toLowerCase();
  if (!v) return null;
  for (const c of EVENT_CATEGORIES) {
    if (c.slug === v || c.aliases?.includes(v) || c.db?.includes(v)) return c.slug;
  }
  return null;
}

function keywordHit(rule: CategoryRule, c: Concert): boolean {
  return Boolean(
    rule.title?.test(c.title ?? "") ||
      rule.artist?.test(c.artist_name ?? "") ||
      rule.venue?.test(c.venue ?? "")
  );
}

/** Semua kategori yang cocok untuk satu event. */
export function categoriesOf(c: Concert): Set<EventCategorySlug> {
  const out = new Set<EventCategorySlug>();
  let exclusiveHit = false;
  for (const rule of EVENT_CATEGORIES) {
    if (keywordHit(rule, c)) {
      out.add(rule.slug);
      if (rule.exclusive) exclusiveHit = true;
    }
  }
  if (!exclusiveHit) {
    const db = (c.category ?? "").trim().toLowerCase();
    for (const rule of EVENT_CATEGORIES) if (db && rule.db?.includes(db)) out.add(rule.slug);
  }
  return out;
}

export function matchesCategory(c: Concert, slug: EventCategorySlug): boolean {
  return categoriesOf(c).has(slug);
}

/** Jumlah event per kategori. */
export function countByCategory(list: Concert[]): Record<EventCategorySlug, number> {
  const counts = Object.fromEntries(EVENT_CATEGORIES.map((c) => [c.slug, 0])) as Record<EventCategorySlug, number>;
  for (const c of list) for (const slug of categoriesOf(c)) counts[slug] += 1;
  return counts;
}
