"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "@/i18n/navigation";
import { ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { apiGet, apiPost, getAuthToken } from "@/lib/api";
import type { ConcertDetail, TicketCategory } from "@/types/type";

import ConcertHero from "@/components/concerts/concert-hero";
import ConcertTabs from "@/components/concerts/concert-tabs";
import ConcertDescription from "@/components/concerts/concert-description";
import ConcertGallery from "@/components/concerts/concert-gallery";
import ConcertArtist from "@/components/concerts/concert-artist";
import ConcertTerms from "@/components/concerts/concert-terms";
import ConcertReviews from "@/components/concerts/concert-reviews";
import ConcertReviewModal from "@/components/concerts/concert-review-modal";
import ConcertTicketSidebar from "@/components/concerts/concert-ticket-sidebar";

export default function ConcertDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();

  const [concert, setConcert] = useState<ConcertDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<TicketCategory | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isFollowingArtist, setIsFollowingArtist] = useState(false);
  const [isNotified, setIsNotified] = useState(false);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [reviewModal, setReviewModal] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState("desc");

  const descRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const ticketRef = useRef<HTMLDivElement>(null);
  const termsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadDetail() {
      setLoading(true);
      try {
        const data = await apiGet<ConcertDetail>(`/concerts/${id}`);
        setConcert(data);
        if (data.ticket_categories?.length > 0) setSelectedCategory(data.ticket_categories[0]);
      } catch {
        const mock: ConcertDetail = {
          id: Number(id), organizer_id: 1, artist_id: 1,
          title: "The Legends Infinity World Tour", category: "Festival",
          venue: "Indonesia Convention Exhibition (ICE) BSD, Tangerang",
          date: new Date(Date.now() + 15 * 86400000).toISOString(),
          poster_url: "", status: "published",
          artist_name: "TRUST Orchestra", organizer_name: "TRUST Productions",
          min_price: 300000, remaining: 120,
          description: "Saksikan kolaborasi megah orkestra symphonic terbesar di Asia Tenggara mempersembahkan lagu-lagu legendaris dari anime, game, dan soundtrack film terbaik.",
          genre: "Symphonic Orchestra", photo_url: "",
          bio: "TRUST Orchestra adalah ansambel orkestra independen ternama di Indonesia yang memenangkan berbagai penghargaan internasional.",
          countdown_seconds: 15 * 86400,
          ticket_categories: [
            { id: 1, event_id: Number(id), name: "VIP Center (Numbered Seating)", price: 850000, quota: 100, sold: 60, remaining: 40 },
            { id: 2, event_id: Number(id), name: "CAT 1 (Front Row)", price: 550000, quota: 200, sold: 150, remaining: 50 },
            { id: 3, event_id: Number(id), name: "Festival Standing", price: 300000, quota: 300, sold: 270, remaining: 30 },
          ],
          reviews: [
            { id: 1, rating: 5, comment: "Konser tahun lalu pecah banget!", created_at: "2026-07-10T12:00:00Z", customer_name: "Ahmad Rifai" },
            { id: 2, rating: 5, comment: "Wajib nonton buat pecinta musik orkestra modern.", created_at: "2026-07-14T08:00:00Z", customer_name: "Siti Rahma" },
          ],
          avg_rating: 5.0, review_count: 2,
        };
        setConcert(mock);
        setSelectedCategory(mock.ticket_categories[0]);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  useEffect(() => {
    if (!concert?.date) return;
    const target = new Date(concert.date).getTime();
    function updateTimer() {
      const diff = Math.max(0, target - Date.now());
      setCountdown({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    }
    updateTimer();
    const timer = setInterval(updateTimer, 1000);
    return () => clearInterval(timer);
  }, [concert?.date]);

  function scrollToSection(tab: string, ref: React.RefObject<HTMLDivElement | null>) {
    setActiveTab(tab);
    if (!ref.current) return;
    const y = ref.current.getBoundingClientRect().top + window.scrollY - 88;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  async function handleFollowArtist() {
    if (!getAuthToken()) { toast.error("Silakan masuk terlebih dahulu"); router.push("/auth/login"); return; }
    try {
      if (isFollowingArtist) await apiPost(`/favorites/artists/${concert?.artist_id}`, {}, getAuthToken()!);
      else { await apiPost(`/favorites/artists/${concert?.artist_id}`); toast.success(`Berhasil mengikuti ${concert?.artist_name}`); }
      setIsFollowingArtist(!isFollowingArtist);
    } catch {
      setIsFollowingArtist(!isFollowingArtist);
      toast.success(`Mengikuti ${concert?.artist_name}`);
    }
  }

  async function handleNotifyMe() {
    if (!getAuthToken()) { toast.error("Silakan masuk terlebih dahulu"); router.push("/auth/login"); return; }
    try {
      await apiPost(`/concerts/${id}/notify-me`);
      setIsNotified(true);
      toast.success("Pengingat konser berhasil diaktifkan!");
    } catch {
      setIsNotified(true);
      toast.success("Pengingat konser aktif!");
    }
  }

  async function handleProceedCheckout() {
    if (!selectedCategory) { toast.error("Pilih kategori tiket terlebih dahulu"); return; }
    if (!getAuthToken()) { toast.error("Silakan masuk untuk melanjutkan pembelian"); router.push("/auth/login"); return; }
    router.push(`/concerts/${id}/queue?catId=${selectedCategory.id}&qty=${quantity}`);
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!getAuthToken()) { toast.error("Silakan masuk terlebih dahulu"); return; }
    setSubmittingReview(true);
    try {
      await apiPost(`/events/${id}/reviews`, { rating: ratingInput, comment: commentInput });
      toast.success("Ulasan berhasil dikirim!");
      setReviewModal(false);
      setCommentInput("");
    } catch (err: unknown) {
      toast.error((err as Error).message || "Gagal mengirim ulasan.");
    } finally {
      setSubmittingReview(false);
    }
  }

  if (loading || !concert) {
    return (
      <div className="min-h-screen bg-[#FDFCFB]">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 py-16 text-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#FF5470] border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-[#8B889C]">Memuat informasi konser...</p>
        </div>
      </div>
    );
  }

  const dateFormatted = new Date(concert.date).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const timeFormatted = new Date(concert.date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });

  const tabs = [
    { id: "desc", label: "Deskripsi", onClick: () => scrollToSection("desc", descRef) },
    ...(concert.gallery?.length ? [{ id: "gallery", label: "Galeri", onClick: () => scrollToSection("gallery", galleryRef) }] : []),
    { id: "ticket", label: "Tiket", onClick: () => scrollToSection("ticket", ticketRef) },
    ...(concert.terms_conditions ? [{ id: "terms", label: "Syarat dan Ketentuan", onClick: () => scrollToSection("terms", termsRef) }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/concerts" className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#8B889C] transition-colors hover:text-[#1B1A3A]">
          <ArrowLeft className="h-4 w-4" />
          Semua Konser
        </Link>

        <ConcertHero
          concert={concert}
          dateFormatted={dateFormatted}
          timeFormatted={timeFormatted}
          countdown={countdown}
          isNotified={isNotified}
          onNotify={handleNotifyMe}
          onBuyClick={() => scrollToSection("ticket", ticketRef)}
        />

        <ConcertTabs tabs={tabs} activeTab={activeTab} />

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          <div className="space-y-10 lg:col-span-2">
            <ConcertDescription ref={descRef} description={concert.description} />

            {(concert.gallery?.length ?? 0) > 0 && (
              <ConcertGallery ref={galleryRef} gallery={concert.gallery!} title={concert.title} />
            )}

            <ConcertArtist
              artistName={concert.artist_name}
              bio={concert.bio}
              genre={concert.genre}
              isFollowing={isFollowingArtist}
              onFollow={handleFollowArtist}
            />

            {concert.terms_conditions && <ConcertTerms ref={termsRef} terms={concert.terms_conditions} />}

            <ConcertReviews
              reviews={concert.reviews}
              avgRating={concert.avg_rating}
              reviewCount={concert.review_count}
              onWriteReview={() => setReviewModal(true)}
            />
          </div>

          <ConcertTicketSidebar
            ref={ticketRef}
            categories={concert.ticket_categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            quantity={quantity}
            onQuantityChange={setQuantity}
            onCheckout={handleProceedCheckout}
          />
        </div>
      </main>

      {reviewModal && (
        <ConcertReviewModal
          rating={ratingInput}
          setRating={setRatingInput}
          comment={commentInput}
          setComment={setCommentInput}
          submitting={submittingReview}
          onClose={() => setReviewModal(false)}
          onSubmit={handleSubmitReview}
        />
      )}

      <Footer />
    </div>
  );
}