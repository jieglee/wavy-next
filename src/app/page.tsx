import Navbar from "@/components/landing/navbar";
import Hero from "@/components/landing/hero";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
      </main>
    </>
  );
}
