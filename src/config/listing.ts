/**
 * Default listing content. The owner normally edits these through /admin
 * (saved online); these values are only used until something is saved there,
 * or for any field that was never changed.
 */
import type { ListingContent } from "@/lib/listing-content";

/** Pre-filled WhatsApp message sent with every booking enquiry. */
export const WHATSAPP_MESSAGE = "Hello, I am interested in the Lekki Phase 1 Duplex";

export const defaultContent: ListingContent = {
  // Wrap a word in *stars* to show it in gold italics.
  title: "Luxury 3-Bedroom *Waterfront* Duplex",
  badge: "EXCLUSIVE LISTING • LEKKI PHASE 1",
  price: "₦150,000 / night",
  specs: "24/7 Power • Starlink Wi-Fi • Armed Estate Security",
  location: "Lekki Phase 1, Lagos",
  whatsappNumber: "2348000000000",
  video: {
    // MP4 link, YouTube, Instagram Reel or TikTok. Empty = "request a live video call" card.
    url: "",
    orientation: "wide",
    duration: "01:45 HD Tour",
  },
  agent: {
    name: "Adaeze Okafor",
    bio: "Trusted luxury short-let and property specialists in Lekki & Victoria Island",
  },
  // null = use the original photo that ships with the site.
  images: { hero: null, living: null, bedroom: null, kitchen: null, pool: null, agent: null },
};

/** Content that is not editable from /admin. */
export const staticListing = {
  videoCaption: "Take a 2-minute virtual walkthrough of the interior, compound, and neighborhood",
  agency: {
    name: "PrimeHaven Properties Lagos",
    role: "Lead Property Consultant",
    stats: [
      { value: "120+", label: "Luxury stays hosted" },
      { value: "4.9", label: "Guest rating" },
      { value: "8 yrs", label: "In Lagos real estate" },
    ],
  },
  testimonials: [
    {
      quote:
        "Spotless, secure and the power never blinked once. Check-in was seamless — easily the best short-let I've booked in Lekki.",
      name: "Tunde A.",
      detail: "Business stay • 5 nights",
    },
    {
      quote:
        "The pool, the Starlink, the view — exactly as shown in the video. PrimeHaven responded on WhatsApp within minutes.",
      name: "Chioma E.",
      detail: "Family getaway • 3 nights",
    },
  ],
} as const;
