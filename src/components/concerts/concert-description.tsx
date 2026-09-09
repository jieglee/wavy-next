import { forwardRef } from "react";
import { sanitizeHtml } from "@/lib/sanitize";

const ConcertDescription = forwardRef<HTMLDivElement, { description: string }>(({ description }, ref) => (
  <section ref={ref} id="sec-desc" className="scroll-mt-[140px]">
    <div className="tnc-html whitespace-pre-line font-sans text-[15px] leading-6 text-[#4B5563]" dangerouslySetInnerHTML={{ __html: sanitizeHtml(description || "") }} />
  </section>
));
ConcertDescription.displayName = "ConcertDescription";
export default ConcertDescription;
