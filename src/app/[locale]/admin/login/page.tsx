"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, ArrowRight, Eye, EyeOff } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { WavyIcon } from "@/components/landing/wavy-icon";
import { LocaleToggle } from "@/components/i18n/locale-switcher";
import { WavyIconAnimated } from "@/components/landing/wavy-icon-animated";
import { ApiError, apiPost } from "@/lib/api";
import { setAdminSession } from "@/lib/admin-session";
import { useErrorMessage } from "@/lib/error-message";

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  );
}

const inputCls =
  "w-full rounded-lg bg-muted px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none focus:ring-2 focus:ring-primary";

function AdminLoginForm() {
  const t = useTranslations("Admin.login");
  const router = useRouter();
  const expired = useSearchParams().get("reason") === "expired";
  const errorMessage = useErrorMessage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBrandName, setShowBrandName] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowBrandName(true), 500);
    return () => clearTimeout(timer);
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await apiPost<{ access_token: string; admin: { id: number; name: string; email: string } }>("/admin/login", {
        email,
        password,
      });
      setAdminSession(res.access_token, res.admin);
      router.replace("/admin/dashboard");
    } catch (err) {
      setError(err instanceof ApiError && err.status === 401 ? t("invalid") : errorMessage(err));
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
        <div className="flex items-center justify-between gap-3 pt-6">
          <button
            type="button"
            onClick={() => router.push("/")}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("backHome")}
          </button>
          <LocaleToggle />
        </div>

        <div className="flex flex-1 items-center">
          <div className="w-full max-w-sm pb-10">
            <div className="mb-6 flex items-center gap-2">
              <WavyIcon size={28} />
              <span className="font-display text-xl font-bold tracking-tight text-foreground">Wavy</span>
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">{t("title")}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>

            <form onSubmit={handleLogin} className="mt-8 flex flex-col gap-4">
              <div>
                <label htmlFor="admin-email" className="mb-1.5 block text-sm font-medium text-foreground">
                  {t("email")}
                </label>
                <input
                  id="admin-email"
                  type="email"
                  autoFocus
                  required
                  autoComplete="username"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(null);
                  }}
                  className={inputCls}
                />
              </div>

              <div>
                <label htmlFor="admin-password" className="mb-1.5 block text-sm font-medium text-foreground">
                  {t("password")}
                </label>
                <div className="relative">
                  <input
                    id="admin-password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="&bull;&bull;&bull;&bull;&bull;&bull;&bull;&bull;"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    className={`${inputCls} pr-11`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={t(showPassword ? "hidePassword" : "showPassword")}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {expired && !error && (
                <p role="status" className="rounded-lg bg-warning/10 px-3 py-2 text-xs leading-relaxed text-warning">
                  {t("expired")}
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
                {loading ? t("submitting") : t("submit")}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
