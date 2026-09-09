import { Star, PenLine } from "lucide-react";
import type { Review } from "@/types/type";

export default function ConcertReviews({
  reviews,
  avgRating,
  reviewCount,
  onWriteReview,
}: {
  reviews: Review[];
  avgRating: number;
  reviewCount: number;
  onWriteReview: () => void;
}) {
  return (
    <section className="scroll-mt-[72px]">
      <div className="flex items-center justify-between gap-4 border-b border-[#F3F4F6] pb-4">
        <div>
          <h2 className="text-[15px] font-bold text-[#111827]">Ulasan</h2>
          <div className="mt-1.5 flex items-center gap-2">
            <span className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className={`h-4 w-4 ${s <= Math.round(avgRating) ? "fill-amber-400" : "fill-gray-200 text-gray-200"}`} />
              ))}
            </span>
            <span className="text-sm font-bold text-[#111827]">{avgRating.toFixed(1)}</span>
            <span className="text-xs text-[#6B7280]">({reviewCount})</span>
          </div>
        </div>
        <button onClick={onWriteReview} className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#E5E7EB] bg-white px-4 py-2 text-xs font-bold text-[#374151] hover:border-[#1E40AF] hover:text-[#1E40AF]">
          <PenLine className="h-3.5 w-3.5" />
          Tulis Ulasan
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {reviews?.length ? (
          reviews.map((rev) => (
            <div key={rev.id} className="rounded-xl border border-[#F3F4F6] bg-[#F9FAFB] p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#111827] text-xs font-bold text-white">
                    {(rev.customer_name || "U").charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">{rev.customer_name}</p>
                    <p className="text-[11px] text-[#6B7280]">{new Date(rev.created_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                </div>
                <span className="flex text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => (
                    <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                  ))}
                </span>
              </div>
              {rev.comment && <p className="mt-2 text-[13px] leading-6 text-[#374151]">{rev.comment}</p>}
            </div>
          ))
        ) : (
          <p className="py-6 text-center text-sm text-[#6B7280]">Belum ada ulasan.</p>
        )}
      </div>
    </section>
  );
}
