import Navbar from "@/components/landing/navbar";
import PromoCarousel from "@/components/landing/promo-carousel";
import FeaturedEvents from "@/components/landing/featured-events";
import FeaturedPicks from "@/components/landing/featured-picks";
import TravelerMode from "@/components/landing/traveler-mode";
import DiscoverCountries from "@/components/landing/discover-countries";
import Footer from "@/components/landing/footer";
import ScrollToTop from "@/components/scroll-to-top";

export default function LoggedInHomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-wavy-bg">
      <Navbar />
      <main className="flex-1">
        <PromoCarousel />
        <FeaturedEvents />
        <section className="px-4 sm:px-6 lg:px-8" style={{ backgroundImage: "url(/images/banner/event4u2.png)", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
          <div className="mx-auto max-w-7xl py-8">
            <FeaturedPicks viewAllHref="/concerts" />
          </div>
        </section>
        {/* <TravelerMode /> */}
        <DiscoverCountries />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
