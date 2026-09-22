"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  MapPin,
  Calendar,
  Ticket,
  Minus,
  Plus,
  ChevronRight,
  ShieldCheck,
  CreditCard,
  Users,
  ArrowLeft,
  Check,
  Info,
} from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import ConcertSeatmap from "@/components/concerts/concert-seatmap";
import { apiGet, apiPost, getAuthToken } from "@/lib/api";
import { formatIDR } from "@/lib/price";
import type { ConcertDetail } from "@/types/type";

async function loadConcert(id: string): Promise<ConcertDetail> {
  try {
    return await apiGet<ConcertDetail>(`/concerts/${id}`);
  } catch {
    return {
      id: Number(id),
      organizer_id: 1,
      artist_id: 1,
      title: "Tiffany Young: Edge of Calm Tour in Jakarta",
      category: "Konser",
      venue: "JIEXPO Theatre, Jakarta Pusat",
      date: "2026-09-19T19:00:00+07:00",
      poster_url:
        "https://assets.loket.com/neo/production/images/banner/20260722120040_6a604e781ffbd.jpg",
      banner_url: "",
      status: "published",
      artist_name: "Tiffany Young",
      organizer_name: "Flabbergast Productions",
      min_price: 950000,
      remaining: 250,
      description: "",
      genre: "K-Pop",
      photo_url: "",
      bio: "",
      countdown_seconds: 15 * 86400,
      ticket_categories: [
        { id: 1, event_id: Number(id), name: "VIP (Seated)", price: 3250000, quota: 100, sold: 20, remaining: 80 },
        { id: 2, event_id: Number(id), name: "CAT R (Seated)", price: 2550000, quota: 200, sold: 60, remaining: 140 },
        { id: 3, event_id: Number(id), name: "CAT S (Seated)", price: 2000000, quota: 200, sold: 90, remaining: 110 },
        { id: 4, event_id: Number(id), name: "CAT A (Seated)", price: 1500000, quota: 300, sold: 120, remaining: 180 },
        { id: 5, event_id: Number(id), name: "CAT B (Seated)", price: 950000, quota: 400, sold: 200, remaining: 200 },
      ],
      reviews: [],
      avg_rating: 0,
      review_count: 0,
    };
  }
}

