import { useState, type ReactNode } from "react";
import { AlertTriangle, ArrowDown, ArrowUp, Copy, ExternalLink, Pencil, Plus, Search, Star, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/listing/PropertyCard";
import { resolveProperty } from "@/lib/listing-assets";
import { MAX_PROPERTIES, plainTitle, type AmenityText, type CategoryFilter, type Property } from "@/lib/listing-content";
import { cn } from "@/lib/utils";

const FILTERS: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "short-let", label: "Short-Lets" },
  { id: "sale", label: "For Sale" },
];

type Props = {
  properties: Property[];
  featuredId: string | undefined;
  whatsappNumber: string;
  amenityText: readonly AmenityText[];
  unsavedIds: string[];
  attentionIds: Set<string>;
  onCreate: () => void;
  onEdit: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (p: Property) => void;
  onFeature: (id: string) => void;
  onMove: (id: string, dir: -1 | 1) => void;
};

export function ListingsPanel(props: Props) {
  const { properties, onCreate } = props;
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<CategoryFilter>("all");
  const q = query.trim().toLowerCase();
  const filtering = q.length > 0 || filter !== "all";
  const shown = properties.filter(
    (p) =>
      (filter === "all" || p.category === filter) &&
      (!q || `${plainTitle(p.title)} ${p.location} ${p.price}`.toLowerCase().includes(q)),
  );

  const stats = [
    { label: "Total listings", value: properties.length },
    { label: "Short-lets", value: properties.filter((p) => p.category === "short-let").length },
    { label: "For sale", value: properties.filter((p) => p.category === "sale").length },
    { label: "Booked", value: properties.filter((p) => p.status === "booked").length },
  ];

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] gap-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-card-gradient p-5">
            <p className="font-display text-4xl text-gold">{s.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onCreate}
        disabled={properties.length >= MAX_PROPERTIES}
        className="group flex items-center gap-5 rounded-3xl border border-dashed border-border-gold bg-accent/30 p-5 text-left transition-colors hover:bg-accent/60 disabled:opacity-50 md:p-6"
      >
        <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gold text-primary-foreground shadow-gold transition-transform group-hover:scale-105">
          <Plus className="h-6 w-6" />
        </span>
        <span>
          <span className="block font-display text-2xl text-foreground md:text-3xl">Create New Listing</span>
          <span className="mt-1 block text-sm text-muted-foreground">
            Add a separate apartment or house with its own photos, video, price and WhatsApp booking. ({properties.length}/{MAX_PROPERTIES})
          </span>
        </span>
      </button>

      <div className="rounded-3xl border border-border bg-card-gradient p-4 shadow-card md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="relative md:w-80">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search title, area or price" className="pl-9" aria-label="Search listings" />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filter === f.id}
                onClick={() => setFilter(f.id)}
                className={cn(
                  "whitespace-nowrap rounded-full border px-4 py-2 text-xs font-medium transition-all",
                  filter === f.id ? "border-transparent bg-gold text-primary-foreground" : "border-border text-muted-foreground hover:text-foreground",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          The <Star className="inline h-3 w-3 fill-current text-primary" /> starred listing is featured at the top of the website. Use the arrows to change the order on the website.
        </p>

        <ul className="mt-4 grid grid-cols-[minmax(0,1fr)] gap-3">
          {shown.map((p) => (
            <ListingRow key={p.id} {...props} property={p} index={properties.indexOf(p)} total={properties.length} reorderDisabled={filtering} />
          ))}
          {shown.length === 0 && (
            <li className="rounded-2xl border border-border p-8 text-center text-sm text-muted-foreground">No listings match your search.</li>
          )}
        </ul>
      </div>
    </div>
  );
}

function ListingRow({
  property,
  index,
  total,
  reorderDisabled,
  featuredId,
  whatsappNumber,
  amenityText,
  unsavedIds,
  attentionIds,
  onEdit,
  onDuplicate,
  onDelete,
  onFeature,
  onMove,
}: Props & { property: Property; index: number; total: number; reorderDisabled: boolean }) {
  const p = resolveProperty(property, whatsappNumber, amenityText);
  const featured = featuredId === p.id;
  const unsaved = unsavedIds.includes(p.id);
  const needsAttention = attentionIds.has(p.id);
  return (
    <li className={cn("flex min-w-0 flex-col gap-4 rounded-2xl border bg-background/60 p-3 lg:flex-row lg:items-center", needsAttention ? "border-destructive/60" : "border-border")}>
      <div className="flex w-full min-w-0 flex-1 items-center gap-4">
        <button type="button" onClick={() => onEdit(p.id)} className="relative aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-xl bg-card sm:w-36" aria-label={`Edit ${p.plainTitle || "new listing"}`}>
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
            {unsaved && <span className="text-xs text-primary">Not published yet</span>}
            {needsAttention && (
              <span className="inline-flex items-center gap-1 text-xs text-destructive">
                <AlertTriangle className="h-3 w-3" /> Needs attention
              </span>
            )}
          </div>
          <p className="mt-2 line-clamp-2 font-display text-xl leading-tight text-foreground sm:truncate">{p.plainTitle || "Untitled listing"}</p>
          <p className="truncate text-xs text-muted-foreground">
            {p.location || "No location yet"} · <span className="font-semibold text-foreground">{p.price || "No price yet"}</span>
          </p>
        </div>
      </div>
      <div className="flex shrink-0 flex-wrap items-center gap-1">
        <IconAction label={featured ? "Featured at the top" : "Feature at the top"} onClick={() => onFeature(p.id)} disabled={featured} className={featured ? "text-primary" : undefined}>
          <Star className={cn(featured && "fill-current")} />
        </IconAction>
        <IconAction label="Move up" onClick={() => onMove(p.id, -1)} disabled={reorderDisabled || index === 0}>
          <ArrowUp />
        </IconAction>
        <IconAction label="Move down" onClick={() => onMove(p.id, 1)} disabled={reorderDisabled || index === total - 1}>
          <ArrowDown />
        </IconAction>
        <IconAction label="Duplicate" onClick={() => onDuplicate(p.id)}>
          <Copy />
        </IconAction>
        {unsaved ? (
          <IconAction label="Publish first to view it on the website" disabled>
            <ExternalLink />
          </IconAction>
        ) : (
          <Button asChild variant="ghost" size="icon" className="rounded-full text-muted-foreground" title="View on website">
            <a href={`/?property=${p.id}`} target="_blank" rel="noopener noreferrer" aria-label="View on website">
              <ExternalLink />
            </a>
          </Button>
        )}
        <Button variant="goldOutline" size="sm" className="rounded-full" onClick={() => onEdit(p.id)}>
          <Pencil /> Edit
        </Button>
        <Button variant="ghost" size="sm" className="rounded-full text-destructive hover:text-destructive" onClick={() => onDelete(property)} disabled={total <= 1}>
          <Trash2 /> Delete
        </Button>
      </div>
    </li>
  );
}

function IconAction({ label, onClick, disabled, className, children }: { label: string; onClick?: () => void; disabled?: boolean; className?: string | undefined; children: ReactNode }) {
  return (
    <Button variant="ghost" size="icon" className={cn("rounded-full text-muted-foreground", className)} onClick={onClick} disabled={disabled} aria-label={label} title={label}>
      {children}
    </Button>
  );
}
