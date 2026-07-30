import Navbar from "@/components/landing/navbar";
import Hero from "@/components/landing/hero";
import Featured from "@/components/landing/featured";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Featured />
      </main>
    </>
  );
}
