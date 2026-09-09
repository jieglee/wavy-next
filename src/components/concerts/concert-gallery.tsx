import { forwardRef } from "react";

const ConcertGallery = forwardRef<HTMLDivElement, { gallery: string[]; title: string }>(
  ({ gallery, title }, ref) => {
    if (!gallery?.length) return null;
    return (
      <section ref={ref} id="sec-gallery" className="scroll-mt-[140px] rounded-2xl bg-white p-5 sm:p-6">
        <h2 className="text-[15px] font-bold text-[#111827]">Galeri</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {gallery.map((url, i) => (
            <div key={i} className="overflow-hidden rounded-xl">
              <img src={url} alt={`${title} ${i + 1}`} className="aspect-[4/3] w-full object-cover" loading="lazy" />
            </div>
          ))}
        </div>
      </section>
    );
  },
);
ConcertGallery.displayName = "ConcertGallery";
export default ConcertGallery;
