import Navbar from "@/components/landing/navbar";
import FeaturedPicks from "@/components/landing/featured-picks";
import TravelerMode from "@/components/landing/traveler-mode";
import { SHOW_TRAVELER_MODE } from "@/lib/features";
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
          <section className="bg-surface px-4 py-12 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-7xl">
              <FeaturedPicks viewAllHref="/concerts" />
            </div>
          </section>
          {SHOW_TRAVELER_MODE && <TravelerMode />}
          <DiscoverCountries />
        </main>
        <Footer />
        <ScrollToTop />
      </SmoothScroll>
    </SplashWrapper>
  );
}
