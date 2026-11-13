import { Button } from "@/components/ui/button";
import { useListing } from "./ListingContext";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function MobileActionBar() {
  const listing = useListing();
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t glass pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex items-center justify-between gap-4 px-5 py-3">
        <div className="leading-tight">
          <p className="text-lg font-bold text-foreground">
            {listing.priceLabel} <span className="text-sm font-normal text-muted-foreground">{listing.priceUnit}</span>
          </p>
          <p className="text-[0.7rem] text-primary">{listing.shortLocation} · Available now</p>
        </div>
        <Button asChild variant="gold" size="pill" className="shrink-0">
          <a href={listing.whatsappUrl} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon /> Chat on WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
