import { MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listing } from "@/config/listing";
import heroImg from "@/assets/hero-duplex.jpg";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function Hero() {
  const features = listing.subtitle.split(" • ");
  return (
    <section id="top" className="relative flex min-h-[100svh] items-end overflow-hidden">
      <img
        src={heroImg}
        alt="Luxury waterfront duplex in Lekki Phase 1 at dusk with infinity pool"
        width={1920}
        height={1088}
        fetchPriority="high"
        className="absolute inset-0 h-full w-full object-cover object-[35%_center]"
      />
      <div className="absolute inset-0 bg-hero-overlay" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 pt-32 md:px-10 md:pb-24">
        <span className="inline-flex animate-rise items-center gap-2 rounded-full border border-border-gold bg-background/50 px-4 py-2 text-[0.65rem] font-semibold tracking-[0.25em] text-primary backdrop-blur-md md:text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          {listing.badge}
        </span>

        <h1 className="mt-6 max-w-4xl animate-rise font-display text-[2.9rem] font-medium leading-[0.95] text-foreground [animation-delay:120ms] sm:text-6xl md:text-7xl lg:text-8xl">
          Luxury 3-Bedroom <span className="italic text-gold">Waterfront</span> Duplex
        </h1>

        <p className="sr-only">{listing.subtitle}</p>
        <ul
          aria-hidden="true"
          className="mt-6 flex max-w-3xl animate-rise flex-wrap items-center gap-x-4 gap-y-2 text-sm text-foreground/85 [animation-delay:240ms] md:text-base"
        >
          {features.map((f, i) => (
            <li key={f} className="flex items-center gap-4">
              {i > 0 && <span className="h-1 w-1 rounded-full bg-primary" />}
              <span className={i === 0 ? "font-semibold text-primary" : undefined}>{f}</span>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex animate-rise flex-col gap-4 [animation-delay:360ms] sm:flex-row sm:items-center">
          <Button asChild variant="gold" size="xl" className="w-full whitespace-normal text-center sm:w-auto">
            <a href={listing.whatsappUrl} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon />
              Book Inspection / Reserve on WhatsApp
            </a>
          </Button>
          <span className="flex items-center justify-center gap-2 text-sm text-muted-foreground sm:justify-start">
            <MapPin className="h-4 w-4 text-primary" /> {listing.location}
          </span>
        </div>
      </div>
    </section>
  );
}
