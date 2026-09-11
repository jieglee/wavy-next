"use client";

import { forwardRef, useState } from "react";
import { ShieldCheck, ChevronDown } from "lucide-react";
import { sanitizeHtml } from "@/lib/sanitize";

const ConcertTerms = forwardRef<HTMLDivElement, { terms: string; concertId?: number | string }>(({ terms }, ref) => {
  const [open, setOpen] = useState(false);
  if (!terms) return null;
  let html = sanitizeHtml(terms);
  if (!/<[a-z][\s\S]*>/i.test(html)) html = html.replace(/\n/g, "<br>");
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
        <h2 className="font-sans text-[24px] font-bold text-[#111827]">Syarat & Ketentuan</h2>
      </div>
      <div className="relative mt-4">
        <div
          className={`relative overflow-hidden transition-[max-height] duration-500 ease-out ${
            open ? "max-h-[none]" : "max-h-[340px]"
          }`}
        >
          <div
            className="tnc-terms font-sans text-base leading-6 text-gray-800 text-justify [&_a]:text-rose-500 [&_a]:underline [&_em]:!text-rose-500 [&_h3_em]:!text-rose-500 [&_h4_em]:!text-rose-500 [&_strong_em]:!text-rose-500"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          {!open && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-white/80 to-transparent" />
          )}
        </div>
        <div className="mt-2 flex justify-center">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1 rounded-full border border-[#EDEBF2] bg-white px-4 py-1.5 text-xs font-bold text-[#6B6875] transition hover:border-[#FF5470] hover:text-[#FF5470]"
          >
            {open ? "Tutup" : "Lihat Selengkapnya"}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>
    </section>
  );
});
ConcertTerms.displayName = "ConcertTerms";
export default ConcertTerms;