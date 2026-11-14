import { Fragment, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, MapPin, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ResolvedAgent, ResolvedProperty } from "@/lib/listing-assets";
import { cn } from "@/lib/utils";
import { AMENITY_ICONS } from "./amenity-icons";
import { BookingDialog } from "./BookingDialog";
import { LandmarkTags, StatusBadge } from "./PropertyCard";
import { OrientationToggle, VideoPlayer, type Orientation } from "./VideoPlayer";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function PropertyDetail({ property, agent, onClose }: { property: ResolvedProperty | null; agent: ResolvedAgent; onClose: () => void }) {
  return (
    <Dialog.Root open={!!property} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[60] bg-overlay/90 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-0 z-[61] overflow-y-auto bg-background focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in md:inset-4 md:rounded-3xl md:border md:border-border-gold lg:inset-8"
        >
          {property && <DetailBody key={property.id} property={property} agent={agent} />}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DetailBody({ property, agent }: { property: ResolvedProperty; agent: ResolvedAgent }) {
  const slides = [...(property.coverSrc ? [{ src: property.coverSrc, label: "Cover" }] : []), ...property.photos];
  const [index, setIndex] = useState(0);
  const [orientation, setOrientation] = useState<Orientation>(property.video.orientation);
  const current = slides[index];
  const step = (d: number) => setIndex((i) => (i + d + slides.length) % slides.length);

  return (
    <div className="pb-28 md:pb-12">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b glass px-5 py-3 md:px-8">
        <div className="flex items-center gap-2">
          <StatusBadge property={property} />
          <span className="text-xs text-muted-foreground">{property.categoryLabel}</span>
        </div>
        <Dialog.Close aria-label="Close" className="rounded-full border border-border bg-card p-2.5 text-foreground transition-colors hover:border-border-gold hover:text-primary">
          <X className="h-5 w-5" />
        </Dialog.Close>
      </div>

      <div className="mx-auto max-w-6xl px-5 pt-8 md:px-8">
        <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <MapPin className="h-4 w-4 text-primary" /> {property.location}
        </p>
        <Dialog.Title className="mt-3 font-display text-4xl leading-[1] text-foreground md:text-6xl">
          {property.titleParts.map((p, i) => (p.gold ? <span key={i} className="italic text-gold">{p.text}</span> : <Fragment key={i}>{p.text}</Fragment>))}
        </Dialog.Title>
        <div className="mt-4">
          <LandmarkTags landmarks={property.landmarks} />
        </div>

        {current && (
          <div className="mt-8">
            <div className="relative aspect-[16/10] overflow-hidden rounded-3xl border border-border bg-card md:aspect-[16/8]">
              <img src={current.src} alt={`${property.plainTitle} — ${current.label}`} className="absolute inset-0 h-full w-full object-cover" />
              <span className="absolute bottom-4 left-4 rounded-full glass border px-3 py-1.5 text-xs text-foreground">
                {String(index + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")} · {current.label}
              </span>
              {slides.length > 1 &&
                [-1, 1].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => step(d)}
                    aria-label={d < 0 ? "Previous photo" : "Next photo"}
                    className={cn("absolute top-1/2 -translate-y-1/2 rounded-full glass border p-3 text-foreground transition-colors hover:text-primary", d < 0 ? "left-4" : "right-4")}
                  >
                    {d < 0 ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                  </button>
                ))}
            </div>
            {slides.length > 1 && (
              <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                {slides.map((s, i) => (
                  <button
                    key={`${s.src}-${i}`}
                    type="button"
                    onClick={() => setIndex(i)}
                    aria-label={`Show ${s.label}`}
                    className={cn("relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition-all md:h-20 md:w-28", i === index ? "border-primary" : "border-transparent opacity-70 hover:opacity-100")}
                  >
                    <img src={s.src} alt="" loading="lazy" className="absolute inset-0 h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="grid content-start gap-10">
            <section>
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="eyebrow">Virtual Viewing</p>
                  <h3 className="mt-2 font-display text-3xl text-foreground">Walkthrough Video</h3>
                </div>
                <OrientationToggle value={orientation} onChange={setOrientation} />
              </div>
              <div className="mt-6">
                <VideoPlayer
                  url={property.video.url}
                  duration={property.video.duration}
                  orientation={orientation}
                  poster={property.coverSrc}
                  title={property.plainTitle}
                  whatsappUrl={property.interestUrl}
                />
              </div>
            </section>

            {property.description && (
              <section>
                <p className="eyebrow">About this home</p>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground md:text-lg">{property.description}</p>
              </section>
            )}

            {property.amenityList.length > 0 && (
              <section>
                <p className="eyebrow">Key Amenities</p>
                <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                  {property.amenityList.map((a) => {
                    const Icon = AMENITY_ICONS[a.key];
                    return (
                      <li key={a.key} className="flex items-center gap-3 rounded-2xl border border-border bg-card-gradient p-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border-gold bg-accent text-primary">
                          <Icon className="h-4 w-4" strokeWidth={1.6} />
                        </span>
                        <span className="text-sm font-medium text-foreground">{a.label}</span>
                      </li>
                    );
                  })}
                </ul>
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-3xl border border-border-gold bg-card p-6">
              <p className="text-3xl font-bold text-foreground">
                {property.priceLabel} <span className="text-sm font-normal text-muted-foreground">{property.priceUnit}</span>
              </p>
              <p className="mt-1 text-xs text-primary">{property.categoryLabel} · {property.statusLabel}</p>
              <BookingDialog property={property}>
                <Button variant="gold" size="xl" className="mt-6 w-full">
                  <WhatsAppIcon /> Book Inspection / Reserve
                </Button>
              </BookingDialog>
              <Button asChild variant="goldOutline" size="pill" className="mt-3 w-full">
                <a href={property.interestUrl} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon /> Chat about this property
                </a>
              </Button>
              <div className="gold-rule my-6" />
              <div className="flex items-center gap-3">
                <img src={agent.photoSrc} alt={agent.name} className="h-12 w-12 rounded-full object-cover object-top" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-foreground">{agent.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{agent.agencyName}</p>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t glass pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="flex items-center justify-between gap-4 px-5 py-3">
          <p className="text-lg font-bold text-foreground">
            {property.priceLabel} <span className="text-sm font-normal text-muted-foreground">{property.priceUnit}</span>
          </p>
          <BookingDialog property={property}>
            <Button variant="gold" size="pill" className="shrink-0">
              <WhatsAppIcon /> Reserve
            </Button>
          </BookingDialog>
        </div>
      </div>
    </div>
  );
}
