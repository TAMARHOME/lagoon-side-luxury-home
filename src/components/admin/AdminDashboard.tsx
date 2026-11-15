import { useMemo, useState } from "react";
import { useRouter } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { Building2, CheckCircle2, ExternalLink, Loader2, LogOut, Palette, Plus, Save, Type, UserRound, type LucideIcon } from "lucide-react";
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
import {
  MAX_PROPERTIES,
  blankProperty,
  cleanContent,
  duplicateProperty,
  moveItem,
  plainTitle,
  siteContentSchema,
  type Agent,
  type AmenityText,
  type Property,
  type SiteContent,
} from "@/lib/listing-content";
import { lockAdmin, saveSiteContent } from "@/lib/site-content.functions";
import { siteContentQuery } from "@/lib/site-content-query";
import { cn } from "@/lib/utils";
import { scopedErrors } from "./form-parts";
import { AgentPanel } from "./AgentPanel";
import { BrandPanel } from "./BrandPanel";
import { ListingsPanel } from "./ListingsPanel";
import { PropertyEditor } from "./PropertyEditor";
import { WebsiteTextPanel } from "./WebsiteTextPanel";
import type { SetSite } from "./site-fields";

type Tab = "listings" | "agent" | "website" | "brand";
const TABS: { id: Tab; label: string; icon: LucideIcon; prefixes: string[] }[] = [
  { id: "listings", label: "Listings", icon: Building2, prefixes: ["properties."] },
  { id: "agent", label: "Agent Profile", icon: UserRound, prefixes: ["agent."] },
  { id: "website", label: "Website Text", icon: Type, prefixes: ["site.hero.", "site.catalog.", "site.video.", "site.gallery.", "site.amenities.", "site.host.", "site.amenityText."] },
  { id: "brand", label: "Brand & Footer", icon: Palette, prefixes: ["site.brand.", "site.footer.", "site.seo."] },
];
const tabFor = (key: string): Tab => TABS.find((t) => t.prefixes.some((p) => key.startsWith(p)))?.id ?? "listings";

const TAB_INTRO: Record<Tab, { eyebrow: string; title: string; text: string }> = {
  listings: { eyebrow: "Manage your listings", title: "Your properties,", text: "Create separate listings for every apartment and house, then edit, reorder, duplicate or remove them." },
  agent: { eyebrow: "Agent profile", title: "The face of", text: "Your photo, name, bio and the WhatsApp number every booking goes to." },
  website: { eyebrow: "Website text", title: "Every word,", text: "Change the headings, buttons, captions, highlight numbers and reviews shown on the website — or hide whole sections." },
  brand: { eyebrow: "Brand & footer", title: "Your name,", text: "The website name, footer location, copyright line, WhatsApp greeting and how you appear in Google." },
};
const TAB_GOLD: Record<Tab, string> = { listings: "your words.", agent: "every booking.", website: "your way.", brand: "everywhere." };

