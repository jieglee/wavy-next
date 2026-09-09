import { forwardRef } from "react";
import { ShieldCheck } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";

const ConcertTerms = forwardRef<HTMLDivElement, { terms: string; concertId?: number | string }>(({ terms }, ref) => {
  if (!terms) return null;
  let html = sanitizeHtml(terms);
  html = html.replace(/Loket\.com[\s\S]*?FLABBERGAST PRODUCTIONS/gi, "FLABBERGAST PRODUCTIONS");
  html = html.replace(/Phone:\s*021-30003160[^<]*/gi, "");
  html = html.replace(/Email:\s*[^<]*support@loket\.com[^<]*/gi, "");
  html = html.replace(/Customer Service Info[\s\S]*?FLABBERGAST PRODUCTIONS/gi, "FLABBERGAST PRODUCTIONS");
  html = html.replace(/For more information about ticket purchase[\s\S]*?FLABBERGAST/gi, "FLABBERGAST");
  return (
    <section ref={ref} id="sec-terms" className="scroll-mt-[140px]">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-4 w-4 text-[#1E40AF]" />
        <h2 className="font-sans text-[16px] font-bold text-[#111827]">Syarat & Ketentuan</h2>
      </div>
      <div className="tnc-terms mt-3 font-sans text-base leading-6 text-gray-800 [&_a]:text-rose-500 [&_a]:underline [&_em]:!text-rose-500 [&_h3_em]:!text-rose-500 [&_h4_em]:!text-rose-500 [&_strong_em]:!text-rose-500" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
});
ConcertTerms.displayName = "ConcertTerms";
export default ConcertTerms;
