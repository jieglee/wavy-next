import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function CtaBanner() {
  const t = useTranslations("Landing.cta");
  return (
    <section className="border-t border-border px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-muted px-6 py-14 text-center shadow-[0_24px_80px_color-mix(in_oklab,var(--foreground)_8%,transparent)] sm:px-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-primary/10 blur-[100px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-primary-glow/10 blur-[100px]"
          />

          <div className="relative">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {t("title")}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              {t("text")}
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="#featured"
                className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-primary px-6 text-sm font-semibold text-foreground transition-colors hover:brightness-110 sm:w-auto"
              >
                {t("button")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
