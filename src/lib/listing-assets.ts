import hero from "@/assets/hero-duplex.jpg";
import living from "@/assets/gallery-living.jpg";
import bedroom from "@/assets/gallery-bedroom.jpg";
import kitchen from "@/assets/gallery-kitchen.jpg";
import pool from "@/assets/gallery-pool.jpg";
import agent from "@/assets/agent-portrait.jpg";
import poster from "@/assets/video-poster.jpg";
import penthouseCover from "@/assets/penthouse-cover.jpg";
import penthouseBedroom from "@/assets/penthouse-bedroom.jpg";
import mansionCover from "@/assets/mansion-cover.jpg";
import mansionLiving from "@/assets/mansion-living.jpg";
import servicedCover from "@/assets/serviced-cover.jpg";
import servicedKitchen from "@/assets/serviced-kitchen.jpg";
import {
  CATEGORY_LABELS,
  STATUS_LABELS,
  amenityInfo,
  buildWhatsAppUrl,
  interestMessage,
  parseTitle,
  plainTitle,
  shortLocation,
  splitPrice,
  type Agent,
  type Property,
} from "./listing-content";

/** Photos that ship with the site, referenced in saved content as "asset:<name>". */
const ASSETS: Record<string, string> = {
  hero,
  living,
  bedroom,
  kitchen,
  pool,
  agent,
  poster,
  "penthouse-cover": penthouseCover,
  "penthouse-bedroom": penthouseBedroom,
  "mansion-cover": mansionCover,
  "mansion-living": mansionLiving,
  "serviced-cover": servicedCover,
  "serviced-kitchen": servicedKitchen,
};

export const DEFAULT_AGENT_PHOTO = agent;

/** Turns a saved photo reference into something an <img> can show. */
export function resolveImage(ref: string | null | undefined): string | null {
  if (!ref) return null;
  if (ref.startsWith("asset:")) return ASSETS[ref.slice(6)] ?? null;
  return ref;
}

export function resolveProperty(p: Property, whatsappNumber: string) {
  const { label, unit } = splitPrice(p.price);
  const amenities = p.amenities.map(amenityInfo);
  return {
    ...p,
    titleParts: parseTitle(p.title),
    plainTitle: plainTitle(p.title),
    shortLocation: shortLocation(p.location),
    priceLabel: label,
    priceUnit: unit,
    categoryLabel: CATEGORY_LABELS[p.category],
    statusLabel: STATUS_LABELS[p.status],
    coverSrc: resolveImage(p.cover),
    photos: p.gallery.map((g) => ({ src: resolveImage(g.url), label: g.label })).filter((g): g is { src: string; label: string } => !!g.src),
    amenityList: amenities,
    highlights: [p.price, ...amenities.slice(0, 3).map((a) => a.label)],
    whatsappNumber,
    interestUrl: buildWhatsAppUrl(whatsappNumber, interestMessage(p.title)),
  };
}
export type ResolvedProperty = ReturnType<typeof resolveProperty>;

export function resolveAgent(a: Agent) {
  return { ...a, photoSrc: resolveImage(a.photo) ?? DEFAULT_AGENT_PHOTO, firstName: a.name.split(" ")[0] ?? a.name };
}
export type ResolvedAgent = ReturnType<typeof resolveAgent>;
