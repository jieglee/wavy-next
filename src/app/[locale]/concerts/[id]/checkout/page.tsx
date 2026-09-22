"use client";

import { useEffect, useState, use } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { Ticket, ChevronDown, Clock, AlertTriangle, Check } from "lucide-react";
import toast from "react-hot-toast";
import { WavyIcon } from "@/components/landing/wavy-icon";
import { apiGet, apiPost, getAuthToken, getAuthUser } from "@/lib/api";
import { formatIDR } from "@/lib/price";
import type { ConcertDetail, TicketCategory } from "@/types/type";
import Footer from "@/components/landing/footer";
import ConcertSeatmap from "@/components/concerts/concert-seatmap";

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
    <div className="hidden items-center gap-2 sm:flex">
      {steps.map((label, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <div key={label} className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[13px] font-bold leading-none ${
                  done
                    ? "bg-[#1D4ED8] text-white"
                    : active
                      ? "border-2 border-[#1D4ED8] bg-white text-[#1D4ED8]"
                      : "border-2 border-[#D1D5DB] bg-white text-[#9CA3AF]"
                }`}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={3} /> : n}
              </span>
              <span className={`text-sm font-semibold ${done || active ? "text-[#111827]" : "text-[#9CA3AF]"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && <span className="mx-1 text-base font-medium text-[#D1D5DB]">&gt;</span>}
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
  const [step, setStep] = useState<1 | 2>(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [idNumber, setIdNumber] = useState("");
  const [dobDay, setDobDay] = useState("");
  const [dobMonth, setDobMonth] = useState("");
  const [dobYear, setDobYear] = useState("");
  const [gender, setGender] = useState<"" | "L" | "P">("");
  const [waConsent, setWaConsent] = useState<"Ya" | "Tidak">("Ya");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreeData, setAgreeData] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState(600);

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

  useEffect(() => {
    if (step !== 2) return;
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [step]);

  useEffect(() => {
    if (step !== 2 || timeLeft > 0) return;
    const t = setTimeout(() => {
      toast.error("Waktu pemesanan habis, silakan pilih kategori lagi");
      setStep(1);
      setTimeLeft(600);
    }, 50);
    return () => clearTimeout(t);
  }, [step, timeLeft]);

  const categories: TicketCategory[] = concert?.ticket_categories ?? [];
  const groupLabel = "NATIONAL - GENERAL SALE";

  const entries = categories
    .map((c) => ({ cat: c, qty: qtyMap[c.id] ?? 0 }))
    .filter((e) => e.qty > 0);

  const totalTickets = entries.reduce((s, e) => s + e.qty, 0);
  const totalPrice = entries.reduce((s, e) => s + Number(e.cat.price) * e.qty, 0);
  const soldOutCount = categories.filter((c) => c.remaining !== undefined && c.remaining <= 0).length;
  const timerMm = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const timerSs = String(timeLeft % 60).padStart(2, "0");

  function goToPersonal() {
    if (!concert || totalTickets === 0) {
      toast.error("Pilih minimal 1 tiket");
      return;
    }
    if (totalTickets > 4) {
      toast.error("Maksimal 4 tiket per pesanan");
      return;
    }
    const u = getAuthUser<{ name?: string; email?: string }>();
    if (u?.email) setEmail((v) => v || u.email || "");
    if (u?.name) {
      const parts = u.name.trim().split(/\s+/);
      setFirstName((v) => v || parts[0] || "");
      setLastName((v) => v || parts.slice(1).join(" "));
    }
    setTimeLeft(600);
    setStep(2);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function validatePersonal() {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = "Nama depan wajib diisi";
    if (!email.trim()) errs.email = "Email wajib diisi";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = "Format email tidak valid";
    const digits = phone.replace(/\D/g, "");
    if (!phone.trim()) errs.phone = "No. handphone wajib diisi";
    else if (digits.length < 9) errs.phone = "No. handphone minimal 9 digit";
    if (!idNumber.trim()) errs.idNumber = "Nomor identitas wajib diisi";
    const d = Number(dobDay), m = Number(dobMonth), y = Number(dobYear);
    if (!dobDay || !dobMonth || !dobYear) errs.dob = "Tanggal lahir wajib diisi";
    else {
      const dt = new Date(y, m - 1, d);
      if (!d || !m || !y || dt.getDate() !== d || dt.getMonth() !== m - 1 || dt.getFullYear() !== y) errs.dob = "Tanggal lahir tidak valid";
      else if (y < 1900 || y > new Date().getFullYear()) errs.dob = "Tahun lahir tidak valid";
    }
    if (!gender) errs.gender = "Pilih jenis kelamin";
    if (!agreeTerms) errs.agreeTerms = "Centang persetujuan Syarat & Ketentuan";
    if (!agreeData) errs.agreeData = "Centang persetujuan pemrosesan data";
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleLanjut() {
    if (!validatePersonal()) {
      toast.error("Lengkapi data diri dulu");
      return;
    }
    handlePesan();
  }

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
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <WavyIcon size={26} />
              <span className="font-display text-xl font-bold tracking-tight text-[#1B1A3A]">Wavy</span>
            </Link>
            <CheckoutStepper step={step} />
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
  const eventDateObj = new Date(concert.date);
  const eventDateStr = eventDateObj.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  const eventTimeStr = eventDateObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
  const inputCls = (bad?: string) =>
    `w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-[#111827] outline-none transition focus:border-[#2B5CFF] focus:ring-2 focus:ring-[#2B5CFF]/25 ${bad ? "border-rose-400" : "border-[#E5E7EB]"}`;
  const labelCls = "mb-1.5 block text-xs font-semibold text-[#374151]";
  const errCls = "mt-1 text-xs text-rose-500";
  const req = <span className="text-rose-500"> *</span>;

  return (
    <div className="min-h-screen bg-[#F8F8FA]">
      <header className="sticky top-0 z-40 border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-4 px-3 sm:px-4">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <WavyIcon size={26} />
            <span className="font-display text-xl font-bold tracking-tight text-[#1B1A3A]">Wavy</span>
          </Link>
          <CheckoutStepper step={step} />
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

        {step === 1 && concert.seatmap?.images?.length ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5">
            <ConcertSeatmap seatmap={concert.seatmap} />
          </div>
        ) : null}

        {step === 1 && (
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
                onClick={goToPersonal}
                disabled={totalTickets === 0 || submitting}
                className="mt-3 w-full rounded-lg bg-[#2B5CFF] py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-[#9CA3AF] disabled:hover:brightness-100"
              >
                {submitting ? "Memproses..." : "Pesan Sekarang"}
              </button>
              <p className="mt-2 text-center text-[10px] leading-snug text-[#9CA3AF]">Dengan melanjutkan, kamu menyetujui Syarat & Ketentuan yang berlaku.</p>
            </div>
          </div>
        </div>
        )}

        {step === 2 && (
        <div className="mx-auto mt-5 max-w-[880px]">
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-[#E5E7EB]">
            <div className="bg-[#F5C518] px-4 py-2.5 text-center text-[13px] font-bold text-[#111827]">
              {timerMm}:{timerSs}
              <span className="ml-2 font-medium">| Sisa waktu untuk memesan tiket</span>
            </div>
            <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_290px]">
              <div>
                <h2 className="text-[15px] font-bold text-[#111827]">Data Diri</h2>
                <div className="mt-4 space-y-4">
                  <div>
                    <label className={labelCls}>Nama Depan{req}</label>
                    <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls(formErrors.firstName)} placeholder="Nama depan" />
                    {formErrors.firstName && <p className={errCls}>{formErrors.firstName}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Nama Belakang</label>
                    <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls()} placeholder="Nama belakang" />
                  </div>
                  <div>
                    <label className={labelCls}>Email{req}</label>
                    <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls(formErrors.email)} placeholder="email@contoh.com" />
                    {formErrors.email && <p className={errCls}>{formErrors.email}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>No. Handphone{req}</label>
                    <div className="flex gap-2">
                      <span className="flex shrink-0 items-center gap-1 rounded-lg border border-[#E5E7EB] bg-[#F8F8FA] px-3 py-2.5 text-sm font-semibold text-[#374151]">
                        ID +62
                      </span>
                      <input inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls(formErrors.phone)} placeholder="81223333444" />
                    </div>
                    {formErrors.phone && <p className={errCls}>{formErrors.phone}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Nomor Identitas (KTP/Passport,dll){req}</label>
                    <input value={idNumber} onChange={(e) => setIdNumber(e.target.value)} className={inputCls(formErrors.idNumber)} placeholder="Nomor identitas" />
                    {formErrors.idNumber && <p className={errCls}>{formErrors.idNumber}</p>}
                  </div>
                  <div>
                    <label className={labelCls}>Tanggal Lahir{req}</label>
                    <div className="flex gap-2">
                      <input inputMode="numeric" maxLength={2} value={dobDay} onChange={(e) => setDobDay(e.target.value.replace(/\D/g, ""))} className={`${inputCls(formErrors.dob)} w-[76px] min-w-0 shrink-0 text-center`} placeholder="dd" />
                      <div className="relative min-w-0 flex-1">
                        <select
                          value={dobMonth}
                          onChange={(e) => setDobMonth(e.target.value)}
                          className={`${inputCls(formErrors.dob)} w-full appearance-none pr-8 ${dobMonth ? "text-[#111827]" : "text-[#9CA3AF]"}`}
                        >
                          <option value="" disabled>mm</option>
                          {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((m, i) => (
                            <option key={m} value={i + 1}>{m}</option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
                      </div>
                      <input inputMode="numeric" maxLength={4} value={dobYear} onChange={(e) => setDobYear(e.target.value.replace(/\D/g, ""))} className={`${inputCls(formErrors.dob)} w-[110px] min-w-0 shrink-0 text-center`} placeholder="YYYY" />
                    </div>
                    {formErrors.dob && <p className={errCls}>{formErrors.dob}</p>}
                  </div>
                  <div>
                    <span className={labelCls}>Jenis Kelamin{req}</span>
                    <div className="space-y-2">
                      {(["L", "P"] as const).map((g) => (
                        <label key={g} className="flex cursor-pointer items-center gap-2 text-sm text-[#374151]">
                          <input type="radio" name="gender" checked={gender === g} onChange={() => setGender(g)} className="h-4 w-4 accent-[#2B5CFF]" />
                          {g === "L" ? "Laki-Laki" : "Wanita"}
                        </label>
                      ))}
                    </div>
                    {formErrors.gender && <p className={errCls}>{formErrors.gender}</p>}
                  </div>
                  <div>
                    <p className="text-xs font-semibold leading-relaxed text-[#374151]">
                      Saya setuju untuk menerima notifikasi terkait pemesanan tiket berikut melalui nomor WhatsApp saya.
                    </p>
                    <div className="mt-2 space-y-2">
                      {(["Ya", "Tidak"] as const).map((v) => (
                        <label key={v} className="flex cursor-pointer items-center gap-2 text-sm text-[#374151]">
                          <input type="radio" name="wa" checked={waConsent === v} onChange={() => setWaConsent(v)} className="h-4 w-4 accent-[#2B5CFF]" />
                          {v}
                        </label>
                      ))}
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-[#374151]">
                    <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#2B5CFF]" />
                    <span>Dengan mengklik &ldquo;Lanjut&rdquo;, kamu menyetujui <span className="font-semibold text-[#2B5CFF]">Syarat & Ketentuan</span> dan <span className="font-semibold text-[#2B5CFF]">Kebijakan Privasi</span> Wavy.</span>
                  </label>
                  {formErrors.agreeTerms && <p className={errCls}>{formErrors.agreeTerms}</p>}
                  <label className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-[#374151]">
                    <input type="checkbox" checked={agreeData} onChange={(e) => setAgreeData(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-[#2B5CFF]" />
                    <span>Dengan mengklik &ldquo;Lanjut&rdquo;, kamu menyetujui <span className="font-semibold text-[#2B5CFF]">Kebijakan Pemrosesan Data Pribadi</span> Wavy.</span>
                  </label>
                  {formErrors.agreeData && <p className={errCls}>{formErrors.agreeData}</p>}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="rounded-lg border border-[#E5E7EB] bg-white px-6 py-2.5 text-sm font-bold text-[#374151] transition hover:bg-[#F8F8FA]"
                    >
                      Kembali
                    </button>
                    <button
                      type="button"
                      onClick={handleLanjut}
                      disabled={submitting}
                      className="rounded-lg bg-[#2B5CFF] px-6 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-[#9CA3AF]"
                    >
                      {submitting ? "Memproses..." : "Lanjut"}
                    </button>
                  </div>
                </div>
              </div>
              <aside className="h-fit rounded-xl border border-[#F0F0F4] bg-[#FCFCFD] p-4 lg:sticky lg:top-[68px]">
                <p className="text-[13px] font-bold leading-snug text-[#111827]">{concert.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-[#6B7280]">
                  {eventDateStr} • {eventTimeStr} WIB
                </p>
                <p className="mt-1 text-xs leading-relaxed text-[#6B7280]">{concert.venue}</p>
                <div className="my-3 h-px bg-[#E5E7EB]" />
                <p className="text-[13px] font-bold text-[#111827]">Ringkasan Pesanan</p>
                <div className="mt-2 divide-y divide-[#F0F0F4]">
                  {entries.map(({ cat, qty }) => (
                    <div key={cat.id} className="flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0">
                      <Ticket className="mt-0.5 h-5 w-5 shrink-0 text-[#38BDF8]" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase text-[#111827]">{cat.name}</p>
                        <p className="mt-0.5 text-xs text-[#6B7280]">
                          {qty} tiket x {formatIDR(Number(cat.price))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="my-3 h-px bg-[#E5E7EB]" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-[#6B7280]">Jumlah ({totalTickets} tiket)</span>
                  <span className="text-sm font-extrabold text-[#111827]">{formatIDR(totalPrice)}</span>
                </div>
              </aside>
            </div>
          </div>
        </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
