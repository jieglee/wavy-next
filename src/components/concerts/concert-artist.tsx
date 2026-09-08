import { Heart, Music } from "lucide-react";

interface Props {
  artistName: string;
  bio: string;
  genre: string;
  isFollowing: boolean;
  onFollow: () => void;
}

export default function ConcertArtist({ artistName, bio, genre, isFollowing, onFollow }: Props) {
  return (
    <section className="rounded-3xl border border-[#EDEBF2] bg-white p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl font-bold text-[#1B1A3A]">Musisi / Penampil</h2>
          <p className="text-xs text-[#8B889C]">Genre: {genre}</p>
        </div>
        <button
          onClick={onFollow}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
            isFollowing ? "bg-[#FF5470] text-white" : "border border-[#EDEBF2] bg-[#FAFAF8] text-[#1B1A3A] hover:border-[#FF5470]"
          }`}
        >
          <Heart className={`h-3.5 w-3.5 ${isFollowing ? "fill-white" : ""}`} />
          {isFollowing ? "Mengikuti" : "Ikuti Musisi"}
        </button>
      </div>

      <div className="mt-4 flex items-start gap-4">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF5470] to-[#1B1A3A] text-white font-bold text-xl">
          <Music className="h-8 w-8" />
        </div>
        <div>
          <h3 className="font-bold text-[#1B1A3A]">{artistName}</h3>
          <p className="mt-1 text-sm text-[#6B6875] leading-relaxed">{bio}</p>
        </div>
      </div>
    </section>
  );
}