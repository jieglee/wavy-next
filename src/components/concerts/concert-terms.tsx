"use client";

import { forwardRef, useState } from "react";
import { ShieldCheck, ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";
import { sanitizeHtml } from "@/lib/sanitize";

const ConcertTerms = forwardRef<HTMLDivElement, { terms: string; concertId?: number | string }>(({ terms }, ref) => {
  const t = useTranslations("ConcertDetail.terms");
  const [open, setOpen] = useState(false);
  if (!terms) return null;
  const html = sanitizeHtml(terms);
  return (
    <section ref={ref} id="sec-terms" className="scroll-mt-[72px]">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-foreground stroke-[2.5]" />
        <h2 className="font-sans text-[24px] font-bold text-foreground">{t("title")}</h2>
      </div>
      <div className="relative mt-4">
        <div
          className={`relative overflow-hidden transition-[max-height] duration-500 ease-out ${
            open ? "max-h-[none]" : "max-h-[340px]"
          }`}
        >
          <div
            className="tnc-terms font-sans text-base leading-6 text-foreground text-justify [&_a]:text-primary [&_a]:underline [&_em]:!text-primary [&_h3_em]:!text-primary [&_h4_em]:!text-primary [&_strong_em]:!text-primary"
            dangerouslySetInnerHTML={{ __html: html }}
          />
          {!open && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background via-background/80 to-transparent" />
          )}
        </div>
        <div className="mt-2 flex justify-center">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-4 py-1.5 text-xs font-bold text-muted-foreground transition hover:border-primary hover:text-primary"
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