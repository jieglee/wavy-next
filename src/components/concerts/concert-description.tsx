import { forwardRef } from "react";
import { ShieldCheck, CheckCircle2 } from "lucide-react";

const ConcertDescription = forwardRef<HTMLDivElement, { description: string }>(({ description }, ref) => (
  <section ref={ref} className="rounded-3xl border border-[#EDEBF2] bg-white p-6 sm:p-8 shadow-sm">
    <h2 className="font-display text-xl font-bold text-[#1B1A3A]">Tentang Konser</h2>
    <p className="mt-3 leading-relaxed text-[#6B6875]">{description}</p>
    <div className="mt-6 flex flex-wrap gap-4 border-t border-[#EDEBF2] pt-6">
      <div className="flex items-center gap-2 text-xs font-semibold text-[#1B1A3A]">
        <ShieldCheck className="h-4 w-4 text-emerald-500" />
        Tiket Resmi Terverifikasi
      </div>
      <div className="flex items-center gap-2 text-xs font-semibold text-[#1B1A3A]">
        <CheckCircle2 className="h-4 w-4 text-[#FF5470]" />
        Garansi Anti-Scalper & QR Otentik
      </div>
    </div>
  </section>
));
ConcertDescription.displayName = "ConcertDescription";
export default ConcertDescription;