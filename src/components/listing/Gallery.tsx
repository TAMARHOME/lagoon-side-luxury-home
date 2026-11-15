import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSite } from "./ListingContext";
import { SectionHeading } from "./SectionHeading";

/** Photo gallery of the featured property, with a full-screen lightbox. */
export function Gallery() {
  const { featured, site } = useSite();
  const photos = featured.photos;
  const [open, setOpen] = useState<number | null>(null);
  const close = useCallback(() => setOpen(null), []);
  const step = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length)), [photos.length]);

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

  if (photos.length === 0 || !site.gallery.show) return null;
  const current = open === null ? undefined : photos[open];

  return (
    <section id="gallery" className="px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow={site.gallery.eyebrow} title={site.gallery.title}>
          {site.gallery.intro}
        </SectionHeading>

        <div className="mt-12 grid grid-cols-2 gap-3 md:auto-rows-[230px] md:grid-cols-4 md:gap-4">
          {photos.map((p, i) => (
            <button
              key={`${p.src}-${i}`}
              type="button"
              onClick={() => setOpen(i)}
              className={cn(
                "group relative overflow-hidden rounded-2xl border border-border bg-card",
                i === 0 ? "col-span-2 aspect-[4/3] md:row-span-2 md:aspect-auto" : "aspect-square md:aspect-auto",
                photos.length === 1 && "md:col-span-4",
                photos.length === 4 && i === 1 && "row-span-2 aspect-auto md:row-span-2",
              )}
              aria-label={`View ${p.label || "photo"} full-screen`}
            >
              <img src={p.src} alt={p.label || featured.plainTitle} loading="lazy" className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1.2s] ease-out group-hover:scale-105" />
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
        <div role="dialog" aria-modal="true" aria-label={current.label} className="fixed inset-0 z-[60] flex animate-in fade-in items-center justify-center bg-overlay/95 backdrop-blur-sm duration-300" onClick={close}>
          <img src={current.src} alt={current.label} className="max-h-[82vh] max-w-[94vw] rounded-xl object-contain shadow-card" onClick={(e) => e.stopPropagation()} />
          <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
            <span className="eyebrow">
              {String(open + 1).padStart(2, "0")} / {String(photos.length).padStart(2, "0")} · {current.label}
            </span>
            <button type="button" onClick={close} aria-label="Close" className="rounded-full border border-border bg-card p-3 text-foreground transition-colors hover:border-border-gold hover:text-primary">
              <X className="h-5 w-5" />
            </button>
          </div>
          {photos.length > 1 &&
            [-1, 1].map((d) => (
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
