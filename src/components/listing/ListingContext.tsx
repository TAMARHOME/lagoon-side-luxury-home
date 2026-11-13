import { createContext, useContext, useMemo, type ReactNode } from "react";
import heroImg from "@/assets/hero-duplex.jpg";
import living from "@/assets/gallery-living.jpg";
import bedroom from "@/assets/gallery-bedroom.jpg";
import kitchen from "@/assets/gallery-kitchen.jpg";
import pool from "@/assets/gallery-pool.jpg";
import agent from "@/assets/agent-portrait.jpg";
import { resolveListing, type ImageSlot, type ListingContent, type ResolvedListing } from "@/lib/listing-content";

/** Original photos shipped with the site, used until the owner uploads a replacement. */
export const DEFAULT_IMAGES: Record<ImageSlot, string> = { hero: heroImg, living, bedroom, kitchen, pool, agent };

export function resolveImages(images: ListingContent["images"]): Record<ImageSlot, string> {
  return {
    hero: images.hero ?? DEFAULT_IMAGES.hero,
    living: images.living ?? DEFAULT_IMAGES.living,
    bedroom: images.bedroom ?? DEFAULT_IMAGES.bedroom,
    kitchen: images.kitchen ?? DEFAULT_IMAGES.kitchen,
    pool: images.pool ?? DEFAULT_IMAGES.pool,
    agent: images.agent ?? DEFAULT_IMAGES.agent,
  };
}

type ListingValue = ResolvedListing & { imageSrc: Record<ImageSlot, string> };
const ListingCtx = createContext<ListingValue | null>(null);

export function ListingProvider({ content, children }: { content: ListingContent; children: ReactNode }) {
  const value = useMemo(
    () => ({ ...resolveListing(content), imageSrc: resolveImages(content.images) }),
    [content],
  );
  return <ListingCtx.Provider value={value}>{children}</ListingCtx.Provider>;
}

export function useListing(): ListingValue {
  const value = useContext(ListingCtx);
  if (!value) throw new Error("useListing must be used inside <ListingProvider>");
  return value;
}
