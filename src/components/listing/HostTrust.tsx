import { BadgeCheck, Quote, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSite } from "./ListingContext";
import { SectionHeading } from "./SectionHeading";
import { WhatsAppIcon } from "./WhatsAppIcon";

function Stars() {
  return (
    <div className="flex gap-1 text-primary" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star key={i} className="h-4 w-4 fill-current" />
      ))}
    </div>
  );
}

export function HostTrust() {
  const { agent, site } = useSite();
  const { stats, testimonials, badge } = site.host;
  if (!site.host.show) return null;
  const roleLine = [agent.name, agent.role].filter(Boolean).join(" · ");
  return (
    <section id="host" className="px-5 py-20 md:px-10 md:py-28">
      <div className="mx-auto max-w-7xl">
        <SectionHeading eyebrow={site.host.eyebrow} title={site.host.title} />

        <div className="mt-12 grid gap-4 lg:grid-cols-5">
          <div className={cn("overflow-hidden rounded-3xl border border-border bg-card-gradient shadow-card", testimonials.length > 0 ? "lg:col-span-3" : "lg:col-span-5")}>
            <div className="grid sm:grid-cols-5">
              <div className="relative aspect-[4/5] sm:col-span-2 sm:aspect-auto">
                <img src={agent.photoSrc} alt={roleLine} loading="lazy" width={768} height={960} className="absolute inset-0 h-full w-full object-cover object-top" />
              </div>
              <div className="flex flex-col justify-between gap-8 p-6 sm:col-span-3 md:p-10">
                <div>
                  {badge && (
                    <span className="mb-5 inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-primary-foreground">
                      <BadgeCheck className="h-3.5 w-3.5" /> {badge}
                    </span>
                  )}
                  <h3 className=" font-display text-3xl text-foreground md:text-4xl">{agent.agencyName}</h3>
                  <p className="mt-1 text-sm text-primary">
                    {roleLine}
                  </p>
                  <p className="mt-4 leading-relaxed text-muted-foreground">{agent.bio}</p>
                </div>
                <div>
                  <div className="gold-rule" />
                  {stats.length > 0 && <dl className={cn("mt-6 grid gap-4", stats.length === 4 ? "grid-cols-2 sm:grid-cols-4" : stats.length === 3 ? "grid-cols-3" : "grid-cols-2")}>
                    {stats.map((s, i) => (
                      <div key={`${i}-${s.label}`}>
                        <dt className="sr-only">{s.label}</dt>
                        <dd className="font-display text-3xl text-gold">{s.value}</dd>
                        <dd className="mt-1 text-xs text-muted-foreground">{s.label}</dd>
                      </div>
                    ))}
                  </dl>}
                  <Button asChild variant="goldOutline" size="pill" className="mt-8">
                    <a href={agent.enquiryUrl} target="_blank" rel="noopener noreferrer">
                      <WhatsAppIcon /> Message {agent.firstName}
                    </a>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {testimonials.length > 0 && <div className="grid gap-4 lg:col-span-2">
            {testimonials.map((t, i) => (
              <figure key={`${i}-${t.name}`} className="relative flex flex-col justify-between rounded-3xl border border-border bg-card p-6 md:p-8">
                <Quote className="absolute right-6 top-6 h-8 w-8 text-primary/25" />
                <div>
                  <Stars />
                  <blockquote className="mt-5 font-display text-xl leading-snug text-foreground md:text-[1.35rem]">
                    “{t.quote}”
                  </blockquote>
                </div>
                <figcaption className="mt-6 flex items-center gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full border border-border-gold bg-accent font-display text-lg text-primary">
                    {t.name[0]}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-foreground">{t.name}</span>
                    <span className="block text-xs text-muted-foreground">{t.detail}</span>
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>}
        </div>
      </div>
    </section>
  );
}
