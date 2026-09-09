import { forwardRef } from "react";
import { ShieldCheck } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";

const TIFFANY_TERMS: { id: string; en: string }[] = [
  { id: "Tiket yang sudah dibeli tidak dapat ditukar atau dikembalikan.", en: "Tickets that have been purchased cannot be exchanged or refunded." },
  { id: "Promotor tidak bertanggung jawab atas tiket di luar platform resmi.", en: "The promoter is not responsible for tickets outside the official platform." },
  { id: "Fan benefit hanya berlaku untuk kategori tiket tertentu.", en: "Fan benefits only apply to certain ticket categories." },
  { id: "Kamera profesional & livestream tidak diizinkan tanpa izin.", en: "Professional cameras & livestream are not allowed without permission." },
  { id: "Anak bayi & anak di bawah 7 tahun tidak diperbolehkan masuk.", en: "No admission for infants & children below 7 years old." },
];

const ConcertTerms = forwardRef<HTMLDivElement, { terms: string; concertId?: number | string }>(({ terms, concertId }, ref) => {
  if (!terms) return null;
  const isTiffany = String(concertId) === "1401";
  if (isTiffany) {
    return (
      <section ref={ref} id="sec-terms" className="scroll-mt-[140px]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#1E40AF]" />
          <h2 className="text-[16px] font-bold text-[#111827]">Syarat & Ketentuan</h2>
        </div>
        <ol className="mt-3 list-decimal space-y-3 pl-5 font-sans text-sm leading-6">
          {TIFFANY_TERMS.map((t, i) => (
            <li key={i} className="pl-1">
              <p className="text-gray-800">{t.id}</p>
              <p className="italic text-[#E89095]">{t.en}</p>
            </li>
          ))}
        </ol>
      </section>
    );
  }
  return (
    <section ref={ref} id="sec-terms" className="scroll-mt-[140px]">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-[#1E40AF]" />
        <h2 className="text-[16px] font-bold text-[#111827]">Syarat & Ketentuan</h2>
      </div>
      <div className="tnc-html mt-3 font-sans text-[14px] leading-5 text-[#4B5563]" dangerouslySetInnerHTML={{ __html: sanitizeHtml(terms) }} />
    </section>
  );
});
ConcertTerms.displayName = "ConcertTerms";
export default ConcertTerms;
