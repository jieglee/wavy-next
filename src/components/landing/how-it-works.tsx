const steps = [
  {
    number: "01",
    title: "Cari Konser",
    description:
      "Jelajahi ribuan konser dari berbagai Event Organizer. Filter berdasarkan genre, kota, atau tanggal favoritmu.",
  },
  {
    number: "02",
    title: "Pesan Tiket",
    description:
      "Pilih kursi, langsung bayar aman lewat Wavy. Tiket tersimpan otomatis di akunmu — nggak perlu takut ilang.",
  },
  {
    number: "03",
    title: "Scan & Masuk",
    description:
      "Tinggal tunjukkin QR tiket dari aplikasi di pintu masuk. Cepet, nggak ribet, nggak perlu antri cetak.",
  },
]

export default function HowItWorks() {
  return (
    <section id="about" data-aos="fade-up" className="border-t border-border-dark px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-off-white sm:text-3xl">
            Cara Kerjanya
          </h2>
          <p className="mt-2 text-sm text-lavender-gray">
            Dari cari konser sampai masuk venue — cuma 3 langkah
          </p>
        </div>

        <div className="mt-14 grid gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.number} data-aos="fade-up" data-aos-delay={i * 150} className="relative flex flex-col items-center text-center">
              {i < steps.length - 1 && (
                <div
                  aria-hidden
                  className="absolute right-0 top-8 hidden h-px w-[calc(50%-2rem)] bg-gradient-to-r from-border-dark to-transparent sm:block"
                  style={{ left: "calc(50% + 2rem)" }}
                />
              )}
              <span
                className={`font-display text-4xl font-semibold ${
                  i % 2 === 0 ? "text-coral-spotlight/30" : "text-azure/30"
                }`}
              >
                {step.number}
              </span>
              <h3 className="mt-4 font-display text-lg font-medium text-off-white">
                {step.title}
              </h3>
              <p className="mt-2 max-w-xs text-sm leading-relaxed text-lavender-gray">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