export function AdminDashboard() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: saved } = useSuspenseQuery(siteContentQuery);
  const [draft, setDraft] = useState<SiteContent>(saved);
  const [tab, setTab] = useState<Tab>("listings");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [newIds, setNewIds] = useState<string[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<Property | null>(null);
  const [saving, setSaving] = useState(false);
  const save = useServerFn(saveSiteContent);
  const lock = useServerFn(lockAdmin);

  const dirty = JSON.stringify(draft) !== JSON.stringify(saved);
  const errors = useMemo(() => {
    const r = siteContentSchema.safeParse(cleanContent(draft));
    const map: Record<string, string> = {};
    if (!r.success) for (const issue of r.error.issues) map[issue.path.join(".")] ??= issue.message;
    return map;
  }, [draft]);
  const hasErrors = Object.keys(errors).length > 0;
  const tabHasErrors = (t: Tab) => Object.keys(errors).some((k) => tabFor(k) === t);
  const attentionIds = useMemo(() => {
    const ids = new Set<string>();
    for (const k of Object.keys(errors)) {
      const m = /^properties\.(\d+)\./.exec(k);
      const p = m ? draft.properties[Number(m[1])] : undefined;
      if (p) ids.add(p.id);
    }
    return ids;
  }, [errors, draft.properties]);

  const setAgent = (patch: Partial<Agent>) => setDraft((d) => ({ ...d, agent: { ...d.agent, ...patch } }));
  const setSite: SetSite = (key, patch) => setDraft((d) => ({ ...d, site: { ...d.site, [key]: { ...d.site[key], ...patch } } }));
  const setAmenityText = (amenityText: AmenityText[]) => setDraft((d) => ({ ...d, site: { ...d.site, amenityText } }));
  const updateProperty = (id: string, patch: Partial<Property>) =>
    setDraft((d) => ({ ...d, properties: d.properties.map((p) => (p.id === id ? { ...p, ...patch } : p)) }));

  const openEditor = (id: string | null) => {
    setEditingId(id);
    setTab("listings");
    window.scrollTo({ top: 0 });
  };
  const newId = () => `property-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;

  function createListing() {
    if (draft.properties.length >= MAX_PROPERTIES) {
      toast.error(`You can list up to ${MAX_PROPERTIES} properties.`);
      return;
    }
    const id = newId();
    setDraft((d) => ({ ...d, properties: [blankProperty(id), ...d.properties] }));
    setNewIds((ids) => [...ids, id]);
    openEditor(id);
  }

  function duplicateListing(id: string) {
    if (draft.properties.length >= MAX_PROPERTIES) {
      toast.error(`You can list up to ${MAX_PROPERTIES} properties.`);
      return;
    }
    const copyId = newId();
    setDraft((d) => {
      const i = d.properties.findIndex((p) => p.id === id);
      if (i < 0) return d;
      const properties = [...d.properties];
      properties.splice(i + 1, 0, duplicateProperty(d.properties[i]!, copyId));
      return { ...d, properties };
    });
    setNewIds((ids) => [...ids, copyId]);
    toast("Listing duplicated", { description: "Edit the copy, then press “Save & Publish Changes”." });
  }

  function moveListing(id: string, dir: -1 | 1) {
    setDraft((d) => ({ ...d, properties: moveItem(d.properties, d.properties.findIndex((p) => p.id === id), dir) }));
  }

  function deleteProperty(id: string) {
    setDraft((d) => {
      const properties = d.properties.filter((p) => p.id !== id);
      return { ...d, properties, featuredId: d.featuredId === id ? (properties[0]?.id ?? null) : d.featuredId };
    });
    setNewIds((ids) => ids.filter((x) => x !== id));
    if (editingId === id) setEditingId(null);
    toast("Listing removed", { description: "Press “Save & Publish Changes” to update the live site." });
  }

  async function onSave() {
    if (hasErrors) {
      const firstKey = Object.keys(errors)[0]!;
      const m = /^properties\.(\d+)\./.exec(firstKey);
      const bad = m ? draft.properties[Number(m[1])] : undefined;
      if (bad) openEditor(bad.id);
      else {
        setEditingId(null);
        setTab(tabFor(firstKey));
      }
      toast.error(bad ? `“${plainTitle(bad.title) || "New listing"}” needs attention` : "Please fix the highlighted fields first.", {
        description: errors[firstKey],
      });
      return;
    }
    setSaving(true);
    try {
      const result = await save({ data: cleanContent(draft) });
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
  const intro = TAB_INTRO[tab];

  return (
    <div className="min-h-[100svh] bg-background pb-28 md:pb-16">
      <header className="sticky top-0 z-40 border-b glass">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3 md:px-10 md:py-4">
          <div className="flex min-w-0 items-baseline gap-3">
            <span className="truncate font-display text-2xl font-semibold text-foreground">{draft.site.brand.name || "Your website"}</span>
            <span className="hidden text-[0.65rem] tracking-[0.3em] text-primary sm:inline">OWNER DASHBOARD</span>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill dirty={dirty} />
            <Button variant="goldOutline" size="pill" className="hidden lg:inline-flex" onClick={createListing}>
              <Plus /> Create New Listing
            </Button>
            <Button asChild variant="ghost" size="pill" className="hidden text-muted-foreground sm:inline-flex">
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
        <nav aria-label="Dashboard sections" className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-3 pb-2 md:px-8">
          {TABS.map((t) => {
            const active = tab === t.id;
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => {
                  setTab(t.id);
                  setEditingId(null);
                  window.scrollTo({ top: 0 });
                }}
                className={cn(
                  "relative flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm transition-colors",
                  active ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Icon className={cn("h-4 w-4", active && "text-primary")} /> {t.label}
                {t.id === "listings" && <span className="text-xs text-muted-foreground">{draft.properties.length}</span>}
                {tabHasErrors(t.id) && <span className="h-1.5 w-1.5 rounded-full bg-destructive" aria-label="needs attention" />}
              </button>
            );
          })}
        </nav>
      </header>

      <div className="mx-auto max-w-7xl px-5 pt-10 md:px-10 md:pt-14">
        {editing ? (
          <PropertyEditor
            key={editing.id}
            property={editing}
            isNew={newIds.includes(editing.id)}
            errors={scopedErrors(errors, `properties.${editingIndex}.`)}
            whatsappNumber={draft.agent.whatsappNumber}
            amenityText={draft.site.amenityText}
            isFeatured={featuredId === editing.id}
            canDelete={draft.properties.length > 1}
            onChange={(patch) => updateProperty(editing.id, patch)}
            onFeature={() => setDraft((d) => ({ ...d, featuredId: editing.id }))}
            onDelete={() => setConfirmDelete(editing)}
            onBack={() => openEditor(null)}
          />
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="eyebrow">{intro.eyebrow}</p>
                <h1 className="mt-3 font-display text-4xl text-foreground md:text-5xl">
                  {intro.title} <span className="italic text-gold">{TAB_GOLD[tab]}</span>
                </h1>
                <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
                  {intro.text} Press <span className="text-foreground">Save &amp; Publish Changes</span> and visitors see it straight away.
                </p>
              </div>
              {tab === "listings" && (
                <Button variant="gold" size="pill" onClick={createListing}>
                  <Plus /> Create New Listing
                </Button>
              )}
            </div>

            <div className="mt-10">
              {tab === "listings" && (
                <ListingsPanel
                  properties={draft.properties}
                  featuredId={featuredId}
                  whatsappNumber={draft.agent.whatsappNumber}
                  amenityText={draft.site.amenityText}
                  unsavedIds={newIds}
                  attentionIds={attentionIds}
                  onCreate={createListing}
                  onEdit={openEditor}
                  onDuplicate={duplicateListing}
                  onDelete={setConfirmDelete}
                  onFeature={(id) => setDraft((d) => ({ ...d, featuredId: id }))}
                  onMove={moveListing}
                />
              )}
              {tab === "agent" && <AgentPanel agent={draft.agent} errors={scopedErrors(errors, "agent.")} onChange={setAgent} />}
              {tab === "website" && <WebsiteTextPanel site={draft.site} errors={scopedErrors(errors, "site.")} setSite={setSite} setAmenityText={setAmenityText} />}
              {tab === "brand" && <BrandPanel site={draft.site} agent={draft.agent} errors={scopedErrors(errors, "site.")} setSite={setSite} />}
            </div>
          </>
        )}
      </div>

      <AlertDialog open={!!confirmDelete} onOpenChange={(o) => !o && setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this listing?</AlertDialogTitle>
            <AlertDialogDescription>
              “{plainTitle(confirmDelete?.title ?? "") || "New listing"}” will be removed from the website when you save.
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
          <Button variant="goldOutline" size="icon" className="shrink-0 rounded-full" onClick={createListing} aria-label="Create new listing">
            <Plus />
          </Button>
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
