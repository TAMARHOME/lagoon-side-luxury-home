import { Car, CookingPot, Dumbbell, House, ShieldCheck, Snowflake, Sparkles, Sunset, Tv, Waves, Wifi, Zap, type LucideIcon } from "lucide-react";
import type { AmenityKey } from "@/lib/listing-content";

export const AMENITY_ICONS: Record<AmenityKey, LucideIcon> = {
  power: Zap,
  wifi: Wifi,
  security: ShieldCheck,
  pool: Waves,
  gym: Dumbbell,
  parking: Car,
  ac: Snowflake,
  kitchen: CookingPot,
  tv: Tv,
  housekeeping: Sparkles,
  waterfront: Sunset,
  staff: House,
};
