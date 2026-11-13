import { z } from "zod";
import { WHATSAPP_MESSAGE, defaultContent, staticListing } from "@/config/listing";

export const IMAGE_SLOTS = ["hero", "living", "bedroom", "kitchen", "pool", "agent"] as const;
export type ImageSlot = (typeof IMAGE_SLOTS)[number];

/** Uploaded photos are served from this same-site path. */
export const MEDIA_PREFIX = "/api/public/media/";
export const MEDIA_BUCKET = "listing-media";
export const MEDIA_PATH_PATTERN = /^(hero|living|bedroom|kitchen|pool|agent)\/[\w-]+\.(jpg|png|webp)$/;

const imageRef = z
  .string()
  .trim()
  .max(500)
  .refine((v) => (v.startsWith(MEDIA_PREFIX) && MEDIA_PATH_PATTERN.test(v.slice(MEDIA_PREFIX.length))) || /^https:\/\/\S+$/.test(v), "Invalid photo link")
  .nullable();

export const listingContentSchema = z.object({
  title: z.string().trim().min(1, "Add a property title").max(120),
  badge: z.string().trim().min(1, "Add a location badge").max(80),
  price: z.string().trim().min(1, "Add a price").max(60),
  specs: z.string().trim().max(240),
  location: z.string().trim().min(1, "Add a location").max(80),
  whatsappNumber: z
    .string()
    .trim()
    .regex(/^\d{8,15}$/, "Use digits only with the country code, e.g. 2348012345678"),
  video: z.object({
    url: z.string().trim().max(500),
    orientation: z.enum(["wide", "vertical"]),
    duration: z.string().trim().max(40),
  }),
  agent: z.object({
    name: z.string().trim().min(1, "Add the agent's name").max(80),
    bio: z.string().trim().max(400),
  }),
  images: z.object({
    hero: imageRef,
    living: imageRef,
    bedroom: imageRef,
    kitchen: imageRef,
    pool: imageRef,
    agent: imageRef,
  }),
});

export type ListingContent = z.infer<typeof listingContentSchema>;

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

/** Overlays saved content on the defaults; any missing or invalid field keeps its default. */
export function mergeContent(saved: unknown): ListingContent {
  const s = isObj(saved) ? saved : {};
  const out: Record<string, unknown> = {};
  const shape = listingContentSchema.shape;
  for (const key of Object.keys(shape) as (keyof ListingContent)[]) {
    const fallback = defaultContent[key];
    const candidate = isObj(fallback) ? { ...fallback, ...(isObj(s[key]) ? s[key] : {}) } : (s[key] ?? fallback);
    const parsed = shape[key].safeParse(candidate);
    out[key] = parsed.success ? parsed.data : fallback;
  }
  return out as ListingContent;
}

export function splitPrice(price: string): { label: string; unit: string } {
  const i = price.indexOf("/");
  if (i === -1) return { label: price.trim(), unit: "" };
  return { label: price.slice(0, i).trim(), unit: `/ ${price.slice(i + 1).trim()}` };
}

export function buildWhatsAppUrl(number: string): string {
  return `https://wa.me/${number.replace(/\D/g, "")}?text=${WHATSAPP_MESSAGE.split(" ").join("%20")}`;
}

/** "Luxury *Waterfront* Duplex" → plain and gold-highlighted parts. */
export function parseTitle(title: string): { text: string; gold: boolean }[] {
  return title
    .split(/\*([^*]+)\*/)
    .map((text, i) => ({ text, gold: i % 2 === 1 }))
    .filter((p) => p.text.length > 0);
}

export const plainTitle = (title: string) => title.replace(/\*/g, "");

export const splitSpecs = (specs: string) =>
  specs
    .split(/\s*[•|·]\s*/)
    .map((s) => s.trim())
    .filter(Boolean);

export function resolveListing(content: ListingContent) {
  const { label, unit } = splitPrice(content.price);
  return {
    content,
    titleParts: parseTitle(content.title),
    plainTitle: plainTitle(content.title),
    badge: content.badge,
    location: content.location,
    shortLocation: content.location.split(",")[0]!.trim(),
    price: content.price,
    priceLabel: label,
    priceUnit: unit,
    features: [content.price, ...splitSpecs(content.specs)],
    whatsappUrl: buildWhatsAppUrl(content.whatsappNumber),
    video: { ...content.video, caption: staticListing.videoCaption },
    agency: { ...staticListing.agency, agent: content.agent.name, bio: content.agent.bio },
    testimonials: staticListing.testimonials,
  };
}

export type ResolvedListing = ReturnType<typeof resolveListing>;
