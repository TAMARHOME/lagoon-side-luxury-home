import { z } from "zod";
import { defaultContent } from "@/config/listing";

/** Uploaded photos are served from this same-site path. */
export const MEDIA_PREFIX = "/api/public/media/";
export const MEDIA_BUCKET = "listing-media";
export const MEDIA_PATH_PATTERN = /^(hero|living|bedroom|kitchen|pool|agent|properties)\/[\w-]+\.(jpg|png|webp)$/;
/** Photos that ship with the site are referenced as "asset:<name>". */
export const ASSET_PATTERN = /^asset:[a-z0-9-]{1,40}$/;

export const MAX_PROPERTIES = 40;
export const MAX_GALLERY = 6;
export const MAX_LANDMARKS = 4;

export function isValidImageRef(v: string): boolean {
  return (
    (v.startsWith(MEDIA_PREFIX) && MEDIA_PATH_PATTERN.test(v.slice(MEDIA_PREFIX.length))) ||
    ASSET_PATTERN.test(v) ||
    /^https:\/\/\S+$/.test(v)
  );
}

const imageRef = z
  .string()
  .trim()
  .max(500)
  .refine(isValidImageRef, "Use an uploaded photo or an https:// image link");

export const AMENITIES = [
  { key: "power", label: "24/7 Power", text: "Grid, inverter and generator backup — zero blackouts." },
  { key: "wifi", label: "Starlink Wi-Fi", text: "Fast, reliable internet for streaming and remote work." },
  { key: "security", label: "Armed Security", text: "Gated estate, CCTV and round-the-clock patrols." },
  { key: "pool", label: "Swimming Pool", text: "A sparkling pool for residents and guests." },
  { key: "gym", label: "Fitted Gym", text: "On-site gym with modern equipment." },
  { key: "parking", label: "Dedicated Parking", text: "Secure on-site parking." },
  { key: "ac", label: "Air Conditioning", text: "Cool, quiet split units in every room." },
  { key: "kitchen", label: "Fitted Kitchen", text: "Modern appliances, cookware and dining set." },
  { key: "tv", label: "Smart TV & Netflix", text: "Large smart TVs with streaming apps." },
  { key: "housekeeping", label: "Housekeeping", text: "Regular cleaning and fresh linen." },
  { key: "waterfront", label: "Waterfront View", text: "Lagoon or ocean views from the living spaces." },
  { key: "staff", label: "Staff Quarters (BQ)", text: "Separate quarters for a driver or housekeeper." },
] as const;
export type AmenityKey = (typeof AMENITIES)[number]["key"];
const AMENITY_KEYS = AMENITIES.map((a) => a.key) as [AmenityKey, ...AmenityKey[]];
export type AmenityText = { key: AmenityKey; label: string; text: string };
/** Built-in amenity wording, replaced by the owner's own wording when they set it. */
export function amenityInfo(key: AmenityKey, overrides: readonly AmenityText[] = []): AmenityText {
  const base = AMENITIES.find((a) => a.key === key)!;
  const own = overrides.find((o) => o.key === key);
  return own ? { key, label: own.label || base.label, text: own.text } : { key, label: base.label, text: base.text };
}

export const CATEGORY_LABELS = { "short-let": "Short-Let", sale: "For Sale" } as const;
export type PropertyCategory = keyof typeof CATEGORY_LABELS;
export const STATUS_LABELS = { available: "Available", new: "New Listing", booked: "Booked" } as const;
export type PropertyStatus = keyof typeof STATUS_LABELS;

export const propertySchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,48}$/),
  title: z.string().trim().min(1, "Add a property title").max(120),
  location: z.string().trim().min(1, "Add a location").max(80),
  price: z.string().trim().min(1, "Add a price").max(60),
  category: z.enum(["short-let", "sale"]),
  status: z.enum(["available", "new", "booked"]),
  video: z.object({
    url: z.string().trim().max(500),
    orientation: z.enum(["wide", "vertical"]),
    duration: z.string().trim().max(40),
  }),
  cover: z.string().trim().min(1, "Add a cover photo").max(500).refine(isValidImageRef, "Use an uploaded photo or an https:// image link"),
  gallery: z
    .array(z.object({ url: imageRef, label: z.string().trim().max(40) }))
    .max(MAX_GALLERY, `Up to ${MAX_GALLERY} gallery photos`),
  amenities: z.array(z.enum(AMENITY_KEYS)).max(AMENITIES.length),
  description: z.string().trim().max(1200),
  landmarks: z.array(z.string().trim().min(1).max(60)).max(MAX_LANDMARKS, `Up to ${MAX_LANDMARKS} landmarks`),
});
export type Property = z.infer<typeof propertySchema>;

