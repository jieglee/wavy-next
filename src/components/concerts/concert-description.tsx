import { forwardRef } from "react";
import { sanitizeHtml } from "@/lib/sanitize";

const ConcertDescription = forwardRef<HTMLDivElement, { description: string }>(({ description }, ref) => (
  <section ref={ref} id="sec-desc" className="scroll-mt-[140px] rounded-2xl bg-white p-5 sm:p-6">
    <div className="tnc-html mt-3 whitespace-pre-line text-[14px] leading-7 text-[#374151]" dangerouslySetInnerHTML={{ __html: sanitizeHtml(description || "") }} />
  </section>
));
ConcertDescription.displayName = "ConcertDescription";
export default ConcertDescription;
