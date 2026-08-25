import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { WavyIcon } from "@/components/landing/wavy-icon";

export default function AppFooter() {
  const t = useTranslations("AppFooter");

  const appLinks = [
    { label: t("browse"), href: "/concerts" },
    { label: t("myTickets"), href: "/tickets" },
    { label: t("profile"), href: "/me" },
  ];

  return (
    <footer className="border-t border-wavy-border px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-4">
          <Link
            href="/home"
            className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-wavy-text-primary"
          >
            <WavyIcon size={22} />
            Wavy
          </Link>
          <nav className="flex items-center gap-4">
            {appLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="text-xs text-wavy-text-secondary transition-colors hover:text-wavy-text-primary"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="text-xs text-wavy-text-secondary">
          &copy; {new Date().getFullYear()} Wavy. {t("rights")}
        </p>
      </div>
    </footer>
  );
}
