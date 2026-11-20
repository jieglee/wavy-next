"use client";

import { Heart, Music2, Users } from "lucide-react";
import { useFormatter, useTranslations } from "next-intl";

export default function ConcertArtist({
  artistName,
  bio,
  genre,
  followerCount,
  isFollowing,
  onFollow,
}: {
  artistName: string;
  bio: string;
  genre: string;
  followerCount?: number;
  isFollowing: boolean;
  onFollow: () => void;
}) {
  const t = useTranslations("ConcertDetail.artist");
  const format = useFormatter();
  return (
    <section className="scroll-mt-[72px]">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[15px] font-bold text-foreground">{t("title")}</h2>
        <button
          onClick={onFollow}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
            isFollowing ? "bg-primary text-primary-foreground" : "border border-border bg-background text-foreground/85 hover:border-primary hover:text-primary"
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${isFollowing ? "fill-primary-foreground" : ""}`} />
          {isFollowing ? t("following") : t("follow")}
        </button>
      </div>
      <div className="mt-4 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
          <Music2 className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <h3 className="flex flex-wrap items-center gap-2 text-sm font-bold text-foreground">
            {artistName}
            {typeof followerCount === "number" && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                {t("followers", { count: followerCount, formatted: format.number(followerCount) })}
              </span>
            )}
            <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">{genre}</span>
          </h3>
          {bio && <p className="mt-1.5 text-[13px] leading-6 text-foreground/80">{bio}</p>}
        </div>
      </div>
    </section>
  );
}
