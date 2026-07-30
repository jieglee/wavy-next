import Link from "next/link"

const categories = [
  "Pop", "Rock", "K-Pop", "Indie", "Jazz", "Festival", "EDM", "Fan Meeting",
]

export default function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-24 pt-16 sm:px-6 sm:pt-20 lg:px-8 lg:pt-28">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 right-0 h-[500px] w-[500px] rounded-full bg-coral-spotlight/10 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 left-0 h-[400px] w-[400px] rounded-full bg-coral-spotlight/5 blur-[100px]"
      />

      <div className="relative mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 flex items-center justify-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-border-dark bg-graphite-plum px-3 py-1 text-xs font-medium text-lavender-gray">
              <span className="h-1.5 w-1.5 rounded-full bg-lime" />
              Marketplace tiket konser #1 di Indonesia
            </span>
          </div>

          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight text-off-white sm:text-5xl lg:text-6xl">
            One Platform.
            <br />
            <span className="text-coral-spotlight">Every Concert.</span>
            <br />
            Every Moment.
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-lavender-gray sm:text-lg">
            Platform marketplace tiket konser yang menghubungkan Event Organizer
            dengan pecinta musik dalam satu ekosistem. Cari, pesan, dan nikmati
            konser favoritmu — tanpa ribet.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="#featured"
              className="inline-flex h-12 w-full items-center justify-center rounded-lg bg-coral-spotlight px-6 text-sm font-semibold text-plum-black transition-colors hover:brightness-110 sm:w-auto"
            >
              Cari konser
            </Link>
            <Link
              href="/auth/register"
              className="inline-flex h-12 w-full items-center justify-center rounded-lg border border-border-dark px-6 text-sm font-semibold text-lavender-gray transition-colors hover:border-lavender-gray hover:text-off-white sm:w-auto"
            >
              Daftar jadi Event Organizer
            </Link>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-3">
          {categories.map((cat) => (
            <Link
              key={cat}
              href="#"
              className="rounded-full border border-border-dark bg-graphite-plum px-4 py-2 text-sm font-medium text-lavender-gray transition-colors hover:border-coral-spotlight hover:text-coral-spotlight"
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
