import { useState } from "react";
import { Clock, MonitorPlay, Play, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { resolveVideoSource } from "@/lib/video-source";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "./WhatsAppIcon";

export type Orientation = "wide" | "vertical";

export function OrientationToggle({
  value,
  onChange,
  className,
}: {
  value: Orientation;
  onChange: (o: Orientation) => void;
  className?: string | undefined;
}) {
  return (
    <div role="group" aria-label="Video format" className={cn("inline-flex rounded-full border border-border bg-card p-1", className)}>
      {(
        [
          { id: "wide", label: "Widescreen", icon: MonitorPlay },
          { id: "vertical", label: "Reel", icon: Smartphone },
        ] as const
      ).map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          aria-pressed={value === id}
          onClick={() => onChange(id)}
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all",
            value === id ? "bg-gold text-primary-foreground" : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="h-4 w-4" /> {label}
        </button>
      ))}
    </div>
  );
}

type Props = {
  url: string;
  duration: string;
  orientation: Orientation;
  poster: string | null;
  title: string;
  whatsappUrl: string;
};

export function VideoPlayer({ url, duration, orientation, poster, title, whatsappUrl }: Props) {
  const source = resolveVideoSource(url);
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className={cn(
        "relative mx-auto overflow-hidden rounded-3xl border border-border bg-card shadow-card transition-all duration-500",
        orientation === "wide" ? "aspect-video w-full" : "aspect-[9/16] w-full max-w-sm",
      )}
    >
      {playing && source.kind === "file" && (
        <video src={source.src} poster={poster ?? undefined} controls autoPlay playsInline className="absolute inset-0 h-full w-full bg-overlay object-contain" />
      )}

      {playing && source.kind === "embed" && (
        <iframe
          src={source.src}
          title={`${title} video tour`}
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
          <p className="max-w-md font-display text-2xl text-foreground md:text-3xl">Request a private live video walkthrough with our host.</p>
          <Button asChild variant="gold" size="pill">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon /> Request on WhatsApp
            </a>
          </Button>
        </div>
      )}

      {!playing && (
        <button type="button" onClick={() => setPlaying(true)} aria-label={`Play ${title} video tour`} className="group absolute inset-0 block h-full w-full">
          {poster && (
            <img
              src={poster}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.5s] group-hover:scale-105"
            />
          )}
          <span className="absolute inset-0 bg-overlay/35" />
          {duration && (
            <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full glass border px-3 py-1.5 text-xs font-medium text-foreground md:left-6 md:top-6">
              <Clock className="h-3.5 w-3.5 text-primary" /> {duration}
            </span>
          )}
          <span className="absolute left-1/2 top-1/2 flex h-20 w-20 -translate-x-1/2 -translate-y-1/2 animate-pulse-gold items-center justify-center rounded-full bg-gold text-primary-foreground transition-transform duration-300 group-hover:scale-110 md:h-24 md:w-24">
            <Play className="ml-1 h-8 w-8 fill-current md:h-9 md:w-9" />
          </span>
        </button>
      )}
    </div>
  );
}
