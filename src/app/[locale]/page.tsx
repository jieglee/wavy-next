import Navbar from "@/components/landing/navbar";
import PromoCarousel from "@/components/landing/promo-carousel";
import FeaturedEvents from "@/components/landing/featured-events";
import FeaturedPicks from "@/components/landing/featured-picks";
import TravelerMode from "@/components/landing/traveler-mode";
import Footer from "@/components/landing/footer";
import ScrollToTop from "@/components/scroll-to-top";
import SplashWrapper from "@/components/splash-wrapper";
import DiscoverCountries from "@/components/landing/discover-countries";

const popularMock = [
  { id: "1", day: "11", month: "SEP", title: 'Hillsong Worship Nights Asia Tour Surabaya', meta: "11 Sep 2026 • Graha Unesa Surabaya, Kota Surabaya", image: "https://picsum.photos/seed/hillsong/400/200", href: "/concerts/1" },
  { id: "2", day: "11", month: "SEP", title: 'Drama Musikal "Mutiara Dari Timur: Nyala Perjuangan Martha Christina Tiahahu."', meta: "11 Sep 2026 • Istora Senayan, Jakarta Pusat", image: "https://picsum.photos/seed/mutiara/400/200", href: "/concerts/2" },
  { id: "3", day: "11", month: "SEP", title: "FAM - Fan And Makers Vol. 2", meta: "11-13 Sep 2026 • The Brickhall, Fatmawati, Jakarta Selatan", image: "https://picsum.photos/seed/fam/400/200", href: "/concerts/3" },
  { id: "4", day: "12", month: "SEP", title: "U-KNOW PROJECT 26 : SCENE#1 in JAKARTA", meta: "12 Sep 2026 • JAKARTA CONCERT HALL, Lt 14 & 15 iNews Tower, Jakarta Pusat", image: "https://picsum.photos/seed/uknow/400/200", href: "/concerts/4" },
  { id: "5", day: "12", month: "SEP", title: "RUANG RAYA - KARAWANG", meta: "12 Sep 2026 • KAWASAN 3 BISNIS, KARAWANG, Kab. Karawang", image: "https://picsum.photos/seed/ruangraya/400/200", href: "/concerts/5" },
];

const thisWeekMock = [
  { id: "6", day: "12", month: "SEP", title: "NIKI: Nicole Live in Jakarta", meta: "12 Sep 2026 • ICE BSD, Tangerang", image: "https://picsum.photos/seed/niki/400/200", href: "/concerts/6" },
  { id: "7", day: "13", month: "SEP", title: "Tulus: Tur Manusia 2026", meta: "13 Sep 2026 • Tennis Indoor Senayan, Jakarta", image: "https://picsum.photos/seed/tulus/400/200", href: "/concerts/7" },
  { id: "8", day: "14", month: "SEP", title: "Jazz Under The Stars", meta: "14 Sep 2026 • Sabuga, Bandung", image: "https://picsum.photos/seed/jazzweek/400/200", href: "/concerts/8" },
];

export default function Home() {
  return (
    <SplashWrapper>
      <>
        <Navbar />
        <main className="flex-1">
          <PromoCarousel />
          <FeaturedEvents />
          <section className="px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl py-8">
              <FeaturedPicks popular={popularMock} thisWeek={thisWeekMock} viewAllHref="/concerts" />
            </div>
          </section>
          <TravelerMode />
          <DiscoverCountries />
        </main>
        <Footer />
        <ScrollToTop />
      </>
    </SplashWrapper>
  );
}
