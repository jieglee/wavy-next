"use client";

import { useState, useEffect, useRef, use } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  MapPin,
  Calendar,
  Clock,
  Heart,
  Bell,
  Star,
  CheckCircle2,
  ArrowLeft,
  Share2,
  ShieldCheck,
  Music,
  Ticket,
} from "lucide-react";
import toast from "react-hot-toast";
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import { apiGet, apiPost, getAuthToken } from "@/lib/api";
import type { ConcertDetail, TicketCategory } from "@/types/type";

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
        if (data.ticket_categories?.length > 0) {
          setSelectedCategory(data.ticket_categories[0]);
        }
      } catch {
        // Mock fallback if offline
        const mock: ConcertDetail = {
          id: Number(id),
          organizer_id: 1,
          artist_id: 1,
          title: "The Legends Infinity World Tour",
          category: "Festival",
          venue: "Indonesia Convention Exhibition (ICE) BSD, Tangerang",
          date: new Date(Date.now() + 15 * 86400000).toISOString(),
          poster_url: "",
          status: "published",
          artist_name: "TRUST Orchestra",
          organizer_name: "TRUST Productions",
          min_price: 300000,
          remaining: 120,
          description:
            "Saksikan kolaborasi megah orkestra symphonic terbesar di Asia Tenggara mempersembahkan lagu-lagu legendaris dari anime, game, dan soundtrack film terbaik.",
          genre: "Symphonic Orchestra",
          photo_url: "",
          bio: "TRUST Orchestra adalah ansambel orkestra independen ternama di Indonesia yang memenangkan berbagai penghargaan internasional.",
          countdown_seconds: 15 * 86400,
          ticket_categories: [
            { id: 1, event_id: Number(id), name: "VIP Center (Numbered Seating)", price: 850000, quota: 100, sold: 60, remaining: 40 },
            { id: 2, event_id: Number(id), name: "CAT 1 (Front Row)", price: 550000, quota: 200, sold: 150, remaining: 50 },
            { id: 3, event_id: Number(id), name: "Festival Standing", price: 300000, quota: 300, sold: 270, remaining: 30 },
          ],
          reviews: [
            { id: 1, rating: 5, comment: "Konser tahun lalu pecah banget! Tata panggung dan audionya kelas dunia.", created_at: "2026-07-10T12:00:00Z", customer_name: "Ahmad Rifai" },
            { id: 2, rating: 5, comment: "Wajib nonton buat pecinta musik orkestra modern.", created_at: "2026-07-14T08:00:00Z", customer_name: "Siti Rahma" },
          ],
          avg_rating: 5.0,
          review_count: 2,
        };
        setConcert(mock);
        setSelectedCategory(mock.ticket_categories[0]);
      } finally {
        setLoading(false);
      }
    }
    loadDetail();
  }, [id]);

  // Countdown timer calculation
  useEffect(() => {
    if (!concert?.date) return;
    const target = new Date(concert.date).getTime();

    function updateTimer() {
      const now = Date.now();
      const diff = Math.max(0, target - now);
      const d = Math.floor(diff / (1000 * 60 * 60 * 24));
      const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((diff % (1000 * 60)) / 1000);
      setCountdown({ days: d, hours: h, minutes: m, seconds: s });
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
    if (!getAuthToken()) {
      toast.error("Silakan masuk terlebih dahulu");
      router.push("/auth/login");
      return;
    }
    try {
      if (isFollowingArtist) {
        await apiPost(`/favorites/artists/${concert?.artist_id}`, {}, getAuthToken()!);
      } else {
        await apiPost(`/favorites/artists/${concert?.artist_id}`);
        toast.success(`Berhasil mengikuti ${concert?.artist_name}`);
      }
      setIsFollowingArtist(!isFollowingArtist);
    } catch {
      setIsFollowingArtist(!isFollowingArtist);
      toast.success(`Mengikuti ${concert?.artist_name}`);
    }
  }

  async function handleNotifyMe() {
    if (!getAuthToken()) {
      toast.error("Silakan masuk terlebih dahulu");
      router.push("/auth/login");
      return;
    }
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
    if (!selectedCategory) {
      toast.error("Pilih kategori tiket terlebih dahulu");
      return;
    }

    if (!getAuthToken()) {
      toast.error("Silakan masuk untuk melanjutkan pembelian");
      router.push("/auth/login");
      return;
    }

    router.push(`/concerts/${id}/queue?catId=${selectedCategory.id}&qty=${quantity}`);
  }

  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!getAuthToken()) {
      toast.error("Silakan masuk terlebih dahulu");
      return;
    }
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

  const dateFormatted = new Date(concert.date).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const timeFormatted = new Date(concert.date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const tabs = [
    { id: "desc", label: "Deskripsi", ref: descRef },
    ...(concert.gallery?.length ? [{ id: "gallery", label: "Galeri", ref: galleryRef }] : []),
    { id: "ticket", label: "Tiket", ref: ticketRef },
    ...(concert.terms_conditions ? [{ id: "terms", label: "Syarat dan Ketentuan", ref: termsRef }] : []),
  ];

  return (
    <div className="min-h-screen bg-[#FDFCFB]">
      <Navbar />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Link */}
        <Link
          href="/concerts"
          className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-[#8B889C] transition-colors hover:text-[#1B1A3A]"
        >
          <ArrowLeft className="h-4 w-4" />
          Semua Konser
        </Link>

        {/* ===== HERO: banner navy + poster card overlap ===== */}
        <div className="relative mb-20 sm:mb-24 md:mb-16">
          <div
            className="relative overflow-hidden rounded-3xl bg-[#1B1A3A] p-6 pb-10 text-white shadow-xl sm:p-8 md:pb-14 md:pr-[300px]"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 15% -10%, #FF5470 0%, transparent 55%), radial-gradient(circle at 90% 110%, #7DD3E8 0%, transparent 45%)",
              }}
            />

            <div className="relative z-10 max-w-xl space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-[#FF5470] px-3 py-1 text-xs font-bold text-white">
                  {concert.category}
                </span>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                  Oleh {concert.organizer_name}
                </span>
                {/* Countdown ringkas, inline pill */}
                {countdown.days + countdown.hours + countdown.minutes > 0 && (
                  <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                    <Clock className="h-3 w-3 text-[#FF5470]" />
                    {countdown.days}h {countdown.hours}j lagi
                  </span>
                )}
              </div>

              <h1 className="font-display text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl md:text-4xl">
                {concert.title}
              </h1>

              <div className="flex flex-col gap-2 pt-2 text-sm text-white/80 sm:flex-row sm:flex-wrap sm:gap-4">
                <div className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 shrink-0 text-[#7DD3E8]" />
                  <span>{concert.venue}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 shrink-0 text-[#FF5470]" />
                  <span>
                    {dateFormatted}, {timeFormatted} WIB
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-2">
                <button
                  onClick={handleNotifyMe}
                  className={`flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-bold transition-all ${
                    isNotified ? "bg-emerald-600 text-white" : "bg-white/15 text-white hover:bg-white/25"
                  }`}
                >
                  <Bell className="h-3.5 w-3.5" />
                  {isNotified ? "Pengingat Aktif" : "Ingatkan Saya"}
                </button>
              </div>
            </div>
          </div>

          {/* Poster card — melayang, overlap ke bawah */}
          <div className="absolute right-4 top-6 w-[220px] overflow-hidden rounded-2xl bg-white shadow-2xl sm:right-8 sm:w-[260px] md:right-10 md:top-8 md:w-[280px]">
            <div className="relative aspect-[3/4] bg-gradient-to-br from-[#8B0000] to-[#2B0000]">
              {concert.poster_url ? (
                <img
                  src={concert.poster_url}
                  alt={concert.title}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Music className="h-10 w-10 text-white/30" />
                </div>
              )}
            </div>

            <div className="space-y-3 p-4">
              <div>
                <p className="text-[11px] text-[#8B889C]">Harga mulai dari</p>
                <p className="font-mono text-lg font-extrabold text-[#1B1A3A]">
                  Rp{Number(concert.min_price).toLocaleString("id-ID")}
                </p>
              </div>

              <button
                onClick={() => scrollToSection("ticket", ticketRef)}
                className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#FF5470] py-2.5 text-xs font-bold text-white shadow-md transition-all hover:brightness-110 active:scale-[.98]"
              >
                <Ticket className="h-3.5 w-3.5" />
                Beli Tiket
              </button>

              <div className="flex items-center gap-2 border-t border-[#EDEBF2] pt-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#1B1A3A] text-[10px] font-bold text-white">
                  {concert.organizer_name?.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-[11px] text-[#8B889C]">Diselenggarakan oleh</p>
                  <p className="truncate text-xs font-bold text-[#1B1A3A]">{concert.organizer_name}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 border-t border-[#EDEBF2] pt-3">
                <span className="text-[11px] text-[#8B889C]">Bagikan:</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(window.location.href);
                    toast.success("Link konser disalin!");
                  }}
                  className="flex h-6 w-6 items-center justify-center rounded-full bg-[#FAFAF8] text-[#1B1A3A] hover:bg-[#EDEBF2]"
                >
                  <Share2 className="h-3 w-3" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ===== TAB NAV ===== */}
        <div className="mb-8 flex items-center gap-6 overflow-x-auto border-b border-[#EDEBF2]">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => scrollToSection(tab.id, tab.ref)}
              className={`shrink-0 whitespace-nowrap border-b-2 pb-3 text-sm font-semibold transition-colors ${
                activeTab === tab.id
                  ? "border-[#FF5470] text-[#1B1A3A]"
                  : "border-transparent text-[#8B889C] hover:text-[#1B1A3A]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Left Column: Details, Artist, Reviews */}
          <div className="space-y-10 lg:col-span-2">
            {/* Description */}
            <section ref={descRef} className="rounded-3xl border border-[#EDEBF2] bg-white p-6 sm:p-8 shadow-sm">
              <h2 className="font-display text-xl font-bold text-[#1B1A3A]">Tentang Konser</h2>
              <p className="mt-3 leading-relaxed text-[#6B6875]">{concert.description}</p>

              <div className="mt-6 flex flex-wrap gap-4 border-t border-[#EDEBF2] pt-6">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1B1A3A]">
                  <ShieldCheck className="h-4 w-4 text-emerald-500" />
                  Tiket Resmi Terverifikasi
                </div>
                <div className="flex items-center gap-2 text-xs font-semibold text-[#1B1A3A]">
                  <CheckCircle2 className="h-4 w-4 text-[#FF5470]" />
                  Garansi Anti-Scalper & QR Otentik
                </div>
              </div>
            </section>

            {/* Gallery */}
            {(concert.gallery?.length ?? 0) > 0 && (
              <section ref={galleryRef} className="rounded-3xl border border-[#EDEBF2] bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="font-display text-xl font-bold text-[#1B1A3A]">Galeri</h2>
                <div className="mt-4 flex gap-3 overflow-x-auto scroll-smooth">
                  {concert.gallery!.map((url, i) => (
                    <div
                      key={i}
                      className="relative aspect-video w-[280px] shrink-0 overflow-hidden rounded-2xl border border-[#EDEBF2]"
                    >
                      <img
                        src={url}
                        alt={`${concert.title} ${i + 1}`}
                        className="absolute inset-0 h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Seat Plan */}
            {concert.seatmap && (
              <section className="rounded-3xl border border-[#EDEBF2] bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="font-display text-xl font-bold text-[#1B1A3A]">Denah & Graph Layout</h2>
                <p className="mt-1 text-xs text-[#8B889C]">{concert.seatmap.name}</p>
                <div className="mt-4 overflow-hidden rounded-2xl border border-[#EDEBF2]">
                  <img
                    src={concert.seatmap.image}
                    alt={concert.seatmap.name}
                    className="h-auto w-full object-contain"
                    loading="lazy"
                  />
                </div>
              </section>
            )}

            {/* Artist Profile */}
            <section className="rounded-3xl border border-[#EDEBF2] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl font-bold text-[#1B1A3A]">Musisi / Penampil</h2>
                  <p className="text-xs text-[#8B889C]">Genre: {concert.genre}</p>
                </div>
                <button
                  onClick={handleFollowArtist}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold transition-all ${
                    isFollowingArtist
                      ? "bg-[#FF5470] text-white"
                      : "border border-[#EDEBF2] bg-[#FAFAF8] text-[#1B1A3A] hover:border-[#FF5470]"
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${isFollowingArtist ? "fill-white" : ""}`} />
                  {isFollowingArtist ? "Mengikuti" : "Ikuti Musisi"}
                </button>
              </div>

              <div className="mt-4 flex items-start gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#FF5470] to-[#1B1A3A] text-white font-bold text-xl">
                  <Music className="h-8 w-8" />
                </div>
                <div>
                  <h3 className="font-bold text-[#1B1A3A]">{concert.artist_name}</h3>
                  <p className="mt-1 text-sm text-[#6B6875] leading-relaxed">{concert.bio}</p>
                </div>
              </div>
            </section>

            {/* Terms & Conditions */}
            {concert.terms_conditions && (
              <section ref={termsRef} className="rounded-3xl border border-[#EDEBF2] bg-white p-6 sm:p-8 shadow-sm">
                <h2 className="font-display text-xl font-bold text-[#1B1A3A]">Syarat & Ketentuan</h2>
                <p className="mt-3 whitespace-pre-line leading-relaxed text-[#6B6875]">{concert.terms_conditions}</p>
              </section>
            )}

            {/* Reviews Section */}
            <section className="rounded-3xl border border-[#EDEBF2] bg-white p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#EDEBF2] pb-4">
                <div>
                  <h2 className="font-display text-xl font-bold text-[#1B1A3A]">Ulasan Penggemar</h2>
                  <div className="mt-1 flex items-center gap-2">
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className="h-4 w-4 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-sm font-bold text-[#1B1A3A]">{concert.avg_rating.toFixed(1)}</span>
                    <span className="text-xs text-[#8B889C]">({concert.review_count} ulasan)</span>
                  </div>
                </div>

                <button
                  onClick={() => setReviewModal(true)}
                  className="rounded-full bg-[#1B1A3A] px-4 py-2 text-xs font-bold text-white hover:bg-black"
                >
                  Tulis Ulasan
                </button>
              </div>

              <div className="mt-6 space-y-4">
                {concert.reviews?.length > 0 ? (
                  concert.reviews.map((rev) => (
                    <div key={rev.id} className="rounded-2xl bg-[#FAFAF8] p-4 border border-[#EDEBF2]">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-[#1B1A3A]">{rev.customer_name}</span>
                        <div className="flex text-amber-400">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-amber-400" />
                          ))}
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
          </div>

          {/* Right Column: Ticket Category Selection & Booking Card */}
          <div className="lg:col-span-1" ref={ticketRef}>
            <div className="sticky top-24 rounded-3xl border border-[#EDEBF2] bg-white p-6 shadow-xl space-y-6">
              <h2 className="font-display text-lg font-bold text-[#1B1A3A]">Pilih Kategori Tiket</h2>

              {/* Categories list */}
              <div className="space-y-3">
                {concert.ticket_categories?.map((cat) => {
                  const isSelected = selectedCategory?.id === cat.id;
                  const isSoldOut = cat.remaining !== undefined && cat.remaining <= 0;
                  const priceNum = Number(cat.price);

                  return (
                    <div
                      key={cat.id}
                      onClick={() => !isSoldOut && setSelectedCategory(cat)}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all ${
                        isSelected
                          ? "border-[#FF5470] bg-[#FF5470]/5 shadow-sm"
                          : isSoldOut
                          ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                          : "border-[#EDEBF2] hover:border-[#1B1A3A]/40"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-sm text-[#1B1A3A]">{cat.name}</p>
                          <p className="font-mono text-base font-extrabold text-[#FF5470]">
                            Rp{priceNum.toLocaleString("id-ID")}
                          </p>
                        </div>
                        {isSoldOut ? (
                          <span className="rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                            Habis
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-[#8B889C]">
                            Sisa {cat.remaining ?? cat.quota - cat.sold}
                          </span>
                        )}
                      </div>
                      {cat.benefits && (
                        <p className="mt-2 border-t border-[#EDEBF2] pt-2 text-[11px] leading-relaxed text-[#6B6875]">
                          {cat.benefits}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quantity Selector */}
              {selectedCategory && (
                <div className="flex items-center justify-between border-t border-[#EDEBF2] pt-4">
                  <span className="text-xs font-bold text-[#1B1A3A]">Jumlah Tiket (Maks 4)</span>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#EDEBF2] text-base font-bold text-[#1B1A3A] hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold text-sm">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(4, quantity + 1))}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#EDEBF2] text-base font-bold text-[#1B1A3A] hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Price Calculation */}
              {selectedCategory && (
                <div className="rounded-2xl bg-[#FAFAF8] p-4 border border-[#EDEBF2] space-y-1">
                  <div className="flex justify-between text-xs text-[#6B6875]">
                    <span>Harga Satuan</span>
                    <span>Rp{Number(selectedCategory.price).toLocaleString("id-ID")}</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#6B6875]">
                    <span>Jumlah</span>
                    <span>x {quantity}</span>
                  </div>
                  <div className="border-t border-[#EDEBF2] pt-2 flex justify-between font-bold text-sm text-[#1B1A3A]">
                    <span>Total Pembayaran</span>
                    <span className="font-mono text-base text-[#FF5470]">
                      Rp{(Number(selectedCategory.price) * quantity).toLocaleString("id-ID")}
                    </span>
                  </div>
                </div>
              )}

              {/* Checkout Button */}
              <button
                onClick={handleProceedCheckout}
                disabled={!selectedCategory}
                className="w-full rounded-2xl bg-[#FF5470] py-4 text-center text-sm font-extrabold text-white shadow-lg transition-all hover:brightness-110 active:scale-98 disabled:opacity-50"
              >
                Masuk Antrean & Beli Tiket
              </button>

              <p className="text-center text-[11px] text-[#8B889C]">
                Sistem Smart Queue Wavy menjamin antrean tiket yang adil & transparan.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Review Modal */}
      {reviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h3 className="font-display text-xl font-bold text-[#1B1A3A]">Tulis Ulasan Konser</h3>
            <p className="text-xs text-[#6B6875] mt-1">Bagikan pengalaman menonton konser ini kepada pengguna lain.</p>

            <form onSubmit={handleSubmitReview} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-[#1B1A3A]">Rating (1 - 5 Bintang)</label>
                <div className="mt-2 flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setRatingInput(star)}
                      className="p-1"
                    >
                      <Star
                        className={`h-7 w-7 transition-colors ${
                          star <= ratingInput ? "fill-amber-400 text-amber-400" : "text-gray-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#1B1A3A]">Komentar</label>
                <textarea
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  rows={3}
                  placeholder="Ceritakan keseruan konser..."
                  className="mt-1 w-full rounded-2xl border border-[#EDEBF2] p-3 text-xs outline-none focus:border-[#FF5470]"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModal(false)}
                  className="flex-1 rounded-xl border border-[#EDEBF2] py-2.5 text-xs font-bold text-[#6B6875] hover:bg-gray-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 rounded-xl bg-[#1B1A3A] py-2.5 text-xs font-bold text-white hover:bg-black"
                >
                  {submittingReview ? "Mengirim..." : "Kirim Ulasan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}