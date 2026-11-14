import { ArrowLeft, Building2, KeyRound, MonitorPlay, Plus, Smartphone, Star, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PropertyCard } from "@/components/listing/PropertyCard";
import { WhatsAppIcon } from "@/components/listing/WhatsAppIcon";
import { resolveProperty } from "@/lib/listing-assets";
import { AMENITIES, MAX_GALLERY, MAX_LANDMARKS, STATUS_LABELS, type AmenityKey, type Property, type PropertyStatus } from "@/lib/listing-content";
import { resolveVideoSource } from "@/lib/video-source";
import { cn } from "@/lib/utils";
import { Field, Section, Segmented } from "./form-parts";
import { PhotoField } from "./PhotoField";

const PROVIDER_NAMES = { youtube: "YouTube video", instagram: "Instagram Reel", tiktok: "TikTok video" } as const;
const STATUS_OPTIONS = (Object.keys(STATUS_LABELS) as PropertyStatus[]).map((id) => ({ id, label: STATUS_LABELS[id] }));

type Props = {
  property: Property;
  isNew: boolean;
  /** Validation messages keyed by field path within this property, e.g. "title", "gallery.0.url". */
  errors: Record<string, string>;
  whatsappNumber: string;
  isFeatured: boolean;
  canDelete: boolean;
  onChange: (patch: Partial<Property>) => void;
  onFeature: () => void;
  onDelete: () => void;
  onBack: () => void;
};

