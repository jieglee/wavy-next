"use client";

import { useEffect, useMemo, useState } from "react";
import { Image as ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";

type Seatmap = { images: string[]; name: string } | null;

function clean(u: string) {
  try {
    const url = new URL(u.trim());
    return (url.origin + url.pathname).toLowerCase().replace(/\/+$/, "");
  } catch {
    return u.trim().toLowerCase().split("?")[0].split("#")[0].replace(/\/+$/, "");
  }
}

function isBanner(u: string) {
  const n = u.trim().toLowerCase();
  return n.includes("/banner/") || n.includes("banner_") || n.includes("banner-");
}

function baseName(u: string) {
  const noQuery = u.trim().split("?")[0].split("#")[0].replace(/\/+$/, "");
  const parts = noQuery.split("/");
  return (parts[parts.length - 1] ?? "").toLowerCase();
}

function assetKeys(u: string) {
  const path = u.trim().split("?")[0].split("#")[0];
  const parts = path.split("/").filter(Boolean).map((part) => {
    try {
      return decodeURIComponent(part).toLowerCase();
    } catch {
      return part.toLowerCase();
    }
  });
  const file = parts.at(-1) ?? "";
  const fileStem = file.replace(/\.[a-z0-9]{2,5}$/, "");
  const keys = new Set<string>();

  if (fileStem) keys.add(fileStem.replace(/[^a-z0-9]+/g, ""));

  // Cloudinary may add delivery transformations and a version before the asset.
  const versionIndex = parts.findIndex((part) => /^v\d+$/.test(part));
  if (versionIndex >= 0 && fileStem) {
    keys.add(parts.slice(versionIndex + 1, -1).concat(fileStem).join("/").replace(/[^a-z0-9]+/g, ""));
  }

  return [...keys].filter(Boolean);
}

export default function ConcertGallery({
  gallery,
  seatmap,
  posterUrl,
  title,
}: {
  gallery?: string[];
  seatmap?: Seatmap;
  posterUrl?: string;
  title: string;
}) {
  const [index, setIndex] = useState(0);
  const [open, setOpen] = useState(false);

  const images = useMemo(() => {
    const posterKey = posterUrl ? clean(posterUrl) : null;
    const posterName = posterUrl ? baseName(posterUrl) : "";
    const seenPaths = new Set<string>();
    const seenNames = new Set<string>();
    const seenAssets = new Set<string>();
    const out: string[] = [];
    for (const raw of [...(gallery ?? []), ...(seatmap?.images ?? [])]) {
      const u = raw.trim();
      if (!u || isBanner(u)) continue;
      const key = clean(u);
      if (seenPaths.has(key)) continue;
      const name = baseName(u);
      if (posterKey && key === posterKey) continue;
      if (posterName && name === posterName) continue;
      if (name && seenNames.has(name)) continue;
      const keys = assetKeys(u);
      if (keys.some((assetKey) => seenAssets.has(assetKey))) continue;
      seenPaths.add(key);
      if (name) seenNames.add(name);
      keys.forEach((assetKey) => seenAssets.add(assetKey));
      out.push(u);
    }
    return out;
  }, [gallery, seatmap, posterUrl]);

  const total = images.length;

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + total) % total);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % total);
    }
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, total]);

  if (!total) return null;

  function openAt(i: number) {
    setIndex(i);
    setOpen(true);
  }

  return (
    <section id="sec-gallery" className="scroll-mt-[72px]">
      <div className="flex items-center gap-2">
        <ImageIcon className="h-5 w-5 text-[#111827] stroke-[2.5]" />
        <h2 className="font-sans text-[24px] font-bold text-[#111827]">Galeri</h2>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {images.map((url, i) => (
          <button
            key={i}
            type="button"
            onClick={() => openAt(i)}
            className="group relative block cursor-zoom-in overflow-hidden rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0F56FF]"
          >
            <img
              src={url}
              alt={`${title} - ${i + 1}`}
              className="aspect-[4/3] w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              loading="lazy"
            />
          </button>
        ))}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-[100] flex flex-col bg-black/95"
          role="dialog"
          aria-modal="true"
          onClick={() => setOpen(false)}
        >
          <div className="flex items-center justify-between px-4 py-3">
            <p className="text-xs text-white/70">
              {index + 1} / {total}
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Tutup galeri"
              className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4">
            {total > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Sebelumnya"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex((i) => (i - 1 + total) % total);
                  }}
                  className="absolute left-3 z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 md:p-3"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  aria-label="Berikutnya"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex((i) => (i + 1) % total);
                  }}
                  className="absolute right-3 z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 md:p-3"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
            <img
              src={images[index]}
              alt={`${title} - ${index + 1}`}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[64vh] w-auto max-w-full rounded-md object-contain"
            />
          </div>

          <div className="shrink-0 px-4 py-4">
            <div className="scrollbar-hide mx-auto flex max-w-3xl gap-3 overflow-x-auto">
              {images.map((url, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex(i);
                  }}
                  className={`relative shrink-0 overflow-hidden rounded-md transition ${
                    i === index ? "ring-2 ring-white" : "opacity-60 hover:opacity-100"
                  }`}
                >
                  <img src={url} alt="" className="h-14 w-20 object-cover" />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}