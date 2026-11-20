"use client";

import { useCallback, useState } from "react";
import { cn } from "@/lib/utils";

type PosterSize = "sm" | "md" | "lg";

const TITLE_CLS: Record<Exclude<PosterSize, "sm">, string> = {
  md: "line-clamp-3 text-base sm:text-lg",
  lg: "line-clamp-2 text-2xl sm:text-4xl",
};

const initials = (title: string) =>
  title
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w))
    .slice(0, 2)
    .map((w) => w.match(/[\p{L}\p{N}]/u)?.[0] ?? "")
    .join("")
    .toUpperCase();

/**
 * Poster pengganti saat event tidak punya gambar (DESIGN §2.5): gradient token
 * `stage` → `primary-glow` + judul event. Ukuran `sm` (thumbnail kecil) hanya memuat inisial.
 */
export function PosterFallback({ title, size = "md", className }: { title: string; size?: PosterSize; className?: string }) {
  return (
    <div
      role="img"
      aria-label={title}
      className={cn(
        "flex h-full w-full overflow-hidden bg-linear-to-br from-stage to-primary-glow",
        size === "sm" ? "items-center justify-center" : "items-end p-3 sm:p-4",
        className
      )}
    >
      <span
        aria-hidden
        className={cn(
          "min-w-0 font-display font-bold leading-tight tracking-tight text-primary-foreground",
          size === "sm" ? "text-xs" : TITLE_CLS[size]
        )}
      >
        {size === "sm" ? initials(title) : title}
      </span>
    </div>
  );
}

/**
 * Poster/banner event. `src` kosong atau gagal dimuat → PosterFallback.
 * `className` dipakai di elemen akar (img atau fallback), jadi posisi/ukuran/hover tetap sama.
 * `fallbackClassName` ditambahkan hanya pada fallback (mis. posisi judul).
 */
export function EventPoster({
  src,
  title,
  alt,
  size = "md",
  className,
  fallbackClassName,
  loading = "lazy",
}: {
  src?: string | null;
  title: string;
  alt?: string;
  size?: PosterSize;
  className?: string;
  fallbackClassName?: string;
  loading?: "lazy" | "eager";
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  // Gambar dari HTML server bisa gagal sebelum React terhidrasi, jadi onError tidak terpanggil.
  // Saat elemen terpasang, cek apakah gambar sudah selesai tapi rusak (naturalWidth 0).
  const checkBroken = useCallback(
    (el: HTMLImageElement | null) => {
      if (el && src && el.complete && el.naturalWidth === 0) setFailedSrc(src);
    },
    [src]
  );
  if (!src || failedSrc === src) return <PosterFallback title={title} size={size} className={cn(className, fallbackClassName)} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={checkBroken} src={src} alt={alt ?? title} loading={loading} onError={() => setFailedSrc(src)} className={className} />
  );
}
