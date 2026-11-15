import { Button } from "@/components/ui/button";
import { useSite } from "./ListingContext";
import { BookingDialog } from "./BookingDialog";
import { ThemeToggle } from "./ThemeToggle";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function SiteHeader() {
  const { featured, site } = useSite();
  const { tagline } = site.brand;
  return (
    <header className="absolute inset-x-0 top-0 z-30">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-5 md:px-10 md:py-7">
        <a href="#top" className="flex items-baseline gap-2">
          <span className="font-display text-2xl font-semibold tracking-wide text-foreground">{site.brand.name}</span>
          {tagline && <span className="hidden text-[0.65rem] uppercase tracking-[0.3em] text-primary sm:inline">{tagline}</span>}
        </a>
        <nav className="hidden items-center gap-8 text-sm text-muted-foreground lg:flex">
          <a href="#properties" className="transition-colors hover:text-foreground">Properties</a>
          {site.video.show && <a href="#tour" className="transition-colors hover:text-foreground">Video Tour</a>}
          {site.gallery.show && <a href="#gallery" className="transition-colors hover:text-foreground">Gallery</a>}
          {site.host.show && <a href="#host" className="transition-colors hover:text-foreground">Host</a>}
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <BookingDialog property={featured}>
            <Button variant="goldOutline" size="pill" className="hidden md:inline-flex">
              <WhatsAppIcon /> Reserve
            </Button>
          </BookingDialog>
        </div>
      </div>
    </header>
  );
}
