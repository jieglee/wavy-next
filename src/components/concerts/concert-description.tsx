import { forwardRef } from "react";

const ConcertDescription = forwardRef<HTMLDivElement, { description: string }>(({ description }, ref) => {
  if (!description) return null;
  return (
    <section ref={ref} id="sec-desc" className="scroll-mt-[140px]">
      <p className="whitespace-pre-line text-justify font-sans text-[15px] leading-6 text-gray-800">{description}</p>
    </section>
  );
});
ConcertDescription.displayName = "ConcertDescription";
export default ConcertDescription;
