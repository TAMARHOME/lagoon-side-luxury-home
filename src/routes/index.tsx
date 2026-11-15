import { useCallback } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/listing/SiteHeader";
import { Hero } from "@/components/listing/Hero";
import { PropertiesCatalog } from "@/components/listing/PropertiesCatalog";
import { VideoTour } from "@/components/listing/VideoTour";
import { Gallery } from "@/components/listing/Gallery";
import { Amenities } from "@/components/listing/Amenities";
import { HostTrust } from "@/components/listing/HostTrust";
import { Footer } from "@/components/listing/Footer";
import { MobileActionBar } from "@/components/listing/MobileActionBar";
import { PropertyDetail } from "@/components/listing/PropertyDetail";
import { SiteProvider, useSite } from "@/components/listing/ListingContext";
import { getFeatured, plainTitle, shortLocation } from "@/lib/listing-content";
import { siteContentQuery } from "@/lib/site-content-query";

type HomeSearch = { property?: string };

export const Route = createFileRoute("/")({
  validateSearch: (search: Record<string, unknown>): HomeSearch => {
    const id = search["property"];
    return typeof id === "string" && /^[a-z0-9-]{1,48}$/.test(id) ? { property: id } : {};
  },
  loader: ({ context }) => context.queryClient.ensureQueryData(siteContentQuery),
  head: ({ loaderData }) => {
    const featured = loaderData ? getFeatured(loaderData) : null;
    const count = loaderData?.properties.length ?? 0;
    const brand = loaderData ? [loaderData.site.brand.name, loaderData.site.brand.tagline].filter(Boolean).join(" ") : "PrimeHaven Lagos";
    const seo = loaderData?.site.seo;
    const title =
      seo?.title ||
      (featured
        ? `${plainTitle(featured.title)}, ${shortLocation(featured.location)} | ${brand}`
        : `Luxury Short-Lets & Homes in Lagos | ${brand}`);
    const description =
      seo?.description ||
      (featured
      ? `Browse ${count} luxury short-lets and homes for sale in Lagos, featuring the ${plainTitle(featured.title)} in ${featured.location}. Watch video tours and book on WhatsApp.`
      : "Browse luxury short-lets and homes for sale in Lekki, Victoria Island and Ikoyi. Watch video tours and book on WhatsApp.");
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
  const navigate = Route.useNavigate();
  const openProperty = useCallback(
    (id: string) => void navigate({ search: { property: id }, resetScroll: false }),
    [navigate],
  );
  return (
    <SiteProvider content={data} openProperty={openProperty}>
      <div className="relative overflow-x-clip bg-background">
        <SiteHeader />
        <main>
          <Hero />
          <PropertiesCatalog />
          <VideoTour />
          <Gallery />
          <Amenities />
          <HostTrust />
        </main>
        <Footer />
        <MobileActionBar />
        <OpenPropertyDetail />
      </div>
    </SiteProvider>
  );
}

/** Shows the full-screen detail view for ?property=<id>. */
function OpenPropertyDetail() {
  const { property: id } = Route.useSearch();
  const navigate = Route.useNavigate();
  const { properties, agent } = useSite();
  const property = id ? (properties.find((p) => p.id === id) ?? null) : null;
  return <PropertyDetail property={property} agent={agent} onClose={() => void navigate({ search: {}, resetScroll: false })} />;
}
