import Link from "next/link"

export default function CtaBanner() {
  return (
    <section data-aos="zoom-in" className="border-t border-border-dark px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="relative overflow-hidden rounded-2xl border border-border-dark bg-graphite-plum px-6 py-14 text-center shadow-[0_24px_80px_rgba(27,26,36,0.08)] sm:px-14">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-20 -top-20 h-60 w-60 rounded-full bg-coral-spotlight/10 blur-[100px]"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-20 -left-20 h-60 w-60 rounded-full bg-azure/10 blur-[100px]"
          />

          <div className="relative">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-off-white sm:text-3xl">
              Siap Jadi Bagian dari Wavy?
            </h2>
            <p className="mx-auto mt-3 max-w-md text-sm leading-relaxed text-lavender-gray">
              Baik kamu pencinta musik yang mau nonton konser favorit, atau Event
              Organizer yang mau jangkau lebih banyak penonton.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="#featured"
                className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-coral-spotlight px-6 text-sm font-semibold text-plum-black transition-colors hover:brightness-110 sm:w-auto"
              >
                Cari Konser Sekarang
              </Link>
              <Link
                href="/auth/register"
                className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-border-dark px-6 text-sm font-semibold text-lavender-gray transition-colors hover:border-azure hover:text-azure sm:w-auto"
              >
                Daftar Jadi EO
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
