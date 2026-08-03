const benefits = [
  {
    title: "Satu Akun, Semua Konser",
    desc: "Nggak perlu daftar ulang di tiap EO. Cukup satu akun Wavy buat akses ribuan konser dari berbagai penyelenggara.",
  },
  {
    title: "Anti Scalper & Penipuan",
    desc: "Setiap tiket dilindungi sistem verifikasi Wavy. Harga transparan, nggak ada calo, nggak ada tiket palsu.",
  },
  {
    title: "Refund Darurat Mudah",
    desc: "Ada jadwal bentrok atau konser batal? Pengembalian dana cepat tanpa drama, langsung ke Wavy Wallet kamu.",
  },
  {
    title: "Dashboard untuk EO",
    desc: "Event Organizer pantau penjualan real-time, kelola kursi, dan analisis data pengunjung — semua dalam satu layar.",
  },
]

export default function Benefits() {
  return (
    <section data-aos="fade-up" className="border-t border-border-dark px-4 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-off-white sm:text-3xl">
            Kenapa Wavy?
          </h2>
          <p className="mt-2 text-sm text-lavender-gray">
            Masalah lama di industri tiket konser — kami bikin solusinya
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {benefits.map((b, i) => (
            <div
              key={b.title}
              data-aos="fade-up"
              data-aos-delay={i * 100}
              className={`rounded-xl border border-border-dark bg-graphite-plum p-5 transition-colors sm:p-6 ${
                i % 2 === 0
                  ? "hover:border-coral-spotlight/40"
                  : "hover:border-azure/40"
              }`}
            >
              <h3 className="font-display text-base font-medium text-off-white">
                {b.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-lavender-gray">
                {b.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
