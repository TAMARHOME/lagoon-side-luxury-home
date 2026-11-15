import { Button } from "@/components/ui/button";
import { useSite } from "./ListingContext";
import { GoldText } from "./GoldText";
import { WhatsAppIcon } from "./WhatsAppIcon";

export function Footer() {
  const { agent, properties, site } = useSite();
  const { brand, footer } = site;
  const count = `${properties.length} handpicked ${properties.length === 1 ? "home" : "homes"}`;
  return (
    <footer className="px-5 pb-32 pt-10 md:px-10 md:pb-12">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-3xl border border-border-gold bg-card-gradient p-8 text-center md:p-16">
          {footer.eyebrow && <p className="eyebrow">{footer.eyebrow}</p>}
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-4xl leading-tight text-foreground md:text-6xl">
            <GoldText text={footer.title} />
          </h2>
          <p className="mt-4 text-muted-foreground">
            {footer.subline ? `${count} · ${footer.subline}` : count}
          </p>
          <Button asChild variant="gold" size="xl" className="mt-8">
            <a href={agent.enquiryUrl} target="_blank" rel="noopener noreferrer">
              <WhatsAppIcon /> {footer.ctaLabel}
            </a>
          </Button>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-xs text-muted-foreground md:flex-row">
          <span className="font-display text-lg text-foreground">{brand.name}</span>
          {brand.footerLocation && <span className="text-center">{brand.footerLocation}</span>}
          <span className="text-center">{brand.copyright || `© ${new Date().getFullYear()} ${agent.agencyName}. All rights reserved.`}</span>
        </div>
      </div>
    </footer>
  );
}
