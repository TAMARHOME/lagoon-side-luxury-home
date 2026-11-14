import { AMENITY_ICONS } from "./amenity-icons";
import { useSite } from "./ListingContext";
import { SectionHeading } from "./SectionHeading";

/** Amenities of the featured property. */
export function Amenities() {
  const { featured } = useSite();
  if (featured.amenityList.length === 0) return null;
  return (
    <section id="amenities" className="px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="Amenities & Specs" title={<>Built for <span className="italic text-gold">effortless</span> living.</>} />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featured.amenityList.map(({ key, label, text }) => {
            const Icon = AMENITY_ICONS[key];
            return (
              <div key={key} className="group rounded-2xl border border-border bg-card-gradient p-6 transition-all duration-300 hover:-translate-y-1 hover:border-border-gold md:p-8">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-border-gold bg-accent text-primary transition-shadow duration-300 group-hover:shadow-gold">
                  <Icon className="h-5 w-5" strokeWidth={1.6} />
                </span>
                <h3 className="mt-6 text-lg font-semibold text-foreground">{label}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
