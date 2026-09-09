import { forwardRef } from "react";
import { ShieldCheck } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";

const ConcertTerms = forwardRef<HTMLDivElement, { terms: string; concertId?: number | string }>(({ terms }, ref) => {
  if (!terms) return null;
  return (
    <section ref={ref} id="sec-terms" className="scroll-mt-[140px]">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-[#1E40AF]" />
        <h2 className="font-sans text-[16px] font-bold text-[#111827]">Syarat & Ketentuan</h2>
      </div>
      <div className="tnc-terms mt-3 font-sans text-sm leading-6 text-gray-800 [&_a]:text-rose-500 [&_a]:underline [&_em]:italic [&_em]:text-rose-500 [&_h4]:text-sm [&_h4]:font-normal [&_h4]:leading-6 [&_strong]:text-sm" dangerouslySetInnerHTML={{ __html: sanitizeHtml(terms) }} />
    </section>
  );
});
ConcertTerms.displayName = "ConcertTerms";
export default ConcertTerms;
