import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/listing/SiteHeader";
import { Hero } from "@/components/listing/Hero";
import { VideoTour } from "@/components/listing/VideoTour";
import { Gallery } from "@/components/listing/Gallery";
import { Amenities } from "@/components/listing/Amenities";
import { HostTrust } from "@/components/listing/HostTrust";
import { Footer } from "@/components/listing/Footer";
import { MobileActionBar } from "@/components/listing/MobileActionBar";
import { ListingProvider } from "@/components/listing/ListingContext";
import { plainTitle, splitSpecs } from "@/lib/listing-content";
import { siteContentQuery } from "@/lib/site-content-query";

export const Route = createFileRoute("/")({
  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQuery),
  head: ({ loaderData }) => {
    const title = loaderData
      ? `${plainTitle(loaderData.title)}, ${loaderData.location.split(",")[0]} | PrimeHaven Lagos`
      : "Luxury Waterfront Duplex, Lekki Phase 1 | PrimeHaven Lagos";
    const description = loaderData
      ? `Book a luxury stay in ${loaderData.location} — ${loaderData.price} with ${splitSpecs(loaderData.specs).join(", ")}. Reserve on WhatsApp.`
      : "Book a luxury waterfront short-let in Lekki Phase 1 with 24/7 power, Starlink Wi-Fi and armed estate security. Reserve on WhatsApp.";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: Index,
});

function Index() {
  const { data } = useSuspenseQuery(siteContentQuery);
  return (
    <ListingProvider content={data}>
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
    </ListingProvider>
  );
}
