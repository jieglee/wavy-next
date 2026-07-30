import Link from "next/link"

const concerts = [
  {
    title: "Java Jazz Festival 2026",
    venue: "JIExpo Kemayoran, Jakarta",
    date: "12–14 Jun 2026",
    price: "Rp250K",
    image: null,
  },
  {
    title: "K-Pop All Night",
    venue: "GBK Main Stadium, Jakarta",
    date: "28 Agu 2026",
    price: "Rp450K",
    image: null,
  },
  {
    title: "Rock Legends World Tour",
    venue: "Istora Senayan, Jakarta",
    date: "5 Sep 2026",
    price: "Rp350K",
    image: null,
  },
  {
    title: "Festival Musik Indie",
    venue: "Lapangan Gasibu, Bandung",
    date: "19–20 Sep 2026",
    price: "Rp150K",
    image: null,
  },
]

export default function Featured() {
  return (
    <section id="featured" data-aos="fade-up" className="px-4 pb-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-off-white sm:text-3xl">
              Konser Pilihan
            </h2>
            <p className="mt-1 text-sm text-lavender-gray">
              Konser yang lagi naik daun bulan ini
            </p>
          </div>
          <Link
            href="#"
            className="hidden text-sm font-medium text-coral-spotlight transition-colors hover:brightness-110 sm:inline-flex"
          >
            Lihat semua &rarr;
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {concerts.map((concert, i) => (
            <Link
              key={concert.title}
              href="#"
              data-aos="fade-up"
              data-aos-delay={i * 100}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-border-dark bg-graphite-plum transition-colors hover:border-coral-spotlight/40"
            >
              <div className="aspect-[4/3] w-full bg-gradient-to-br from-graphite-plum via-plum-black to-border-dark" />
              <div className="flex flex-col gap-1.5 p-4">
                <h3 className="font-display text-base font-medium text-off-white group-hover:text-coral-spotlight">
                  {concert.title}
                </h3>
                <p className="text-xs text-lavender-gray">{concert.venue}</p>
                <p className="text-xs text-lavender-gray">{concert.date}</p>
                <p className="mt-1 font-display text-sm font-semibold text-coral-spotlight">
                  Mulai {concert.price}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link
            href="#"
            className="text-sm font-medium text-coral-spotlight transition-colors hover:brightness-110"
          >
            Lihat semua &rarr;
          </Link>
        </div>
      </div>
    </section>
  )
}
