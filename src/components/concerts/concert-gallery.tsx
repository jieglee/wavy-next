import { forwardRef } from "react";

const ConcertGallery = forwardRef<HTMLDivElement, { gallery: string[]; title: string }>(({ gallery, title }, ref) => (
  <section ref={ref} className="rounded-3xl border border-[#EDEBF2] bg-white p-6 sm:p-8 shadow-sm">
    <h2 className="font-display text-xl font-bold text-[#1B1A3A]">Galeri</h2>
    <div className="mt-4 flex gap-3 overflow-x-auto scroll-smooth">
      {gallery.map((url, i) => (
        <div key={i} className="relative aspect-video w-[280px] shrink-0 overflow-hidden rounded-2xl border border-[#EDEBF2]">
          <img src={url} alt={`${title} ${i + 1}`} className="absolute inset-0 h-full w-full object-cover" loading="lazy" />
        </div>
      ))}
    </div>
  </section>
));
ConcertGallery.displayName = "ConcertGallery";
export default ConcertGallery;