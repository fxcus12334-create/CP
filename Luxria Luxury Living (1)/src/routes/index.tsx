import { createFileRoute } from "@tanstack/react-router";
import { SmoothScroll } from "@/components/luxria/SmoothScroll";
import { Navbar } from "@/components/luxria/Navbar";
import { Hero } from "@/components/luxria/Hero";
import { Properties } from "@/components/luxria/Properties";
import { Alerts } from "@/components/luxria/Alerts";
import { Footer } from "@/components/luxria/Footer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Luxria — Ultra-Luxury Real Estate" },
      { name: "description", content: "Luxria curates ultra-luxury villas, penthouses and oceanfront estates. We simplify every step of the real estate journey." },
      { property: "og:title", content: "Luxria — Ultra-Luxury Real Estate" },
      { property: "og:description", content: "Curated luxury properties with expert support and total transparency." },
      { property: "og:image", content: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=1920&q=80" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <main className="bg-background text-foreground">
      <SmoothScroll />
      <Navbar />
      <Hero />
      <Properties />
      <Alerts />
      <Footer />
    </main>
  );
}
