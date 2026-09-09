import { forwardRef } from "react";
import { Image as ImageIcon } from "lucide-react";

const ConcertGallery = forwardRef<HTMLDivElement, { gallery: string[]; title: string }>(
  ({ gallery, title }, ref) => {
    if (!gallery?.length) return null;
    return (
  <section ref={ref} id="sec-gallery" className="scroll-mt-[140px]">
        <div className="mx-auto max-w-4xl">
          <div className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5 text-[#1E40AF]" />
            <h2 className="font-sans text-[24px] font-bold text-[#111827]">Galeri</h2>
          </div>
          <div className="mt-4 flex flex-col gap-4">
            {gallery.map((url, i) => (
              <div key={i} className="overflow-hidden rounded-xl">
                <img src={url} alt={`${title} ${i + 1}`} className="h-auto w-full object-cover" loading="lazy" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  },
);
ConcertGallery.displayName = "ConcertGallery";
export default ConcertGallery;
