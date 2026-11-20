import { Link } from "@/i18n/navigation";

const concerts = [
  { id: "1", title: "Java Jazz Festival 2026", venue: "JIExpo Kemayoran, Jakarta", date: "12–14 Jun 2026", price: "Rp250K", image: null },
  { id: "2", title: "K-Pop All Night", venue: "GBK Main Stadium, Jakarta", date: "28 Agu 2026", price: "Rp450K", image: null },
  { id: "3", title: "Rock Legends World Tour", venue: "Istora Senayan, Jakarta", date: "5 Sep 2026", price: "Rp350K", image: null },
  { id: "4", title: "Festival Musik Indie", venue: "Lapangan Gasibu, Bandung", date: "19–20 Sep 2026", price: "Rp150K", image: null },
];

export default function Featured() {
  return (
    <section id="featured" className="px-4 pb-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Konser Pilihan
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Konser yang lagi naik daun bulan ini
            </p>
          </div>
<Link
             href="/concerts"
             className="hidden text-sm font-medium text-primary transition-colors hover:brightness-110 sm:inline-flex"
           >
            Lihat semua &rarr;
          </Link>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {concerts.map((concert, i) => (
            <Link
              key={concert.title}
              href={`/concerts/${concert.id}`}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-muted transition-colors hover:border-primary/40"
            >
              <div className="aspect-4/3 w-full bg-linear-to-br from-primary/25 via-primary-glow/20 to-primary/25" />
              <div className="flex flex-col gap-1.5 p-4">
                <h3 className="font-display text-base font-medium text-foreground group-hover:text-primary">
                  {concert.title}
                </h3>
                <p className="text-xs text-muted-foreground">{concert.venue}</p>
                <p className="text-xs text-muted-foreground">{concert.date}</p>
                <p className="mt-1 font-display text-sm font-semibold text-primary">
                  Mulai {concert.price}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-6 text-center sm:hidden">
          <Link
            href="#"
            className="text-sm font-medium text-primary transition-colors hover:brightness-110"
          >
            Lihat semua &rarr;
          </Link>
        </div>
      </div>
    </section>
  )
}
