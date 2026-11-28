import { useTranslations } from "next-intl";

const BENEFITS = ["account", "quota", "payment", "alerts"] as const;

export default function Benefits() {
  const t = useTranslations("Landing.benefits");
  return (
    <section className="border-t border-border px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t("title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {BENEFITS.map((key) => (
            <div key={key} className="rounded-xl border border-border bg-muted p-5 transition-colors hover:border-primary/40 sm:p-6">
              <h3 className="font-display text-base font-medium text-foreground">
                {t(`items.${key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {t(`items.${key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
