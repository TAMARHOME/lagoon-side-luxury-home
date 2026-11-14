import { Fragment } from "react";
import { MapPin, Navigation, PlayCircle, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ResolvedProperty } from "@/lib/listing-assets";
import { cn } from "@/lib/utils";

export function StatusBadge({ property, className }: { property: ResolvedProperty; className?: string | undefined }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.18em]",
        property.status === "new" && "bg-gold text-primary-foreground",
        property.status === "available" && "glass border text-primary",
        property.status === "booked" && "glass border text-muted-foreground",
        className,
      )}
    >
      {property.status !== "new" && <span className={cn("h-1.5 w-1.5 rounded-full", property.status === "booked" ? "bg-muted-foreground" : "bg-primary")} />}
      {property.statusLabel}
    </span>
  );
}

export function LandmarkTags({ landmarks }: { landmarks: string[] }) {
  if (landmarks.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2" aria-label="Nearby landmarks">
      {landmarks.map((l) => (
        <li key={l} className="inline-flex items-center gap-1.5 rounded-full border border-border-gold bg-accent/50 px-2.5 py-1 text-[0.7rem] text-primary">
          <Navigation className="h-3 w-3" /> {l}
        </li>
      ))}
    </ul>
  );
}

export function PropertyCard({ property, onView }: { property: ResolvedProperty; onView: () => void }) {
  const hasVideo = property.video.url.trim().length > 0;
  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-border bg-card-gradient shadow-card transition-all duration-300 hover:-translate-y-1 hover:border-border-gold">
      <button type="button" onClick={onView} className="relative block aspect-[4/3] overflow-hidden bg-card" aria-label={`View ${property.plainTitle}`}>
        {property.coverSrc ? (
          <img src={property.coverSrc} alt={property.plainTitle} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] group-hover:scale-105" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">Cover photo</span>
        )}
        <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-overlay/80 to-transparent" />
        <StatusBadge property={property} className="absolute left-4 top-4" />
        <span className="absolute right-4 top-4 rounded-full glass border px-2.5 py-1 text-[0.65rem] font-medium text-foreground">{property.categoryLabel}</span>
        <span className="absolute bottom-4 left-4 inline-flex items-center gap-1.5 rounded-full glass border px-3 py-1.5 text-[0.7rem] font-medium text-foreground">
          <Video className="h-3.5 w-3.5 text-primary" />
          {hasVideo ? `Video Tour${property.video.duration ? ` · ${property.video.duration}` : ""}` : "Live Video Tour on Request"}
        </span>
      </button>
      <div className="flex flex-1 flex-col p-5 md:p-6">
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <MapPin className="h-3.5 w-3.5 text-primary" /> {property.location}
        </p>
        <h3 className="mt-2 font-display text-2xl leading-tight text-foreground md:text-[1.7rem]">
          {property.titleParts.map((p, i) => (p.gold ? <span key={i} className="italic text-gold">{p.text}</span> : <Fragment key={i}>{p.text}</Fragment>))}
        </h3>
        <div className="mt-4">
          <LandmarkTags landmarks={property.landmarks} />
        </div>
        <div className="mt-auto pt-6">
          <p className="text-xl font-bold text-foreground">
            {property.priceLabel} <span className="text-xs font-normal text-muted-foreground">{property.priceUnit}</span>
          </p>
          <Button variant="goldOutline" size="pill" className="mt-4 w-full" onClick={onView}>
            <PlayCircle /> View Details &amp; Video
          </Button>
        </div>
      </div>
    </article>
  );
}