export const agentSchema = z.object({
  agencyName: z.string().trim().min(1, "Add the agency name").max(80),
  name: z.string().trim().min(1, "Add the agent's name").max(80),
  role: z.string().trim().max(60),
  bio: z.string().trim().max(400),
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^\d{8,15}$/, "Use digits only with the country code, e.g. 2348012345678"),
  /** null = the original portrait that ships with the site. */
  photo: imageRef.nullable(),
});
export type Agent = z.infer<typeof agentSchema>;

const text = (max: number) => z.string().trim().max(max);
const required = (max: number, message: string) => z.string().trim().min(1, message).max(max);

export const MAX_STATS = 4;
export const MAX_TESTIMONIALS = 6;

/** Website-wide wording, brand and footer. Titles accept *stars* for gold words. */
export const siteSchema = z.object({
  brand: z.object({
    name: required(40, "Add the website name"),
    tagline: text(30),
    footerLocation: text(120),
    copyright: text(120),
    enquiryMessage: required(200, "Add the WhatsApp greeting"),
  }),
  seo: z.object({ title: text(70), description: text(170) }),
  hero: z.object({
    badge: text(40),
    bookLabel: required(40, "Add the booking button text"),
    detailsLabel: required(40, "Add the details button text"),
    chatLabel: required(30, "Add the mobile button text"),
  }),
  catalog: z.object({ eyebrow: text(40), title: required(80, "Add a heading"), intro: text(240) }),
  video: z.object({ show: z.boolean(), eyebrow: text(40), title: required(80, "Add a heading"), caption: text(240) }),
  gallery: z.object({ show: z.boolean(), eyebrow: text(40), title: required(80, "Add a heading"), intro: text(240) }),
  amenities: z.object({ show: z.boolean(), eyebrow: text(40), title: required(80, "Add a heading") }),
  host: z.object({
    show: z.boolean(),
    eyebrow: text(40),
    title: required(80, "Add a heading"),
    badge: text(30),
    stats: z.array(z.object({ value: required(12, "Add a number"), label: required(40, "Add a label") })).max(MAX_STATS),
    testimonials: z
      .array(z.object({ quote: required(400, "Add the review"), name: required(60, "Add the guest's name"), detail: text(80) }))
      .max(MAX_TESTIMONIALS),
  }),
  footer: z.object({
    eyebrow: text(40),
    title: required(100, "Add a heading"),
    subline: text(160),
    ctaLabel: required(40, "Add the button text"),
  }),
  amenityText: z
    .array(z.object({ key: z.enum(AMENITY_KEYS), label: required(40, "Add a name"), text: text(160) }))
    .max(AMENITIES.length),
});
export type SiteSettings = z.infer<typeof siteSchema>;

export const siteContentSchema = z
  .object({
    site: siteSchema,
    agent: agentSchema,
    featuredId: z.string().max(48).nullable(),
    properties: z.array(propertySchema).min(1, "Keep at least one property").max(MAX_PROPERTIES),
  })
  .superRefine((v, ctx) => {
    const seen = new Set<string>();
    v.properties.forEach((p, i) => {
      if (seen.has(p.id)) ctx.addIssue({ code: "custom", path: ["properties", i, "id"], message: "Duplicate property" });
      seen.add(p.id);
    });
  });
export type SiteContent = z.infer<typeof siteContentSchema>;

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Field-by-field overlay: anything missing or invalid keeps its default; bad list items are dropped. */
function mergeObject<T>(schema: z.AnyZodObject, input: unknown, fallback: T): T {
  const src = isObj(input) ? input : {};
  const fb = fallback as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [key, field] of Object.entries(schema.shape as z.ZodRawShape)) {
    if (field instanceof z.ZodObject) {
      out[key] = mergeObject(field, src[key], fb[key]);
      continue;
    }
    let value: unknown = key in src ? src[key] : fb[key];
    if (field instanceof z.ZodArray && Array.isArray(value)) {
      const element = field.element as z.ZodTypeAny;
      value = value.filter((item) => element.safeParse(item).success);
    }
    const parsed = field.safeParse(value);
    out[key] = parsed.success ? parsed.data : fb[key];
  }
  return out as T;
}

