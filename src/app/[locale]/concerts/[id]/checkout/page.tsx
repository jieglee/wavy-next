"use client";

import { MIDTRANS_ENABLED } from "@/lib/midtrans";
import { useEffect, useState, use, type ReactNode } from "react";
import { useRouter, Link } from "@/i18n/navigation";
import { Ticket, ChevronDown, ChevronLeft, AlertTriangle, Check, Info } from "lucide-react";
import toast from "react-hot-toast";
import { useFormatter, useTranslations } from "next-intl";
import { OrderErrorAlert, type OrderSubmitError } from "@/components/checkout/order-error-alert";
import { ErrorState, LoadingState } from "@/components/states/async-states";
import { WavyIcon } from "@/components/landing/wavy-icon";
import { apiGet, apiPost, getAuthToken, getAuthUser } from "@/lib/api";
import { formatIDR } from "@/lib/price";
import { cn } from "@/lib/utils";
import type { ConcertDetail, TicketCategory } from "@/types/type";
import Footer from "@/components/landing/footer";
import ConcertSeatmap from "@/components/concerts/concert-seatmap";
import { useSalesText } from "@/hooks/use-sales-text";
import { EventPoster } from "@/components/concerts/event-poster";

const STEP_KEYS = ["category", "personal", "confirm", "pay"] as const;
const MAX_TICKETS = 4;

