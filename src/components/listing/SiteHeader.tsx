import { Button } from "@/components/ui/button";
import { useListing } from "./ListingContext";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function SiteHeader() {
  const listing = useListing();
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-10 md:py-7">
        <a href="#top" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold tracking-wide text-foreground">
            PrimeHaven
          </span>
          <span className="hidden text-[0.65rem] tracking-[0.3em] text-primary sm:inline">LAGOS</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
          <a href="#tour" className="transition-colors hover:text-foreground">Video Tour</a>
          <a href="#gallery" className="transition-colors hover:text-foreground">Gallery</a>
          <a href="#amenities" className="transition-colors hover:text-foreground">Amenities</a>
          <a href="#host" className="transition-colors hover:text-foreground">Host</a>
        </nav>
        <Button asChild variant="goldOutline" size="pill" className="hidden md:inline-flex">
          <a href={listing.whatsappUrl} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon /> Reserve
          </a>
        </Button>
      </div>
    </header>
  );
}
