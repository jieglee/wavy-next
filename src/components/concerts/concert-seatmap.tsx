export default function ConcertSeatmap({
  seatmap,
}: {
  seatmap: { name: string; image: string } | null | undefined;
}) {
  if (!seatmap) return null;
  return (
    <section className="scroll-mt-[140px]">
      <h2 className="text-[16px] font-bold text-[#111827]">Denah Tempat Duduk</h2>
      <p className="mt-1 text-sm text-[#6B7280]">{seatmap.name}</p>
      <div className="mt-4 overflow-hidden rounded-xl bg-transparent">
        <img src={seatmap.image} alt={seatmap.name} className="h-auto w-full object-contain" loading="lazy" />
      </div>
    </section>
  );
}
