import { forwardRef } from "react";
import { Image as ImageIcon } from "lucide-react";

const ConcertGallery = forwardRef<HTMLDivElement, { 
  gallery?: string[]; 
  seatmap?: { images: string[]; name: string } | null; 
  title: string 
}>(({ gallery, seatmap, title }, ref) => {
    const clean = (u: string) => {
      try {
        const url = new URL(u.trim());
        return (url.origin + url.pathname).toLowerCase().replace(/\/+$/, "");
      } catch {
        return u.trim().toLowerCase().split("?")[0].split("#")[0].replace(/\/+$/, "");
      }
    };
    const isBanner = (u: string) => {
      const n = u.trim().toLowerCase();
      return n.includes("/banner/") || n.includes("banner_") || n.includes("banner-");
    };
    const seen = new Set<string>();
    const unique = (list: string[]) => {
      const out: string[] = [];
      for (const raw of list) {
        const u = raw.trim();
        if (!u || isBanner(u) || seen.has(clean(u))) continue;
        seen.add(clean(u));
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
