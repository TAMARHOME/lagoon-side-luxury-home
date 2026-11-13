import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/listing/SiteHeader";
import { Hero } from "@/components/listing/Hero";
import { VideoTour } from "@/components/listing/VideoTour";
import { Gallery } from "@/components/listing/Gallery";
import { Amenities } from "@/components/listing/Amenities";
import { HostTrust } from "@/components/listing/HostTrust";
import { Footer } from "@/components/listing/Footer";
import { MobileActionBar } from "@/components/listing/MobileActionBar";

const title = "Luxury 3-Bedroom Waterfront Duplex, Lekki Phase 1 | PrimeHaven Lagos";
const description =
  "Book a luxury waterfront short-let in Lekki Phase 1 — ₦150,000/night with 24/7 power, Starlink Wi-Fi, pool, gym and armed estate security. Reserve on WhatsApp.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

function Index() {
  return (
    <div className="relative overflow-x-clip bg-background">
      <SiteHeader />
      <main>
        <Hero />
        <VideoTour />
        <Gallery />
        <Amenities />
        <HostTrust />
      </main>
      <Footer />
      <MobileActionBar />
    </div>
  );
}
