import { Heart, Music2, Users } from "lucide-react";

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
  return (
    <section className="rounded-2xl border border-[#E5E7EB] bg-white p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-[15px] font-bold text-[#111827]">Tentang Penampil</h2>
        <button
          onClick={onFollow}
          className={`flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
            isFollowing ? "bg-[#1E40AF] text-white" : "border border-[#E5E7EB] bg-white text-[#374151] hover:border-[#1E40AF] hover:text-[#1E40AF]"
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${isFollowing ? "fill-white" : ""}`} />
          {isFollowing ? "Mengikuti" : "Ikuti"}
        </button>
      </div>
      <div className="mt-4 flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#111827] text-white">
          <Music2 className="h-6 w-6" />
        </div>
        <div className="min-w-0">
          <h3 className="flex flex-wrap items-center gap-2 text-sm font-bold text-[#111827]">
            {artistName}
            {typeof followerCount === "number" && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-[#6B7280]">
                <Users className="h-3.5 w-3.5" />
                {followerCount.toLocaleString("id-ID")} penggemar
              </span>
            )}
            <span className="rounded-full bg-[#F3F4F6] px-2 py-0.5 text-[11px] font-semibold text-[#6B7280]">{genre}</span>
          </h3>
          {bio && <p className="mt-1.5 text-[13px] leading-6 text-[#4B5563]">{bio}</p>}
        </div>
      </div>
    </section>
  );
}
