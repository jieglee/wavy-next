"use client";

import { use } from "react";
import { Link } from "@/i18n/navigation";
import { MapPin, Star, BedDouble, ArrowLeft, CalendarCheck, Check } from "lucide-react";
import toast from "react-hot-toast";
import Navbar from "@/components/landing/navbar";
import Footer from "@/components/landing/footer";
import hotels from "@/data/hotels.json";

const NAVY = "#1B1A3A";
const PINK = "#FF5470";

interface Hotel {
  id: number;
  name: string;
  location: string;
  price: string;
  rating: string;
  gradient: string;
  tier: string;
  rooms: { category: string; room: string }[];
  ticketCat: string;
  image?: string;
}

export default function HotelDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const hotel = (hotels as Hotel[]).find((h) => h.id === Number(id));

  if (!hotel) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar sticky={false} hideUser />
        <div className="mx-auto max-w-5xl px-4 py-24 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#FF5470]/10">
            <BedDouble className="h-8 w-8" style={{ color: PINK }} />
          </div>
          <h1 className="mt-6 font-display text-2xl font-bold" style={{ color: NAVY }}>
            Hotel tidak ditemukan
          </h1>
          <p className="mt-2 text-sm text-[#8B889C]">
            Penginapan yang kamu cari nggak ada. Yuk balik ke beranda buat lihat semua hotel.
          </p>
          <Link
            href="/"
            className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:brightness-110 active:scale-95"
            style={{ backgroundColor: PINK }}
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali ke Beranda
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar sticky={false} hideUser />

      <main>
        <div className="relative h-[58vh] min-h-[400px] w-full overflow-hidden">
          {hotel.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={hotel.image} alt={hotel.name} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full" style={{ background: hotel.gradient }} />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/30" />

          <Link
            href="/"
            aria-label="Kembali ke beranda"
            className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-[#1B1A3A] shadow-lg backdrop-blur transition-all hover:bg-white active:scale-95 sm:left-6 sm:top-6"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>

          <div className="absolute inset-x-0 bottom-0 mx-auto max-w-5xl px-4 pb-8 sm:px-6 sm:pb-10">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur"
              >
                <MapPin className="h-3.5 w-3.5" />
                {hotel.location}
              </span>
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold text-white backdrop-blur"
              >
                <Star className="h-3.5 w-3.5 fill-current" />
                {hotel.rating}
              </span>
            </div>
            <h1 className="mt-3 font-display text-3xl font-bold text-white sm:text-4xl">{hotel.name}</h1>
          </div>
        </div>

        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            <section>
              <h2 className="flex items-center gap-2 font-display text-lg font-bold" style={{ color: NAVY }}>
                <BedDouble className="h-5 w-5" style={{ color: PINK }} />
                Tipe Kamar
              </h2>
              {hotel.rooms && hotel.rooms.length > 0 ? (
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {hotel.rooms.map((room, i) => (
                    <div
                      key={`${room.category}-${room.room}-${i}`}
                      className="rounded-2xl border border-[#EDEBF2] bg-[#FAFAF8] p-4 transition-colors hover:border-[#FF5470]/40"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-bold" style={{ color: NAVY }}>
                          {room.room || "Standard"}
                        </h3>
                        <span className="shrink-0 rounded-full bg-[#FF5470]/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase text-[#FF5470]">
                          {room.category}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-[#8B889C]">Detail kamar belum tersedia.</p>
              )}

              <div className="mt-8 rounded-2xl border border-[#EDEBF2] bg-[#FAFAF8] p-5">
                <h3 className="font-display text-base font-bold" style={{ color: NAVY }}>
                  Fasilitas & Informasi
                </h3>
                <ul className="mt-3 grid gap-2 text-sm text-[#4A4757] sm:grid-cols-2">
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    Cek-in mulai 14.00, cek-out sampai 12.00
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    Sarapan tersedia di beberapa paket
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    Berdekatan dengan lokasi venue & destinasi
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    Pemesanan hotel terintegrasi dengan Wavy
                  </li>
                </ul>
              </div>
            </section>

            <aside className="lg:sticky lg:top-6 lg:self-start">
              <div className="rounded-3xl border border-[#EDEBF2] bg-white p-5 shadow-[0_10px_40px_rgba(27,26,58,0.06)]">
                <p className="flex items-center gap-1.5 text-xs font-medium text-[#8B889C]">
                  <CalendarCheck className="h-4 w-4" />
                  Harga per malam
                </p>
                <p className="mt-2 font-display text-2xl font-extrabold" style={{ color: NAVY }}>
                  Rp{Number(hotel.price).toLocaleString("id-ID")}
                </p>
                <p className="mt-1 flex items-center gap-1 text-xs text-[#6B6875]">
                  <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                  Rating {hotel.rating} · {hotel.location}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    toast.success(`Booking ${hotel.name} berhasil disiapkan — lanjut pembayaran di aplikasi.`, {
                      duration: 3500,
                    })
                  }
                  className="mt-5 w-full rounded-full py-3 text-sm font-bold text-white shadow-sm transition-all hover:brightness-110 active:scale-95"
                  style={{ backgroundColor: PINK }}
                >
                  Pesan Sekarang
                </button>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}