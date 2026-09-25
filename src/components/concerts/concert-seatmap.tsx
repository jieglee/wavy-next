export default function ConcertSeatmap({
  seatmap,
}: {
  seatmap: { name: string; images: string[] } | null | undefined;
}) {
  if (!seatmap || !seatmap.images?.length) return null;
  return (
    <section className="scroll-mt-[72px]">
      <h2 className="text-[15px] font-bold tracking-tight text-[#0B1A2E]">Denah Tempat Duduk</h2>
      <p className="mt-1 text-[12px] font-semibold text-[#6B7280]">{seatmap.name}</p>
      <div className="mt-4 grid gap-4">
        {seatmap.images.map((img, i) => (
          <div key={i} className="overflow-hidden rounded-xl border border-[#E5E7EB] bg-white p-2">
            <img src={img} alt={seatmap.name} className="h-auto w-full rounded-lg object-contain" loading="lazy" />
          </div>
        ))}
      </div>
    </section>
  );
}