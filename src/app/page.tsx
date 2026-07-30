import Navbar from "@/components/landing/navbar";
import Hero from "@/components/landing/hero";
import Featured from "@/components/landing/featured";
import HowItWorks from "@/components/landing/how-it-works";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Featured />
        <HowItWorks />
      </main>
    </>
  );
}
