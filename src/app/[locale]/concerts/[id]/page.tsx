"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { MapPin, Calendar, Layers } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import ConcertHero from "@/components/concerts/concert-hero";
import ConcertDescription from "@/components/concerts/concert-description";
import ConcertGallery from "@/components/concerts/concert-gallery";
import ConcertArtist from "@/components/concerts/concert-artist";
import ConcertTerms from "@/components/concerts/concert-terms";
import ConcertOrganizerShare from "@/components/concerts/concert-organizer-share";
import ConcertForYou from "@/components/concerts/concert-for-you";
import ConcertStickyBar from "@/components/concerts/concert-sticky-bar";
import ConcertReviewModal from "@/components/concerts/concert-review-modal";
import ConcertTicketSidebar from "@/components/concerts/concert-ticket-sidebar";
import { apiGet, apiPost, getAuthToken } from "@/lib/api";
import { getMinPrice, formatIDR } from "@/lib/price";
import type { ConcertDetail } from "@/types/type";
import ConcertTabs from "@/components/concerts/concert-tabs";

async function loadConcert(id: string): Promise<ConcertDetail> {
  try {
    const data = await apiGet<ConcertDetail>(`/concerts/${id}`);
    return data;
  } catch {
    return {
      id: Number(id), organizer_id: 1, artist_id: 1, title: "Konser", category: "Konser",
      venue: "-", date: new Date().toISOString(), poster_url: "", status: "published",
      artist_name: "-", organizer_name: "-", min_price: 0, remaining: 0,
      description: "Informasi konser sedang tidak tersedia.", genre: "-", photo_url: "",
      bio: "-", countdown_seconds: 0, ticket_categories: [], reviews: [],
      avg_rating: 0, review_count: 0,
    };
  }
}