/** Overlays saved content on the defaults; invalid fields keep their default, invalid properties are skipped. */
export function mergeContent(saved: unknown): SiteContent {
  const s = isObj(saved) ? saved : {};
  const agent = mergeObject<Agent>(agentSchema, s["agent"], defaultContent.agent);
  const site = mergeObject<SiteSettings>(siteSchema, s["site"], defaultContent.site);

  const ids = new Set<string>();
  const saveds = Array.isArray(s["properties"]) ? s["properties"] : [];
  let properties: Property[] = [];
  for (const raw of saveds) {
    const parsed = propertySchema.safeParse(raw);
    if (parsed.success && !ids.has(parsed.data.id) && properties.length < MAX_PROPERTIES) {
      ids.add(parsed.data.id);
      properties.push(parsed.data);
    }
  }
  if (properties.length === 0) properties = defaultContent.properties;

  const featuredId =
    typeof s["featuredId"] === "string" && properties.some((p) => p.id === s["featuredId"])
      ? (s["featuredId"] as string)
      : properties[0]!.id;

  return { site, agent, featuredId, properties };
}

export function getFeatured(content: SiteContent): Property {
  return content.properties.find((p) => p.id === content.featuredId) ?? content.properties[0]!;
}

export function splitPrice(price: string): { label: string; unit: string } {
  const i = price.indexOf("/");
  if (i === -1) return { label: price.trim(), unit: "" };
  return { label: price.slice(0, i).trim(), unit: `/ ${price.slice(i + 1).trim()}` };
}

/** "Luxury *Waterfront* Duplex" → plain and gold-highlighted parts. */
export function parseTitle(title: string): { text: string; gold: boolean }[] {
  return title
    .split(/\*([^*]+)\*/)
    .map((text, i) => ({ text, gold: i % 2 === 1 }))
    .filter((p) => p.text.length > 0);
}

export const plainTitle = (title: string) => title.replace(/\*/g, "");
export const shortLocation = (location: string) => location.split(",")[0]!.trim();

/* ---------- Filtering ---------- */

export type CategoryFilter = "all" | PropertyCategory;

export function filterProperties<T extends Pick<Property, "category" | "location">>(
  list: T[],
  filter: { category: CategoryFilter; area: string | null },
): T[] {
  return list.filter(
    (p) => (filter.category === "all" || p.category === filter.category) && (!filter.area || shortLocation(p.location) === filter.area),
  );
}

export function listAreas(list: Pick<Property, "location">[]): string[] {
  return [...new Set(list.map((p) => shortLocation(p.location)))];
}

/* ---------- WhatsApp ---------- */

export const VISIT_TYPES = ["Physical Inspection", "Short-Let Booking"] as const;
export type VisitType = (typeof VISIT_TYPES)[number];

export function buildWhatsAppUrl(number: string, message: string): string {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`;
}


export const interestMessage = (title: string) => `Hello, I am interested in the ${plainTitle(title)}`;

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** "2026-11-21" → "Sat, 21 Nov 2026" (no timezone shifts). */
export function formatVisitDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m) return iso;
  const d = new Date(Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
  return `${DAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
}

export function buildBookingMessage(input: { title: string; price: string; date: string; visitType: VisitType }): string {
  return [
    `Hello, I would like to book the ${plainTitle(input.title)}.`,
    `Price: ${input.price}`,
    `Preferred date: ${formatVisitDate(input.date)}`,
    `Visit type: ${input.visitType}`,
  ].join("\n");
}

export const defaultVisitType = (category: PropertyCategory): VisitType =>
  category === "sale" ? "Physical Inspection" : "Short-Let Booking";

/* ---------- Admin helpers ---------- */

/** Copy of a listing for "Duplicate", saved as a new listing. */
export function duplicateProperty(p: Property, id: string): Property {
  return { ...structuredClone(p), id, title: `${p.title} (copy)`.slice(0, 120), status: "new" };
}

/** Moves the item at `from` one place up (-1) or down (+1). */
export function moveItem<T>(list: T[], from: number, dir: -1 | 1): T[] {
  const to = from + dir;
  if (to < 0 || to >= list.length) return list;
  const next = [...list];
  [next[from], next[to]] = [next[to]!, next[from]!];
  return next;
}

/** Drops half-filled rows so the form still saves. */
export function cleanContent(d: SiteContent): SiteContent {
  const host = d.site.host;
  return {
    ...d,
    site: {
      ...d.site,
      host: {
        ...host,
        stats: host.stats.filter((x) => x.value.trim() || x.label.trim()),
        testimonials: host.testimonials.filter((t) => t.quote.trim() || t.name.trim() || t.detail.trim()),
      },
    },
    properties: d.properties.map((p) => ({ ...p, landmarks: p.landmarks.map((l) => l.trim()).filter(Boolean) })),
  };
}

export function blankProperty(id: string): Property {
  return {
    id,
    title: "",
    location: "",
    price: "",
    category: "short-let",
    status: "new",
    video: { url: "", orientation: "wide", duration: "" },
    cover: "",
    gallery: [],
    amenities: ["power", "wifi", "security"],
    description: "",
    landmarks: [],
  };
}
