import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";

type Section = { title: string; body: string[] };

export type InfoPageKey = "howToBuy" | "terms" | "privacy" | "about" | "organizerGuide";

/**
 * Halaman informasi statis (Cara Beli, S&K, Privasi, Tentang, Panduan Organizer).
 * Grid: baseline — satu kolom baca ~65ch, nomor section mono di kiri (desktop) agar ritme terasa.
 * Konten di messages `InfoPages.<key>` (title, intro, updated, sections[], cta?).
 */
export function InfoPage({ page, cta }: { page: InfoPageKey; cta?: { href: string } }) {
  const t = useTranslations(`InfoPages.${page}`);
  const common = useTranslations("InfoPages");
  const sections = t.raw("sections") as Section[];

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Navbar />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <header className="border-b border-border pb-8">
          <p className="font-mono text-[11px] font-medium uppercase tracking-widest text-primary">{common("eyebrow")}</p>
          <h1 className="mt-2 font-display text-3xl font-bold tracking-tight text-foreground sm:text-5xl">{t("title")}</h1>
          <p className="mt-4 max-w-[65ch] text-base leading-7 text-muted-foreground">{t("intro")}</p>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            {common("updated", { date: t("updated") })}
          </p>
        </header>

        <ol className="divide-y divide-border">
          {sections.map((s, i) => (
            <li key={s.title} className="grid gap-2 py-8 sm:grid-cols-[4rem_1fr] sm:gap-6">
              <span className="font-mono text-xs font-semibold text-muted-foreground sm:pt-1">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="max-w-[65ch] space-y-3">
                <h2 className="font-display text-xl font-bold tracking-tight text-foreground">{s.title}</h2>
                {s.body.map((p, j) => (
                  <p key={j} className="text-sm leading-6 text-foreground/85">
                    {p}
                  </p>
                ))}
              </div>
            </li>
          ))}
        </ol>

        {cta && (
          <div className="mt-4 flex flex-wrap items-center gap-4 rounded-xl border border-border bg-background p-5 sm:p-6">
            <p className="min-w-0 flex-1 text-sm text-muted-foreground">{t("ctaText")}</p>
            <Link
              href={cta.href}
              className="rounded-lg bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground transition hover:brightness-110"
            >
              {t("ctaLabel")}
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
