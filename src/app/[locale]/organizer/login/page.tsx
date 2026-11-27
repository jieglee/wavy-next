"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, Ban, Clock, Eye, EyeOff, XCircle } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter, Link } from "@/i18n/navigation";
import { apiPost, ApiError, setAuthToken } from "@/lib/api";
import { LoginRoleSwitch } from "@/components/auth/login-role-switch";
import { WavyIcon } from "@/components/landing/wavy-icon";
import { WavyIconAnimated } from "@/components/landing/wavy-icon-animated";

type AccountState = { kind: "pending" | "rejected" | "suspended"; reason?: string };

// 403 dari POST /auth/organizer/login membawa code per status akun (backend: auth.service)
function accountStateOf(err: unknown): AccountState | null {
  if (!(err instanceof ApiError) || err.status !== 403) return null;
  if (err.code === "ORGANIZER_PENDING") return { kind: "pending" };
  if (err.code === "ORGANIZER_SUSPENDED") return { kind: "suspended" };
  if (err.code === "ORGANIZER_REJECTED")
    return { kind: "rejected", reason: typeof err.details.reason === "string" ? err.details.reason : undefined };
  return null;
}

interface LoginResult {
  access_token: string;
  organizer: { id: number; name: string; email: string };
}

export default function OrganizerLoginPage() {
  return (
    <Suspense>
      <OrganizerLoginForm />
    </Suspense>
  );
}

function OrganizerLoginForm() {
  const router = useRouter();
  const reason = useSearchParams().get("reason");
  const tStudio = useTranslations("Studio.session");
  const [account, setAccount] = useState<AccountState | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [showBrandName, setShowBrandName] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowBrandName(true), 500);
    return () => clearTimeout(timer);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setAccount(null);
    setLoading(true);
    try {
      const res = await apiPost<LoginResult>("/auth/organizer/login", { email, password });
      setAuthToken(res.access_token, "organizer", res.organizer);
      toast.success(`Selamat datang, ${res.organizer.name}!`);
      router.push("/organizer/dashboard");
    } catch (err) {
      const state = accountStateOf(err);
      if (state) {
        setAccount(state);
        return;
      }
      const message =
        err instanceof ApiError ? err.message : "Terjadi kesalahan. Coba lagi nanti.";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full">
      {/* Panel kiri: full-bleed, background foto — konsisten dengan login customer */}
      <div
        className="relative hidden w-[55%] items-center justify-center overflow-hidden md:flex"
        style={{ backgroundImage: "url(/images/login-otp.png)", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <motion.div layout className="relative z-10 flex items-center gap-3">
          <motion.div layout transition={{ duration: 0.6, ease: "easeOut" }}>
            <WavyIconAnimated
              size={48}
              color="var(--primary-foreground)"
              drawDuration={1.1}
              onFirstDrawComplete={() => setShowBrandName(true)}
            />
          </motion.div>
          <AnimatePresence>
            {showBrandName && (
              <motion.span
                key="brand-name"
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="font-display text-4xl font-bold tracking-tight text-white drop-shadow-lg"
              >
                Wavy
              </motion.span>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Panel kanan: form */}
      <div className="flex w-full flex-col bg-background px-8 sm:px-16 md:w-[45%] md:px-20">
        <div className="pt-6">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Kembali
          </button>
        </div>

        <div className="flex flex-1 items-center">
          <div className="w-full max-w-sm pb-10">
            <div className="mb-8 flex items-center gap-2 md:hidden">
              <WavyIcon size={24} />
              <span className="font-display text-lg font-bold tracking-tight text-foreground">Wavy</span>
            </div>

            <div className="mb-6 flex items-center gap-2">
              <WavyIcon size={28} />
              <span className="font-display text-xl font-bold tracking-tight text-foreground">Wavy</span>
            </div>
            <LoginRoleSwitch current="organizer" className="mb-6" />
            <span className="mb-3 inline-block rounded-full border border-border px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Portal Mitra Penyelenggara
            </span>
            <h1 className="font-display text-2xl font-bold text-foreground">
              Masuk Portal Organizer
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Gunakan kredensial Event Organizer terdaftar Anda.
            </p>

            <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Email Organizer</label>
                <input
                  type="email"
                  autoFocus
                  required
                  placeholder="organizer@test.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                    setAccount(null);
                  }}
                  className="w-full rounded-lg bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Kata Sandi</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError("");
                    }}
                    className="w-full rounded-lg bg-muted px-4 py-3 pr-11 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Sembunyikan kata sandi" : "Tampilkan kata sandi"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {account && <AccountNotice state={account} />}
              {!error && !account && (reason === "suspended" || reason === "expired") && (
                <p role="alert" className="rounded-lg bg-destructive/10 px-3 py-2 text-xs leading-relaxed text-destructive">
                  {tStudio(reason)}
                </p>
              )}
              {error && (
                <p role="alert" className="text-xs text-destructive">
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3.5 text-sm font-semibold text-primary-foreground transition-colors hover:brightness-110 disabled:opacity-40 disabled:hover:brightness-100"
              >
                <ArrowRight className="h-4 w-4" />
                {loading ? "Memverifikasi..." : "Masuk ke Dashboard"}
              </button>
            </form>

            <p className="mt-6 text-sm text-muted-foreground">
              Belum menjadi mitra?{" "}
              <Link href="/organizer/register" className="font-semibold text-primary hover:underline">
                Ajukan Kerja Sama
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const NOTICE = {
  pending: { icon: Clock, tone: "border-warning/30 bg-warning/5 text-warning" },
  rejected: { icon: XCircle, tone: "border-destructive/30 bg-destructive/5 text-destructive" },
  suspended: { icon: Ban, tone: "border-destructive/30 bg-destructive/5 text-destructive" },
} as const;

/** Penjelasan status akun EO yang belum bisa masuk (menunggu verifikasi / ditolak / ditangguhkan). */
function AccountNotice({ state }: { state: AccountState }) {
  const t = useTranslations("OrganizerLogin");
  const { icon: Icon, tone } = NOTICE[state.kind];
  return (
    <div role="alert" className={`flex gap-3 rounded-lg border p-3 ${tone}`}>
      <Icon className="mt-0.5 h-4 w-4 shrink-0" />
      <div className="min-w-0 space-y-1.5 text-xs leading-relaxed">
        <p className="font-semibold">{t(`${state.kind}Title`)}</p>
        <p className="text-foreground/80">{t(`${state.kind}Body`)}</p>
        {state.kind === "rejected" && state.reason && (
          <div className="rounded-md bg-background/70 p-2 text-foreground">
            <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{t("reasonLabel")}</p>
            <p className="mt-0.5 whitespace-pre-line break-words">{state.reason}</p>
          </div>
        )}
        {state.kind === "rejected" && (
          <Link href="/organizer/register" className="inline-block font-semibold underline underline-offset-2">
            {t("reapply")}
          </Link>
        )}
      </div>
    </div>
  );
}
