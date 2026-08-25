import { WavyIcon } from "@/components/landing/wavy-icon";

const appLinks = [
  { label: "Jelajah Konser", href: "/concerts" },
  { label: "Tiket Saya", href: "/tickets" },
  { label: "Profil & Level", href: "/me" },
]

export default function AppFooter() {
  return (
    <footer className="border-t border-wavy-border px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 sm:flex-row">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 font-display text-lg font-bold tracking-tight text-wavy-text-primary">
            <WavyIcon size={22} />
            Wavy
          </span>
          <nav className="flex items-center gap-4">
            {appLinks.map((l) => (
              <a
                key={l.label}
                href={l.href}
                className="text-xs text-wavy-text-secondary transition-colors hover:text-wavy-text-primary"
              >
                {l.label}
              </a>
            ))}
          </nav>
        </div>
        <p className="text-xs text-wavy-text-secondary">
          &copy; {new Date().getFullYear()} Wavy. All rights reserved.
        </p>
      </div>
    </footer>
  )
}
