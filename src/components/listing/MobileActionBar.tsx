import { Button } from "@/components/ui/button";
import { useSite } from "./ListingContext";
import { WhatsAppIcon } from "./WhatsAppIcon";

/** Frosted bottom bar on phones: featured price + WhatsApp. */
export function MobileActionBar() {
  const { featured } = useSite();
  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t glass pb-[env(safe-area-inset-bottom)] md:hidden">
      <div className="flex items-center justify-between gap-4 px-5 py-3">
        <div className="min-w-0 leading-tight">
          <p className="truncate text-lg font-bold text-foreground">
            {featured.priceLabel} <span className="text-sm font-normal text-muted-foreground">{featured.priceUnit}</span>
          </p>
          <p className="truncate text-[0.7rem] text-primary">
            {featured.shortLocation} · {featured.statusLabel}
          </p>
        </div>
        <Button asChild variant="gold" size="pill" className="shrink-0">
          <a href={featured.interestUrl} target="_blank" rel="noopener noreferrer">
            <WhatsAppIcon /> Chat on WhatsApp
          </a>
        </Button>
      </div>
    </div>
  );
}
