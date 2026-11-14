import { useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { AlertTriangle, CheckCircle2, ExternalLink, Loader2, LogOut, Pencil, Plus, Save, Star, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/listing/PropertyCard";
import { DEFAULT_AGENT_PHOTO, resolveProperty } from "@/lib/listing-assets";
import { MAX_PROPERTIES, blankProperty, plainTitle, siteContentSchema, type Agent, type Property, type SiteContent } from "@/lib/listing-content";
import { lockAdmin, saveSiteContent } from "@/lib/site-content.functions";
import { siteContentQuery } from "@/lib/site-content-query";
import { cn } from "@/lib/utils";
import { Field, Section } from "./form-parts";
import { PhotoField } from "./PhotoField";
import { PropertyEditor } from "./PropertyEditor";

/** Drops blank landmark rows so half-filled forms still save. */
function cleanDraft(d: SiteContent): SiteContent {
  return { ...d, properties: d.properties.map((p) => ({ ...p, landmarks: p.landmarks.map((l) => l.trim()).filter(Boolean) })) };
}

export function AdminDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: saved } = useSuspenseQuery(siteContentQuery);
  const [draft, setDraft] = useState<SiteContent>(saved);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newIds, setNewIds] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<Property | null>(null);
  const [saving, setSaving] = useState(false);
  const save = useServerFn(saveSiteContent);
  const lock = useServerFn(lockAdmin);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const errors = useMemo(() => {
    const r = siteContentSchema.safeParse(cleanDraft(draft));
    const map: Record<string, string> = {};
    if (!r.success) for (const issue of r.error.issues) map[issue.path.join(".")] ??= issue.message;
    return map;
  }, [draft]);
  const hasErrors = Object.keys(errors).length > 0;

  /** Errors for one property, keyed relative to it ("title", "gallery.0.url"). */
  const propertyErrors = (index: number) => {
    const prefix = `properties.${index}.`;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(errors)) if (k.startsWith(prefix)) out[k.slice(prefix.length)] = v;
    return out;
  };
  const agentErrors = Object.fromEntries(Object.entries(errors).filter(([k]) => k.startsWith("agent.")).map(([k, v]) => [k.slice(6), v]));

  const setAgent = (patch: Partial<Agent>) => setDraft((d) => ({ ...d, agent: { ...d.agent, ...patch } }));
  const updateProperty = (id: string, patch: Partial<Property>) =>
    setDraft((d) => ({ ...d, properties: d.properties.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));

  function addProperty() {
    if (draft.properties.length >= MAX_PROPERTIES) {
      toast.error(`You can list up to ${MAX_PROPERTIES} properties.`);
      return;
    }
    const id = `property-${Date.now().toString(36)}`;
    setDraft((d) => ({ ...d, properties: [blankProperty(id), ...d.properties] }));
    setNewIds((ids) => [...ids, id]);
    setEditingId(id);
    window.scrollTo({ top: 0 });
  }

  function deleteProperty(id: string) {
    setDraft((d) => {
      const properties = d.properties.filter((p) => p.id !== id);
      return { ...d, properties, featuredId: d.featuredId === id ? (properties[0]?.id ?? null) : d.featuredId };
    });
    if (editingId === id) setEditingId(null);
    toast("Property removed", { description: "Press “Save & Publish Changes” to update the live site." });
  }

  async function onSave() {
    if (hasErrors) {
      const firstKey = Object.keys(errors)[0]!;
      const m = /^properties\.(\d+)\./.exec(firstKey);
      const bad = m ? draft.properties[Number(m[1])] : undefined;
      if (bad) setEditingId(bad.id);
      toast.error(bad ? `“${plainTitle(bad.title) || "New property"}” needs attention` : "Please fix the highlighted fields first.", {
        description: errors[firstKey],
      });
      return;
    }
    setSaving(true);
    try {
      const result = await save({ data: cleanDraft(draft) });
      queryClient.setQueryData(siteContentQuery.queryKey, result);
      setDraft(result);
      setNewIds([]);
      toast.success("Changes are live", { description: "Visitors now see the updated website." });
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

  const editingIndex = editingId ? draft.properties.findIndex((p) => p.id === editingId) : -1;
  const editing = editingIndex >= 0 ? draft.properties[editingIndex] : undefined;
  const featuredId = draft.featuredId ?? draft.properties[0]?.id;

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
        {editing ? (
          <PropertyEditor
            key={editing.id}
            property={editing}
            isNew={newIds.includes(editing.id)}
            errors={propertyErrors(editingIndex)}
            whatsappNumber={draft.agent.whatsappNumber}
            isFeatured={featuredId === editing.id}
            canDelete={draft.properties.length > 1}
            onChange={(patch) => updateProperty(editing.id, patch)}
            onFeature={() => setDraft((d) => ({ ...d, featuredId: editing.id }))}
            onDelete={() => setConfirmDelete(editing)}
            onBack={() => {
              setEditingId(null);
              window.scrollTo({ top: 0 });
            }}
          />
        ) : (
          <>
            <p className="eyebrow">Manage your listings</p>
            <h1 className="mt-3 font-display text-4xl text-foreground md:text-5xl">
              Your properties, <span className="italic text-gold">your words.</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
              Add, edit or remove homes, then press <span className="text-foreground">Save &amp; Publish Changes</span>. Visitors see it straight away.
            </p>

            <div className="mt-10 grid gap-6">
              <Section
                n="01"
                title="Properties"
                description={`${draft.properties.length} listed. The starred one is featured at the top of the website.`}
                action={
                  <Button variant="gold" size="pill" onClick={addProperty}>
                    <Plus /> Add New Property
                  </Button>
                }
              >
                <ul className="grid gap-3">
                  {draft.properties.map((p, i) => (
                    <PropertyRow
                      key={p.id}
                      property={p}
                      whatsappNumber={draft.agent.whatsappNumber}
                      featured={featuredId === p.id}
                      needsAttention={Object.keys(propertyErrors(i)).length > 0}
                      canDelete={draft.properties.length > 1}
                      onEdit={() => {
                        setEditingId(p.id);
                        window.scrollTo({ top: 0 });
                      }}
                      onDelete={() => setConfirmDelete(p)}
                      onFeature={() => setDraft((d) => ({ ...d, featuredId: p.id }))}
                    />
                  ))}
                </ul>
              </Section>

              <Section n="02" title="Agent settings" description="Your profile and WhatsApp number — used for every property booking.">
                <div className="grid gap-5 sm:grid-cols-[220px_minmax(0,1fr)]">
                  <PhotoField
                    kind="agent"
                    label="Profile photo"
                    value={draft.agent.photo}
                    fallbackSrc={DEFAULT_AGENT_PHOTO}
                    onChange={(photo) => setAgent({ photo })}
                    onClear={draft.agent.photo ? () => setAgent({ photo: null }) : undefined}
                    clearLabel="Use original"
                    error={agentErrors["photo"]}
                    aspect="aspect-[4/5]"
                  />
                  <div className="grid content-start gap-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <Field id="agency" label="Agency name" error={agentErrors["agencyName"]}>
                        <Input id="agency" value={draft.agent.agencyName} onChange={(e) => setAgent({ agencyName: e.target.value })} />
                      </Field>
                      <Field id="agent-name" label="Agent name" error={agentErrors["name"]}>
                        <Input id="agent-name" value={draft.agent.name} onChange={(e) => setAgent({ name: e.target.value })} />
                      </Field>
                    </div>
                    <Field id="wa" label="WhatsApp number" error={agentErrors["whatsappNumber"]} hint="Country code first, digits only, e.g. 2348012345678">
                      <div className="relative">
                        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">+</span>
                        <Input
                          id="wa"
                          inputMode="tel"
                          className="pl-7"
                          value={draft.agent.whatsappNumber}
                          onChange={(e) => setAgent({ whatsappNumber: e.target.value.replace(/[^\d]/g, "") })}
                        />
                      </div>
                    </Field>
                    <Field id="agent-bio" label="Bio" error={agentErrors["bio"]}>
                      <Textarea id="agent-bio" rows={4} value={draft.agent.bio} onChange={(e) => setAgent({ bio: e.target.value })} />
                    </Field>
                  </div>
                </div>
              </Section>
            </div>
          </>
        )}
      </div>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this property?</AlertDialogTitle>
            <AlertDialogDescription>
              “{plainTitle(confirmDelete?.title ?? "") || "New property"}” will be removed from the website when you save.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep it</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (confirmDelete) deleteProperty(confirmDelete.id);
                setConfirmDelete(null);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

function PropertyRow({
  property,
  whatsappNumber,
  featured,
  needsAttention,
  canDelete,
  onEdit,
  onDelete,
  onFeature,
}: {
  property: Property;
  whatsappNumber: string;
  featured: boolean;
  needsAttention: boolean;
  canDelete: boolean;
  onEdit: () => void;
  onDelete: () => void;
  onFeature: () => void;
}) {
  const p = resolveProperty(property, whatsappNumber);
  return (
    <li className={cn("flex flex-col gap-4 rounded-2xl border bg-background/60 p-3 sm:flex-row sm:items-center", needsAttention ? "border-destructive/60" : "border-border")}>
      <button type="button" onClick={onEdit} className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-xl bg-card sm:w-36" aria-label={`Edit ${p.plainTitle || "new property"}`}>
        {p.coverSrc ? (
          <img src={p.coverSrc} alt="" className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <span className="absolute inset-0 flex items-center justify-center text-xs text-muted-foreground">No cover</span>
        )}
      </button>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge property={p} />
          <span className="text-xs text-muted-foreground">{p.categoryLabel}</span>
          {featured && (
            <span className="inline-flex items-center gap-1 text-xs text-primary">
              <Star className="h-3 w-3 fill-current" /> Featured
            </span>
          )}
          {needsAttention && (
            <span className="inline-flex items-center gap-1 text-xs text-destructive">
              <AlertTriangle className="h-3 w-3" /> Needs attention
            </span>
          )}
        </div>
        <p className="mt-2 truncate font-display text-xl text-foreground">{p.plainTitle || "Untitled property"}</p>
        <p className="truncate text-xs text-muted-foreground">
          {p.location || "No location yet"} · <span className="font-semibold text-foreground">{p.price || "No price yet"}</span>
        </p>
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className={cn("rounded-full", featured ? "text-primary" : "text-muted-foreground")}
          onClick={onFeature}
          disabled={featured}
          aria-label={featured ? "Featured property" : "Feature at the top"}
          title={featured ? "Featured at the top" : "Feature at the top"}
        >
          <Star className={cn(featured && "fill-current")} />
        </Button>
        <Button variant="goldOutline" size="sm" className="rounded-full" onClick={onEdit}>
          <Pencil /> Edit
        </Button>
        <Button variant="ghost" size="sm" className="rounded-full text-destructive hover:text-destructive" onClick={onDelete} disabled={!canDelete}>
          <Trash2 /> Delete
        </Button>
      </div>
    </li>
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
