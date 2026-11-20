"use client";

import { useEffect, useState, use } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { Ticket, ChevronDown, Clock, AlertTriangle, Check, Info } from "lucide-react";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { OrderErrorAlert, type OrderSubmitError } from "@/components/checkout/order-error-alert";
import { ErrorState, LoadingState } from "@/components/states/async-states";
import { WavyIcon } from "@/components/landing/wavy-icon";
import { apiGet, apiPost, getAuthToken, getAuthUser } from "@/lib/api";
import { formatIDR } from "@/lib/price";
import type { ConcertDetail, TicketCategory } from "@/types/type";
import Footer from "@/components/landing/footer";
import ConcertSeatmap from "@/components/concerts/concert-seatmap";

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
                    ? "bg-primary text-white"
                    : active
                      ? "border-2 border-primary bg-white text-primary"
                      : "border-2 border-input bg-white text-muted-foreground/70"
                }`}
              >
                {done ? <Check className="h-4 w-4" strokeWidth={3} /> : n}
              </span>
              <span className={`text-sm font-semibold ${done || active ? "text-foreground" : "text-muted-foreground/70"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && <span className="mx-1 text-base font-medium text-muted-foreground/40">&gt;</span>}
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
  const [step, setStep] = useState<1 | 2 | 3>(1);
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
  const [orderError, setOrderError] = useState<OrderSubmitError | null>(null);
  const [loadError, setLoadError] = useState<unknown>(null);
  const [loadNonce, setLoadNonce] = useState(0);
  const tCheckout = useTranslations("Checkout");


  useEffect(() => {
    if (!getAuthToken()) {
      toast.error("Silakan masuk terlebih dahulu");
      router.push("/auth/login");
      return;
    }
    (async () => {
      setLoading(true);
      setLoadError(null);
      let data: ConcertDetail;
      try {
        data = await apiGet<ConcertDetail>(`/concerts/${id}`);
      } catch (err: unknown) {
        setLoadError(err);
        setLoading(false);
        return;
      }
      setConcert(data);
      try {
        const raw = sessionStorage.getItem(`wavy-checkout-${id}`);
        if (raw) {
          const s = JSON.parse(raw) as { qtyMap?: Record<string, number>; step?: number; form?: Record<string, string> };
          const cats = data.ticket_categories ?? [];
          // satu kategori per checkout: pulihkan kategori valid pertama saja
          const validQty: Record<number, number> = {};
          let total = 0;
          for (const c of cats) {
            const q = Number(s.qtyMap?.[c.id] ?? 0);
            if (q > 0) {
              const v = Math.min(q, 4, c.remaining ?? 4);
              if (v > 0) { validQty[c.id] = v; total += v; break; }
            }
          }
          if (total > 0 && total <= 4) {
            setQtyMap(validQty);
            if (s.step === 2 || s.step === 3) setStep(s.step);
            const f = s.form ?? {};
            if (f.firstName) setFirstName(f.firstName);
            if (f.lastName) setLastName(f.lastName);
            if (f.email) setEmail(f.email);
            if (f.phone) setPhone(f.phone);
            if (f.idNumber) setIdNumber(f.idNumber);
            if (f.dobDay) setDobDay(f.dobDay);
            if (f.dobMonth) setDobMonth(f.dobMonth);
            if (f.dobYear) setDobYear(f.dobYear);
            if (f.gender === "L" || f.gender === "P") setGender(f.gender);
            if (f.waConsent === "Ya" || f.waConsent === "Tidak") setWaConsent(f.waConsent);
          }
        }
      } catch { /* abaikan storage rusak */ }
      setLoading(false);
    })();
  }, [id, router, loadNonce]);

  useEffect(() => {
    if (step !== 2 && step !== 3) return;
    const t = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [step]);

  useEffect(() => {
    if ((step !== 2 && step !== 3) || timeLeft > 0) return;
    const t = setTimeout(() => {
      toast.error("Waktu pemesanan habis, silakan pilih kategori lagi");
      setStep(1);
      setTimeLeft(600);
    }, 50);
    return () => clearTimeout(t);
  }, [step, timeLeft]);

  useEffect(() => {
    if (loading) return;
    try {
      sessionStorage.setItem(`wavy-checkout-${id}`, JSON.stringify({
        qtyMap, step,
        form: { firstName, lastName, email, phone, idNumber, dobDay, dobMonth, dobYear, gender, waConsent },
      }));
    } catch { /* abaikan storage penuh */ }
  }, [loading, id, qtyMap, step, firstName, lastName, email, phone, idNumber, dobDay, dobMonth, dobYear, gender, waConsent]);

  function dropStored() {
    try { sessionStorage.removeItem(`wavy-checkout-${id}`); } catch { /* abaikan */ }
  }

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
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    // Satu kategori per checkout -> satu order -> total di detail order = total di sini.
    // Memilih kategori lain mengganti pilihan sebelumnya.
    const switching = Object.entries(qtyMap).some(([k, q]) => Number(k) !== catId && q > 0);
    if (switching) toast(tCheckout("oneCategorySwitched"));
    setQtyMap({ [catId]: Math.min(v, 4) });
  }

  function buildOrderPayload(catId: number, qty: number) {
    return {
      event_id: Number(id),
      ticket_category_id: catId,
      quantity: qty,
      full_name: `${firstName} ${lastName}`.trim(),
      email: email.trim(),
      phone: phone.trim(),
      id_number: idNumber.trim(),
      birth_date: dobYear && dobMonth && dobDay ? `${dobYear}-${String(dobMonth).padStart(2, "0")}-${String(dobDay).padStart(2, "0")}` : null,
      gender: gender || null,
      wa_consent: waConsent,
    } as unknown as Record<string, unknown>;
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
    // satu kategori per checkout = satu order (backend: total_price = harga x jumlah)
    const [entry] = entries;
    setSubmitting(true);
    setOrderError(null);
    try {
      const order = await apiPost<{ id: number }>("/orders", buildOrderPayload(entry.cat.id, entry.qty));
      dropStored();
      toast.success(tCheckout("created", { count: 1 }));
      router.push(`/orders/${order.id}`);
    } catch (err: unknown) {
      setOrderError({ error: err });
    } finally {
      setSubmitting(false);
    }
  }

  // QUOTA_EXCEEDED / ORDER_EXPIRED: ambil sisa kuota terbaru lalu kembali ke pilihan tiket
  async function handleReselect() {
    setOrderError(null);
    try {
      const fresh = await apiGet<ConcertDetail>(`/concerts/${id}`);
      setConcert(fresh);
      setQtyMap((prev) => {
        const next: Record<number, number> = {};
        for (const c of fresh.ticket_categories ?? []) {
          const q = Math.min(prev[c.id] ?? 0, c.remaining ?? 0);
          if (q > 0) next[c.id] = q;
        }
        return next;
      });
    } catch (err: unknown) {
      setOrderError({ error: err });
      return;
    }
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading || !concert) {
    return (
      <div className="min-h-screen bg-surface">
        <header className="sticky top-0 z-40 border-b border-border bg-white">
          <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-4">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <WavyIcon size={26} />
              <span className="font-display text-xl font-bold tracking-tight text-foreground">Wavy</span>
            </Link>
            <CheckoutStepper step={step} />
          </div>
        </header>
        <div className="mx-auto max-w-[1280px] px-4 py-12">
          {loadError && !loading ? (
            <ErrorState error={loadError} onRetry={() => setLoadNonce((n) => n + 1)} />
          ) : (
            <LoadingState label={tCheckout("loading")} />
          )}
        </div>
      </div>
    );
  }

  const banner = concert.banner_url || concert.poster_url || null;
  const eventDateObj = new Date(concert.date);
  const eventDateStr = eventDateObj.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
  const eventTimeStr = eventDateObj.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false });
  const inputCls = (bad?: string) =>
    `w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/25 ${bad ? "border-destructive" : "border-border"}`;
  const labelCls = "mb-1.5 block text-xs font-semibold text-foreground/85";
  const errCls = "mt-1 text-xs text-destructive";
  const req = <span className="text-destructive"> *</span>;

  return (
    <div className="min-h-screen bg-surface">
      <header className="sticky top-0 z-40 border-b border-border bg-white">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-4 px-3 sm:px-4">
          <Link href="/" className="flex shrink-0 items-center gap-2">
            <WavyIcon size={26} />
            <span className="font-display text-xl font-bold tracking-tight text-foreground">Wavy</span>
          </Link>
          <CheckoutStepper step={step} />
          <div className="flex items-center gap-2">
            <span className="hidden rounded-full bg-muted px-2.5 py-1 text-[11px] font-semibold text-foreground/85 sm:inline-flex">ID</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1280px] px-3 py-3 sm:px-4 sm:py-4">
        <div className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm">
          <div className="relative h-[132px] w-full overflow-hidden bg-primary/15 sm:h-[190px]">
            {banner && <img src={banner} alt={concert.title} className="h-full w-full object-cover object-center" />}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-border" />
          <h1 className="text-sm font-bold text-foreground sm:text-[15px]">{concert.title}</h1>
          <div className="h-px flex-1 bg-border" />
        </div>

        {step === 1 && concert.seatmap?.images?.length ? (
          <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-white p-4 shadow-sm sm:p-5">
            <ConcertSeatmap seatmap={concert.seatmap} />
          </div>
        ) : null}

        {step === 1 && (
        <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div>
            <h2 className="text-[13px] font-extrabold tracking-wide text-foreground">{groupLabel}</h2>
            <p className="mt-1 text-xs text-muted-foreground">{tCheckout("oneCategoryHint")}</p>

            {soldOutCount > 0 && (
              <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-warning/30 bg-warning/5 px-3.5 py-3">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                <p className="text-xs leading-relaxed text-warning">
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
                    className={`relative overflow-hidden rounded-xl border bg-white ${soldOut ? "border-destructive/30 opacity-90" : "border-border"}`}
                  >
                    <span className={`pointer-events-none absolute left-0 top-[72%] hidden h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border bg-surface sm:block ${soldOut ? "border-destructive/30" : "border-border"}`} />
                    <span className={`pointer-events-none absolute right-0 top-[72%] hidden h-4 w-4 translate-x-1/2 -translate-y-1/2 rounded-full border bg-surface sm:block ${soldOut ? "border-destructive/30" : "border-border"}`} />
                    {soldOut && <div className="absolute inset-x-0 top-0 h-1 bg-destructive" />}

                    <div className="px-4 py-3.5 sm:px-5 sm:py-4">
                      <p className={`flex items-center gap-1.5 text-[13px] font-bold sm:text-[14px] ${soldOut ? "text-muted-foreground/70" : "text-foreground"}`}>
                        {soldOut && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />}
                        {cat.name}
                      </p>
                      <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[12px] leading-snug text-muted-foreground">
                        <li>Harga belum termasuk Pajak Hiburan Daerah, Biaya Admin, dan biaya lainnya.</li>
                      </ul>
                      {soldOut ? (
                        <p className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-destructive">
                          <AlertTriangle className="h-3 w-3 shrink-0" />
                          Maaf, kategori ini sudah habis dan tidak bisa dipesan lagi
                        </p>
                      ) : (
                        <p className="mt-2 flex items-center gap-1 text-[11px] font-medium text-primary">
                          <Clock className="h-3 w-3" />
                          Penjualan berakhir pada {new Date(concert.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })} • 21:00
                        </p>
                      )}
                    </div>

                    <div className={`flex items-center justify-between border-t border-dashed px-4 py-3 sm:px-5 ${soldOut ? "border-destructive/30 bg-destructive/10" : "border-border bg-surface"}`}>
                      <span className={`text-[14px] font-extrabold ${soldOut ? "text-muted-foreground/70 line-through decoration-destructive/40" : "text-foreground"}`}>{formatIDR(price)}</span>
                      {soldOut ? (
                        <span className="inline-flex items-center gap-1 rounded-md border border-destructive/30 bg-white px-3 py-1 text-[11px] font-bold text-destructive">
                          <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                          Habis Terjual
                        </span>
                      ) : (
                        <div className="relative">
                          <select
                            value={qty}
                            onChange={(e) => setQty(cat.id, Number(e.target.value))}
                            className="min-w-[72px] appearance-none rounded-lg border border-border bg-white px-3 py-1.5 pr-7 text-center text-sm font-semibold text-foreground outline-none focus:border-primary"
                          >
                            {[0, 1, 2, 3, 4].map((n) => (
                              <option key={n} value={n}>
                                {n}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground/70" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="lg:sticky lg:top-[68px] lg:self-start">
            <div className="rounded-xl border border-border bg-white p-4 shadow-[0_4px_24px_rgba(0,0,0,0.06)] sm:p-5">
              {entries.length === 0 ? (
                <div className="flex items-start gap-2.5 py-1">
                  <Ticket className="h-5 w-5 shrink-0 text-primary" />
                  <p className="text-[13px] leading-snug text-muted-foreground">Tiket yang dipilih akan dicantumkan di sini</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {entries.map(({ cat, qty }) => (
                    <div key={cat.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                      <Ticket className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="text-[13px] font-semibold leading-tight text-foreground">{cat.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {qty} tiket x {formatIDR(Number(cat.price))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="my-3 h-px bg-border" />

              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Jumlah ({totalTickets} tiket)</span>
                <span className="text-sm font-extrabold text-foreground">{formatIDR(totalPrice)}</span>
              </div>

              <button
                onClick={goToPersonal}
                disabled={totalTickets === 0 || submitting}
                className="mt-3 w-full rounded-lg bg-primary py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-muted-foreground/70 disabled:hover:brightness-100"
              >
                {submitting ? "Memproses..." : "Pesan Sekarang"}
              </button>
              <p className="mt-2 text-center text-[10px] leading-snug text-muted-foreground/70">Dengan melanjutkan, kamu menyetujui Syarat & Ketentuan yang berlaku.</p>
            </div>
          </div>
        </div>
        )}

        {step === 2 && (
        <div className="mx-auto mt-5 max-w-[880px]">
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-border">
            <div className="bg-info-subtle px-4 py-2.5 text-center text-[13px] font-bold text-foreground">
              {timerMm}:{timerSs}
              <span className="ml-2 font-medium">| Sisa waktu untuk memesan tiket</span>
            </div>
            <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_290px]">
              <div>
                <h2 className="text-[15px] font-bold text-foreground">Data Diri</h2>
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
                      <span className="flex shrink-0 items-center gap-1 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm font-semibold text-foreground/85">
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
                          className={`${inputCls(formErrors.dob)} w-full appearance-none pr-8 ${dobMonth ? "text-foreground" : "text-muted-foreground/70"}`}
                        >
                          <option value="" disabled>mm</option>
                          {[
                            "Januari", "Februari", "Maret", "April", "Mei", "Juni",
                            "Juli", "Agustus", "September", "Oktober", "November", "Desember",
                          ].map((m, i) => (
                            <option key={m} value={i + 1}>{m}</option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                      </div>
                      <input inputMode="numeric" maxLength={4} value={dobYear} onChange={(e) => setDobYear(e.target.value.replace(/\D/g, ""))} className={`${inputCls(formErrors.dob)} w-[110px] min-w-0 shrink-0 text-center`} placeholder="YYYY" />
                    </div>
                    {formErrors.dob && <p className={errCls}>{formErrors.dob}</p>}
                  </div>
                  <div>
                    <span className={labelCls}>Jenis Kelamin{req}</span>
                    <div className="space-y-2">
                      {(["L", "P"] as const).map((g) => (
                        <label key={g} className="flex cursor-pointer items-center gap-2 text-sm text-foreground/85">
                          <input type="radio" name="gender" checked={gender === g} onChange={() => setGender(g)} className="h-4 w-4 accent-primary" />
                          {g === "L" ? "Laki-Laki" : "Wanita"}
                        </label>
                      ))}
                    </div>
                    {formErrors.gender && <p className={errCls}>{formErrors.gender}</p>}
                  </div>
                  <div>
                    <p className="text-xs font-semibold leading-relaxed text-foreground/85">
                      Saya setuju untuk menerima notifikasi terkait pemesanan tiket berikut melalui nomor WhatsApp saya.
                    </p>
                    <div className="mt-2 space-y-2">
                      {(["Ya", "Tidak"] as const).map((v) => (
                        <label key={v} className="flex cursor-pointer items-center gap-2 text-sm text-foreground/85">
                          <input type="radio" name="wa" checked={waConsent === v} onChange={() => setWaConsent(v)} className="h-4 w-4 accent-primary" />
                          {v}
                        </label>
                      ))}
                    </div>
                  </div>
                  <label className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-foreground/85">
                    <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-primary" />
                    <span>Dengan mengklik &ldquo;Lanjut&rdquo;, kamu menyetujui <span className="font-semibold text-primary">Syarat & Ketentuan</span> dan <span className="font-semibold text-primary">Kebijakan Privasi</span> Wavy.</span>
                  </label>
                  {formErrors.agreeTerms && <p className={errCls}>{formErrors.agreeTerms}</p>}
                  <label className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-foreground/85">
                    <input type="checkbox" checked={agreeData} onChange={(e) => setAgreeData(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-primary" />
                    <span>Dengan mengklik &ldquo;Lanjut&rdquo;, kamu menyetujui <span className="font-semibold text-primary">Kebijakan Pemrosesan Data Pribadi</span> Wavy.</span>
                  </label>
                  {formErrors.agreeData && <p className={errCls}>{formErrors.agreeData}</p>}
                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => { setStep(1); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                      className="rounded-lg border border-border bg-white px-6 py-2.5 text-sm font-bold text-foreground/85 transition hover:bg-surface"
                    >
                      Kembali
                    </button>
                    <button
                      type="button"
                      onClick={handleLanjut}
                      disabled={submitting || !agreeTerms || !agreeData}
                      className="rounded-lg bg-primary px-6 py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-muted-foreground/70 disabled:hover:brightness-100"
                    >
                      {submitting ? "Memproses..." : "Lanjut"}
                    </button>
                  </div>
                </div>
              </div>
              <aside className="h-fit rounded-xl border border-border bg-surface p-4 lg:sticky lg:top-[68px]">
                <p className="text-[13px] font-bold leading-snug text-foreground">{concert.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {eventDateStr} • {eventTimeStr} WIB
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{concert.venue}</p>
                <div className="my-3 h-px bg-border" />
                <p className="text-[13px] font-bold text-foreground">Ringkasan Pesanan</p>
                <div className="mt-2 divide-y divide-border">
                  {entries.map(({ cat, qty }) => (
                    <div key={cat.id} className="flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0">
                      <Ticket className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase text-foreground">{cat.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {qty} tiket x {formatIDR(Number(cat.price))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="my-3 h-px bg-border" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Jumlah ({totalTickets} tiket)</span>
                  <span className="text-sm font-extrabold text-foreground">{formatIDR(totalPrice)}</span>
                </div>
              </aside>
            </div>
          </div>
        </div>
        )}

        {step === 3 && (
        <div className="mx-auto mt-5 max-w-[880px]">
          <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-border">
            <div className="bg-info-subtle px-4 py-2.5 text-center text-[13px] font-bold text-foreground">
              {timerMm}:{timerSs}
              <span className="ml-2 font-medium">| Sisa waktu untuk memesan tiket</span>
            </div>
            <div className="grid grid-cols-1 gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_290px]">
              <div>
                <div className="flex items-start gap-2.5 rounded-lg border border-border bg-white px-4 py-3">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <p className="text-[13px] leading-relaxed text-foreground/85">{tCheckout("paymentNotice")}</p>
                </div>
              </div>
              <aside className="h-fit rounded-xl border border-border bg-surface p-4 lg:sticky lg:top-[68px]">
                <p className="text-[13px] font-bold leading-snug text-foreground">{concert.title}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                  {eventDateStr} • {eventTimeStr} WIB
                </p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{concert.venue}</p>
                <div className="my-3 h-px bg-border" />
                <p className="text-[13px] font-bold text-foreground">Ringkasan Pesanan</p>
                <div className="mt-2 divide-y divide-border">
                  {entries.map(({ cat, qty }) => (
                    <div key={cat.id} className="flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0">
                      <Ticket className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold uppercase text-foreground">{cat.name}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {qty} tiket x {formatIDR(Number(cat.price))}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="my-3 h-px bg-border" />
                <p className="text-[13px] font-bold text-foreground">Detail Pembayaran</p>
                <div className="mt-2 space-y-1.5">
                  {entries.map(({ cat, qty }) => (
                    <div key={cat.id} className="flex items-center justify-between text-xs text-foreground/85">
                      <span>{cat.name} (x{qty})</span>
                      <span className="font-semibold">{formatIDR(Number(cat.price) * qty)}</span>
                    </div>
                  ))}
                </div>
                <div className="my-3 border-t border-dashed border-border" />
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-bold text-foreground">Total Keseluruhan</span>
                  <span className="text-sm font-extrabold text-foreground">{formatIDR(totalPrice)}</span>
                </div>
                {orderError && (
                  <OrderErrorAlert
                    value={orderError}
                    concertId={id}
                    onRetry={handlePesan}
                    onReselect={handleReselect}
                  />
                )}
                <div className="mt-3 flex gap-2">
                  <button
                    type="button"
                    aria-label="Kembali"
                    onClick={() => { setStep(2); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                    className="flex items-center justify-center rounded-lg border border-border bg-white px-3.5 text-foreground/85 transition hover:bg-surface"
                  >
                    <ChevronDown className="h-4 w-4 rotate-90" />
                  </button>
                  <button
                    type="button"
                    onClick={handlePesan}
                    disabled={submitting}
                    className="flex-1 rounded-lg bg-primary py-2.5 text-sm font-bold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-muted-foreground/70"
                  >
                    {submitting ? "Memproses..." : "Lanjut"}
                  </button>
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
