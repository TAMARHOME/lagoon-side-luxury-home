import { Fragment, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, ExternalLink, Loader2, LogOut, MonitorPlay, Save, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { WhatsAppIcon } from "@/components/listing/WhatsAppIcon";
import { resolveImages } from "@/components/listing/ListingContext";
import { listingContentSchema, resolveListing, type ImageSlot, type ListingContent } from "@/lib/listing-content";
import { lockAdmin, saveSiteContent } from "@/lib/site-content.functions";
import { siteContentQuery } from "@/lib/site-content-query";
import { resolveVideoSource } from "@/lib/video-source";
import { cn } from "@/lib/utils";
import { PhotoField } from "./PhotoField";

const PROVIDER_NAMES = { youtube: "YouTube video", instagram: "Instagram Reel", tiktok: "TikTok video" } as const;

export function AdminDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: saved } = useSuspenseQuery(siteContentQuery);
  const [draft, setDraft] = useState<ListingContent>(saved);
  const [saving, setSaving] = useState(false);
  const save = useServerFn(saveSiteContent);
  const lock = useServerFn(lockAdmin);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const errors = useMemo(() => {
    const r = listingContentSchema.safeParse(draft);
    const map: Record<string, string> = {};
    if (!r.success) for (const issue of r.error.issues) map[issue.path.join(".")] ??= issue.message;
    return map;
  }, [draft]);
  const hasErrors = Object.keys(errors).length > 0;

  const set = <K extends keyof ListingContent>(key: K, value: ListingContent[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const setVideo = (patch: Partial<ListingContent["video"]>) => setDraft((d) => ({ ...d, video: { ...d.video, ...patch } }));
  const setAgent = (patch: Partial<ListingContent["agent"]>) => setDraft((d) => ({ ...d, agent: { ...d.agent, ...patch } }));
  const setImage = (slot: ImageSlot, url: string | null) => setDraft((d) => ({ ...d, images: { ...d.images, [slot]: url } }));

  async function onSave() {
    if (hasErrors) {
      toast.error("Please fix the highlighted fields first.", { description: Object.values(errors)[0] });
      return;
    }
    setSaving(true);
    try {
      const result = await save({ data: draft });
      queryClient.setQueryData(siteContentQuery.queryKey, result);
      setDraft(result);
      toast.success("Changes are live", { description: "Visitors now see the updated page." });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "";
      if (msg.includes("locked")) {
        toast.error("Your session expired. Please enter your PIN again.");
        await router.invalidate();
      } else {
        toast.error(msg || "Could not save. Please try again.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function onLock() {
    await lock();
    await router.invalidate();
  }

  const source = resolveVideoSource(draft.video.url);
  const videoHint = !draft.video.url.trim()
    ? "No video yet — visitors see a “Request a live video walkthrough” card."
    : source.kind === "file"
      ? "Detected: direct video file"
      : source.kind === "embed"
        ? `Detected: ${PROVIDER_NAMES[source.provider]}`
        : null;

  return (
    <div className="min-h-[100svh] bg-background pb-28 md:pb-16">
      <header className="sticky top-0 z-40 border-b glass">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3 md:px-10 md:py-4">
          <div className="flex items-baseline gap-3">
            <span className="font-display text-2xl font-semibold text-foreground">PrimeHaven</span>
            <span className="hidden text-[0.65rem] tracking-[0.3em] text-primary sm:inline">OWNER DASHBOARD</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill dirty={dirty} />
            <Button asChild variant="goldOutline" size="pill" className="hidden sm:inline-flex">
              <a href="/" target="_blank" rel="noopener noreferrer">
                <ExternalLink /> View Live Page
              </a>
            </Button>
            <Button variant="gold" size="pill" className="hidden sm:inline-flex" onClick={onSave} disabled={!dirty || saving}>
              {saving ? <Loader2 className="animate-spin" /> : <Save />} Save &amp; Publish Changes
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground" onClick={onLock} aria-label="Lock dashboard" title="Lock dashboard">
              <LogOut />
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 pt-10 md:px-10 md:pt-14">
        <p className="eyebrow">Edit your listing</p>
        <h1 className="mt-3 font-display text-4xl text-foreground md:text-5xl">
          Your page, <span className="italic text-gold">your words.</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
          Update anything below, check the preview, then press <span className="text-foreground">Save &amp; Publish Changes</span>. Visitors see it straight away.
        </p>

        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="grid gap-6">
            <Section n="01" title="Property details" description="The headline, price and contact shown at the top of the page.">
              <Field id="title" label="Property title" error={errors["title"]} hint="Wrap a word in *stars* to show it in gold italics, e.g. Luxury *Waterfront* Duplex">
                <Input id="title" value={draft.title} onChange={(e) => set("title", e.target.value)} />
              </Field>
              <div className="grid gap-5 sm:grid-cols-2">
                <Field id="badge" label="Location badge" error={errors["badge"]}>
                  <Input id="badge" value={draft.badge} onChange={(e) => set("badge", e.target.value)} />
                </Field>
                <Field id="location" label="Location" error={errors["location"]} hint="Shown beside the booking button and in the footer">
                  <Input id="location" value={draft.location} onChange={(e) => set("location", e.target.value)} />
                </Field>
                <Field id="price" label="Price" error={errors["price"]} hint="e.g. ₦150,000 / night, or ₦250,000,000 for a sale">
                  <Input id="price" value={draft.price} onChange={(e) => set("price", e.target.value)} />
                </Field>
                <Field id="wa" label="WhatsApp number" error={errors["whatsappNumber"]} hint="Country code first, digits only, e.g. 2348012345678">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">+</span>
                    <Input
                      id="wa"
                      inputMode="tel"
                      className="pl-7"
                      value={draft.whatsappNumber}
                      onChange={(e) => set("whatsappNumber", e.target.value.replace(/[^\d]/g, ""))}
                    />
                  </div>
                </Field>
              </div>
              <Field id="specs" label="Subheadline specs" error={errors["specs"]} hint="Separate each feature with •  (the price is added in front automatically)">
                <Textarea id="specs" rows={2} value={draft.specs} onChange={(e) => set("specs", e.target.value)} />
              </Field>
            </Section>

            <Section n="02" title="Video tour" description="Paste a YouTube, Instagram Reel, TikTok or direct MP4 link.">
              <Field id="video" label="Video link" error={errors["video.url"]}>
                <Input
                  id="video"
                  placeholder="https://www.youtube.com/watch?v=…"
                  value={draft.video.url}
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
                <div>
                  <Label className="text-sm text-foreground">Display mode</Label>
                  <div role="group" aria-label="Display mode" className="mt-2 inline-flex rounded-full border border-border bg-background p-1">
                    {(
                      [
                        { id: "wide", label: "Widescreen", icon: MonitorPlay },
                        { id: "vertical", label: "Reel", icon: Smartphone },
                      ] as const
                    ).map(({ id, label, icon: Icon }) => (
                      <button
                        key={id}
                        type="button"
                        aria-pressed={draft.video.orientation === id}
                        onClick={() => setVideo({ orientation: id })}
                        className={cn(
                          "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all",
                          draft.video.orientation === id ? "bg-gold text-primary-foreground" : "text-muted-foreground hover:text-foreground",
                        )}
                      >
                        <Icon className="h-4 w-4" /> {label}
                      </button>
                    ))}
                  </div>
                </div>
                <Field id="duration" label="Duration badge" error={errors["video.duration"]}>
                  <Input id="duration" placeholder="01:45 HD Tour" value={draft.video.duration} onChange={(e) => setVideo({ duration: e.target.value })} />
                </Field>
              </div>
            </Section>

            <Section n="03" title="Photos" description="Replace the cover photo and the four gallery photos. Large photos are resized automatically.">
              <PhotoField slot="hero" label="Hero cover" value={draft.images.hero} onChange={(u) => setImage("hero", u)} aspect="aspect-[16/9]" />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <PhotoField slot="living" label="Living Room" value={draft.images.living} onChange={(u) => setImage("living", u)} />
                <PhotoField slot="bedroom" label="Master Bedroom" value={draft.images.bedroom} onChange={(u) => setImage("bedroom", u)} />
                <PhotoField slot="kitchen" label="Kitchen" value={draft.images.kitchen} onChange={(u) => setImage("kitchen", u)} />
                <PhotoField slot="pool" label="Pool" value={draft.images.pool} onChange={(u) => setImage("pool", u)} />
              </div>
            </Section>

            <Section n="04" title="Host" description="The agent shown in the “Your Host” section.">
              <div className="grid gap-5 sm:grid-cols-[200px_minmax(0,1fr)]">
                <PhotoField slot="agent" label="Profile photo" value={draft.images.agent} onChange={(u) => setImage("agent", u)} aspect="aspect-[4/5]" />
                <div className="grid content-start gap-5">
                  <Field id="agent-name" label="Agent name" error={errors["agent.name"]}>
                    <Input id="agent-name" value={draft.agent.name} onChange={(e) => setAgent({ name: e.target.value })} />
                  </Field>
                  <Field id="agent-bio" label="Bio" error={errors["agent.bio"]}>
                    <Textarea id="agent-bio" rows={4} value={draft.agent.bio} onChange={(e) => setAgent({ bio: e.target.value })} />
                  </Field>
                </div>
              </div>
            </Section>
          </div>

          <aside className="lg:sticky lg:top-24 lg:self-start">
            <LivePreview content={draft} />
          </aside>
        </div>
      </div>

      {/* Mobile save bar */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t glass pb-[env(safe-area-inset-bottom)] sm:hidden">
        <div className="flex items-center gap-2 px-4 py-3">
          <Button asChild variant="goldOutline" size="pill" className="flex-1">
            <a href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink /> View Live
            </a>
          </Button>
          <Button variant="gold" size="pill" className="flex-[1.4]" onClick={onSave} disabled={!dirty || saving}>
            {saving ? <Loader2 className="animate-spin" /> : <Save />} Save &amp; Publish
          </Button>
        </div>
      </div>
    </div>
  );
}

function StatusPill({ dirty }: { dirty: boolean }) {
  return dirty ? (
    <span className="hidden items-center gap-2 rounded-full border border-border-gold px-3 py-1.5 text-xs text-primary md:inline-flex">
      <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-primary" /> Unsaved changes
    </span>
  ) : (
    <span className="hidden items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground md:inline-flex">
      <CheckCircle2 className="h-3.5 w-3.5 text-primary" /> All changes live
    </span>
  );
}

function Section({ n, title, description, children }: { n: string; title: string; description: string; children: ReactNode }) {
  return (
    <section className="rounded-3xl border border-border bg-card-gradient p-5 shadow-card md:p-8">
      <div className="flex items-start gap-4">
        <span className="font-display text-3xl italic text-gold">{n}</span>
        <div>
          <h2 className="font-display text-2xl text-foreground md:text-3xl">{title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="gold-rule my-6" />
      <div className="grid gap-5">{children}</div>
    </section>
  );
}

function Field({ id, label, hint, error, children }: { id: string; label: string; hint?: string | undefined; error?: string | undefined; children: ReactNode }) {
  return (
    <div>
      <Label htmlFor={id} className="text-sm text-foreground">
        {label}
      </Label>
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

function LivePreview({ content }: { content: ListingContent }) {
  const l = resolveListing(content);
  const img = resolveImages(content.images);
  return (
    <div className="rounded-3xl border border-border-gold bg-card p-4">
      <div className="flex items-center justify-between px-1 pb-3">
        <p className="eyebrow">Live preview</p>
        <span className="text-[0.65rem] text-muted-foreground">Updates as you type</span>
      </div>
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl">
        <img src={img.hero} alt="Cover preview" className="absolute inset-0 h-full w-full object-cover object-[35%_center]" />
        <div className="absolute inset-0 bg-hero-overlay" />
        <div className="absolute inset-x-0 bottom-0 p-5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border-gold bg-background/50 px-2.5 py-1 text-[0.55rem] font-semibold tracking-[0.2em] text-primary backdrop-blur-md">
            <span className="h-1 w-1 rounded-full bg-primary" /> {l.badge}
          </span>
          <p className="mt-3 font-display text-3xl leading-[0.95] text-foreground">
            {l.titleParts.map((p, i) => (p.gold ? <span key={i} className="italic text-gold">{p.text}</span> : <Fragment key={i}>{p.text}</Fragment>))}
          </p>
          <p className="mt-3 text-[0.7rem] leading-relaxed text-foreground/85">
            {l.features.map((f, i) => (
              <Fragment key={i}>
                {i > 0 && <span className="mx-1.5 text-primary">•</span>}
                <span className={i === 0 ? "font-semibold text-primary" : undefined}>{f}</span>
              </Fragment>
            ))}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 rounded-2xl border border-border bg-background/60 px-4 py-3">
        <p className="text-sm font-bold text-foreground">
          {l.priceLabel} <span className="text-xs font-normal text-muted-foreground">{l.priceUnit}</span>
        </p>
        <a href={l.whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full bg-gold px-3 py-1.5 text-xs font-semibold text-primary-foreground">
          <WhatsAppIcon className="h-3.5 w-3.5" /> Test WhatsApp
        </a>
      </div>
      <div className="mt-3 flex items-center gap-3 rounded-2xl border border-border bg-background/60 p-3">
        <img src={img.agent} alt="Agent preview" className="h-12 w-12 rounded-full object-cover object-top" />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{l.agency.agent}</p>
          <p className="line-clamp-2 text-xs text-muted-foreground">{l.agency.bio}</p>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {(["living", "bedroom", "kitchen", "pool"] as const).map((s) => (
          <img key={s} src={img[s]} alt={`${s} preview`} className="aspect-square w-full rounded-lg object-cover" />
        ))}
      </div>
    </div>
  );
}