export function PropertyEditor({ property: p, isNew, errors, whatsappNumber, isFeatured, canDelete, onChange, onFeature, onDelete, onBack }: Props) {
  const setVideo = (patch: Partial<Property["video"]>) => onChange({ video: { ...p.video, ...patch } });
  const fid = (name: string) => `${p.id}-${name}`;

  const source = resolveVideoSource(p.video.url);
  const videoHint = !p.video.url.trim()
    ? "No video yet — visitors see a “Request a live video walkthrough” card."
    : source.kind === "file"
      ? "Detected: direct video file"
      : source.kind === "embed"
        ? `Detected: ${PROVIDER_NAMES[source.provider]}`
        : null;

  const toggleAmenity = (key: AmenityKey, on: boolean) =>
    onChange({ amenities: on ? AMENITIES.map((a) => a.key).filter((k) => k === key || p.amenities.includes(k)) : p.amenities.filter((k) => k !== key) });

  const preview = resolveProperty(p, whatsappNumber);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" className="rounded-full text-muted-foreground" onClick={onBack}>
          <ArrowLeft /> All properties
        </Button>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant={isFeatured ? "gold" : "goldOutline"} size="sm" className="rounded-full" onClick={onFeature} disabled={isFeatured}>
            <Star className={cn(isFeatured && "fill-current")} /> {isFeatured ? "Featured at the top" : "Feature at the top"}
          </Button>
          <Button variant="ghost" size="sm" className="rounded-full text-destructive hover:text-destructive" onClick={onDelete} disabled={!canDelete}>
            <Trash2 /> Delete
          </Button>
        </div>
      </div>

      <h2 className="mt-6 font-display text-4xl text-foreground md:text-5xl">
        {isNew ? "Add a new property" : <>Edit <span className="italic text-gold">{preview.plainTitle || "property"}</span></>}
      </h2>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="grid gap-6">
          <Section n="01" title="Basics" description="Title, location, price and the badge shown on the card.">
            <Field id={fid("title")} label="Property title" error={errors["title"]} hint="Wrap a word in *stars* to show it in gold italics, e.g. Luxury *Waterfront* Duplex">
              <Input id={fid("title")} value={p.title} onChange={(e) => onChange({ title: e.target.value })} />
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Field id={fid("location")} label="Location" error={errors["location"]} hint="Area first, e.g. Lekki Phase 1, Lagos (used for the area filter)">
                <Input id={fid("location")} value={p.location} onChange={(e) => onChange({ location: e.target.value })} />
              </Field>
              <Field id={fid("price")} label="Price" error={errors["price"]} hint="e.g. ₦150,000 / night, or ₦250,000,000 for a sale">
                <Input id={fid("price")} value={p.price} onChange={(e) => onChange({ price: e.target.value })} />
              </Field>
            </div>
            <div className="flex flex-wrap gap-6">
              <Segmented
                label="Type"
                value={p.category}
                onChange={(category) => onChange({ category })}
                options={[
                  { id: "short-let", label: "Short-Let", icon: KeyRound },
                  { id: "sale", label: "For Sale", icon: Building2 },
                ]}
              />
              <Segmented label="Status badge" value={p.status} onChange={(status) => onChange({ status })} options={STATUS_OPTIONS} />
            </div>
          </Section>

          <Section n="02" title="Walkthrough video" description="Paste a YouTube, Instagram Reel, TikTok or direct MP4 link.">
            <Field id={fid("video")} label="Video link" error={errors["video.url"]}>
              <Input
                id={fid("video")}
                placeholder="https://www.youtube.com/watch?v=…"
                value={p.video.url}
                onChange={(e) => {
                  const url = e.target.value;
                  const s = resolveVideoSource(url);
                  setVideo(s.kind === "embed" ? { url, orientation: s.vertical ? "vertical" : "wide" } : { url });
                }}
              />
              <p className={cn("mt-2 text-xs", videoHint ? "text-primary" : "text-destructive")}>
                {videoHint ?? "This link isn't recognised. Use a YouTube, Instagram, TikTok or .mp4 link."}
              </p>
            </Field>
            <div className="grid gap-5 sm:grid-cols-2">
              <Segmented
                label="Display mode"
                value={p.video.orientation}
                onChange={(orientation) => setVideo({ orientation })}
                options={[
                  { id: "wide", label: "Widescreen", icon: MonitorPlay },
                  { id: "vertical", label: "Reel", icon: Smartphone },
                ]}
              />
              <Field id={fid("duration")} label="Duration badge" error={errors["video.duration"]}>
                <Input id={fid("duration")} placeholder="01:45 HD Tour" value={p.video.duration} onChange={(e) => setVideo({ duration: e.target.value })} />
              </Field>
            </div>
          </Section>

          <Section n="03" title="Photos" description={`A cover photo plus up to ${MAX_GALLERY} gallery photos. Upload from your phone or paste an image link.`}>
            <PhotoField
              kind="property"
              label="Cover photo"
              value={p.cover || null}
              onChange={(cover) => onChange({ cover })}
              error={errors["cover"]}
              aspect="aspect-[16/9]"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {p.gallery.map((g, i) => (
                <div key={`${i}-${g.url}`} className="grid gap-2">
                  <PhotoField
                    kind="property"
                    label={g.label || `Photo ${i + 1}`}
                    value={g.url}
                    onChange={(url) => onChange({ gallery: p.gallery.map((x, j) => (j === i ? { ...x, url } : x)) })}
                    onClear={() => onChange({ gallery: p.gallery.filter((_, j) => j !== i) })}
                    error={errors[`gallery.${i}.url`]}
                  />
                  <Input
                    aria-label={`Photo ${i + 1} caption`}
                    placeholder="Caption, e.g. Living Room"
                    value={g.label}
                    maxLength={40}
                    onChange={(e) => onChange({ gallery: p.gallery.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)) })}
                  />
                </div>
              ))}
              {p.gallery.length < MAX_GALLERY && (
                <PhotoField
                  key={`add-${p.gallery.length}`}
                  kind="property"
                  label="Add gallery photo"
                  value={null}
                  onChange={(url) => onChange({ gallery: [...p.gallery, { url, label: "" }] })}
                />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {p.gallery.length} / {MAX_GALLERY} gallery photos
            </p>
          </Section>

          <Section n="04" title="Amenities & description" description="Tick everything this home offers.">
            <div className="grid gap-2 sm:grid-cols-2">
              {AMENITIES.map((a) => {
                const checked = p.amenities.includes(a.key);
                return (
                  <label
                    key={a.key}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
                      checked ? "border-border-gold bg-accent/50 text-foreground" : "border-border text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <Checkbox checked={checked} onCheckedChange={(v) => toggleAmenity(a.key, v === true)} />
                    {a.label}
                  </label>
                );
              })}
            </div>
            <Field id={fid("description")} label="Description" error={errors["description"]}>
              <Textarea id={fid("description")} rows={4} value={p.description} onChange={(e) => onChange({ description: e.target.value })} />
            </Field>
          </Section>

          <Section n="05" title="Nearby landmarks" description="Optional gold tags on the card, e.g. 5 mins from Admiralty Way.">
            {p.landmarks.map((l, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  aria-label={`Landmark ${i + 1}`}
                  placeholder="5 mins from Admiralty Way"
                  value={l}
                  maxLength={60}
                  onChange={(e) => onChange({ landmarks: p.landmarks.map((x, j) => (j === i ? e.target.value : x)) })}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="shrink-0 rounded-full text-muted-foreground"
                  aria-label={`Remove landmark ${i + 1}`}
                  onClick={() => onChange({ landmarks: p.landmarks.filter((_, j) => j !== i) })}
                >
                  <X />
                </Button>
              </div>
            ))}
            {errors["landmarks"] && <p className="text-xs text-destructive">{errors["landmarks"]}</p>}
            {p.landmarks.length < MAX_LANDMARKS && (
              <Button type="button" variant="goldOutline" size="sm" className="w-fit rounded-full" onClick={() => onChange({ landmarks: [...p.landmarks, ""] })}>
                <Plus /> Add landmark
              </Button>
            )}
          </Section>
        </div>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-3xl border border-border-gold bg-card p-4">
            <div className="flex items-center justify-between px-1 pb-3">
              <p className="eyebrow">Card preview</p>
              <span className="text-[0.65rem] text-muted-foreground">Updates as you type</span>
            </div>
            <div className="pointer-events-none">
              <PropertyCard property={preview} onView={() => {}} />
            </div>
            <a
              href={preview.interestUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 flex items-center justify-center gap-2 rounded-full border border-border-gold px-4 py-2.5 text-xs font-semibold text-primary transition-colors hover:bg-accent"
            >
              <WhatsAppIcon className="h-3.5 w-3.5" /> Test this property's WhatsApp message
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
