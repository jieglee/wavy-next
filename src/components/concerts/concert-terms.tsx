import { forwardRef } from "react";

const ConcertTerms = forwardRef<HTMLDivElement, { terms: string }>(({ terms }, ref) => (
  <section ref={ref} className="rounded-3xl border border-[#EDEBF2] bg-white p-6 sm:p-8 shadow-sm">
    <h2 className="font-display text-xl font-bold text-[#1B1A3A]">Syarat & Ketentuan</h2>
    <p className="mt-3 whitespace-pre-line leading-relaxed text-[#6B6875]">{terms}</p>
  </section>
));
ConcertTerms.displayName = "ConcertTerms";
export default ConcertTerms;