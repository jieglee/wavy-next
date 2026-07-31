import Link from "next/link"
import Image from "next/image"

const menuLinks = [
  { label: "Tentang Kami", href: "#" },
  { label: "Verifikasi Organizer", href: "#" },
  { label: "Simulasi Biaya", href: "#" },
  { label: "Bantuan", href: "#" },
]

const panduanLinks = [
  { label: "Cara Beli Tiket", href: "#" },
  { label: "Ticket Protection", href: "#" },
  { label: "Panduan Organizer", href: "#" },
]

const paymentMethods = [
  "QRIS", "BCA", "BRI", "BNI", "Mandiri", "BSI",
  "GoPay", "OVO", "DANA", "LinkAja", "ShopeePay",
  "Visa", "Mastercard", "Alfamart", "Indomaret",
]

const paymentLogos: Record<string, { src: string; width: number; height: number }> = {
  QRIS: { src: "/images/footer/Logo_QRIS.svg.webp", width: 3840, height: 1456 },
  BCA: { src: "/images/footer/Bank_Central_Asia.svg.webp", width: 3840, height: 1204 },
  BRI: { src: "/images/footer/bri.png", width: 658, height: 370 },
  BNI: { src: "/images/footer/Bank_Negara_Indonesia_logo.svg.webp", width: 3840, height: 1113 },
  Mandiri: { src: "/images/footer/Bank_Mandiri_logo_2016.svg.webp", width: 3840, height: 1121 },
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

// TikTok belum ada di lucide-react versi ini, jadi dibikin manual
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M16.6 5.82a4.28 4.28 0 0 1-3.14-1.4v9.53a5.24 5.24 0 1 1-4.53-5.19v2.4a2.84 2.84 0 1 0 1.98 2.7V2h2.55a4.28 4.28 0 0 0 4.28 4.28v2.4a6.6 6.6 0 0 1-1.14-.1z" />
    </svg>
  )
}

// Threads belum ada di lucide-react versi ini, jadi dibikin manual
function ThreadsIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12.2 22c-2.7 0-4.9-.8-6.5-2.4-1.6-1.7-2.5-4.1-2.5-7.2v-.8c0-3.1.9-5.5 2.5-7.2C7.3 2.8 9.5 2 12.2 2c2.2 0 4 .6 5.4 1.7 1.3 1.1 2.1 2.6 2.4 4.5l-2.1.3c-.2-1.3-.8-2.4-1.7-3.1-.9-.7-2.2-1.1-3.8-1.1-2 0-3.6.6-4.7 1.8-1.1 1.2-1.7 2.9-1.7 5.1v.6c0 2.2.6 3.9 1.7 5.1 1.1 1.2 2.7 1.8 4.7 1.8 1.7 0 3-.5 3.9-1.4.8-.7 1.2-1.7 1.3-2.9-.3.1-.7.2-1.1.3-.6.1-1.2.2-1.9.2-1.4 0-2.5-.3-3.3-1-.8-.7-1.2-1.6-1.2-2.7 0-1.1.4-2 1.3-2.7.9-.7 2.1-1 3.6-1 .7 0 1.4.1 2 .2.1-.6.1-1.3-.1-1.9-.3-.9-1.1-1.5-2.4-1.5-1 0-1.9.3-2.5 1l-1.8-1.2c1-1.3 2.5-2 4.4-2 1.9 0 3.4.7 4.1 2.1.5.9.6 2 .4 3.3.9.5 1.6 1.1 2 1.9.6 1.1.7 2.5.2 3.9-.7 2.1-2.7 4.5-6.6 4.5zm.6-9.1c-.9 0-1.6.2-2 .5-.4.3-.6.6-.6 1.1 0 .5.2.8.6 1.1.4.3 1 .4 1.7.4.6 0 1.1-.1 1.6-.2.4-.1.8-.3 1.1-.5 0-.9-.2-1.6-.6-2-.4-.3-1-.4-1.8-.4z" />
    </svg>
  )
}

const socials = [
  { icon: InstagramIcon, href: "#", label: "Instagram" },
  { icon: FacebookIcon, href: "#", label: "Facebook" },
]

export default function Footer() {
  return (
    <footer className="border-t border-wavy-border px-4 py-14 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-10 sm:grid-cols-4">
          {/* Brand + Social */}
          <div className="col-span-2 sm:col-span-1">
            <p className="font-display text-xs font-bold uppercase tracking-wide text-wavy-accent">
              #EveryConcert
            </p>
            <Link href="/" className="mt-1 block font-display text-2xl font-bold tracking-tight text-wavy-text-primary">
              Wavy
            </Link>

            <p className="mt-6 text-sm font-semibold text-wavy-text-primary">Ikuti Kami</p>
            <div className="mt-3 flex items-center gap-3">
              {socials.map(({ icon: Icon, href, label }) => (
                <Link
                  key={label}
                  href={href}
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-wavy-surface text-wavy-text-secondary transition-colors hover:bg-wavy-accent hover:text-wavy-bg"
                >
                  <Icon className="h-4 w-4" />
                </Link>
              ))}
              <Link
                href="#"
                aria-label="TikTok"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-wavy-surface text-wavy-text-secondary transition-colors hover:bg-wavy-accent hover:text-wavy-bg"
              >
                <TikTokIcon className="h-4 w-4" />
              </Link>
              <Link
                href="#"
                aria-label="Threads"
                className="flex h-9 w-9 items-center justify-center rounded-full bg-wavy-surface text-wavy-text-secondary transition-colors hover:bg-wavy-accent hover:text-wavy-bg"
              >
                <ThreadsIcon className="h-4 w-4" />
              </Link>
            </div>
          </div>

          {/* Menu */}
          <div>
            <p className="font-display text-sm font-semibold text-wavy-text-primary">Menu</p>
            <nav className="mt-4 flex flex-col gap-3">
              {menuLinks.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-sm text-wavy-text-secondary transition-colors hover:text-wavy-text-primary"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Panduan */}
          <div>
            <p className="font-display text-sm font-semibold text-wavy-text-primary">Panduan</p>
            <nav className="mt-4 flex flex-col gap-3">
              {panduanLinks.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className="text-sm text-wavy-text-secondary transition-colors hover:text-wavy-text-primary"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Pilihan Pembayaran */}
          <div className="col-span-2 sm:col-span-1">
            <p className="font-display text-sm font-semibold text-wavy-text-primary">
              Pilihan Pembayaran
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              {paymentMethods.map((method) => (
                <span
                  key={method}
                  className="flex items-center justify-center rounded-md bg-wavy-surface px-2.5 py-1.5 font-mono text-[0.65rem] font-medium text-wavy-text-secondary"
                >
                  {paymentLogos[method] ? (
                    <Image
                      src={paymentLogos[method].src}
                      alt={method}
                      width={paymentLogos[method].width}
                      height={paymentLogos[method].height}
                      className="h-4 w-auto"
                    />
                  ) : (
                    method
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-wavy-border pt-6 sm:flex-row">
          <p className="text-xs text-wavy-text-secondary">
            &copy; {new Date().getFullYear()} Wavy. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-xs text-wavy-text-secondary transition-colors hover:text-wavy-text-primary">
              Kebijakan Privasi
            </Link>
            <Link href="#" className="text-xs text-wavy-text-secondary transition-colors hover:text-wavy-text-primary">
              Syarat & Ketentuan
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}