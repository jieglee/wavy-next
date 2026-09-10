export default function ConcertSeatmap({
  seatmap,
}: {
  seatmap: { name: string; images: string[] } | null | undefined;
}) {
  if (!seatmap || !seatmap.images?.length) return null;
  return (
    <section className="scroll-mt-[72px]">
      <h2 className="text-[16px] font-bold text-[#111827]">Denah Tempat Duduk</h2>
      <p className="mt-1 text-sm text-[#6B7280]">{seatmap.name}</p>
      <div className="mt-4 grid gap-4">
        {seatmap.images.map((img, i) => (
          <div key={i} className="overflow-hidden rounded-xl bg-transparent">
            <img src={img} alt={seatmap.name} className="h-auto w-full object-contain" loading="lazy" />
          </div>
        ))}
      </div>
    </section>
  );
}