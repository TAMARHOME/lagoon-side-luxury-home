import { Button } from "@/components/ui/button";
import { useSite } from "./ListingContext";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function Footer() {
  const { agent, properties } = useSite();
  const areas = [...new Set(properties.map((p) => p.shortLocation))].slice(0, 3);
  return (
    <footer className="px-5 pb-32 pt-10 md:px-10 md:pb-12">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-border-gold bg-card-gradient p-8 text-center md:p-16">
          <p className="eyebrow">Limited Availability</p>
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl leading-tight text-foreground md:text-6xl">
            Find your next address in <span className="italic text-gold">Lagos.</span>
          </h2>
          <p className="mt-4 text-muted-foreground">
            {properties.length} handpicked {properties.length === 1 ? "home" : "homes"} · Instant replies on WhatsApp
          </p>
          <Button asChild variant="gold" size="xl" className="mt-8">
            <a href={agent.enquiryUrl} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon /> Chat on WhatsApp
            </a>
          </Button>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground md:flex-row">
          <span className="font-display text-lg text-foreground">{agent.agencyName}</span>
          <span>{areas.join(" · ")} · Lagos, Nigeria</span>
          <span>© {new Date().getFullYear()} {agent.agencyName}. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
