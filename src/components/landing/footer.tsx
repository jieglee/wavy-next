import Link from "next/link"

export default function Footer() {
  return (
    <footer className="border-t border-border-dark px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div>
            <Link href="/" className="font-display text-xl font-semibold tracking-tight text-off-white">
              Wavy
            </Link>
            <p className="mt-1 text-xs text-lavender-gray">
              One Platform. Every Concert. Every Moment.
            </p>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-6">
            <Link href="#" className="text-xs text-lavender-gray transition-colors hover:text-off-white">
              Beranda
            </Link>
            <Link href="#featured" className="text-xs text-lavender-gray transition-colors hover:text-off-white">
              Cari Konser
            </Link>
            <Link href="#about" className="text-xs text-lavender-gray transition-colors hover:text-off-white">
              Tentang
            </Link>
            <Link href="#" className="text-xs text-lavender-gray transition-colors hover:text-off-white">
              Kebijakan Privasi
            </Link>
            <Link href="#" className="text-xs text-lavender-gray transition-colors hover:text-off-white">
              Syarat & Ketentuan
            </Link>
          </nav>
        </div>

        <div className="mt-8 border-t border-border-dark pt-6 text-center">
          <p className="text-xs text-lavender-gray">
            &copy; {new Date().getFullYear()} Wavy. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}
