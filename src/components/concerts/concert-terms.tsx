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
  html = html.replace(/Hari\s*\/\s*Tanggal\s*<br[^>]*>\s*<em[^>]*>\s*Day\s*\/\s*Date\s*<\/em>\s*<br[^>]*>\s*:\s*([^<]+)\s*<br[^>]*>\s*<em[^>]*>\s*:\s*([^<]+)\s*<\/em>/gi, "Hari / Tanggal : $1<br><em>Day / Date : $2</em>");
  html = html.replace(/Waktu\s*<br[^>]*>\s*<em[^>]*>\s*Time\s*<\/em>\s*<br[^>]*>\s*:\s*([^<]+)\s*<br[^>]*>\s*<em[^>]*>\s*:\s*([^<]+)\s*<\/em>/gi, "Waktu : $1<br><em>Time : $2</em>");
  return (
    <section ref={ref} id="sec-terms" className="scroll-mt-[72px]">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-[#111827] stroke-[2.5]" />
        <h2 className="font-sans text-[16px] font-bold text-[#111827]">Syarat & Ketentuan</h2>
      </div>
      <div className="tnc-terms mt-3 font-sans text-base leading-6 text-gray-800 text-justify [&_a]:text-rose-500 [&_a]:underline [&_em]:!text-rose-500 [&_h3_em]:!text-rose-500 [&_h4_em]:!text-rose-500 [&_strong_em]:!text-rose-500" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
});
ConcertTerms.displayName = "ConcertTerms";
export default ConcertTerms;
