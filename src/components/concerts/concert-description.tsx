import { forwardRef } from "react";
import { sanitizeHtml } from "@/lib/sanitize";

const ConcertDescription = forwardRef<HTMLDivElement, { description: string }>(({ description }, ref) => {
  if (!description) return null;
  let html = sanitizeHtml(description);
  if (!/<[a-z][\s\S]*>/i.test(html)) html = html.replace(/\n/g, "<br>");
  return (
    <section ref={ref} id="sec-desc" className="scroll-mt-[72px]">
      <div className="font-sans text-justify text-[14px] leading-7 text-black [&_a]:text-black [&_a]:underline [&_em]:text-black [&_em]:not-italic" dangerouslySetInnerHTML={{ __html: html }} />
    </section>
  );
});
ConcertDescription.displayName = "ConcertDescription";
export default ConcertDescription;
