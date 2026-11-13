import { Button } from "@/components/ui/button";
import { useListing } from "./ListingContext";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function Footer() {
  const listing = useListing();
  return (
    <footer className="px-5 pb-32 pt-10 md:px-10 md:pb-12">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-border-gold bg-card-gradient p-8 text-center md:p-16">
          <p className="eyebrow">Limited Availability</p>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl leading-tight text-foreground md:text-6xl">
            Secure your stay in <span className="italic text-gold">{listing.shortLocation}.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            <span className="font-semibold text-foreground">{listing.priceLabel}</span> {listing.priceUnit} · Instant replies on WhatsApp
          </p>
          <Button asChild variant="gold" size="xl" className="mt-8">
            <a href={listing.whatsappUrl} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon /> Reserve on WhatsApp
            </a>
          </Button>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground md:flex-row">
          <span className="font-display text-lg text-foreground">{listing.agency.name}</span>
          <span>{listing.location}, Nigeria</span>
          <span>© {new Date().getFullYear()} PrimeHaven. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
