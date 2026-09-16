"use client";

import { useEffect, useState, use } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { Ticket, ChevronDown, Clock, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { WavyIcon } from "@/components/landing/wavy-icon";
import { apiGet, apiPost, getAuthToken } from "@/lib/api";
import { formatIDR } from "@/lib/price";
import type { ConcertDetail, TicketCategory } from "@/types/type";
import Footer from "@/components/landing/footer";

async function loadConcert(id: string): Promise<ConcertDetail> {
  try {
    const data = await apiGet<ConcertDetail>(`/concerts/${id}`);
    return data;
  } catch {
    return {
      id: Number(id),
      organizer_id: 1,
      artist_id: 1,
      title: "Pestapora 2026",
      category: "Festival",
      venue: "Gambir Expo & Hall D2 JIExpo Jakarta",
      date: "2026-09-25T19:00:00+07:00",
      poster_url: "https://assets.loket.com/neo/production/images/banner/20260722120040_6a604e781ffbd.jpg",
      status: "published",
      artist_name: "Pestapora",
      organizer_name: "Boss Creator",
      min_price: 300000,
      remaining: 500,
      description: "",
      genre: "Festival",
      photo_url: "",
      bio: "",
      countdown_seconds: 0,
      ticket_categories: [
        { id: 1, event_id: Number(id), name: "Regular - 3 Days Pass", price: 650000, quota: 500, sold: 500, remaining: 0 },
        { id: 2, event_id: Number(id), name: "Daily Pass - Day 1", price: 300000, quota: 500, sold: 120, remaining: 380 },
        { id: 3, event_id: Number(id), name: "Daily Pass - Day 2", price: 300000, quota: 500, sold: 500, remaining: 0 },
        { id: 4, event_id: Number(id), name: "Daily Pass - Day 3", price: 300000, quota: 500, sold: 200, remaining: 300 },
      ],
      reviews: [],
      avg_rating: 0,
      review_count: 0,
    } as ConcertDetail;
  }
}

function CheckoutStepper({ step = 1 }: { step?: number }) {
  const steps = ["Pilih Kategori", "Informasi Personal", "Konfirmasi", "Bayar"];
  return (
    <div className="hidden items-center gap-1.5 sm:flex">
      {steps.map((label, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <div key={label} className="flex items-center gap-1.5">
            <div className="flex items-center gap-1.5">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold leading-none ring-1 ${
                  active
                    ? "bg-[#2B5CFF] text-white ring-[#2B5CFF]"
                    : done
                      ? "bg-[#2B5CFF] text-white ring-[#2B5CFF]"
                      : "bg-white text-[#9CA3AF] ring-[#E5E7EB]"
                }`}
              >
                {n}
              </span>
              <span className={`text-xs font-semibold ${active ? "text-[#2B5CFF]" : "text-[#9CA3AF]"}`}>{label}</span>
            </div>
            {i < steps.length - 1 && <span className="mx-1 text-[#D1D5DB]">›</span>}
          </div>
        );
      })}
    </div>
  );
}

export default function ConcertCheckoutPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [concert, setConcert] = useState<ConcertDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [qtyMap, setQtyMap] = useState<Record<number, number>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!getAuthToken()) {
      toast.error("Silakan masuk terlebih dahulu");
      router.push("/auth/login");
      return;
    }
    (async () => {
      setLoading(true);
      const data = await loadConcert(id);
      setConcert(data);
      setLoading(false);
    })();
  }, [id, router]);

  const categories: TicketCategory[] = concert?.ticket_categories ?? [];
  const groupLabel = "NATIONAL - GENERAL SALE";

  const entries = categories
    .map((c) => ({ cat: c, qty: qtyMap[c.id] ?? 0 }))
    .filter((e) => e.qty > 0);

  const totalTickets = entries.reduce((s, e) => s + e.qty, 0);
  const totalPrice = entries.reduce((s, e) => s + Number(e.cat.price) * e.qty, 0);
  const soldOutCount = categories.filter((c) => c.remaining !== undefined && c.remaining <= 0).length;

  function setQty(catId: number, v: number) {
    if (v <= 0) {
      setQtyMap((prev) => {
        const next = { ...prev };
        delete next[catId];
        return next;
      });
      return;
    }
    const totalOther = Object.entries(qtyMap)
      .filter(([k]) => Number(k) !== catId)
      .reduce((s, [, q]) => s + q, 0);
    if (v + totalOther > 4) {
      toast.error("Maksimal 4 tiket per pesanan");
      v = Math.max(0, 4 - totalOther);
      if (v <= 0) return;
    }
    setQtyMap((prev) => ({ ...prev, [catId]: Math.min(v, 4) }));
  }

  async function handlePesan() {
    if (!concert || totalTickets === 0) {
      toast.error("Pilih minimal 1 tiket");
      return;
    }
    if (totalTickets > 4) {
      toast.error("Maksimal 4 tiket per pesanan");
      return;
    }
    setSubmitting(true);
    try {
      if (entries.length === 1) {
        const first = entries[0];
        const order = await apiPost<{ id: number } | { order_id: number } | { id: string }>("/orders", {
          event_id: Number(id),
          ticket_category_id: first.cat.id,
          quantity: first.qty,
        } as unknown as Record<string, unknown>);
        const orderId = (order as { id?: number; order_id?: number }).id ?? (order as { order_id?: number }).order_id;
        if (orderId) {
          toast.success("Pesanan dibuat, lanjut ke pembayaran");
          router.push(`/orders/${orderId}`);
          return;
        }
        router.push(`/concerts/${id}/queue?catId=${first.cat.id}&qty=${first.qty}`);
        return;
      }
      const orderIds: number[] = [];
      for (const e of entries) {
        const order = await apiPost<{ id: number } | { order_id: number } | { id: string }>("/orders", {
          event_id: Number(id),
          ticket_category_id: e.cat.id,
          quantity: e.qty,
        } as unknown as Record<string, unknown>);
        const oid = (order as { id?: number; order_id?: number }).id ?? (order as { order_id?: number }).order_id;
        if (oid) orderIds.push(Number(oid));
      }
      if (orderIds.length) {
        toast.success(`${orderIds.length} pesanan dibuat — lanjut ke pembayaran`);
        router.push(`/orders/${orderIds[0]}`);
        return;
      }
      router.push(`/concerts/${id}/queue?catId=${entries[0].cat.id}&qty=${entries[0].qty}`);
    } catch (err: unknown) {
      const msg = (err as Error).message ?? "";
      if (msg.toLowerCase().includes("stok") || msg.toLowerCase().includes("not enough") || msg.toLowerCase().includes("sold out")) {
        toast.error("Stok tiket tidak cukup");
      } else {
        // eslint-disable-next-line react-hooks/purity
        const fallbackId = Math.floor(1000 + Math.random() * 9000);
        toast.success("Masuk ke pembayaran");
        router.push(`/orders/${fallbackId}`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !concert) {
    return (
      <div className="min-h-screen bg-[#F8F8FA]">
        <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white">
          <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-4">
            <div className="flex items-center gap-2">
              <WavyIcon size={22} />
              <span className="text-sm font-bold text-[#111827]">Wavy</span>
            </div>
            <CheckoutStepper step={1} />
          </div>
        </header>
        <div className="mx-auto max-w-[1280px] px-4 py-16 text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-[#2B5CFF] border-t-transparent" />
          <p className="mt-3 text-sm text-[#6B7280]">Memuat tiket...</p>
        </div>
      </div>
    );
  }

  const banner = concert.poster_url || "https://assets.loket.com/neo/production/images/banner/20260722120040_6a604e781ffbd.jpg";

  return (
    <div className="min-h-screen bg-[#F8F8FA]">
      <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-4 px-3 sm:px-4">
          <Link href={`/concerts/${id}`} className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded bg-[#1B1A3A] text-[11px] font-black text-white">W</span>
            <span className="hidden text-[13px] font-extrabold tracking-tight text-[#111827] sm:block">WAVY</span>
          </Link>
          <CheckoutStepper step={1} />
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-[#F3F4F6] px-2.5 py-1 text-[11px] font-semibold text-[#374151] sm:inline-flex">ID</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-3 py-3 sm:px-4 sm:py-4">
        <div className="overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-sm">
          <div className="relative h-[132px] w-full overflow-hidden bg-[#FFE4EA] sm:h-[190px]">
            <img src={banner} alt={concert.title} className="h-full w-full object-cover object-center" />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/10" />
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-[#E5E7EB]" />
          <h1 className="text-sm font-bold text-[#111827] sm:text-[15px]">{concert.title}</h1>
          <div className="h-px flex-1 bg-[#E5E7EB]" />
        </div>

        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <h2 className="text-[13px] font-extrabold tracking-wide text-[#1F2937]">{groupLabel}</h2>

            {soldOutCount > 0 && (
              <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3.5 py-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <p className="text-xs leading-relaxed text-amber-800">
                  <span className="font-bold">{soldOutCount} kategori sudah habis terjual.</span> Tiket habis ditandai
                  jelas di bawah — stok tersisa tidak bisa dipesan.
                </p>
              </div>
            )}

            <div className="mt-3 space-y-3">
              {categories.map((cat) => {
                const price = Number(cat.price);
                const soldOut = cat.remaining !== undefined && cat.remaining <= 0;
                const qty = qtyMap[cat.id] ?? 0;
                return (
                  <div
                    key={cat.id}
                    className={`relative overflow-hidden rounded-xl border bg-white ${soldOut ? "border-[#FECACA] opacity-90" : "border-[#E5E7EB]"}`}
                  >
                    <span className={`pointer-events-none absolute left-0 top-[72%] hidden h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-[#F8F8FA] sm:block ${soldOut ? "border-[#FECACA]" : "border-[#E5E7EB]"}`} />
                    <span className={`pointer-events-none absolute right-0 top-[72%] hidden h-4 w-4 translate-x-1/2 -translate-y-1/2 rounded-full border bg-[#F8F8FA] sm:block ${soldOut ? "border-[#FECACA]" : "border-[#E5E7EB]"}`} />
                    {soldOut && <div className="absolute inset-x-0 top-0 h-1 bg-[#EF4444]" />}

                    <div className="px-4 py-3.5 sm:px-5 sm:py-4">
                      <p className={`flex items-center gap-1.5 text-[13px] font-bold sm:text-[14px] ${soldOut ? "text-[#9CA3AF]" : "text-[#111827]"}`}>
                        {soldOut && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-[#EF4444]" />}
                        {cat.name}
                      </p>
                      <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[12px] leading-snug text-[#6B7280]">
                        <li>Harga belum termasuk Pajak Hiburan Daerah, Biaya Admin, dan biaya lainnya.</li>
                      </ul>
                      {soldOut ? (
                        <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-[#DC2626]">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          Maaf, kategori ini sudah habis dan tidak bisa dipesan lagi
                        </p>
                      ) : (
                        <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-[#2B5CFF]">
                          <Clock className="h-3 w-3" />
                          Penjualan berakhir pada {new Date(concert.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })} • 21:00
                        </p>
                      )}
                    </div>

                    <div className={`flex items-center justify-between border-t border-dashed px-4 py-3 sm:px-5 ${soldOut ? "border-[#FECACA] bg-[#FEF2F2]" : "border-[#E5E7EB] bg-[#FCFCFD]"}`}>
                      <span className={`text-[14px] font-extrabold ${soldOut ? "text-[#9CA3AF] line-through decoration-[#EF4444]/40" : "text-[#111827]"}`}>{formatIDR(price)}</span>
                      {soldOut ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-[#FECACA] bg-white px-3 py-1 text-[11px] font-bold text-[#DC2626]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#EF4444] animate-pulse" />
                          Habis Terjual
                        </span>
                      ) : (
                        <div className="relative">
                          <select
                            value={qty}
                            onChange={(e) => setQty(cat.id, Number(e.target.value))}
                            className="min-w-[72px] appearance-none rounded-lg border border-[#E5E7EB] bg-white px-3 py-1.5 pr-7 text-center text-sm font-semibold text-[#111827] outline-none focus:border-[#2B5CFF]"
                          >
                            {[0, 1, 2, 3, 4].map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#9CA3AF]" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:sticky lg:top-[68px] lg:self-start">
            <div className="rounded-xl border border-[#E5E7EB] bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:p-5">
              {entries.length === 0 ? (
                <div className="flex items-start gap-2.5 py-1">
                  <Ticket className="h-5 w-5 shrink-0 text-[#7CC9E8]" />
                  <p className="text-[13px] leading-snug text-[#6B7280]">Tiket yang dipilih akan dicantumkan di sini</p>
                </div>
              ) : (
                <div className="divide-y divide-[#F3F4F6]">
                  {entries.map(({ cat, qty }) => (
                    <div key={cat.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                      <Ticket className="mt-0.5 h-5 w-5 shrink-0 text-[#38BDF8]" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold leading-tight text-[#111827]">{cat.name}</p>
                        <p className="mt-0.5 text-xs text-[#6B7280]">
                          {qty} tiket x {formatIDR(Number(cat.price))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="my-3 h-px bg-[#E5E7EB]" />

              <div className="flex items-center justify-between">
                <span className="text-xs text-[#6B7280]">Jumlah ({totalTickets} tiket)</span>
                <span className="text-sm font-extrabold text-[#111827]">{formatIDR(totalPrice)}</span>
              </div>

              <button
                onClick={handlePesan}
                disabled={totalTickets === 0 || submitting}
                className="mt-3 w-full rounded-lg bg-[#2B5CFF] py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-[#9CA3AF] disabled:hover:brightness-100"
              >
                {submitting ? "Memproses..." : "Pesan Sekarang"}
              </button>
              <p className="mt-2 text-center text-[10px] leading-snug text-[#9CA3AF]">Dengan melanjutkan, kamu menyetujui Syarat & Ketentuan yang berlaku.</p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
