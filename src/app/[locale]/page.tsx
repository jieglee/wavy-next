import Navbar from "@/components/landing/navbar";
import PromoCarousel from "@/components/landing/promo-carousel";
import FeaturedEvents from "@/components/landing/featured-events";
import TravelerMode from "@/components/landing/traveler-mode";
import Footer from "@/components/landing/footer";
import ScrollToTop from "@/components/scroll-to-top";
import SplashWrapper from "@/components/splash-wrapper";
import DiscoverCountries from "@/components/landing/discover-countries";

export default function Home() {
  return (
    <SplashWrapper>
      <>
        <Navbar />
        <main className="flex-1">
          <PromoCarousel />
          <FeaturedEvents />
          <TravelerMode />
          <DiscoverCountries />
        </main>
        <Footer />
        <ScrollToTop />
      </>
    </SplashWrapper>
  );
}
