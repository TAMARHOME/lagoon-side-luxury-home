import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AMENITIES, MAX_STATS, MAX_TESTIMONIALS, type AmenityKey, type AmenityText, type SiteSettings } from "@/lib/listing-content";
import { GOLD_HINT, Section, scopedErrors } from "./form-parts";
import { ShowToggle, TextField, type SetSite } from "./site-fields";

type Props = {
  site: SiteSettings;
  errors: Record<string, string>;
  setSite: SetSite;
  setAmenityText: (list: AmenityText[]) => void;
};

export function WebsiteTextPanel({ site, errors, setSite, setAmenityText }: Props) {
  const e = (prefix: string) => scopedErrors(errors, `${prefix}.`);
  const hero = e("hero");
  const catalog = e("catalog");
  const video = e("video");
  const gallery = e("gallery");
  const amen = e("amenities");
  const host = e("host");
  const { stats, testimonials } = site.host;

  const setStat = (i: number, patch: Partial<(typeof stats)[number]>) =>
    setSite("host", { stats: stats.map((s, j) => (j === i ? { ...s, ...patch } : s)) });
  const setReview = (i: number, patch: Partial<(typeof testimonials)[number]>) =>
    setSite("host", { testimonials: testimonials.map((t, j) => (j === i ? { ...t, ...patch } : t)) });

  return (
    <div className="grid gap-6">
      <Section n="01" title="Top of the page" description="The badge and buttons over the featured property photo, plus the phone bottom bar.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField id="hero-badge" label="Badge text" value={site.hero.badge} onChange={(badge) => setSite("hero", { badge })} error={hero["badge"]} hint="The property's area is added after it automatically" />
          <TextField id="hero-chat" label="Phone bottom-bar button" value={site.hero.chatLabel} onChange={(chatLabel) => setSite("hero", { chatLabel })} error={hero["chatLabel"]} />
          <TextField id="hero-book" label="Booking button" value={site.hero.bookLabel} onChange={(bookLabel) => setSite("hero", { bookLabel })} error={hero["bookLabel"]} />
          <TextField id="hero-details" label="Details button" value={site.hero.detailsLabel} onChange={(detailsLabel) => setSite("hero", { detailsLabel })} error={hero["detailsLabel"]} />
        </div>
        <p className="text-xs text-muted-foreground">The big title, price and photo come from the featured listing — edit them in the Listings tab.</p>
      </Section>

      <Section n="02" title="Properties section" description="The heading above your listings grid.">
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField id="cat-eyebrow" label="Small label" value={site.catalog.eyebrow} onChange={(eyebrow) => setSite("catalog", { eyebrow })} error={catalog["eyebrow"]} />
          <TextField id="cat-title" label="Heading" value={site.catalog.title} onChange={(title) => setSite("catalog", { title })} error={catalog["title"]} hint={GOLD_HINT} />
        </div>
        <TextField id="cat-intro" label="Intro text" rows={2} value={site.catalog.intro} onChange={(intro) => setSite("catalog", { intro })} error={catalog["intro"]} />
      </Section>

      <Section
        n="03"
        title="Video tour section"
        description="Plays the featured listing's video."
        action={<ShowToggle id="show-video" checked={site.video.show} onChange={(show) => setSite("video", { show })} />}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField id="vid-eyebrow" label="Small label" value={site.video.eyebrow} onChange={(eyebrow) => setSite("video", { eyebrow })} error={video["eyebrow"]} />
          <TextField id="vid-title" label="Heading" value={site.video.title} onChange={(title) => setSite("video", { title })} error={video["title"]} hint={GOLD_HINT} />
        </div>
        <TextField id="vid-caption" label="Caption under the video" rows={2} value={site.video.caption} onChange={(caption) => setSite("video", { caption })} error={video["caption"]} />
      </Section>

      <Section
        n="04"
        title="Photo gallery section"
        description="Shows the featured listing's gallery photos."
        action={<ShowToggle id="show-gallery" checked={site.gallery.show} onChange={(show) => setSite("gallery", { show })} />}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField id="gal-eyebrow" label="Small label" value={site.gallery.eyebrow} onChange={(eyebrow) => setSite("gallery", { eyebrow })} error={gallery["eyebrow"]} />
          <TextField id="gal-title" label="Heading" value={site.gallery.title} onChange={(title) => setSite("gallery", { title })} error={gallery["title"]} hint={GOLD_HINT} />
        </div>
        <TextField id="gal-intro" label="Intro text" value={site.gallery.intro} onChange={(intro) => setSite("gallery", { intro })} error={gallery["intro"]} />
      </Section>

      <Section
        n="05"
        title="Amenities section"
        description="Heading, plus the name and description of each amenity used on every listing."
        action={<ShowToggle id="show-amenities" checked={site.amenities.show} onChange={(show) => setSite("amenities", { show })} />}
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField id="am-eyebrow" label="Small label" value={site.amenities.eyebrow} onChange={(eyebrow) => setSite("amenities", { eyebrow })} error={amen["eyebrow"]} />
          <TextField id="am-title" label="Heading" value={site.amenities.title} onChange={(title) => setSite("amenities", { title })} error={amen["title"]} hint={GOLD_HINT} />
        </div>
        <AmenityWording list={site.amenityText} errors={scopedErrors(errors, "amenityText.")} onChange={setAmenityText} />
      </Section>

      <Section
        n="06"
        title="Host & reviews section"
        description="Agent card heading, badge, highlight numbers and guest reviews. The agent's name, photo and bio are in the Agent Profile tab."
        action={<ShowToggle id="show-host" checked={site.host.show} onChange={(show) => setSite("host", { show })} />}
      >
        <div className="grid gap-5 sm:grid-cols-3">
          <TextField id="host-eyebrow" label="Small label" value={site.host.eyebrow} onChange={(eyebrow) => setSite("host", { eyebrow })} error={host["eyebrow"]} />
          <TextField id="host-title" label="Heading" value={site.host.title} onChange={(title) => setSite("host", { title })} error={host["title"]} hint={GOLD_HINT} />
          <TextField id="host-badge" label="Gold badge" value={site.host.badge} onChange={(badge) => setSite("host", { badge })} error={host["badge"]} hint="Leave empty to hide it" />
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-foreground">Highlight numbers <span className="text-muted-foreground">({stats.length}/{MAX_STATS})</span></p>
            <Button variant="goldOutline" size="sm" className="rounded-full" disabled={stats.length >= MAX_STATS} onClick={() => setSite("host", { stats: [...stats, { value: "", label: "" }] })}>
              <Plus /> Add number
            </Button>
          </div>
          <div className="mt-3 grid gap-3">
            {stats.map((s, i) => (
              <div key={i} className="grid grid-cols-[6rem_minmax(0,1fr)_auto] items-start gap-2">
                <TextField id={`stat-v-${i}`} label="Number" value={s.value} placeholder="120+" onChange={(value) => setStat(i, { value })} error={host[`stats.${i}.value`]} />
                <TextField id={`stat-l-${i}`} label="Label" value={s.label} placeholder="Luxury stays hosted" onChange={(label) => setStat(i, { label })} error={host[`stats.${i}.label`]} />
                <RemoveButton label="Remove number" onClick={() => setSite("host", { stats: stats.filter((_, j) => j !== i) })} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-foreground">Guest reviews <span className="text-muted-foreground">({testimonials.length}/{MAX_TESTIMONIALS})</span></p>
            <Button
              variant="goldOutline"
              size="sm"
              className="rounded-full"
              disabled={testimonials.length >= MAX_TESTIMONIALS}
              onClick={() => setSite("host", { testimonials: [...testimonials, { quote: "", name: "", detail: "" }] })}
            >
              <Plus /> Add review
            </Button>
          </div>
          <div className="mt-3 grid gap-3">
            {testimonials.length === 0 && <p className="text-xs text-muted-foreground">No reviews — the agent card fills the full width.</p>}
            {testimonials.map((t, i) => (
              <div key={i} className="grid gap-3 rounded-2xl border border-border bg-background/60 p-4">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <TextField id={`rev-q-${i}`} label={`Review ${i + 1}`} rows={3} value={t.quote} onChange={(quote) => setReview(i, { quote })} error={host[`testimonials.${i}.quote`]} />
                  </div>
                  <RemoveButton label="Remove review" onClick={() => setSite("host", { testimonials: testimonials.filter((_, j) => j !== i) })} />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <TextField id={`rev-n-${i}`} label="Guest name" value={t.name} placeholder="Tunde A." onChange={(name) => setReview(i, { name })} error={host[`testimonials.${i}.name`]} />
                  <TextField id={`rev-d-${i}`} label="Stay details" value={t.detail} placeholder="Business stay • 5 nights" onChange={(detail) => setReview(i, { detail })} error={host[`testimonials.${i}.detail`]} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" className="mt-7 shrink-0 rounded-full text-muted-foreground hover:text-destructive" onClick={onClick} aria-label={label} title={label}>
      <Trash2 />
    </Button>
  );
}

function AmenityWording({ list, errors, onChange }: { list: AmenityText[]; errors: Record<string, string>; onChange: (list: AmenityText[]) => void }) {
  const update = (key: AmenityKey, patch: Partial<AmenityText>) => {
    const base = AMENITIES.find((a) => a.key === key)!;
    const current = list.find((a) => a.key === key) ?? { key, label: base.label, text: base.text };
    const next = { ...current, ...patch };
    const rest = list.filter((a) => a.key !== key);
    onChange(next.label === base.label && next.text === base.text ? rest : [...rest, next]);
  };
  return (
    <div>
      <p className="text-sm font-medium text-foreground">Amenity wording</p>
      <p className="mt-1 text-xs text-muted-foreground">Change how each amenity is named and described. Tick which ones a home has inside each listing.</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {AMENITIES.map((a) => {
          const idx = list.findIndex((x) => x.key === a.key);
          const own = idx >= 0 ? list[idx] : undefined;
          return (
            <div key={a.key} className="grid gap-2 rounded-2xl border border-border bg-background/60 p-4">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[0.65rem] uppercase tracking-[0.2em] text-primary">{own ? "Your wording" : "Standard wording"}</span>
                {own && (
                  <button type="button" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground" onClick={() => onChange(list.filter((x) => x.key !== a.key))}>
                    <RotateCcw className="h-3 w-3" /> Reset
                  </button>
                )}
              </div>
              <TextField id={`am-l-${a.key}`} label="Name" value={own?.label ?? a.label} onChange={(label) => update(a.key, { label })} error={idx >= 0 ? errors[`${idx}.label`] : undefined} />
              <TextField id={`am-t-${a.key}`} label="Description" rows={2} value={own?.text ?? a.text} onChange={(text) => update(a.key, { text })} error={idx >= 0 ? errors[`${idx}.text`] : undefined} />
            </div>
          );
        })}
      </div>
    </div>
  );
}
