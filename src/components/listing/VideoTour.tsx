import { useState } from "react";
import { Clock, MonitorPlay, Play, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { listing } from "@/config/listing";
import { resolveVideoSource } from "@/lib/video-source";
import { cn } from "@/lib/utils";
import poster from "@/assets/video-poster.jpg";
import { SectionHeading } from "./SectionHeading";
import { WhatsAppIcon } from "./WhatsAppIcon";

type Orientation = "wide" | "vertical";

export function VideoTour() {
  const source = resolveVideoSource(listing.videoTour.url);
  const [orientation, setOrientation] = useState<Orientation>(
    source.kind === "embed" && source.vertical ? "vertical" : "wide",
  );
  const [playing, setPlaying] = useState(false);

  return (
    <section id="tour" className="relative px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            eyebrow="Virtual Viewing"
            title={
              <>
                Property Walkthrough <span className="italic text-gold">&amp; Video Tour</span>
              </>
            }
          />
          <div
            role="group"
            aria-label="Video format"
            className="inline-flex self-start rounded-full border border-border bg-card p-1 md:self-auto"
          >
            {(
              [
                { id: "wide", label: "Widescreen", icon: MonitorPlay },
                { id: "vertical", label: "Reel", icon: Smartphone },
              ] as const
            ).map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                type="button"
                aria-pressed={orientation === id}
                onClick={() => setOrientation(id)}
                className={cn(
                  "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all",
                  orientation === id
                    ? "bg-gold text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" /> {label}
              </button>
            ))}
          </div>
        </div>

        <div
          className={cn(
            "relative mx-auto mt-12 overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-all duration-500",
            orientation === "wide" ? "aspect-video w-full" : "aspect-[9/16] w-full max-w-sm",
          )}
        >
          {playing && source.kind === "file" && (
            <video
              src={source.src}
              poster={poster}
              controls
              autoPlay
              playsInline
              className="absolute inset-0 h-full w-full bg-overlay object-contain"
            />
          )}

          {playing && source.kind === "embed" && (
            <iframe
              src={source.src}
              title="Property video tour"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
              className="absolute inset-0 h-full w-full"
            />
          )}

          {playing && source.kind === "none" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-5 bg-overlay/95 p-6 text-center">
              <button
                type="button"
                onClick={() => setPlaying(false)}
                aria-label="Close"
                className="absolute right-4 top-4 rounded-full border border-border p-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
              <p className="eyebrow">Tour premiering soon</p>
              <p className="max-w-md font-display text-2xl text-foreground md:text-3xl">
                Request a private live video walkthrough with our host.
              </p>
              <Button asChild variant="gold" size="pill">
                <a href={listing.whatsappUrl} target="_blank" rel="noopener noreferrer">
                  <WhatsAppIcon /> Request on WhatsApp
                </a>
              </Button>
            </div>
          )}

          {!playing && (
            <button
              type="button"
              onClick={() => setPlaying(true)}
              aria-label="Play video tour"
              className="group absolute inset-0 block h-full w-full"
            >
              <img
                src={poster}
                alt="Grand foyer with floating staircase and gold lighting"
                loading="lazy"
                width={1920}
                height={1088}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
              />
              <span className="absolute inset-0 bg-overlay/35" />
              <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full glass border px-3 py-1.5 text-xs font-medium text-foreground md:left-6 md:top-6">
                <Clock className="h-3.5 w-3.5 text-primary" /> {listing.videoTour.duration}
              </span>
              <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 animate-pulse-gold items-center justify-center rounded-full bg-gold text-primary-foreground transition-transform duration-300 group-hover:scale-110 md:h-24 md:w-24">
                <Play className="ml-1 h-8 w-8 fill-current md:h-9 md:w-9" />
              </span>
            </button>
          )}
        </div>

        <p className="mx-auto mt-6 max-w-xl text-center text-sm leading-relaxed text-muted-foreground md:text-base">
          {listing.videoTour.caption}
        </p>
      </div>
    </section>
  );
}
