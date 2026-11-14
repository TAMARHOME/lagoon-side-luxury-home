import { Fragment } from "react";
import { MapPin, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSite } from "./ListingContext";
import { BookingDialog } from "./BookingDialog";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function Hero() {
  const { featured, openProperty } = useSite();
  const features = featured.highlights;
  return (
    <section id="top" className="relative flex min-h-[100svh] items-end overflow-hidden">
      {featured.coverSrc && (
        <img
          src={featured.coverSrc}
          alt={`${featured.plainTitle} in ${featured.location}`}
          width={1920}
          height={1088}
          fetchPriority="high"
          className="absolute inset-0 h-full w-full object-cover object-[35%_center]"
        />
      )}
      <div className="absolute inset-0 bg-hero-overlay" />

      <div className="relative z-10 mx-auto w-full max-w-7xl px-5 pb-16 pt-32 md:px-10 md:pb-24">
        <span className="inline-flex animate-rise items-center gap-2 rounded-full border border-border-gold bg-background/50 px-4 py-2 text-[0.65rem] font-semibold uppercase tracking-[0.25em] text-primary backdrop-blur-md md:text-xs">
          <span className="h-1.5 w-1.5 rounded-full bg-primary" />
          Featured Listing • {featured.shortLocation}
        </span>

        <h1 className="mt-6 max-w-4xl animate-rise font-display text-[2.9rem] font-medium leading-[0.95] text-foreground [animation-delay:120ms] sm:text-6xl md:text-7xl lg:text-8xl">
          {featured.titleParts.map((p, i) => (p.gold ? <span key={i} className="italic text-gold">{p.text}</span> : <Fragment key={i}>{p.text}</Fragment>))}
        </h1>

        <p className="sr-only">{features.join(" • ")}</p>
        <ul aria-hidden="true" className="mt-6 flex max-w-3xl animate-rise flex-wrap items-center gap-x-4 gap-y-2 text-sm text-foreground/85 [animation-delay:240ms] md:text-base">
          {features.map((f, i) => (
            <li key={`${i}-${f}`} className="flex items-center gap-4">
              {i > 0 && <span className="h-1 w-1 rounded-full bg-primary" />}
              <span className={i === 0 ? "font-semibold text-primary" : undefined}>{f}</span>
            </li>
          ))}
        </ul>

        <div className="mt-10 flex animate-rise flex-col gap-3 [animation-delay:360ms] sm:flex-row sm:flex-wrap sm:items-center">
          <BookingDialog property={featured}>
            <Button variant="gold" size="xl" className="w-full whitespace-normal text-center sm:w-auto">
              <WhatsAppIcon /> Book Inspection / Reserve
            </Button>
          </BookingDialog>
          <Button variant="goldOutline" size="xl" className="w-full sm:w-auto" onClick={() => openProperty(featured.id)}>
            <PlayCircle /> View Details &amp; Video
          </Button>
          <span className="flex items-center justify-center gap-2 text-sm text-muted-foreground sm:ml-2 sm:justify-start">
            <MapPin className="h-4 w-4 text-primary" /> {featured.location}
          </span>
        </div>
      </div>
    </section>
  );
}
