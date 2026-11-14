import { useState } from "react";
import { filterProperties, listAreas, type CategoryFilter } from "@/lib/listing-content";
import { cn } from "@/lib/utils";
import { useSite } from "./ListingContext";
import { PropertyCard } from "./PropertyCard";
import { SectionHeading } from "./SectionHeading";

const CATEGORY_PILLS: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All Properties" },
  { id: "short-let", label: "Short-Lets" },
  { id: "sale", label: "For Sale" },
];

function Pill({ active, onClick, children, small }: { active: boolean; onClick: () => void; children: React.ReactNode; small?: boolean }) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "whitespace-nowrap rounded-full border font-medium transition-all",
        small ? "px-3.5 py-1.5 text-xs" : "px-5 py-2.5 text-sm",
        active ? "border-transparent bg-gold text-primary-foreground shadow-gold" : "border-border text-muted-foreground hover:border-border-gold hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}

export function PropertiesCatalog() {
  const { properties, openProperty } = useSite();
  const [category, setCategory] = useState<CategoryFilter>("all");
  const [area, setArea] = useState<string | null>(null);
  const areas = listAreas(properties);
  const shown = filterProperties(properties, { category, area });

  return (
    <section id="properties" className="px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="The Collection" title={<>Available Properties <span className="italic text-gold">&amp; Short-Lets</span></>}>
          Handpicked residences across Lagos. Tap any home for photos, a video walkthrough and instant booking.
        </SectionHeading>

        <div className="mt-10 flex gap-2 overflow-x-auto pb-1">
          {CATEGORY_PILLS.map((c) => (
            <Pill key={c.id} active={category === c.id} onClick={() => setCategory(c.id)}>
              {c.label} <span className="ml-1 opacity-70">{filterProperties(properties, { category: c.id, area }).length}</span>
            </Pill>
          ))}
        </div>
        {areas.length > 1 && (
          <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
            <span className="shrink-0 text-xs text-muted-foreground">Area</span>
            <Pill small active={area === null} onClick={() => setArea(null)}>All areas</Pill>
            {areas.map((a) => (
              <Pill small key={a} active={area === a} onClick={() => setArea(a)}>{a}</Pill>
            ))}
          </div>
        )}

        {shown.length > 0 ? (
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {shown.map((p) => (
              <PropertyCard key={p.id} property={p} onView={() => openProperty(p.id)} />
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-3xl border border-border bg-card p-10 text-center">
            <p className="font-display text-2xl text-foreground">No properties match this filter yet.</p>
            <button type="button" className="mt-4 text-sm text-primary underline-offset-4 hover:underline" onClick={() => { setCategory("all"); setArea(null); }}>
              Show all properties
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
