import Navbar from "@/components/landing/navbar";
import PromoCarousel from "@/components/landing/promo-carousel";
import Stats from "@/components/landing/stats";
import Featured from "@/components/landing/featured";
import Benefits from "@/components/landing/benefits";
import HowItWorks from "@/components/landing/how-it-works";
import Testimonials from "@/components/landing/testimonials";
import CtaBanner from "@/components/landing/cta-banner";
import Footer from "@/components/landing/footer";
import ScrollToTop from "@/components/scroll-to-top";
import SplashWrapper from "@/components/splash-wrapper";

export default function Home() {
  return (
    <SplashWrapper>
      <>
        <Navbar />
        <main className="flex-1">
          <PromoCarousel />
          <Stats />
          <Featured />
          <Benefits />
          <HowItWorks />
          <Testimonials />
          <CtaBanner />
        </main>
        <Footer />
        <ScrollToTop />
      </>
    </SplashWrapper>
  );
}
