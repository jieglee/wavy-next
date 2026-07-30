const testimonials = [
  {
    quote:
      "Sebelum pake Wavy, kami harus daftar manual di 3 website EO beda. Sekarang semua lewat satu aplikasi — hemat banget waktunya.",
    name: "Dinda Putri",
    role: "Mahasiswa",
  },
  {
    quote:
      "Sebagai EO kecil, Wavy bantu kami jual tiket sampe 2x lipat dari event sebelumnya. Dashboard-nya gampang dipake.",
    name: "Rizky Pratama",
    role: "Event Organizer",
  },
  {
    quote:
      "Nggak ada lagi ghosting dari penjual tiket abal-abal. Wavy garansi tiket orisinal, refund juga cepet.",
    name: "Andre Wijaya",
    role: "Kolektor Konser",
  },
]

export default function Testimonials() {
  return (
    <section className="border-t border-border-dark px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-off-white sm:text-3xl">
            Kata Mereka
          </h2>
          <p className="mt-2 text-sm text-lavender-gray">
            Yang udah cobain Wavy — dari penonton sampai EO
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="relative flex flex-col rounded-xl border border-border-dark bg-graphite-plum p-5 sm:p-6"
            >
              <svg
                className="mb-3 h-5 w-5 text-coral-spotlight/40"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
              </svg>
              <p className="text-sm leading-relaxed text-lavender-gray">
                &ldquo;{t.quote}&rdquo;
              </p>
              <div className="mt-4 border-t border-border-dark pt-3">
                <p className="text-sm font-medium text-off-white">{t.name}</p>
                <p className="text-xs text-lavender-gray">{t.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
