const stats = [
  { value: "500+", label: "Konser Tersedia" },
  { value: "50+", label: "Event Organizer" },
  { value: "200rb+", label: "Tiket Terjual" },
  { value: "4.8", label: "Rating Pengguna" },
]

export default function Stats() {
  return (
    <section data-aos="fade-up" className="border-t border-border-dark px-4 py-20 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {stats.map((s, i) => (
            <div key={s.label} data-aos="fade-up" data-aos-delay={i * 100} className="flex flex-col items-center text-center">
              <span className="font-display text-3xl font-semibold text-off-white sm:text-4xl">
                {s.value}
              </span>
              <span className="mt-1 text-xs text-lavender-gray sm:text-sm">
                {s.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
