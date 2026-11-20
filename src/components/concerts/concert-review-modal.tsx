"use client";

import { Star } from "lucide-react";
import { useTranslations } from "next-intl";

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
  const t = useTranslations("ConcertDetail.review");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-background p-6 shadow-2xl">
        <h3 className="font-display text-xl font-bold text-foreground">{t("title")}</h3>
        <p className="text-xs text-muted-foreground mt-1">{t("subtitle")}</p>
        <form onSubmit={onSubmit} className="mt-4 space-y-4">
          <div>
            <label className="text-xs font-bold text-foreground">{t("rating")}</label>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button type="button" key={star} onClick={() => setRating(star)} className="p-1" aria-label={t("star", { n: star })}>
                  <Star className={`h-7 w-7 transition-colors ${star <= rating ? "fill-[#FFB800] text-[#FFB800]" : "text-muted-foreground/40"}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-bold text-foreground">{t("comment")}</label>
            <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3} placeholder={t("commentPlaceholder")} className="mt-1 w-full rounded-2xl border border-border p-3 text-xs outline-none focus:border-primary" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 rounded-xl border border-border py-2.5 text-xs font-bold text-muted-foreground hover:bg-surface">{t("cancel")}</button>
            <button type="submit" disabled={submitting} className="flex-1 rounded-xl bg-foreground py-2.5 text-xs font-bold text-background hover:opacity-90">{submitting ? t("submitting") : t("submit")}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
