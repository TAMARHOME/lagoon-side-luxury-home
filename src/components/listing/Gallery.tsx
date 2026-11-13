import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ImageSlot } from "@/lib/listing-content";
import { useListing } from "./ListingContext";
import { SectionHeading } from "./SectionHeading";

const PHOTO_SLOTS: { slot: ImageSlot; w: number; h: number; label: string; alt: string; cls: string }[] = [
  { slot: "living", w: 1280, h: 960, label: "Living Room", alt: "Double-height living room with lagoon view", cls: "col-span-2 aspect-[4/3] md:aspect-auto md:col-span-2 md:row-span-2" },
  { slot: "bedroom", w: 1024, h: 1280, label: "Master Bedroom", alt: "Master bedroom with king bed and city view", cls: "row-span-2 md:row-span-2" },
  { slot: "kitchen", w: 1280, h: 960, label: "Fitted Kitchen", alt: "Black fitted kitchen with marble island", cls: "aspect-square md:aspect-auto" },
  { slot: "pool", w: 1280, h: 960, label: "Swimming Pool", alt: "Infinity pool at sunset overlooking the lagoon", cls: "aspect-square md:aspect-auto" },
];

export function Gallery() {
  const { imageSrc } = useListing();
  const photos = PHOTO_SLOTS.map((p) => ({ ...p, src: imageSrc[p.slot] }));
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (d: number) => setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length)),
    [photos.length],
  );

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, close, step]);

  const current = open === null ? undefined : photos[open];

  return (
    <section id="gallery" className="px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="The Residence" title={<>Every room, <span className="italic text-gold">curated.</span></>}>
          Tap any photo to view it full-screen.
        </SectionHeading>

        <div className="mt-12 grid grid-cols-2 gap-3 md:h-[640px] md:grid-cols-4 md:grid-rows-2 md:gap-4">
          {photos.map((p, i) => (
            <button
              key={p.label}
              type="button"
              onClick={() => setOpen(i)}
              className={cn("group relative overflow-hidden rounded-2xl border border-border bg-card", p.cls)}
              aria-label={`View ${p.label} full-screen`}
            >
              <img
                src={p.src}
                alt={p.alt}
                loading="lazy"
                width={p.w}
                height={p.h}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105"
              />
              <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-overlay/85 to-transparent" />
              <span className="absolute bottom-3 left-3 right-3 flex items-center justify-between md:bottom-5 md:left-5 md:right-5">
                <span className="font-display text-lg text-foreground md:text-2xl">{p.label}</span>
                <span className="flex h-8 w-8 items-center justify-center rounded-full glass border text-primary opacity-90 transition-opacity md:opacity-0 md:group-hover:opacity-100">
                  <Expand className="h-3.5 w-3.5" />
                </span>
              </span>
            </button>
          ))}
        </div>
      </div>

      {open !== null && current && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={current.label}
          className="fixed inset-0 z-[60] flex animate-in fade-in items-center justify-center bg-overlay/95 backdrop-blur-sm duration-300"
          onClick={close}
        >
          <img
            src={current.src}
            alt={current.alt}
            className="max-h-[82vh] max-w-[94vw] rounded-xl object-contain shadow-card"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
            <span className="eyebrow">
              {String(open + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")} · {current.label}
            </span>
            <button type="button" onClick={close} aria-label="Close" className="rounded-full border border-border bg-card p-3 text-foreground transition-colors hover:border-border-gold hover:text-primary">
              <X className="h-5 w-5" />
            </button>
          </div>
          {[-1, 1].map((d) => (
            <button
              key={d}
              type="button"
              aria-label={d < 0 ? "Previous photo" : "Next photo"}
              onClick={(e) => {
                e.stopPropagation();
                step(d);
              }}
              className={cn(
                "absolute bottom-8 rounded-full border border-border bg-card p-3 text-foreground transition-colors hover:border-border-gold hover:text-primary md:bottom-auto md:top-1/2 md:-translate-y-1/2",
                d < 0 ? "left-[calc(50%-4rem)] md:left-6" : "right-[calc(50%-4rem)] md:right-6",
              )}
            >
              {d < 0 ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
