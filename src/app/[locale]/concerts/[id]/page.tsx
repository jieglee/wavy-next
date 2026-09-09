"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { MapPin, Calendar, Layers } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import ConcertHero from "@/components/concerts/concert-hero";
import ConcertStickyHeader from "@/components/concerts/concert-sticky-header";
import ConcertDescription from "@/components/concerts/concert-description";
import ConcertGallery from "@/components/concerts/concert-gallery";
import ConcertSeatmap from "@/components/concerts/concert-seatmap";
import ConcertArtist from "@/components/concerts/concert-artist";
import ConcertTerms from "@/components/concerts/concert-terms";
import ConcertReviews from "@/components/concerts/concert-reviews";
import ConcertOrganizerShare from "@/components/concerts/concert-organizer-share";
import ConcertStickyBar from "@/components/concerts/concert-sticky-bar";
import ConcertReviewModal from "@/components/concerts/concert-review-modal";
import { apiGet, apiPost, getAuthToken } from "@/lib/api";
import { getMinPrice, formatIDR } from "@/lib/price";
import type { ConcertDetail } from "@/types/type";

async function loadConcert(id: string): Promise<ConcertDetail> {
  try {
    const data = await apiGet<ConcertDetail>(`/concerts/${id}`);
    return data;
  } catch {
    return {
      id: Number(id), organizer_id: 1, artist_id: 1, title: "Tiffany Young: Edge of Calm Tour in Jakarta", category: "Konser",
      venue: "JIEXPO Theatre, Jakarta Pusat", date: "2026-09-19T19:00:00+07:00",
      poster_url: "https://assets.loket.com/neo/production/images/banner/20260722120040_6a604e781ffbd.jpg", status: "published", artist_name: "Tiffany Young", organizer_name: "Flabbergast Productions", min_price: 950000, remaining: 250,
      description: "Tiffany Young: Edge of Calm Tour in Jakarta\nCelebrating the 10th anniversary of her solo debut, Tiffany Young is finally set to reunite with fans through the Tiffany Young: Edge of Calm Tour in Jakarta.\n\nA decade of music, unforgettable performances, and Tiffany Young's most heartfelt stories come together in a special concert created just for this milestone.\n\nJakarta will be one of the special stops on this Asia tour, bringing fans closer to Tiffany Young for a long-awaited reunion filled with unforgettable moments, heartfelt performances, and new memories to cherish together",
      genre: "K-Pop", photo_url: "", bio: "Tiffany Young — penyanyi, aktris, dan anggota Girls' Generation. Merayakan 10 tahun debut solonya lewat Edge of Calm Tour.",
      countdown_seconds: 15 * 86400,
      ticket_categories: [
        { id: 1, event_id: Number(id), name: "VIP (Seated)", price: 3250000, quota: 100, sold: 20, remaining: 80 },
        { id: 2, event_id: Number(id), name: "CAT R (Seated)", price: 2550000, quota: 200, sold: 60, remaining: 140 },
        { id: 3, event_id: Number(id), name: "CAT S (Seated)", price: 2000000, quota: 200, sold: 90, remaining: 110 },
        { id: 4, event_id: Number(id), name: "CAT A (Seated)", price: 1500000, quota: 300, sold: 120, remaining: 180 },
        { id: 5, event_id: Number(id), name: "CAT B (Seated)", price: 950000, quota: 400, sold: 200, remaining: 200 },
      ],
      reviews: [
        { id: 1, rating: 5, comment: "Gak sabar nonton Tiffany live!", created_at: "2026-07-10T12:00:00Z", customer_name: "Ahmad Rifai" },
        { id: 2, rating: 5, comment: "10th anniversary pasti spesial banget.", created_at: "2026-07-14T08:00:00Z", customer_name: "Siti Rahma" },
      ],
      avg_rating: 5.0, review_count: 2,
    };
  }
}

