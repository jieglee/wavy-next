import { forwardRef } from "react";
import { Image as ImageIcon } from "lucide-react";

const ConcertGallery = forwardRef<HTMLDivElement, { 
  gallery?: string[]; 
  seatmap?: { images: string[]; name: string } | null; 
  poster_url?: string | null;
  title: string 
}>(({ gallery, seatmap, poster_url, title }, ref) => {
    const normalize = (u: string) => u.trim().toLowerCase();
    const posterNorm = poster_url ? normalize(poster_url) : "";
    const isBanner = (u: string) => {
      const n = normalize(u);
      if (posterNorm && n === posterNorm) return true;
      if (n.includes("/banner/") || n.includes("banner_") || n.includes("banner-")) return true;
      return false;
    };
    const seen = new Set<string>();
    const unique = (list: string[]) => {
      const out: string[] = [];
      for (const raw of list) {
        const u = raw.trim();
        if (!u || isBanner(u) || seen.has(normalize(u))) continue;
        seen.add(normalize(u));
        out.push(u);
      }
      return out;
    };
    const seatmapImages = unique(seatmap?.images ?? []);
    const galleryImages = unique(gallery ?? []);
    const images = [...seatmapImages, ...galleryImages];
    if (!images.length) return null;
    return (
<section ref={ref} id="sec-gallery" className="scroll-mt-[72px]">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-[#111827] stroke-[2.5]" />
          <h2 className="font-sans text-[24px] font-bold text-[#111827]">Galeri</h2>
        </div>
        <div className="mt-4 flex flex-col gap-4">
          {images.map((url, i) => (
            <div key={i} className="group overflow-hidden rounded-xl">
              <img src={url} alt={`${title} - ${i + 1}`} className="aspect-video w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" loading="lazy" />
            </div>
          ))}
        </div>
      </section>
    );
  },
);
ConcertGallery.displayName = "ConcertGallery";
export default ConcertGallery;
