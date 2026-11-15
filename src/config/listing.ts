/**
 * Default site content. The owner edits everything through /admin (saved
 * online); these values are only used for anything not saved there yet.
 * Photos written as "asset:<name>" are the ones that ship with the site
 * (see src/lib/listing-assets.ts).
 */
import type { SiteContent } from "@/lib/listing-content";

export const defaultContent: SiteContent = {
  site: {
    brand: {
      name: "PrimeHaven",
      tagline: "Lagos",
      footerLocation: "Lekki · Victoria Island · Ikoyi · Lagos, Nigeria",
      copyright: "",
      enquiryMessage: "Hello, I am interested in your Lagos properties",
    },
    seo: { title: "", description: "" },
    hero: {
      badge: "Featured Listing",
      bookLabel: "Book Inspection / Reserve",
      detailsLabel: "View Details & Video",
      chatLabel: "Chat on WhatsApp",
    },
    catalog: {
      eyebrow: "The Collection",
      title: "Available Properties *& Short-Lets*",
      intro: "Handpicked residences across Lagos. Tap any home for photos, a video walkthrough and instant booking.",
    },
    video: {
      show: true,
      eyebrow: "Virtual Viewing",
      title: "Property Walkthrough *& Video Tour*",
      caption: "Take a 2-minute virtual walkthrough of the interior, compound, and neighborhood",
    },
    gallery: { show: true, eyebrow: "The Residence", title: "Every room, *curated.*", intro: "Tap any photo to view it full-screen." },
    amenities: { show: true, eyebrow: "Amenities & Specs", title: "Built for *effortless* living." },
    host: {
      show: true,
      eyebrow: "Your Host",
      title: "Hosted with *discretion.*",
      badge: "Verified Host",
      stats: [
        { value: "120+", label: "Luxury stays hosted" },
        { value: "4.9", label: "Guest rating" },
        { value: "8 yrs", label: "In Lagos real estate" },
      ],
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
    },
    footer: {
      eyebrow: "Limited Availability",
      title: "Find your next address in *Lagos.*",
      subline: "Instant replies on WhatsApp",
      ctaLabel: "Chat on WhatsApp",
    },
    amenityText: [],
  },
  agent: {
    agencyName: "PrimeHaven Properties Lagos",
    name: "Adaeze Okafor",
    role: "Lead Property Consultant",
    bio: "Trusted luxury short-let and property specialists in Lekki & Victoria Island",
    whatsappNumber: "2348000000000",
    photo: null,
  },
  featuredId: "lekki-waterfront-duplex",
  properties: [
    {
      id: "lekki-waterfront-duplex",
      // Wrap a word in *stars* to show it in gold italics.
      title: "Luxury 3-Bedroom *Waterfront* Duplex",
      location: "Lekki Phase 1, Lagos",
      price: "₦150,000 / night",
      category: "short-let",
      status: "available",
      video: { url: "", orientation: "wide", duration: "01:45 HD Tour" },
      cover: "asset:hero",
      gallery: [
        { url: "asset:living", label: "Living Room" },
        { url: "asset:bedroom", label: "Master Bedroom" },
        { url: "asset:kitchen", label: "Fitted Kitchen" },
        { url: "asset:pool", label: "Swimming Pool" },
      ],
      amenities: ["power", "wifi", "security", "pool", "gym", "parking", "waterfront"],
      description:
        "A double-height waterfront duplex with three en-suite bedrooms, a private pool deck and lagoon views — moments from Lekki's best restaurants.",
      landmarks: ["5 mins from Admiralty Way", "10 mins from Lekki Toll Gate"],
    },
    {
      id: "vi-skyline-penthouse",
      title: "Penthouse *Skyline* Apartment",
      location: "Victoria Island, Lagos",
      price: "₦220,000 / night",
      category: "short-let",
      status: "new",
      video: { url: "", orientation: "wide", duration: "01:30 HD Tour" },
      cover: "asset:penthouse-cover",
      gallery: [{ url: "asset:penthouse-bedroom", label: "Master Suite" }],
      amenities: ["power", "wifi", "security", "gym", "ac", "tv", "waterfront"],
      description: "A top-floor penthouse with floor-to-ceiling ocean views, marble finishes and a private lift lobby.",
      landmarks: ["3 mins from Eko Atlantic", "5 mins from Adeola Odeku"],
    },
    {
      id: "banana-island-mansion",
      title: "5-Bedroom *Detached* Mansion",
      location: "Banana Island, Ikoyi",
      price: "₦1,200,000,000",
      category: "sale",
      status: "available",
      video: { url: "", orientation: "wide", duration: "02:00 HD Tour" },
      cover: "asset:mansion-cover",
      gallery: [{ url: "asset:mansion-living", label: "Grand Living Room" }],
      amenities: ["power", "security", "pool", "parking", "staff", "kitchen"],
      description:
        "A newly built detached mansion on a quiet Banana Island close, with a pool, cinema room and two-room staff quarters. Certificate of Occupancy available.",
      landmarks: ["2 mins from Banana Island Gate", "10 mins from Ikoyi Club"],
    },
    {
      id: "ikoyi-serviced-apartment",
      title: "2-Bedroom *Serviced* Apartment",
      location: "Old Ikoyi, Lagos",
      price: "₦95,000 / night",
      category: "short-let",
      status: "booked",
      video: { url: "", orientation: "wide", duration: "01:15 HD Tour" },
      cover: "asset:serviced-cover",
      gallery: [{ url: "asset:serviced-kitchen", label: "Kitchen" }],
      amenities: ["power", "wifi", "security", "ac", "kitchen", "tv", "housekeeping"],
      description: "A calm, fully serviced apartment with daily housekeeping — ideal for business stays.",
      landmarks: ["5 mins from Falomo Bridge"],
    },
  ],
};