function CheckoutStepper({ step = 1 }: { step?: number }) {
  const t = useTranslations("Checkout.steps");
  return (
    <ol className="hidden items-center gap-2 md:flex" aria-label={t("label")}>
      {STEP_KEYS.map((key, i) => {
        const n = i + 1;
        const active = n === step;
        const done = n < step;
        return (
          <li key={key} className="flex items-center gap-2" aria-current={active ? "step" : undefined}>
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-full font-mono text-xs font-bold leading-none",
                done
                  ? "bg-primary text-primary-foreground"
                  : active
                    ? "border-2 border-primary bg-background text-primary"
                    : "border-2 border-input bg-background text-muted-foreground/70"
              )}
            >
              {done ? <Check className="h-4 w-4" strokeWidth={3} /> : n}
            </span>
            <span className={cn("text-sm font-semibold", done || active ? "text-foreground" : "text-muted-foreground/70")}>
              {t(key)}
            </span>
            {i < STEP_KEYS.length - 1 && <span className="mx-1 h-px w-4 bg-input" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}

function CheckoutHeader({ step }: { step: number }) {
  const t = useTranslations("Checkout");
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex shrink-0 items-center gap-2">
          <WavyIcon size={26} />
          <span className="font-display text-xl font-bold tracking-tight text-foreground">Wavy</span>
        </Link>
        <CheckoutStepper step={step} />
        <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground md:hidden">
          {t("stepOf", { step, total: STEP_KEYS.length })}
        </span>
      </div>
    </header>
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
  const [summaryOpen, setSummaryOpen] = useState(false);
  const t = useTranslations("Checkout");
  const format = useFormatter();
  const sales = useSalesText();

  useEffect(() => {
    if (!getAuthToken()) {
      toast.error(t("loginFirst"));
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
              const v = Math.min(q, MAX_TICKETS, c.remaining ?? MAX_TICKETS);
              if (v > 0) { validQty[c.id] = v; total += v; break; }
            }
          }
          if (total > 0 && total <= MAX_TICKETS) {
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
    // t stabil per locale; tidak perlu memicu fetch ulang
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, router, loadNonce]);

  useEffect(() => {
    if (step !== 2 && step !== 3) return;
    const timer = setInterval(() => setTimeLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(timer);
  }, [step]);

  useEffect(() => {
    if ((step !== 2 && step !== 3) || timeLeft > 0) return;
    const timer = setTimeout(() => {
      toast.error(t("timeUp"));
      setStep(1);
      setTimeLeft(600);
    }, 50);
    return () => clearTimeout(timer);
  }, [step, timeLeft, t]);

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

  const entries = categories
    .map((c) => ({ cat: c, qty: qtyMap[c.id] ?? 0 }))
    .filter((e) => e.qty > 0);

  const totalTickets = entries.reduce((s, e) => s + e.qty, 0);
  const totalPrice = entries.reduce((s, e) => s + Number(e.cat.price) * e.qty, 0);
  const soldOutCount = categories.filter((c) => c.remaining !== undefined && c.remaining <= 0).length;
  // status dari backend; selain "open" checkout dikunci (POST /orders juga akan menolak)
  const salesBlocked = !!concert && concert.sales_status !== "open";
  const timer = `${String(Math.floor(timeLeft / 60)).padStart(2, "0")}:${String(timeLeft % 60).padStart(2, "0")}`;

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function checkSelection() {
    if (!concert || totalTickets === 0) {
      toast.error(t("pickAtLeastOne"));
      return false;
    }
    if (totalTickets > MAX_TICKETS) {
      toast.error(t("maxTickets", { max: MAX_TICKETS }));
      return false;
    }
    return true;
  }

  function goToPersonal() {
    if (salesBlocked || !checkSelection()) return;
    const u = getAuthUser<{ name?: string; email?: string }>();
    if (u?.email) setEmail((v) => v || u.email || "");
    if (u?.name) {
      const parts = u.name.trim().split(/\s+/);
      setFirstName((v) => v || parts[0] || "");
      setLastName((v) => v || parts.slice(1).join(" "));
    }
    setTimeLeft(600);
    setStep(2);
    setSummaryOpen(false);
    scrollTop();
  }

  function validatePersonal() {
    const errs: Record<string, string> = {};
    if (!firstName.trim()) errs.firstName = t("errors.firstName");
    if (!email.trim()) errs.email = t("errors.emailRequired");
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errs.email = t("errors.emailInvalid");
    const digits = phone.replace(/\D/g, "");
    if (!phone.trim()) errs.phone = t("errors.phoneRequired");
    else if (digits.length < 9) errs.phone = t("errors.phoneShort");
    if (!idNumber.trim()) errs.idNumber = t("errors.idNumber");
    const d = Number(dobDay), m = Number(dobMonth), y = Number(dobYear);
    if (!dobDay || !dobMonth || !dobYear) errs.dob = t("errors.dobRequired");
    else {
      const dt = new Date(y, m - 1, d);
      if (!d || !m || !y || dt.getDate() !== d || dt.getMonth() !== m - 1 || dt.getFullYear() !== y) errs.dob = t("errors.dobInvalid");
      else if (y < 1900 || y > new Date().getFullYear()) errs.dob = t("errors.dobYear");
    }
    if (!gender) errs.gender = t("errors.gender");
    if (!agreeTerms) errs.agreeTerms = t("errors.agreeTerms");
    if (!agreeData) errs.agreeData = t("errors.agreeData");
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function handleLanjut() {
    if (!validatePersonal()) {
      toast.error(t("errors.completeForm"));
      return;
    }
    setStep(3);
    setSummaryOpen(false);
    scrollTop();
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
    if (switching) toast(t("oneCategorySwitched"));
    setQtyMap({ [catId]: Math.min(v, MAX_TICKETS) });
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
    if (salesBlocked || !checkSelection()) return;
    // satu kategori per checkout = satu order (backend: total_price = harga x jumlah)
    const [entry] = entries;
    setSubmitting(true);
    setOrderError(null);
    try {
      const order = await apiPost<{ id: number }>("/orders", buildOrderPayload(entry.cat.id, entry.qty));
      dropStored();
      toast.success(t("created", { count: 1 }));
      router.push(`/orders/${order.id}`);
    } catch (err: unknown) {
      setOrderError({ error: err });
      setSummaryOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  // QUOTA_EXCEEDED / ORDER_EXPIRED / INVALID_QUANTITY: ambil sisa kuota terbaru lalu kembali ke pilihan tiket
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
    scrollTop();
  }

  if (loading || !concert) {
    return (
      <div className="min-h-screen bg-surface">
        <CheckoutHeader step={step} />
        <div className="mx-auto max-w-[1280px] px-4 py-12 sm:px-6">
          {loadError && !loading ? (
            <ErrorState error={loadError} onRetry={() => setLoadNonce((n) => n + 1)} />
          ) : (
            <LoadingState label={t("loading")} />
          )}
        </div>
      </div>
    );
  }

  const banner = concert.banner_url || concert.poster_url || null;
  const eventDate = new Date(concert.date);
  const eventWhen = t("eventTime", {
    date: format.dateTime(eventDate, { day: "numeric", month: "short", year: "numeric", timeZone: "Asia/Jakarta" }),
    time: format.dateTime(eventDate, { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Asia/Jakarta" }),
  });
  const inputCls = (bad?: string) =>
    cn(
      "w-full rounded-lg border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-primary focus:ring-2 focus:ring-ring/25",
      bad ? "border-destructive" : "border-input"
    );
  const labelCls = "mb-1.5 block font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground";
  const errCls = "mt-1 text-xs text-destructive";
  const req = <span className="text-destructive" aria-hidden> *</span>;
  const months = Array.from({ length: 12 }, (_, i) => format.dateTime(new Date(2000, i, 1), { month: "long" }));

  // aksi utama per langkah — dipakai ringkasan desktop & bar bawah mobile
  const primary =
    step === 1
      ? { label: t("cta.order"), onClick: goToPersonal, disabled: salesBlocked || totalTickets === 0 || submitting }
      : step === 2
        ? { label: t("cta.next"), onClick: handleLanjut, disabled: salesBlocked || submitting || !agreeTerms || !agreeData }
        : { label: submitting ? t("cta.processing") : t("cta.createOrder"), onClick: handlePesan, disabled: salesBlocked || submitting };
  const back = step === 1 ? null : () => { setStep(step === 3 ? 2 : 1); scrollTop(); };

  const summaryBody = (
    <OrderSummaryBody
      title={concert.title}
      when={eventWhen}
      venue={concert.venue}
      entries={entries}
      totalTickets={totalTickets}
      totalPrice={totalPrice}
      detailed={step === 3}
    />
  );

  return (
    <div className="min-h-screen bg-surface">
      <CheckoutHeader step={step} />

      <main className="mx-auto max-w-[1280px] px-4 pb-40 pt-4 sm:px-6 lg:pb-12">
        {/* Banner + judul */}
        <div className="overflow-hidden rounded-xl border border-border bg-background">
          <div className="relative h-[120px] w-full overflow-hidden sm:h-[180px]">
            <EventPoster src={banner} title={concert.title} size="lg" loading="eager" className="h-full w-full object-cover object-center" />
          </div>
        </div>
        <h1 className="mt-4 font-display text-xl font-bold tracking-tight text-foreground sm:text-2xl">{concert.title}</h1>
        <p className="mt-1 font-mono text-xs text-muted-foreground">
          {eventWhen} · {concert.venue}
        </p>

        {salesBlocked && concert.sales_status !== "open" && (
          <div role="alert" className="mt-4 flex items-start gap-2.5 rounded-xl border border-destructive/30 bg-destructive/5 px-3.5 py-3">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-sm font-semibold leading-relaxed text-destructive">
              {sales.notOpen(concert.sales_status, concert.sales_start_at)}
            </p>
          </div>
        )}

        {/* Column grid (DESIGN §4): form 8 kolom + ringkasan sticky 4 kolom */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-12">
          <div className="min-w-0 space-y-4 lg:col-span-8">
            {(step === 2 || step === 3) && (
              <div
                role="timer"
                aria-label={t("timerLabel")}
                className="flex items-center justify-between gap-3 rounded-xl bg-info-subtle px-4 py-2.5 text-sm text-foreground"
              >
                <span className="font-medium">{t("timerLabel")}</span>
                <span className={cn("font-mono text-base font-bold", timeLeft < 60 ? "text-destructive" : "text-info")}>{timer}</span>
              </div>
            )}

            {step === 1 && (
              <>
                {concert.seatmap?.images?.length ? (
                  <div className="overflow-hidden rounded-xl border border-border bg-background p-4 sm:p-5">
                    <ConcertSeatmap seatmap={concert.seatmap} />
                  </div>
                ) : null}

                <section className="rounded-xl border border-border bg-background p-4 sm:p-6">
                  <h2 className="font-display text-lg font-bold text-foreground">{t("categoriesTitle")}</h2>
                  <p className="mt-1 text-xs text-muted-foreground">{t("oneCategoryHint")}</p>

                  {soldOutCount > 0 && (
                    <div className="mt-3 flex items-start gap-2.5 rounded-xl border border-warning/30 bg-warning/5 px-3.5 py-3">
                      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-warning" />
                      <p className="text-xs leading-relaxed text-warning">{t("soldOutWarning", { count: soldOutCount })}</p>
                    </div>
                  )}

                  {categories.length === 0 ? (
                    <p className="mt-4 rounded-xl border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                      {t("noCategories")}
                    </p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {categories.map((cat) => {
                        const price = Number(cat.price);
                        const soldOut = cat.remaining !== undefined && cat.remaining <= 0;
                        const qty = qtyMap[cat.id] ?? 0;
                        return (
                          <div
                            key={cat.id}
                            className={cn(
                              "relative overflow-hidden rounded-xl border bg-background",
                              soldOut ? "border-destructive/30" : qty > 0 ? "border-primary" : "border-border"
                            )}
                          >
                            {soldOut && <div className="absolute inset-x-0 top-0 h-1 bg-destructive" />}
                            <div className="px-4 py-3.5 sm:px-5">
                              <p className={cn("flex items-center gap-1.5 text-sm font-bold", soldOut ? "text-muted-foreground/70" : "text-foreground")}>
                                {soldOut && <AlertTriangle className="h-3.5 w-3.5 shrink-0 text-destructive" />}
                                {cat.name}
                              </p>
                              <p className="mt-1 text-xs leading-snug text-muted-foreground">{t("priceNote")}</p>
                              {soldOut && (
                                <p className="mt-2 text-[11px] font-semibold text-destructive">{t("soldOutCategory")}</p>
                              )}
                            </div>
                            <div
                              className={cn(
                                "flex items-center justify-between gap-3 border-t border-dashed px-4 py-3 sm:px-5",
                                soldOut ? "border-destructive/30 bg-destructive/5" : "border-border bg-surface"
                              )}
                            >
                              <span className={cn("font-mono text-sm font-bold", soldOut ? "text-muted-foreground/70 line-through" : "text-foreground")}>
                                {formatIDR(price)}
                              </span>
                              {soldOut ? (
                                <span className="inline-flex items-center rounded-full bg-destructive/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-destructive">
                                  {t("soldOutBadge")}
                                </span>
                              ) : (
                                <div className="relative">
                                  <select
                                    value={qty}
                                    disabled={salesBlocked}
                                    aria-label={t("quantityFor", { name: cat.name })}
                                    onChange={(e) => setQty(cat.id, Number(e.target.value))}
                                    className="min-w-[72px] appearance-none rounded-lg border border-input bg-background px-3 py-1.5 pr-7 text-center font-mono text-sm font-semibold text-foreground outline-none focus:border-primary disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground"
                                  >
                                    {Array.from({ length: MAX_TICKETS + 1 }, (_, n) => (
                                      <option key={n} value={n}>{n}</option>
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
                  )}
                </section>
              </>
            )}

            {step === 2 && (
              <section className="rounded-xl border border-border bg-background p-4 sm:p-6">
                <h2 className="font-display text-lg font-bold text-foreground">{t("form.title")}</h2>
                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="co-first" className={labelCls}>{t("form.firstName")}{req}</label>
                    <input id="co-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls(formErrors.firstName)} placeholder={t("form.firstNamePlaceholder")} autoComplete="given-name" />
                    {formErrors.firstName && <p className={errCls}>{formErrors.firstName}</p>}
                  </div>
                  <div>
                    <label htmlFor="co-last" className={labelCls}>{t("form.lastName")}</label>
                    <input id="co-last" value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls()} placeholder={t("form.lastNamePlaceholder")} autoComplete="family-name" />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="co-email" className={labelCls}>{t("form.email")}{req}</label>
                    <input id="co-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls(formErrors.email)} placeholder={t("form.emailPlaceholder")} autoComplete="email" />
                    {formErrors.email && <p className={errCls}>{formErrors.email}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="co-phone" className={labelCls}>{t("form.phone")}{req}</label>
                    <div className="flex gap-2">
                      <span className="flex shrink-0 items-center rounded-lg border border-input bg-surface px-3 font-mono text-sm font-semibold text-foreground/85">+62</span>
                      <input id="co-phone" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls(formErrors.phone)} placeholder="81223333444" autoComplete="tel-national" />
                    </div>
                    {formErrors.phone && <p className={errCls}>{formErrors.phone}</p>}
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="co-id" className={labelCls}>{t("form.idNumber")}{req}</label>
                    <input id="co-id" value={idNumber} onChange={(e) => setIdNumber(e.target.value)} className={inputCls(formErrors.idNumber)} placeholder={t("form.idNumberPlaceholder")} />
                    {formErrors.idNumber && <p className={errCls}>{formErrors.idNumber}</p>}
                  </div>
                  <fieldset className="sm:col-span-2">
                    <legend className={labelCls}>{t("form.dob")}{req}</legend>
                    <div className="flex gap-2">
                      <input inputMode="numeric" maxLength={2} aria-label={t("form.dobDay")} value={dobDay} onChange={(e) => setDobDay(e.target.value.replace(/\D/g, ""))} className={cn(inputCls(formErrors.dob), "w-16 min-w-0 shrink-0 text-center font-mono")} placeholder={t("form.dobDayPlaceholder")} />
                      <div className="relative min-w-0 flex-1">
                        <select
                          value={dobMonth}
                          aria-label={t("form.dobMonth")}
                          onChange={(e) => setDobMonth(e.target.value)}
                          className={cn(inputCls(formErrors.dob), "appearance-none pr-8", !dobMonth && "text-muted-foreground/70")}
                        >
                          <option value="" disabled>{t("form.dobMonthPlaceholder")}</option>
                          {months.map((m, i) => (
                            <option key={i} value={i + 1}>{m}</option>
                          ))}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground/70" />
                      </div>
                      <input inputMode="numeric" maxLength={4} aria-label={t("form.dobYear")} value={dobYear} onChange={(e) => setDobYear(e.target.value.replace(/\D/g, ""))} className={cn(inputCls(formErrors.dob), "w-20 min-w-0 shrink-0 text-center font-mono sm:w-24")} placeholder={t("form.dobYearPlaceholder")} />
                    </div>
                    {formErrors.dob && <p className={errCls}>{formErrors.dob}</p>}
                  </fieldset>
                  <fieldset>
                    <legend className={labelCls}>{t("form.gender")}{req}</legend>
                    <div className="space-y-2">
                      {(["L", "P"] as const).map((g) => (
                        <label key={g} className="flex cursor-pointer items-center gap-2 text-sm text-foreground/85">
                          <input type="radio" name="gender" checked={gender === g} onChange={() => setGender(g)} className="h-4 w-4 accent-primary" />
                          {g === "L" ? t("form.male") : t("form.female")}
                        </label>
                      ))}
                    </div>
                    {formErrors.gender && <p className={errCls}>{formErrors.gender}</p>}
                  </fieldset>
                  <fieldset>
                    <legend className="text-xs font-semibold leading-relaxed text-foreground/85">{t("form.waConsent")}</legend>
                    <div className="mt-2 space-y-2">
                      {(["Ya", "Tidak"] as const).map((v) => (
                        <label key={v} className="flex cursor-pointer items-center gap-2 text-sm text-foreground/85">
                          <input type="radio" name="wa" checked={waConsent === v} onChange={() => setWaConsent(v)} className="h-4 w-4 accent-primary" />
                          {v === "Ya" ? t("form.yes") : t("form.no")}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <div className="space-y-3 sm:col-span-2">
                    <Agreement checked={agreeTerms} onChange={setAgreeTerms} error={formErrors.agreeTerms}>
                      {t.rich("form.agreeTerms", { link: (c) => <span className="font-semibold text-primary">{c}</span> })}
                    </Agreement>
                    <Agreement checked={agreeData} onChange={setAgreeData} error={formErrors.agreeData}>
                      {t.rich("form.agreeData", { link: (c) => <span className="font-semibold text-primary">{c}</span> })}
                    </Agreement>
                  </div>
                </div>
              </section>
            )}

            {step === 3 && (
              <section className="space-y-4 rounded-xl border border-border bg-background p-4 sm:p-6">
                <h2 className="font-display text-lg font-bold text-foreground">{t("confirm.title")}</h2>
                <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
                  <div className="min-w-0">
                    <dt className={labelCls}>{t("confirm.name")}</dt>
                    <dd className="truncate text-foreground">{`${firstName} ${lastName}`.trim()}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className={labelCls}>{t("form.email")}</dt>
                    <dd className="truncate text-foreground">{email}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className={labelCls}>{t("form.phone")}</dt>
                    <dd className="font-mono text-foreground">+62 {phone}</dd>
                  </div>
                  <div className="min-w-0">
                    <dt className={labelCls}>{t("form.idNumber")}</dt>
                    <dd className="truncate font-mono text-foreground">{idNumber}</dd>
                  </div>
                </dl>
                <div className="flex items-start gap-2.5 rounded-lg border border-border bg-surface px-4 py-3">
                  <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <p className="text-sm leading-relaxed text-foreground/85">{MIDTRANS_ENABLED ? t("paymentNotice") : t("paymentNoticeManual")}</p>
                </div>
                {orderError && (
                  <OrderErrorAlert value={orderError} concertId={id} onRetry={handlePesan} onReselect={handleReselect} />
                )}
              </section>
            )}
          </div>

          {/* Ringkasan order — sticky di desktop */}
          <aside className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-[72px] rounded-xl border border-border bg-background p-5">
              <h2 className="font-mono text-[11px] font-medium uppercase tracking-widest text-muted-foreground">{t("summary.title")}</h2>
              <div className="mt-3">{summaryBody}</div>
              <SummaryActions primary={primary} back={back} />
              {step === 1 && <p className="mt-2 text-center text-[11px] leading-snug text-muted-foreground">{t("termsHint")}</p>}
            </div>
          </aside>
        </div>
      </main>

      {/* Mobile: ringkasan jadi bar bawah yang bisa dibuka */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background pb-[env(safe-area-inset-bottom)] lg:hidden">
        {summaryOpen && (
          <div id="co-summary" className="max-h-[55vh] overflow-y-auto border-b border-border px-4 py-4">
            {summaryBody}
          </div>
        )}
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            type="button"
            onClick={() => setSummaryOpen((v) => !v)}
            aria-expanded={summaryOpen}
            aria-controls="co-summary"
            className="flex min-w-0 flex-1 items-center gap-2 text-left"
          >
            <div className="min-w-0">
              <p className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                {t("summary.total", { count: totalTickets })}
              </p>
              <p className="truncate font-mono text-lg font-bold leading-tight text-foreground">{formatIDR(totalPrice)}</p>
            </div>
            <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200", !summaryOpen && "rotate-180")} />
            <span className="sr-only">{summaryOpen ? t("summary.hide") : t("summary.show")}</span>
          </button>
          {back && (
            <button
              type="button"
              onClick={back}
              aria-label={t("cta.back")}
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-border text-foreground/85"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
          )}
          <button
            type="button"
            onClick={primary.onClick}
            disabled={primary.disabled}
            className="h-11 shrink-0 rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-muted-foreground/70"
          >
            {primary.label}
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function Agreement({
  checked,
  onChange,
  error,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="flex cursor-pointer items-start gap-2 text-xs leading-relaxed text-foreground/85">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-primary" />
        <span>{children}</span>
      </label>
      {error && <p className="mt-1 text-xs text-destructive">{error}</p>}
    </div>
  );
}

function OrderSummaryBody({
  title,
  when,
  venue,
  entries,
  totalTickets,
  totalPrice,
  detailed,
}: {
  title: string;
  when: string;
  venue: string;
  entries: { cat: TicketCategory; qty: number }[];
  totalTickets: number;
  totalPrice: number;
  detailed: boolean;
}) {
  const t = useTranslations("Checkout.summary");
  return (
    <div>
      <p className="text-sm font-bold leading-snug text-foreground">{title}</p>
      <p className="mt-1 font-mono text-[11px] text-muted-foreground">{when}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{venue}</p>
      <div className="my-3 h-px bg-border" />
      {entries.length === 0 ? (
        <div className="flex items-start gap-2.5">
          <Ticket className="h-5 w-5 shrink-0 text-primary" />
          <p className="text-sm leading-snug text-muted-foreground">{t("empty")}</p>
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {entries.map(({ cat, qty }) => (
            <li key={cat.id} className="flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0">
              <Ticket className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold leading-tight text-foreground">{cat.name}</p>
                <p className="mt-0.5 font-mono text-xs text-muted-foreground">
                  {t("line", { qty, price: formatIDR(Number(cat.price)) })}
                </p>
              </div>
              {detailed && <span className="font-mono text-xs font-semibold text-foreground">{formatIDR(Number(cat.price) * qty)}</span>}
            </li>
          ))}
        </ul>
      )}
      <div className="my-3 border-t border-dashed border-border" />
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs text-muted-foreground">{t("total", { count: totalTickets })}</span>
        <span className="font-mono text-base font-bold text-foreground">{formatIDR(totalPrice)}</span>
      </div>
    </div>
  );
}

function SummaryActions({
  primary,
  back,
}: {
  primary: { label: string; onClick: () => void; disabled: boolean };
  back: (() => void) | null;
}) {
  const t = useTranslations("Checkout.cta");
  return (
    <div className="mt-4 flex gap-2">
      {back && (
        <button
          type="button"
          onClick={back}
          className="rounded-lg border border-border bg-background px-4 text-sm font-semibold text-foreground/85 transition hover:bg-surface"
        >
          {t("back")}
        </button>
      )}
      <button
        type="button"
        onClick={primary.onClick}
        disabled={primary.disabled}
        className="flex-1 rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-muted-foreground/70 disabled:hover:brightness-100"
      >
        {primary.label}
      </button>
    </div>
  );
}
