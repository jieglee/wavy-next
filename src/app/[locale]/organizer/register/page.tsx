"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, CheckCircle2, Mail, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter, Link } from "@/i18n/navigation";
import { apiPost, ApiError } from "@/lib/api";
import { WavyIcon } from "@/components/landing/wavy-icon";

const EVENT_TYPES = ["Pop", "Rock", "K-Pop", "Indie", "Jazz", "Festival", "EDM", "Fan Meeting"];
const WA_NUMBER = "6287839615005";
const PARTNERSHIP_EMAIL = "kalsahalkautsar@gmail.com";

type Step = "account" | "profile" | "done";

function ContactLine() {
  return (
    <p className="text-xs text-wavy-text-secondary">
      Butuh bantuan?{" "}
      <a
        href={`https://wa.me/${WA_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-0.5 font-semibold text-green-400 hover:underline"
      >
        <MessageCircle className="h-3 w-3" />
        WhatsApp
      </a>{" "}
      ·{" "}
      <a
        href={`mailto:${PARTNERSHIP_EMAIL}?subject=Pengajuan%20Kerja%20Sama%20Event%20Organizer`}
        className="inline-flex items-center gap-0.5 font-semibold text-black opacity-80 hover:underline"
      >
        <Mail className="h-3 w-3" />
        Email
      </a>
    </p>
  );
}

function ContactCard() {
  return (
    <div className="rounded-xl border border-wavy-border bg-wavy-surface p-4">
      <p className="text-xs font-semibold text-wavy-text-primary">Ada pertanyaan soal pengajuan Anda?</p>
      <div className="mt-3 flex gap-2">
        <a
          href={`https://wa.me/${WA_NUMBER}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-green-400 py-2 text-xs font-semibold text-white transition-colors hover:brightness-110"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          WhatsApp
        </a>
        <a
          href={`mailto:${PARTNERSHIP_EMAIL}?subject=Pengajuan%20Kerja%20Sama%20Event%20Organizer`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-wavy-border bg-transparent py-2 text-xs font-semibold text-wavy-text-primary transition-colors hover:bg-white"
        >
          <Mail className="h-3.5 w-3.5" />
          Email
        </a>
      </div>
    </div>
  );
}

export default function OrganizerRegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("account");

  const [organizerName, setOrganizerName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const [eventTypes, setEventTypes] = useState<string[]>([]);
  const [socialLink, setSocialLink] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function toggleEventType(type: string) {
    setEventTypes((prev) => (prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]));
  }

  function handleAccountNext(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (organizerName.trim().length < 2) return setError("Nama Event Organizer minimal 2 karakter.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Format email tidak valid.");
    if (password.length < 8) return setError("Kata sandi minimal 8 karakter.");
    if (password !== confirmPassword) return setError("Konfirmasi kata sandi tidak cocok.");
    if (!/^[0-9+\-\s]{8,}$/.test(whatsapp)) return setError("Nomor WhatsApp tidak valid.");
    setStep("profile");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (eventTypes.length === 0) return setError("Pilih minimal satu jenis event yang dikelola.");
    setLoading(true);
    try {
      await apiPost("/auth/organizer/register", {
        organizer_name: organizerName.trim(),
        email,
        password,
        whatsapp,
        event_types: eventTypes.join(", "),
        social_link: socialLink || undefined,
      });
      toast.success("Pengajuan kerja sama terkirim!");
      setStep("done");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Terjadi kesalahan. Coba lagi nanti.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass =
    "w-full rounded-lg bg-wavy-surface px-4 py-2.5 text-sm text-wavy-text-primary placeholder:text-wavy-text-secondary/60 outline-none focus:ring-2 focus:ring-wavy-accent";
  const labelClass = "mb-1 block text-xs font-medium text-wavy-text-primary";

  return (
    <div className="flex min-h-screen w-full">
      {/* Panel kiri: konsisten dengan login */}
      <div
        className="relative hidden w-[55%] items-center justify-center overflow-hidden md:flex"
        style={{ backgroundImage: "url(/images/login-otp.png)", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <motion.div layout transition={{ duration: 0.6, ease: "easeOut" }} className="relative z-10 flex items-center gap-3">
          <WavyIcon size={48} className="text-white" />
          <span className="font-display text-4xl font-bold tracking-tight text-white drop-shadow-lg">Wavy</span>
        </motion.div>
      </div>

      {/* Panel kanan: form */}
      <div className="flex w-full flex-col bg-wavy-bg px-8 sm:px-12 md:w-[45%] md:px-14">
        <div className="flex items-center justify-between pt-5">
          {step === "profile" ? (
            <button
              type="button"
              onClick={() => setStep("account")}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-wavy-text-secondary hover:text-wavy-text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali
            </button>
          ) : (
            <button
              type="button"
              onClick={() => router.push("/organizer/login")}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-wavy-text-secondary hover:text-wavy-text-primary"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke Login
            </button>
          )}
          {step !== "done" && (
            <span className="text-[11px] font-semibold uppercase tracking-wider text-wavy-text-secondary">
              Langkah {step === "account" ? 1 : 2} dari 2
            </span>
          )}
        </div>

        <div className="flex flex-1 items-center py-6">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              {step === "done" ? (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <CheckCircle2 className="h-10 w-10 text-wavy-accent" />
                  <h1 className="mt-3 font-display text-xl font-bold text-wavy-text-primary">
                    Pengajuan Terkirim!
                  </h1>
                  <p className="mt-2 text-sm leading-relaxed text-wavy-text-secondary">
                    Terima kasih, <span className="font-semibold text-wavy-text-primary">{organizerName}</span>.
                    Akun Anda berstatus <span className="font-semibold text-wavy-accent">Menunggu Verifikasi</span>.
                    Tim kurasi kami akan menghubungi melalui WhatsApp{" "}
                    <span className="font-semibold text-wavy-text-primary">{whatsapp}</span> atau email{" "}
                    <span className="font-semibold text-wavy-text-primary">{email}</span>.
                  </p>
                  <div className="mt-4 space-y-3">
                    <ContactCard />
                    <button
                      type="button"
                      onClick={() => router.push("/organizer/login")}
                      className="flex w-full items-center justify-center gap-2 rounded-lg bg-wavy-accent py-3 text-sm font-semibold text-wavy-bg transition-colors hover:brightness-110"
                    >
                      <ArrowRight className="h-4 w-4" />
                      Ke Halaman Login
                    </button>
                  </div>
                </motion.div>
              ) : step === "account" ? (
                <motion.div
                  key="account"
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  transition={{ duration: 0.25 }}
                >
                  <h1 className="font-display text-xl font-bold text-wavy-text-primary">
                    Ajukan Kerja Sama
                  </h1>
                  <p className="mt-1 text-xs text-wavy-text-secondary">
                    Data akun dan kontak organizer Anda.
                  </p>

                  <form onSubmit={handleAccountNext} className="mt-5 grid grid-cols-2 gap-x-3 gap-y-3">
                    <div className="col-span-2">
                      <label className={labelClass}>Nama Event Organizer</label>
                      <input
                        type="text"
                        autoFocus
                        placeholder="cth: PK Entertainment"
                        value={organizerName}
                        onChange={(e) => setOrganizerName(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Email</label>
                      <input
                        type="email"
                        placeholder="halo@eokamu.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>No. WhatsApp PIC</label>
                      <input
                        type="tel"
                        placeholder="081234567890"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Kata Sandi</label>
                      <input
                        type="password"
                        placeholder="Min. 8 karakter"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputClass}
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Konfirmasi Kata Sandi</label>
                      <input
                        type="password"
                        placeholder="Ulangi kata sandi"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    {error && (
                      <p className="col-span-2 text-xs text-red-400">{error}</p>
                    )}

                    <button
                      type="submit"
                      disabled={loading}
                      className="col-span-2 mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-wavy-accent py-3 text-sm font-semibold text-wavy-bg transition-colors hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100"
                    >
                      Lanjut
                      <ArrowRight className="h-4 w-4" />
                    </button>

                    <div className="col-span-2 flex items-center justify-between">
                      <ContactLine />
                      <p className="text-xs text-wavy-text-secondary">
                        Sudah punya akun?{" "}
                        <Link href="/organizer/login" className="font-semibold text-wavy-accent hover:underline">
                          Masuk
                        </Link>
                      </p>
                    </div>
                  </form>
                </motion.div>
              ) : (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.25 }}
                >
                  <h1 className="font-display text-xl font-bold text-wavy-text-primary">
                    Profil Penyelenggara
                  </h1>
                  <p className="mt-1 text-xs text-wavy-text-secondary">
                    Jenis event yang biasa Anda kelola.
                  </p>

                  <form onSubmit={handleSubmit} className="mt-5 flex flex-col gap-3">
                    <div>
                      <label className={labelClass}>Jenis Event yang Dikelola</label>
                      <div className="flex flex-wrap gap-2">
                        {EVENT_TYPES.map((type) => {
                          const active = eventTypes.includes(type);
                          return (
                            <button
                              key={type}
                              type="button"
                              onClick={() => toggleEventType(type)}
                              className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
                                active
                                  ? "border-wavy-accent bg-wavy-accent text-wavy-bg"
                                  : "border-wavy-border bg-transparent text-wavy-text-secondary hover:border-wavy-accent hover:text-wavy-text-primary"
                              }`}
                            >
                              {type}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label className={labelClass}>
                        Link Sosmed / Portofolio <span className="font-normal text-wavy-text-secondary">(opsional)</span>
                      </label>
                      <input
                        type="url"
                        placeholder="https://instagram.com/eokamu"
                        value={socialLink}
                        onChange={(e) => setSocialLink(e.target.value)}
                        className={inputClass}
                      />
                    </div>

                    {error && <p className="text-xs text-red-400">{error}</p>}

                    <button
                      type="submit"
                      disabled={loading}
                      className="mt-1 flex w-full items-center justify-center gap-2 rounded-lg bg-wavy-accent py-3 text-sm font-semibold text-wavy-bg transition-colors hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100"
                    >
                      {loading ? "Mengirim..." : "Kirim Pengajuan"}
                      {!loading && <ArrowRight className="h-4 w-4" />}
                    </button>

                    <ContactLine />
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
