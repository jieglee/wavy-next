import { useTranslations } from "next-intl";

const STEPS = ["find", "order", "scan"] as const;

export default function HowItWorks() {
  const t = useTranslations("Landing.howItWorks");
  return (
    <section id="about" className="border-t border-border px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {t("title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t("subtitle")}
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {STEPS.map((key, i) => (
            <div key={key} className="relative flex flex-col items-center text-center">
              {i < STEPS.length - 1 && (
                <div
                  aria-hidden
                  className="absolute right-0 top-8 hidden h-px w-[calc(50%-2rem)] bg-gradient-to-r from-border to-transparent sm:block"
                  style={{ left: "calc(50% + 2rem)" }}
                />
              )}
              <span
                className={`font-display text-4xl font-semibold ${
                  i % 2 === 0 ? "text-primary/30" : "text-primary-glow/30"
                }`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 font-display text-lg font-medium text-foreground">
                {t(`steps.${key}.title`)}
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                {t(`steps.${key}.desc`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
