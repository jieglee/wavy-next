"use client";

import type { ReactNode } from "react";
import { AlertCircle, Inbox, RefreshCw } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import { isUnauthorized, useErrorMessage } from "@/lib/error-message";
import type { ApiResource } from "@/hooks/use-api-resource";

// State standar untuk data dari API: loading, kosong, error.
// Dipakai semua halaman yang fetch data — tidak boleh ada fallback ke data mock.

export function LoadingState({
  label,
  rows = 0,
  className,
}: {
  label?: string;
  /** > 0: tampilkan skeleton sejumlah baris, bukan spinner */
  rows?: number;
  className?: string;
}) {
  const t = useTranslations("States");
  const text = label ?? t("loading");
  if (rows > 0) {
    return (
      <div role="status" aria-live="polite" aria-label={text} className={cn("space-y-3", className)}>
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-2xl bg-muted" />
        ))}
        <span className="sr-only">{text}</span>
      </div>
    );
  }
  return (
    <div role="status" aria-live="polite" className={cn("flex flex-col items-center py-12 text-center", className)}>
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="mt-3 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

export function EmptyState({
  title,
  description,
  icon,
  action,
  className,
}: {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-background px-4 py-12 text-center",
        className
      )}
    >
      <div className="text-muted-foreground">{icon ?? <Inbox className="h-10 w-10" />}</div>
      <h3 className="mt-3 text-base font-bold text-foreground">{title}</h3>
      {description && <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/**
 * Render data dari useApiResource dengan state standar:
 * loading -> LoadingState, error -> ErrorState (+coba lagi), kosong -> `empty`.
 */
export function AsyncContent<T>({
  resource,
  children,
  empty,
  isEmpty = (data) => Array.isArray(data) && data.length === 0,
  loadingRows = 3,
}: {
  resource: ApiResource<T>;
  children: (data: T) => ReactNode;
  empty?: ReactNode;
  isEmpty?: (data: T) => boolean;
  loadingRows?: number;
}) {
  if (resource.loading) return <LoadingState rows={loadingRows} />;
  if (resource.error !== undefined || resource.data === undefined) {
    return <ErrorState error={resource.error} onRetry={resource.reload} />;
  }
  if (empty !== undefined && isEmpty(resource.data)) return <>{empty}</>;
  return <>{children(resource.data)}</>;
}

export function ErrorState({
  error,
  onRetry,
  title,
  className,
}: {
  error: unknown;
  onRetry?: () => void;
  title?: string;
  className?: string;
}) {
  const t = useTranslations("States");
  const message = useErrorMessage()(error);
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-border bg-background px-4 py-10 text-center",
        className
      )}
    >
      <AlertCircle className="h-10 w-10 text-destructive" />
      <h3 className="mt-3 text-base font-bold text-foreground">{title ?? t("errorTitle")}</h3>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">{message}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {isUnauthorized(error) ? (
          <Link
            href="/auth/login"
            className="rounded-lg bg-primary px-5 py-2 text-xs font-bold text-white hover:brightness-110"
          >
            {t("login")}
          </Link>
        ) : (
          onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-5 py-2 text-xs font-bold text-white hover:brightness-125"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              {t("retry")}
            </button>
          )
        )}
      </div>
    </div>
  );
}
