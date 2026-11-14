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
export const amenityInfo = (key: AmenityKey) => AMENITIES.find((a) => a.key === key)!;

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
  bio: z.string().trim().max(400),
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^\d{8,15}$/, "Use digits only with the country code, e.g. 2348012345678"),
  /** null = the original portrait that ships with the site. */
  photo: imageRef.nullable(),
});
export type Agent = z.infer<typeof agentSchema>;

export const siteContentSchema = z
  .object({
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

/** Overlays saved content on the defaults; invalid agent fields keep their default, invalid properties are skipped. */
export function mergeContent(saved: unknown): SiteContent {
  const s = isObj(saved) ? saved : {};
  const agentIn = isObj(s["agent"]) ? s["agent"] : {};
  const agent: Record<string, unknown> = {};
  for (const key of Object.keys(agentSchema.shape) as (keyof Agent)[]) {
    const fallback = defaultContent.agent[key];
    const parsed = agentSchema.shape[key].safeParse(key in agentIn ? agentIn[key] : fallback);
    agent[key] = parsed.success ? parsed.data : fallback;
  }

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

  return { agent: agent as Agent, featuredId, properties };
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
