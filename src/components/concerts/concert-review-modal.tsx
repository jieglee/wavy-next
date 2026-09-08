import { Star } from "lucide-react";

export default function ConcertReviewModal({
  rating,
  setRating,
  comment,
  setComment,
  submitting,
  onClose,
  onSubmit,
}: {
  rating: number;
  setRating: (n: number) => void;
  comment: string;
  setComment: (s: string) => void;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="font-display text-xl font-bold text-[#1B1A3A]">Tulis Ulasan Konser</h3>
        <p className="text-xs text-[#6B6875] mt-1">Bagikan pengalaman menonton konser ini kepada pengguna lain.</p>
        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-[#1B1A3A]">Rating (1 - 5 Bintang)</label>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button type="button" key={star} onClick={() => setRating(star)} className="p-1">
                  <Star className={`h-7 w-7 transition-colors ${star <= rating ? "fill-amber-400 text-amber-400" : "text-gray-300"}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-[#1B1A3A]">Komentar</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder="Ceritakan keseruan konser..." className="mt-1 w-full rounded-2xl border border-[#EDEBF2] p-3 text-xs outline-none focus:border-[#FF5470]" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-[#EDEBF2] py-2.5 text-xs font-bold text-[#6B6875] hover:bg-gray-50">Batal</button>
            <button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-[#1B1A3A] py-2.5 text-xs font-bold text-white hover:bg-black">{submitting ? "Mengirim..." : "Kirim Ulasan"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
