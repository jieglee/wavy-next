import { useTranslations } from "next-intl";

const TESTIMONIALS = ["dinda", "rizky", "andre"] as const;

export default function Testimonials() {
  const tr = useTranslations("Landing.testimonials");
  return (
    <section className="border-t border-border px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {tr("title")}
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {tr("subtitle")}
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {TESTIMONIALS.map((key, i) => (
            <div
              key={key}
              className="relative flex flex-col rounded-xl border border-border bg-muted p-5 sm:p-6"
            >
              <svg
                className={`mb-3 h-5 w-5 ${
                  i % 2 === 0 ? "text-primary/40" : "text-primary-glow/40"
                }`}
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-sm leading-relaxed text-muted-foreground">
                &ldquo;{tr(`items.${key}.quote`)}&rdquo;
              </p>
              <div className="mt-4 border-t border-border pt-3">
                <p className="text-sm font-medium text-foreground">{tr(`items.${key}.name`)}</p>
                <p className="text-xs text-muted-foreground">{tr(`items.${key}.role`)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