export default function ConcertDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const t = useTranslations("ConcertDetail");
  const [concert, setConcert] = useState<ConcertDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFollowingArtist, setIsFollowingArtist] = useState(false);
  const [reviewModal, setReviewModal] = useState(false);
  const [ratingInput, setRatingInput] = useState(5);
  const [commentInput, setCommentInput] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [activeTab, setActiveTab] = useState("desc");
  const [showInfoCard, setShowInfoCard] = useState(false);
  const descRef = useRef<HTMLDivElement>(null);
  const galleryRef = useRef<HTMLDivElement>(null);
  const ticketRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    function onScroll() {
      const hasSeatmapNow = !!(concert?.seatmap?.images?.length);
      const hasTicketCats = !!(concert?.ticket_categories?.length);
      const sections = [
        { id: "desc", ref: descRef },
        ...(hasSeatmapNow ? [{ id: "gallery", ref: galleryRef }] : []),
        ...(!hasSeatmapNow && hasTicketCats ? [{ id: "ticket", ref: ticketRef }] : []),
        { id: "terms", ref: termsRef },
      ];
      const offset = 160;
      let current = "desc";
      for (const s of sections) {
        const node = s.ref.current;
        if (node && node.getBoundingClientRect().top <= offset) current = s.id;
      }
      setActiveTab(current);

      if (!showInfoCard) {
        const triggerRef = hasSeatmapNow ? galleryRef : ticketRef;
        const el = triggerRef.current;
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.55) {
          setShowInfoCard(true);
        }
      }
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [showInfoCard, concert]);

  function scrollToSection(tab: string, ref: React.RefObject<HTMLDivElement | null>) {
    setActiveTab(tab);
    if (!ref.current) return;
    const y = ref.current.getBoundingClientRect().top + window.scrollY - 72;
    window.scrollTo({ top: y, behavior: "smooth" });
  }

  async function handleFollowArtist() {
    if (!getAuthToken()) { toast.error(t("loginFirst")); router.push("/auth/login"); return; }
    const previous = isFollowingArtist;
    setIsFollowingArtist(!previous);
    try {
      if (previous) await apiPost(`/favorites/artists/${concert?.artist_id}`, {}, getAuthToken()!);
      else await apiPost(`/favorites/artists/${concert?.artist_id}`);
      toast.success(previous ? t("unfollowSuccess") : t("followSuccess", { name: concert?.artist_name ?? "" }));
    } catch {
      setIsFollowingArtist(previous);
      toast.error(t("followFailed"));
    }
  }
  function handleBuyTicket() {
    if (!concert) return;
    if (!getAuthToken()) { toast.error(t("loginToContinue")); router.push("/auth/login"); return; }
    router.push(`/concerts/${id}/checkout`);
  }
  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!getAuthToken()) { toast.error(t("loginFirst")); return; }
    setSubmittingReview(true);
    try { await apiPost(`/events/${id}/reviews`, { rating: ratingInput, comment: commentInput }); toast.success(t("reviewSuccess")); setReviewModal(false); setCommentInput(""); }
    catch { toast.error(t("reviewFailed")); }
    finally { setSubmittingReview(false); }
  }

  if (loading || !concert) {
    return (
      <div className="min-h-screen bg-white">
<Navbar sticky={false} />
        <div className="mx-auto max-w-[1440px] px-2 py-16 text-center sm:px-4 lg:px-6">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0F56FF] border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-[#6B7280]">{t("loading")}</p>
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
  const hasSeatmap = !!(concert.seatmap?.images?.length);

  const dateObj = new Date(concert.date);
  const dateStr = dateObj.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  const startHour = dateObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
  const endDate = new Date(dateObj.getTime() + 2 * 60 * 60 * 1000);
  const endHour = endDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });

  const tabs = [
    { id: "desc", label: t("tabs.desc"), onClick: () => scrollToSection("desc", descRef) },
    ...(hasSeatmap ? [{ id: "gallery", label: t("tabs.gallery"), onClick: () => scrollToSection("gallery", galleryRef) }] : []),
    ...(!hasSeatmap && concert.ticket_categories?.length ? [{ id: "ticket", label: t("tabs.ticket"), onClick: () => scrollToSection("ticket", ticketRef) }] : []),
    { id: "terms", label: t("tabs.terms"), onClick: () => scrollToSection("terms", termsRef) },
  ];

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-0">
      <Navbar sticky={false} />

      {/* ── Hero: event information and poster share the same visual plane ── */}
      <ConcertHero concert={concert} />

      {/* Tabs and purchase action share one row directly below the hero. */}
      <div className="relative z-40 border-b border-[#E5E7EB] bg-white lg:sticky lg:top-0">
        <div className="mx-auto grid max-w-[1440px] items-center px-2 sm:px-4 lg:grid-cols-[minmax(0,1fr)_520px] lg:gap-4 lg:px-6">
          <div className="min-w-0">
            <ConcertTabs tabs={tabs} activeTab={activeTab} />
          </div>
          <div className="flex items-center justify-between gap-3 px-2 py-3 lg:px-3">
            <div className="leading-none">
              <p className="text-[12px] text-[#6B7280]">{t("startingFrom")}</p>
              <p className="mt-1 text-[20px] font-bold text-[#111827]">{formatIDR(minPrice)}</p>
            </div>
            <button
              onClick={handleBuyTicket}
              className="shrink-0 rounded-lg bg-[#2B5CFF] px-6 py-3 text-[15px] font-bold text-white transition hover:brightness-110"
            >
              {t("buyTicket")}
            </button>
          </div>
        </div>
      </div>

      {/* ── Main event layout ── */}
      <div className="mx-auto max-w-[1440px] px-2 sm:px-4 lg:px-6">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_520px]">

          {/* =========================================================
        LEFT COLUMN
        ========================================================= */}
          <div className="min-w-0">
            <div className="space-y-6 pt-6">

              <div ref={descRef}>
                <ConcertDescription
                  description={concert.description}
                />
              </div>

              {hasSeatmap && (
                <div ref={galleryRef}>
                  <ConcertGallery
                    gallery={concert.gallery}
                    seatmap={null}
                    posterUrl={concert.poster_url}
                    title={concert.title}
                  />
                </div>
              )}

                  {!hasSeatmap && concert.ticket_categories?.length > 0 && (
                    <div ref={ticketRef}>
                      <ConcertTicketSidebar categories={concert.ticket_categories} />
                    </div>
                  )}

              <div ref={termsRef}>
                <ConcertTerms
                  concertId={id}
                  terms={
                    concert.terms_conditions ??
                    "- Tiket yang sudah dibeli tidak dapat ditukar atau dikembalikan.\n- Promotor tidak bertanggung jawab atas tiket di luar platform resmi.\n- Fan benefit hanya berlaku untuk kategori tiket tertentu.\n- Kamera profesional & livestream tidak diizinkan tanpa izin.\n- No admission for infants & children below 7 years old."
                  }
                />
              </div>

              <ConcertArtist
                artistName={concert.artist_name}
                bio={concert.bio}
                genre={concert.genre}
                isFollowing={isFollowingArtist}
                onFollow={handleFollowArtist}
              />

              {/* <ConcertReviews
                reviews={concert.reviews}
                avgRating={concert.avg_rating}
                reviewCount={concert.review_count}
                onWriteReview={() => setReviewModal(true)}
              /> */}

              <div className="lg:hidden">
                <ConcertOrganizerShare
                  eventTitle={concert.title}
                />
              </div>
            </div>
          </div>

          {/* =========================================================
        RIGHT COLUMN
        ========================================================= */}
          <aside className="hidden lg:block">
            <div className="sticky top-[80px]">
              <div className=" bg-white p-6">

                <div
                  className={`overflow-hidden transition-all duration-500 ${
                    showInfoCard ? "max-h-[420px] opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <div>
                    <h2 className="text-[17px] font-bold leading-tight text-[#1A2B4C]">
                      {concert.title}
                    </h2>

                    <div className="mt-4 space-y-3">

                      <div className="flex items-start gap-3 text-[14px] leading-snug text-[#1A2B4C]">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-[#1E3A8A]" />
                        <span>{concert.venue}</span>
                      </div>

                      <div className="flex items-center gap-3 text-[14px] text-[#1A2B4C]">
                        <Calendar className="h-4 w-4 shrink-0 text-[#1E3A8A]" />
                        <span>
                          {dateStr}, {startHour} - {endHour} WIB
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[14px] text-[#1A2B4C]">
                        <Layers className="h-4 w-4 shrink-0 text-[#1E3A8A]" />
                        <span>
                          {concert.category}
                          &nbsp;•&nbsp;
                          Musik
                          &nbsp;•&nbsp;
                          {concert.genre || "K-Pop"}
                        </span>
                      </div>

                    </div>

                    <div className="my-5 border-t border-[#EEEEF2]" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0F56FF]/10 text-[16px] font-bold text-[#0F56FF]">
                    {concert.organizer_name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-[#6B7280]">{t("organizedBy")}</p>
                    <p className="truncate text-[14px] font-semibold text-[#111827]">{concert.organizer_name}</p>
                  </div>
                </div>

                <div className="mt-5">
                  <ConcertOrganizerShare
                    eventTitle={concert.title}
                    inline
                  />
                </div>

              </div>
            </div>
          </aside>
        </div>

        {/* ── Full-width: Event untuk kamu (outside the aside column so it never gets covered) ── */}
        <div className="mt-12">
          <ConcertForYou excludeId={id} />
        </div>
      </div>

      {/* ── Mobile sticky bottom bar ── */}
      <ConcertStickyBar minPrice={minPrice} soldOut={soldOut} onBuy={handleBuyTicket} />

      {reviewModal && (
        <ConcertReviewModal rating={ratingInput} setRating={setRatingInput} comment={commentInput} setComment={setCommentInput} submitting={submittingReview} onClose={() => setReviewModal(false)} onSubmit={handleSubmitReview} />
      )}
      <Footer />
    </div>
  );
}
