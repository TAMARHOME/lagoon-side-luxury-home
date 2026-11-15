import type { Agent, SiteSettings } from "@/lib/listing-content";
import { GOLD_HINT, Section, scopedErrors } from "./form-parts";
import { TextField, type SetSite } from "./site-fields";

export function BrandPanel({ site, agent, errors, setSite }: { site: SiteSettings; agent: Agent; errors: Record<string, string>; setSite: SetSite }) {
  const brand = scopedErrors(errors, "brand.");
  const footer = scopedErrors(errors, "footer.");
  const seo = scopedErrors(errors, "seo.");
  const year = new Date().getFullYear();
  return (
    <div className="grid gap-6">
      <Section n="01" title="Website name" description="Shown in the top-left corner of the website and at the bottom of the footer.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField id="brand-name" label="Website name" value={site.brand.name} onChange={(name) => setSite("brand", { name })} error={brand["name"]} />
          <TextField id="brand-tag" label="Small gold word beside it" value={site.brand.tagline} onChange={(tagline) => setSite("brand", { tagline })} error={brand["tagline"]} hint="e.g. Lagos — leave empty to hide" />
        </div>
        <div className="flex items-baseline gap-2 rounded-2xl border border-border bg-background/60 px-5 py-4">
          <span className="font-display text-2xl font-semibold text-foreground">{site.brand.name || "Website name"}</span>
          {site.brand.tagline && <span className="text-[0.65rem] uppercase tracking-[0.3em] text-primary">{site.brand.tagline}</span>}
        </div>
      </Section>

      <Section n="02" title="Footer" description="The closing call-to-action box and the bottom line of the website.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField id="ft-eyebrow" label="Small label" value={site.footer.eyebrow} onChange={(eyebrow) => setSite("footer", { eyebrow })} error={footer["eyebrow"]} />
          <TextField id="ft-title" label="Heading" value={site.footer.title} onChange={(title) => setSite("footer", { title })} error={footer["title"]} hint={GOLD_HINT} />
          <TextField id="ft-sub" label="Line under the heading" value={site.footer.subline} onChange={(subline) => setSite("footer", { subline })} error={footer["subline"]} hint="Your number of homes is shown before it automatically" />
          <TextField id="ft-cta" label="Button text" value={site.footer.ctaLabel} onChange={(ctaLabel) => setSite("footer", { ctaLabel })} error={footer["ctaLabel"]} />
        </div>
        <div className="gold-rule" />
        <TextField
          id="ft-loc"
          label="Footer location"
          value={site.brand.footerLocation}
          onChange={(footerLocation) => setSite("brand", { footerLocation })}
          error={brand["footerLocation"]}
          hint="e.g. Lekki · Victoria Island · Ikoyi · Lagos, Nigeria — leave empty to hide"
        />
        <TextField
          id="ft-copy"
          label="Copyright line"
          value={site.brand.copyright}
          placeholder={`© ${year} ${agent.agencyName}. All rights reserved.`}
          onChange={(copyright) => setSite("brand", { copyright })}
          error={brand["copyright"]}
          hint="Leave empty to use the standard line with your agency name and the current year"
        />
      </Section>

      <Section n="03" title="WhatsApp & Google" description="The general WhatsApp greeting, and how your website appears in Google and link previews.">
        <TextField
          id="enquiry"
          label="General WhatsApp greeting"
          value={site.brand.enquiryMessage}
          onChange={(enquiryMessage) => setSite("brand", { enquiryMessage })}
          error={brand["enquiryMessage"]}
          hint="Pre-filled when visitors tap “Message” on the host card or the footer button. Property buttons name the property automatically."
        />
        <TextField id="seo-title" label="Page title in Google" value={site.seo.title} onChange={(title) => setSite("seo", { title })} error={seo["title"]} hint="Leave empty to use the featured property and website name automatically" />
        <TextField
          id="seo-desc"
          label="Google description"
          rows={2}
          value={site.seo.description}
          onChange={(description) => setSite("seo", { description })}
          error={seo["description"]}
          hint="Leave empty to describe your listings automatically"
        />
      </Section>
    </div>
  );
}
