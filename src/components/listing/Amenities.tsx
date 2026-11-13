import { BedDouble, Car, ShieldCheck, Waves, Wifi, Zap } from "lucide-react";
import { SectionHeading } from "./SectionHeading";

const amenities = [
  { icon: BedDouble, title: "3 En-Suite Bedrooms", text: "Private bathrooms, premium linen and walk-in wardrobes." },
  { icon: Zap, title: "24/7 Uninterrupted Power", text: "Grid, inverter and generator backup — zero blackouts." },
  { icon: Wifi, title: "High-Speed Starlink Internet", text: "Fast, reliable Wi-Fi for streaming and remote work." },
  { icon: ShieldCheck, title: "24/7 Armed Estate Security", text: "Gated estate, CCTV and round-the-clock patrols." },
  { icon: Waves, title: "Swimming Pool & Gym", text: "Infinity pool and fitted gym for guests only." },
  { icon: Car, title: "Dedicated Parking", text: "Secure on-site parking for up to three cars." },
];

export function Amenities() {
  return (
    <section id="amenities" className="px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow="Amenities & Specs" title={<>Built for <span className="italic text-gold">effortless</span> living.</>} />
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {amenities.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="group rounded-2xl border border-border bg-card-gradient p-6 transition-all duration-300 hover:-translate-y-1 hover:border-border-gold md:p-8"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-xl border border-border-gold bg-accent text-primary transition-shadow duration-300 group-hover:shadow-gold">
                <Icon className="h-5 w-5" strokeWidth={1.6} />
              </span>
              <h3 className="mt-6 text-lg font-semibold text-foreground">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
