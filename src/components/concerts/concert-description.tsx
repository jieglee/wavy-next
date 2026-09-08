import { forwardRef } from "react";
import { sanitizeHtml } from "@/lib/sanitize";

const ConcertDescription = forwardRef<HTMLDivElement, { description: string }>(({ description }, ref) => (
  <section ref={ref} id="sec-desc" className="scroll-mt-[72px]">
    <div className="tnc-html whitespace-pre-line text-[14px] leading-7 text-[#374151]" dangerouslySetInnerHTML={{ __html: sanitizeHtml(description || "") }} />
  </section>
));
ConcertDescription.displayName = "ConcertDescription";
export default ConcertDescription;
