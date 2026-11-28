import Navbar from "@/components/landing/navbar";
import FeaturedPicks from "@/components/landing/featured-picks";
import Footer from "@/components/landing/footer";
import ScrollToTop from "@/components/scroll-to-top";
import SplashWrapper from "@/components/splash-wrapper";
import DiscoverCountries from "@/components/landing/discover-countries";
import { SmoothScroll } from "@/components/landing/motion/smooth-scroll";
import { SpotlightHero } from "@/components/landing/motion/spotlight-hero";
import { LineupRail } from "@/components/landing/motion/lineup-rail";
import { DiscoverHighlights } from "@/components/landing/discover-highlights";
import { TornTicketSteps } from "@/components/landing/motion/torn-ticket-steps";

// Landing scroll-driven (DESIGN §7): hero di-pin dengan sorot lampu → lineup horizontal →
// banner promo + kategori → cara beli sebagai tiket tersobek → pilihan konser → event per kota.
export default function Home() {
  return (
    <SplashWrapper>
      <SmoothScroll>
        <Navbar />
        <main className="flex-1 overflow-x-clip">
          <SpotlightHero />
          <LineupRail />
          <DiscoverHighlights />
          <TornTicketSteps />
          <section className="px-4 sm:px-6 lg:px-8" style={{ backgroundImage: "url(/images/banner/event4u2.png)", backgroundSize: "cover", backgroundPosition: "center", backgroundRepeat: "no-repeat" }}>
            <div className="mx-auto max-w-7xl py-8">
              <FeaturedPicks viewAllHref="/concerts" />
            </div>
          </section>
          <DiscoverCountries />
        </main>
        <Footer />
        <ScrollToTop />
      </SmoothScroll>
    </SplashWrapper>
  );
}
