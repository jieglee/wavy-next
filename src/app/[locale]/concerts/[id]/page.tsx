"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { useFormatter, useTranslations } from "next-intl";
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
import { useApiResource } from "@/hooks/use-api-resource";
import { ErrorState, LoadingState } from "@/components/states/async-states";
import { getMinPrice, formatIDR } from "@/lib/price";
import type { ConcertDetail } from "@/types/type";
import ConcertTabs from "@/components/concerts/concert-tabs";
import { useSalesText } from "@/hooks/use-sales-text";
import { categoryLabels } from "@/lib/concert-labels";


export default function ConcertDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const tDetail = useTranslations("ConcertDetail");
  const tSales = useTranslations("Sales");
  const format = useFormatter();
  const sales = useSalesText();
  const concertRes = useApiResource(`concert-${id}`, () => apiGet<ConcertDetail>(`/concerts/${id}`));
  const concert = concertRes.data ?? null;
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
    if (!getAuthToken()) { toast.error(tDetail("toast.loginFirst")); router.push("/auth/login"); return; }
    const previous = isFollowingArtist;
    setIsFollowingArtist(!previous);
    try {
      if (previous) await apiPost(`/favorites/artists/${concert?.artist_id}`, {}, getAuthToken()!);
      else await apiPost(`/favorites/artists/${concert?.artist_id}`);
      toast.success(previous ? tDetail("toast.unfollowed") : tDetail("toast.followed", { name: concert?.artist_name ?? "" }));
    } catch {
      setIsFollowingArtist(previous);
      toast.error(tDetail("toast.followFailed"));
    }
  }
  function handleBuyTicket() {
    if (!concert || concert.sales_status !== "open") return;
    if (!getAuthToken()) { toast.error(tDetail("toast.loginToBuy")); router.push("/auth/login"); return; }
    router.push(`/concerts/${id}/checkout`);
  }
  async function handleSubmitReview(e: React.FormEvent) {
    e.preventDefault();
    if (!getAuthToken()) { toast.error(tDetail("toast.loginFirst")); return; }
    setSubmittingReview(true);
    try { await apiPost(`/events/${id}/reviews`, { rating: ratingInput, comment: commentInput }); toast.success(tDetail("toast.reviewSent")); setReviewModal(false); setCommentInput(""); }
    catch { toast.error(tDetail("toast.reviewFailed")); }
    finally { setSubmittingReview(false); }
  }

  if (!concert) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar sticky={false} hideUser />
        <div className="mx-auto max-w-[1440px] px-4 py-12 lg:px-6">
          {concertRes.loading ? (
            <LoadingState label={tDetail("loading")} />
          ) : (
            <ErrorState error={concertRes.error} onRetry={concertRes.reload} />
          )}
        </div>
      </div>
    );
  }

  // status penjualan dihitung backend (sales_status); selain "open" tombol beli dinonaktifkan
  const salesOpen = concert.sales_status === "open";
  const blockedReason =
    concert.sales_status === "open" ? null : sales.notOpen(concert.sales_status, concert.sales_start_at);
  const buyLabel = salesOpen ? tSales("buy") : sales.badge(concert.sales_status);
  const minPrice = getMinPrice(concert);
  const hasSeatmap = !!(concert.seatmap?.images?.length);

  const dateObj = new Date(concert.date);
  const endDate = new Date(dateObj.getTime() + 2 * 60 * 60 * 1000);
  const hourFmt = { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Jakarta" } as const;
  const schedule = tDetail("schedule", {
    date: format.dateTime(dateObj, { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" }),
    start: format.dateTime(dateObj, hourFmt),
    end: format.dateTime(endDate, hourFmt),
  });

  const tabs = [
    { id: "desc", label: tDetail("tabs.desc"), onClick: () => scrollToSection("desc", descRef) },
    ...(hasSeatmap ? [{ id: "gallery", label: tDetail("tabs.gallery"), onClick: () => scrollToSection("gallery", galleryRef) }] : []),
    ...(concert.ticket_categories?.length ? [{ id: "ticket", label: tDetail("tabs.ticket"), onClick: () => scrollToSection("ticket", ticketRef) }] : []),
    { id: "terms", label: tDetail("tabs.terms"), onClick: () => scrollToSection("terms", termsRef) },
  ];

  return (
    <div className="min-h-screen bg-white pb-20 lg:pb-0">
      <Navbar sticky={false} hideUser />

      {/* ── Hero: event information and poster share the same visual plane ── */}
      <ConcertHero concert={concert} />

      {/* Tabs and purchase action share one row directly below the hero. */}
      <div className="relative z-40 border-b border-border bg-white lg:sticky lg:top-0">
        <div className="mx-auto grid max-w-[1440px] items-center px-2 sm:px-4 lg:grid-cols-[minmax(0,1fr)_520px] lg:gap-4 lg:px-6">
          <div className="min-w-0">
            <ConcertTabs tabs={tabs} activeTab={activeTab} label={tDetail("tabs.label")} />
          </div>
          <div className="px-2 py-3 lg:px-3">
            <div className="flex items-center justify-between gap-3">
              <div className="leading-none">
                <p className="text-[12px] text-muted-foreground">{tDetail("priceFrom")}</p>
                <p className="mt-1 font-mono text-[20px] font-bold text-foreground">{formatIDR(minPrice)}</p>
              </div>
              <button
                onClick={handleBuyTicket}
                disabled={!salesOpen}
                className="shrink-0 rounded-lg bg-primary px-6 py-3 text-[15px] font-bold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-muted-foreground/70 disabled:hover:brightness-100"
              >
                {buyLabel}
              </button>
            </div>
            {blockedReason && (
              <p role="status" className="mt-2 hidden text-[12px] font-medium text-destructive lg:block">{blockedReason}</p>
            )}
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

                  {concert.ticket_categories?.length > 0 && (
                    <div ref={ticketRef}>
                      <ConcertTicketSidebar
                        categories={concert.ticket_categories}
                        salesStatus={concert.sales_status}
                        salesStartAt={concert.sales_start_at}
                        salesEndAt={concert.sales_end_at}
                        organizerName={concert.organizer_name}
                      />
                    </div>
                  )}

              <div ref={termsRef}>
                <ConcertTerms
                  concertId={id}
                  terms={concert.terms_conditions ?? tDetail("defaultTerms")}
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
                    <h2 className="text-[17px] font-bold leading-tight text-foreground">
                      {concert.title}
                    </h2>

                    <div className="mt-4 space-y-3">

                      <div className="flex items-start gap-3 text-[14px] leading-snug text-foreground">
                        <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-foreground" />
                        <span>{concert.venue}</span>
                      </div>

                      <div className="flex items-center gap-3 text-[14px] text-foreground">
                        <Calendar className="h-4 w-4 shrink-0 text-foreground" />
                        <span>
                          {schedule}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-[14px] text-foreground">
                        <Layers className="h-4 w-4 shrink-0 text-foreground" />
                        <span>{categoryLabels(concert.category, concert.genre).join(" • ")}</span>
                      </div>

                    </div>

                    <div className="my-5 border-t border-border" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[16px] font-bold text-primary">
                    {concert.organizer_name?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-muted-foreground">{tDetail("organizedBy")}</p>
                    <p className="truncate text-[14px] font-semibold text-foreground">{concert.organizer_name}</p>
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
      <ConcertStickyBar
        minPrice={minPrice}
        priceLabel={tDetail("priceFromShort")}
        buyLabel={buyLabel}
        blockedReason={blockedReason}
        onBuy={handleBuyTicket}
      />

      {reviewModal && (
        <ConcertReviewModal rating={ratingInput} setRating={setRatingInput} comment={commentInput} setComment={setCommentInput} submitting={submittingReview} onClose={() => setReviewModal(false)} onSubmit={handleSubmitReview} />
      )}
      <Footer />
    </div>
  );
}