export default function ConcertDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [concert, setConcert] = useState<ConcertDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowingArtist, setIsFollowingArtist] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState("desc");
  const descRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const termsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      const data = await loadConcert(id);
      setConcert(data);
      setLoading(false);
    }
    loadDetail();
  }, [id]);

  function scrollToSection(tab: string, ref: React.RefObject<HTMLDivElement | null>) {
    setActiveTab(tab);
    if (!ref.current) return;
    const y = ref.current.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  async function handleFollowArtist() {
    if (!getAuthToken()) { toast.error("Silakan masuk terlebih dahulu"); router.push("/auth/login"); return; }
    try {
      if (isFollowingArtist) await apiPost(`/favorites/artists/${concert?.artist_id}`, {}, getAuthToken()!);
      else { await apiPost(`/favorites/artists/${concert?.artist_id}`); toast.success(`Berhasil mengikuti ${concert?.artist_name}`); }
      setIsFollowingArtist(!isFollowingArtist);
    } catch { setIsFollowingArtist(!isFollowingArtist); toast.success(`Mengikuti ${concert?.artist_name}`); }
  }
  function handleBuyTicket() {
    if (!concert) return;
    if (!getAuthToken()) { toast.error("Silakan masuk untuk melanjutkan pembelian"); router.push("/auth/login"); return; }
    const def = concert.ticket_categories?.[0];
    if (!def) { toast.error("Tiket belum tersedia"); return; }
    router.push(`/concerts/${id}/queue?catId=${def.id}&qty=1`);
  }
  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!getAuthToken()) { toast.error("Silakan masuk terlebih dahulu"); return; }
    setSubmittingReview(true);
    try { await apiPost(`/events/${id}/reviews`, { rating: ratingInput, comment: commentInput }); toast.success("Ulasan berhasil dikirim!"); setReviewModal(false); setCommentInput(""); }
    catch (err: unknown) { toast.error((err as Error).message || "Gagal mengirim ulasan."); }
    finally { setSubmittingReview(false); }
  }

  if (loading || !concert) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar sticky={false} />
        <div className="mx-auto max-w-[1180px] px-4 py-16 text-center sm:px-6 lg:px-8">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0F56FF] border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-[#6B7280]">Memuat informasi konser...</p>
        </div>
      </div>
    );
  }

  const remaining =
    concert.remaining ??
    (concert.ticket_categories?.length
      ? concert.ticket_categories.reduce((sum, c) => sum + (c.remaining ?? c.quota - c.sold), 0)
      : undefined);
  const soldOut = remaining !== undefined && remaining <= 0;
  const minPrice = getMinPrice(concert);
  const banner = concert.poster_url || concert.photo_url || "https://assets.loket.com/neo/production/images/banner/20260722120040_6a604e781ffbd.jpg";

    const tabs = [
    { id: "desc", label: "Deskripsi", onClick: () => scrollToSection("desc", descRef) },
    { id: "gallery", label: "Galeri", onClick: () => scrollToSection("gallery", galleryRef) },
    { id: "ticket", label: "Tiket", onClick: () => scrollToSection("gallery", galleryRef) },
    { id: "terms", label: "Syarat dan Ketentuan", onClick: () => scrollToSection("terms", termsRef) },
  ];

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-0">
      <Navbar sticky={false} />
      <ConcertHero concert={concert} />

      <ConcertStickyHeader tabs={tabs} activeTab={activeTab} minPrice={minPrice} onBuy={handleBuyTicket} />

      <div className="mx-auto max-w-[1180px] px-0 py-3 sm:px-0 lg:px-2">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
          <div className="space-y-6 min-w-0 pr-[60px] lg:pr-[76px]">
            <div className="lg:hidden overflow-hidden rounded-xl border border-[#E5E7EB] bg-white">
              <img src={banner} alt={concert.title} className="block h-auto w-full object-contain" />
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="text-[12px] leading-none text-[#6B7280]">Harga mulai dari</p>
                  <p className="mt-1 text-[18px] font-bold leading-none text-[#111827]">{formatIDR(minPrice)}</p>
                </div>
                <button onClick={handleBuyTicket} className="shrink-0 rounded-lg bg-[#0F56FF] px-6 py-2.5 text-[14px] font-bold text-white shadow-sm hover:bg-[#0B46D9]">Beli Tiket</button>
              </div>
              <div className="flex items-center gap-3 border-t border-[#F3F4F6] bg-[#FAFBFC] px-5 py-3.5">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-black tracking-wide text-white">FBG</div>
                <div className="min-w-0">
                  <p className="text-[11px] leading-none text-[#9AA0A6]">Diselenggarakan oleh</p>
                  <p className="mt-1 truncate text-[13px] font-bold leading-none text-[#111827]">{concert.organizer_name}</p>
                </div>
              </div>
            </div>

            <div ref={descRef} id="sec-desc" className="scroll-mt-[72px]">
              <ConcertDescription description={concert.description} />
            </div>
            <div ref={galleryRef} id="sec-gallery" className="scroll-mt-[72px]">
              <ConcertGallery gallery={concert.gallery ?? []} title={concert.title} />
            </div>
            <ConcertSeatmap seatmap={concert.seatmap} />
            <div ref={termsRef} id="sec-terms" className="scroll-mt-[72px]">
              <ConcertTerms concertId={id} terms={concert.terms_conditions ?? "- Tiket yang sudah dibeli tidak dapat ditukar atau dikembalikan.\n- Promotor tidak bertanggung jawab atas tiket di luar platform resmi.\n- Fan benefit hanya berlaku untuk kategori tiket tertentu.\n- Kamera profesional & livestream tidak diizinkan tanpa izin.\n- No admission for infants & children below 7 years old."} />
            </div>
            <ConcertArtist artistName={concert.artist_name} bio={concert.bio} genre={concert.genre} isFollowing={isFollowingArtist} onFollow={handleFollowArtist} />
            <ConcertReviews reviews={concert.reviews} avgRating={concert.avg_rating} reviewCount={concert.review_count} onWriteReview={() => setReviewModal(true)} />
            <div className="lg:hidden">
              <ConcertOrganizerShare eventTitle={concert.title} />
            </div>
          </div>

          <aside className="hidden lg:flex lg:flex-col">
            <div className="-mt-1 sticky top-[64px] z-10 overflow-hidden rounded-xl border border-[#E5E7EB] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.12)]">
              <div className="flex items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <p className="text-[12px] leading-none text-[#6B7280]">Harga mulai dari</p>
                  <p className="mt-1 text-[18px] font-bold leading-none text-[#111827]">{formatIDR(minPrice)}</p>
                </div>
                <button onClick={handleBuyTicket} className="shrink-0 rounded-lg bg-[#0F56FF] px-6 py-2.5 text-[14px] font-bold text-white shadow-sm hover:bg-[#0B46D9]">Beli Tiket</button>
              </div>
              <div className="px-5 pb-5 pt-1">
                <h2 className="text-[16px] font-bold leading-tight text-[#1A2B4C]">{concert.title}</h2>
                <div className="mt-4 space-y-3">
                  <div className="flex items-start gap-3 text-[13px] leading-snug text-[#1A2B4C]">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#1E3A8A]" strokeWidth={2} />
                    <span className="font-medium">{concert.venue}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[13px] text-[#1A2B4C]">
                    <Calendar className="h-4 w-4 shrink-0 text-[#1E3A8A]" strokeWidth={2} />
                    <span className="font-medium">19 Sep 2026, 19:00 - 21:00 WIB</span>
                  </div>
                  <div className="flex items-center gap-3 text-[13px] text-[#1A2B4C]">
                    <Layers className="h-4 w-4 shrink-0 text-[#1E3A8A]" strokeWidth={2} />
                    <span className="font-medium">Konser &nbsp;•&nbsp; Musik &nbsp;•&nbsp; K-Pop</span>
                  </div>
                </div>
                <div className="mt-5 flex items-center gap-3 border-t border-[#F3F4F6] pt-4">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-black text-[10px] font-black tracking-wide text-white">FBG</div>
                  <div className="min-w-0">
                    <p className="text-[11px] leading-none text-[#9AA0A6]">Diselenggarakan oleh</p>
                    <p className="mt-1 truncate text-[13px] font-bold leading-none text-[#111827]">{concert.organizer_name}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
              <ConcertOrganizerShare eventTitle={concert.title} />
            </div>
          </aside>
        </div>
      </div>

      <ConcertStickyBar minPrice={minPrice} soldOut={soldOut} onBuy={handleBuyTicket} />

      {reviewModal && (
        <ConcertReviewModal rating={ratingInput} setRating={setRatingInput} comment={commentInput} setComment={setCommentInput} submitting={submittingReview} onClose={() => setReviewModal(false)} onSubmit={handleSubmitReview} />
      )}
      <Footer />
    </div>
  );
}