export default function PembelianPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ catId?: string; qty?: string }>;
}) {
  const { id } = use(params);
  const { catId: preCatId, qty: preQty } = use(searchParams);
  const router = useRouter();

  const [concert, setConcert] = useState<ConcertDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCatId, setSelectedCatId] = useState<number | null>(
    preCatId ? Number(preCatId) : null
  );
  const [quantity, setQuantity] = useState(preQty ? Math.max(1, Number(preQty)) : 1);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await loadConcert(id);
      setConcert(data);
      setSelectedCatId((prev) => {
        if (prev !== null) return prev;
        const firstAvailable = data.ticket_categories?.find(
          (c) => (c.remaining ?? c.quota - c.sold) > 0
        );
        return firstAvailable?.id ?? null;
      });
      setLoading(false);
    }
    load();
  }, [id]);

  function handleSelectCategory(catId: number) {
    setSelectedCatId(catId);
  }

  function handleQuantityChange(delta: number) {
    setQuantity((prev) => Math.max(1, Math.min(5, prev + delta)));
  }

  async function handleCheckout() {
    if (!getAuthToken()) {
      toast.error("Silakan masuk untuk melanjutkan pembelian");
      router.push("/auth/login");
      return;
    }
    if (!selectedCatId) {
      toast.error("Silakan pilih kategori tiket terlebih dahulu");
      return;
    }
    setSubmitting(true);
    try {
      const order = await apiPost<{ id: number }>("/orders", {
        event_id: Number(id),
        ticket_category_id: selectedCatId,
        quantity,
      });
      toast.success("Berhasil memesan tiket! Silakan selesaikan pembayaran.");
      router.push(`/orders/${order.id}`);
    } catch (err: unknown) {
      const msg = (err as Error).message || "";
      if (msg.includes("not enough") || msg.includes("stok")) {
        toast.error("Maaf, kuota tiket pada kategori ini telah habis.");
      } else {
        toast.error(msg || "Gagal membuat pesanan. Silakan coba lagi.");
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !concert) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar sticky={false} hideUser />
        <div className="mx-auto max-w-[1440px] px-2 py-16 text-center sm:px-4 lg:px-6">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#0F56FF] border-t-transparent mx-auto" />
          <p className="mt-4 text-sm text-[#6B7280]">Memuat informasi pembelian...</p>
        </div>
      </div>
    );
  }

  const selectedCategory = concert.ticket_categories?.find(
    (c) => c.id === selectedCatId
  );
  const subtotal = selectedCategory
    ? Number(selectedCategory.price) * quantity
    : 0;
  const serviceFee = Math.round(subtotal * 0.05);
  const total = subtotal + serviceFee;

  const dateObj = new Date(concert.date);
  const dateStr = dateObj.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const startHour = dateObj.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const endDate = new Date(dateObj.getTime() + 2 * 60 * 60 * 1000);
  const endHour = endDate.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div className="min-h-screen bg-[#F8F9FA] pb-20 lg:pb-0">
      <Navbar sticky={false} hideUser />

      {/* Header */}
      <div className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex max-w-[1440px] items-center gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <button
            onClick={() => router.back()}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F3F4F6] text-[#374151] transition hover:bg-[#E5E7EB]"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="text-[16px] font-bold text-[#111827]">
              Pembelian Tiket
            </h1>
            <p className="text-[13px] text-[#6B7280]">
              Pilih kategori dan jumlah tiket
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 py-6 lg:grid-cols-[minmax(0,1fr)_420px]">
          {/* =========================================================
            LEFT COLUMN: Event Info + Ticket Categories
          ========================================================= */}
          <div className="space-y-6">
            {/* Event Card */}
            <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
              <div className="flex flex-col sm:flex-row">
                <div className="relative h-[200px] shrink-0 overflow-hidden sm:h-[240px] sm:w-[240px]">
                  <img
                    src={
                      concert.banner_url ||
                      concert.poster_url ||
                      concert.photo_url ||
                      "https://assets.loket.com/neo/production/images/banner/20260722120040_6a604e781ffbd.jpg"
                    }
                    alt={concert.title}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>
                <div className="flex-1 p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="inline-flex items-center rounded-full bg-[#EEF2FF] px-2.5 py-0.5 text-[11px] font-bold text-[#1E40AF]">
                      {concert.category}
                    </span>
                    <span className="inline-flex items-center rounded-full bg-[#ECFDF5] px-2.5 py-0.5 text-[11px] font-bold text-[#065F46]">
                      {concert.genre || "Music"}
                    </span>
                  </div>
                  <h2 className="text-[18px] font-bold leading-tight text-[#111827]">
                    {concert.title}
                  </h2>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2 text-[13px] text-[#6B7280]">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span>{concert.venue}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-[#6B7280]">
                      <Calendar className="h-3.5 w-3.5 shrink-0" />
                      <span>
                        {dateStr}, {startHour} - {endHour} WIB
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-[13px] text-[#6B7280]">
                      <Users className="h-3.5 w-3.5 shrink-0" />
                      <span>Diselenggarakan oleh {concert.organizer_name}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seatmap */}
            {concert.seatmap?.images?.length ? (
              <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <ConcertSeatmap seatmap={concert.seatmap} />
              </div>
            ) : null}

            {/* Ticket Categories */}
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Ticket className="h-5 w-5 text-[#1E40AF]" />
                <h3 className="text-[16px] font-bold text-[#111827]">
                  Pilih Kategori Tiket
                </h3>
              </div>

              <div className="space-y-3">
                {concert.ticket_categories?.map((cat) => {
                  const remaining =
                    cat.remaining ?? cat.quota - cat.sold;
                  const isSoldOut = remaining <= 0;
                  const isSelected = selectedCatId === cat.id;

                  return (
                    <button
                      key={cat.id}
                      onClick={() => !isSoldOut && handleSelectCategory(cat.id)}
                      disabled={isSoldOut}
                      className={`w-full rounded-xl border-2 p-4 text-left transition-all ${
                        isSelected
                          ? "border-[#1E40AF] bg-[#EEF2FF] ring-1 ring-[#1E40AF]/20"
                          : isSoldOut
                          ? "border-[#F3F4F6] bg-[#F9FAFB] opacity-60"
                          : "border-[#E5E7EB] bg-white hover:border-[#93C5FD] hover:bg-[#F0F7FF]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                              isSelected
                                ? "border-[#1E40AF] bg-[#1E40AF]"
                                : "border-[#D1D5DB]"
                            }`}
                          >
                            {isSelected && (
                              <Check className="h-3 w-3 text-white" />
                            )}
                          </div>
                          <div>
                            <p
                              className={`text-[14px] font-bold ${
                                isSoldOut
                                  ? "text-[#9CA3AF]"
                                  : "text-[#111827]"
                              }`}
                            >
                              {cat.name}
                            </p>
                            <p className="text-[12px] text-[#6B7280]">
                              {isSoldOut
                                ? "Sold Out"
                                : `Tersisa ${remaining} tiket`}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`text-[15px] font-extrabold ${
                              isSoldOut
                                ? "text-[#9CA3AF]"
                                : "text-[#1E40AF]"
                            }`}
                          >
                            {formatIDR(Number(cat.price))}
                          </p>
                          {isSoldOut && (
                            <span className="inline-block mt-1 rounded-full bg-red-100 px-2 py-0.5 text-[10px] font-bold text-red-600">
                              Habis
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quantity Selector */}
            {selectedCategory && !(selectedCategory.remaining !== undefined && selectedCategory.remaining <= 0) && (
              <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[14px] font-bold text-[#111827]">
                      Jumlah Tiket
                    </p>
                    <p className="text-[12px] text-[#6B7280]">
                      Maksimal 5 tiket per transaksi
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleQuantityChange(-1)}
                      disabled={quantity <= 1}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#374151] transition hover:bg-[#F3F4F6] disabled:opacity-40"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[24px] text-center text-[18px] font-extrabold text-[#111827]">
                      {quantity}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(1)}
                      disabled={quantity >= 5}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-[#E5E7EB] bg-white text-[#374151] transition hover:bg-[#F3F4F6] disabled:opacity-40"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* =========================================================
            RIGHT COLUMN: Order Summary
          ========================================================= */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 shadow-sm">
              <h3 className="mb-4 text-[16px] font-bold text-[#111827]">
                Ringkasan Pesanan
              </h3>

              {selectedCategory ? (
                <>
                  {/* Event Info */}
                  <div className="mb-4 rounded-xl bg-[#F9FAFB] p-4">
                    <p className="text-[13px] font-bold text-[#111827] line-clamp-2">
                      {concert.title}
                    </p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                        <Calendar className="h-3 w-3 shrink-0" />
                        <span>{dateStr}</span>
                      </div>
                      <div className="flex items-center gap-2 text-[12px] text-[#6B7280]">
                        <MapPin className="h-3 w-3 shrink-0" />
                        <span className="line-clamp-1">{concert.venue}</span>
                      </div>
                    </div>
                  </div>

                  {/* Selected Ticket */}
                  <div className="mb-4 space-y-3 border-b border-[#E5E7EB] pb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-[#6B7280]">
                        {selectedCategory.name}
                      </span>
                      <span className="text-[13px] font-bold text-[#111827]">
                        {formatIDR(Number(selectedCategory.price))} x {quantity}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-[#6B7280]">
                        Subtotal
                      </span>
                      <span className="text-[13px] font-bold text-[#111827]">
                        {formatIDR(subtotal)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] text-[#6B7280]">
                        Biaya Layanan (5%)
                      </span>
                      <span className="text-[13px] font-bold text-[#111827]">
                        {formatIDR(serviceFee)}
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="mb-5 flex items-center justify-between">
                    <span className="text-[14px] font-bold text-[#111827]">
                      Total Pembayaran
                    </span>
                    <span className="text-[18px] font-extrabold text-[#1E40AF]">
                      {formatIDR(total)}
                    </span>
                  </div>

                  {/* Checkout Button */}
                  <button
                    onClick={handleCheckout}
                    disabled={submitting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1E40AF] py-3.5 text-[14px] font-bold text-white shadow-lg transition hover:brightness-110 active:scale-[0.98] disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-4 w-4" />
                        Lanjut ke Pembayaran
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  {/* Trust Badge */}
                  <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#9CA3AF]">
                    <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Pembayaran aman & terenkripsi</span>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center">
                  <Ticket className="mx-auto h-10 w-10 text-[#D1D5DB]" />
                  <p className="mt-3 text-[13px] text-[#9CA3AF]">
                    Pilih kategori tiket terlebih dahulu
                  </p>
                </div>
              )}
            </div>

            {/* Info Box */}
            <div className="mt-4 rounded-2xl border border-[#E5E7EB] bg-[#FFFBEB] p-4">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-[#D97706]" />
                <div className="text-[12px] text-[#92400E]">
                  <p className="font-bold">Perlu Diketahui</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4">
                    <li>Tiket yang sudah dibeli tidak dapat ditukar atau dikembalikan</li>
                    <li>Pembayaran harus diselesaikan dalam 15 menit</li>
                    <li>E-tiket QR akan diterbitkan setelah pembayaran terverifikasi</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
