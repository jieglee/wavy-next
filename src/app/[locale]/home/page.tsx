import AppNavbar from "@/components/app/navbar";
import WelcomeBanner from "@/components/app/welcome-banner";
import PromoCarousel from "@/components/landing/promo-carousel";
import FeaturedEvents from "@/components/landing/featured-events";
import TravelerMode from "@/components/landing/traveler-mode";
import AppFooter from "@/components/app/footer";
import ScrollToTop from "@/components/scroll-to-top";

export default function LoggedInHomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-wavy-bg">
      <AppNavbar />
      <main className="flex-1">
        <WelcomeBanner />
        <PromoCarousel />
        <FeaturedEvents />
        <TravelerMode />
      </main>
      <AppFooter />
      <ScrollToTop />
    </div>
  );
}
