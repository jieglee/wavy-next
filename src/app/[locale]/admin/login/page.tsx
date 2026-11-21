"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, Shield } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { WavyIcon } from "@/components/landing/wavy-icon";
import { ApiError, apiPost } from "@/lib/api";
import { setAdminSession } from "@/lib/admin-session";
import { useErrorMessage } from "@/lib/error-message";
import { inputCls, labelCls } from "@/components/studio/studio-ui";

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginForm />
    </Suspense>
  );
}

function AdminLoginForm() {
  const t = useTranslations("Admin.login");
  const router = useRouter();
  const expired = useSearchParams().get("reason") === "expired";
  const errorMessage = useErrorMessage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    <div className="flex min-h-dvh items-center justify-center bg-surface px-4 py-12">
      <div className="w-full max-w-sm space-y-6 rounded-xl border border-border bg-background p-6 sm:p-8">
        <div className="space-y-2 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <WavyIcon size={28} />
            <span className="font-display text-xl font-bold tracking-tight text-foreground">Wavy</span>
          </Link>
          <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Shield className="h-5 w-5" />
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-foreground">{t("title")}</h1>
          <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>

        {expired && !error && (
          <p role="status" className="rounded-lg border border-warning/30 bg-warning/5 p-3 text-xs text-warning">
            {t("expired")}
          </p>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="admin-email" className={labelCls}>{t("email")}</label>
            <input id="admin-email" type="email" required autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} />
          </div>
          <div>
            <label htmlFor="admin-password" className={labelCls}>{t("password")}</label>
            <input id="admin-password" type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} className={inputCls} />
          </div>
          {error && (
            <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-primary py-2.5 text-sm font-bold text-primary-foreground transition hover:brightness-110 disabled:opacity-50"
          >
            {loading ? t("submitting") : t("submit")}
          </button>
        </form>

        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            {t("backHome")}
          </Link>
        </div>
      </div>
    </div>
  );
}
