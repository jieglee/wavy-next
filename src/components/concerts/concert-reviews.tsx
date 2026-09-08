import { Star } from "lucide-react";
import type { ConcertDetail } from "@/types/type";

interface Props {
  reviews: ConcertDetail["reviews"];
  avgRating: number;
  reviewCount: number;
  onWriteReview: () => void;
}

export default function ConcertReviews({ reviews, avgRating, reviewCount, onWriteReview }: Props) {
  return (
    <section className="rounded-3xl border border-[#EDEBF2] bg-white p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#EDEBF2] pb-4">
        <div>
          <h2 className="font-display text-xl font-bold text-[#1B1A3A]">Ulasan Penggemar</h2>
          <div className="mt-1 flex items-center gap-2">
            <div className="flex text-amber-400">
              {[1, 2, 3, 4, 5].map((s) => <Star key={s} className="h-4 w-4 fill-amber-400" />)}
            </div>
            <span className="text-sm font-bold text-[#1B1A3A]">{avgRating.toFixed(1)}</span>
            <span className="text-xs text-[#8B889C]">({reviewCount} ulasan)</span>
          </div>
        </div>
        <button onClick={onWriteReview} className="rounded-full bg-[#1B1A3A] px-4 py-2 text-xs font-bold text-white hover:bg-black">
          Tulis Ulasan
        </button>
      </div>

      <div className="mt-6 space-y-4">
        {reviews?.length > 0 ? (
          reviews.map((rev) => (
            <div key={rev.id} className="rounded-2xl bg-[#FAFAF8] p-4 border border-[#EDEBF2]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-[#1B1A3A]">{rev.customer_name}</span>
                <div className="flex text-amber-400">
                  {Array.from({ length: rev.rating }).map((_, i) => <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />)}
                </div>
              </div>
              {rev.comment && <p className="mt-2 text-xs text-[#6B6875]">{rev.comment}</p>}
            </div>
          ))
        ) : (
          <p className="text-center py-6 text-sm text-[#8B889C]">Belum ada ulasan untuk konser ini.</p>
        )}
      </div>
    </section>
  );
}