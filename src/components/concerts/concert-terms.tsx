"use client";

import { forwardRef, useState } from "react";
import { ShieldCheck, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { sanitizeHtml } from "@/lib/sanitize";

const ConcertTerms = forwardRef<HTMLDivElement, { terms: string; concertId?: number | string }>(({ terms }, ref) => {
  const t = useTranslations("ConcertTerms");
  const [open, setOpen] = useState(false);
  if (!terms) return null;
  const html = sanitizeHtml(terms);
  return (
    <section ref={ref} id="sec-terms" className="scroll-mt-[72px]">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-[#111827] stroke-[2.5]" />
        <h2 className="font-sans text-[24px] font-bold text-[#111827]">{t("title")}</h2>
      </div>
      <div className="relative mt-4">
        <div
          className={`relative overflow-hidden transition-[max-height] duration-500 ease-out ${
            open ? "max-h-[4000px]" : "max-h-[340px]"
          }`}
        >
          <div
            className="tnc-terms font-sans text-[13px] leading-6 text-[#111111] [&_a]:break-all [&_a]:text-[#4A90D9] [&_a]:underline [&_em]:text-[#4A90D9] [&_em]:not-italic [&_h3]:mb-1 [&_h3]:mt-8 [&_h3]:text-[13px] [&_h3]:font-extrabold [&_h3]:uppercase [&_h3]:text-[#111111] [&_h3]:first:mt-0 [&_h3+h3]:mt-1 [&_h3_em]:text-[#4A90D9] [&_h4]:mb-1 [&_h4]:mt-6 [&_h4]:text-[13px] [&_h4]:font-bold [&_h4]:uppercase [&_h4]:text-[#111111] [&_li]:mt-2 [&_li]:text-justify [&_li]:leading-6 [&_ol]:list-none [&_ol]:space-y-0 [&_ol]:pl-0 [&_p]:text-justify [&_p]:leading-6 [&_p+p]:mt-1 [&_strong]:font-bold [&_strong]:text-[#111111] [&_strong_em]:text-[#4A90D9] [&_ul]:list-disc [&_ul]:space-y-0 [&_ul]:pl-5 [&_ul_li]:marker:text-[#111111]"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          {!open && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-white/80 to-transparent" />
          )}
        </div>
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-full border border-[#EDEBF2] bg-white px-5 py-2 text-xs font-bold text-[#6B6875] shadow-sm transition hover:border-[#FF5470] hover:text-[#FF5470]"
          >
            {open ? t("collapse") : t("expand")}
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>
    </section>
  );
});
ConcertTerms.displayName = "ConcertTerms";
export default ConcertTerms;