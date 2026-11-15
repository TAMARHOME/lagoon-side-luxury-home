import { describe, expect, it } from "vitest";
import { defaultContent } from "@/config/listing";
import {
  amenityInfo,
  buildBookingMessage,
  cleanContent,
  duplicateProperty,
  moveItem,
  buildWhatsAppUrl,
  filterProperties,
  getFeatured,
  interestMessage,
  mergeContent,
  parseTitle,
  splitPrice,
} from "@/lib/listing-content";
import { DEFAULT_ADMIN_PIN, pinMatches } from "@/lib/admin-pin.server";
import { resolveVideoSource } from "@/lib/video-source";

describe("listing booking rules", () => {
  const featured = getFeatured(defaultContent);

  it("features the Lekki duplex at ₦150,000 / night by default", () => {
    expect(featured.id).toBe("lekki-waterfront-duplex");
    expect(splitPrice(featured.price)).toEqual({ label: "₦150,000", unit: "/ night" });
  });

  it("pre-fills WhatsApp with that specific property's name", () => {
    expect(buildWhatsAppUrl("2348000000000", interestMessage("Penthouse *Skyline* Apartment"))).toBe(
      "https://wa.me/2348000000000?text=Hello%2C%20I%20am%20interested%20in%20the%20Penthouse%20Skyline%20Apartment",
    );
  });

  it("booking popup message includes title, price, date and visit type", () => {
    expect(
      buildBookingMessage({ title: "Luxury *Waterfront* Duplex", price: "₦150,000 / night", date: "2026-11-21", visitType: "Short-Let Booking" }),
    ).toBe(
      "Hello, I would like to book the Luxury Waterfront Duplex.\nPrice: ₦150,000 / night\nPreferred date: Sat, 21 Nov 2026\nVisit type: Short-Let Booking",
    );
  });

  it("shows a sale price with no per-night unit", () => {
    expect(splitPrice("₦250,000,000")).toEqual({ label: "₦250,000,000", unit: "" });
  });

  it("highlights the *starred* title word in gold", () => {
    expect(parseTitle("Luxury *Waterfront* Duplex")).toEqual([
      { text: "Luxury ", gold: false },
      { text: "Waterfront", gold: true },
      { text: " Duplex", gold: false },
    ]);
  });
});

describe("category & area filters", () => {
  const list = defaultContent.properties;
  it("“Short-Lets” shows only short-lets", () => {
    expect(filterProperties(list, { category: "short-let", area: null }).every((p) => p.category === "short-let")).toBe(true);
  });
  it("“For Sale” shows only homes for sale", () => {
    expect(filterProperties(list, { category: "sale", area: null }).map((p) => p.id)).toEqual(["banana-island-mansion"]);
  });
  it("area filter matches the first part of the location", () => {
    expect(filterProperties(list, { category: "all", area: "Victoria Island" }).map((p) => p.id)).toEqual(["vi-skyline-penthouse"]);
  });
});

describe("saved admin content", () => {
  it("keeps defaults for anything never saved", () => {
    expect(mergeContent(null)).toEqual(defaultContent);
  });

  it("keeps the default WhatsApp number when a saved one is invalid", () => {
    const merged = mergeContent({ agent: { name: "Tife", whatsappNumber: "not-a-number" } });
    expect(merged.agent.name).toBe("Tife");
    expect(merged.agent.whatsappNumber).toBe(defaultContent.agent.whatsappNumber);
  });

  it("skips saved properties with unsafe photo links", () => {
    const good = defaultContent.properties[0]!;
    const merged = mergeContent({ properties: [{ ...good, id: "bad", cover: "javascript:alert(1)" }, good] });
    expect(merged.properties.map((p) => p.id)).toEqual([good.id]);
  });

  it("falls back to the first property when the featured one was deleted", () => {
    const [a, b] = defaultContent.properties;
    expect(mergeContent({ featuredId: "gone", properties: [b, a] }).featuredId).toBe(b!.id);
  });
});

describe("website text, brand & footer", () => {
  it("keeps the PrimeHaven name and Lagos footer location until the owner changes them", () => {
    const { brand } = mergeContent(null).site;
    expect(brand.name).toBe("PrimeHaven");
    expect(brand.footerLocation).toBe("Lekki · Victoria Island · Ikoyi · Lagos, Nigeria");
  });

  it("uses the owner's website name and footer location once saved", () => {
    const merged = mergeContent({ site: { brand: { name: "Tife Homes", footerLocation: "Ikeja, Lagos" } } });
    expect(merged.site.brand.name).toBe("Tife Homes");
    expect(merged.site.brand.footerLocation).toBe("Ikeja, Lagos");
    expect(merged.site.hero.bookLabel).toBe(defaultContent.site.hero.bookLabel);
  });

  it("an empty website name falls back to the default instead of breaking the header", () => {
    expect(mergeContent({ site: { brand: { name: "" } } }).site.brand.name).toBe("PrimeHaven");
  });

  it("hidden sections stay hidden", () => {
    expect(mergeContent({ site: { video: { show: false } } }).site.video.show).toBe(false);
  });

  it("drops a broken review but keeps the good ones", () => {
    const good = { quote: "Lovely stay", name: "Ada", detail: "" };
    const merged = mergeContent({ site: { host: { testimonials: [{ quote: "", name: "" }, good] } } });
    expect(merged.site.host.testimonials).toEqual([good]);
  });

  it("drops blank review and number rows when saving", () => {
    const d = structuredClone(defaultContent);
    d.site.host.testimonials.push({ quote: " ", name: "", detail: "" });
    d.site.host.stats.push({ value: "", label: "" });
    const c = cleanContent(d);
    expect(c.site.host.testimonials).toHaveLength(2);
    expect(c.site.host.stats).toHaveLength(3);
  });

  it("owner's amenity wording replaces the standard wording", () => {
    expect(amenityInfo("wifi", [{ key: "wifi", label: "Fibre Internet", text: "1 Gbps" }])).toEqual({ key: "wifi", label: "Fibre Internet", text: "1 Gbps" });
    expect(amenityInfo("wifi").label).toBe("Starlink Wi-Fi");
  });
});

describe("listing manager", () => {
  it("duplicating creates a separate new listing", () => {
    const original = defaultContent.properties[0]!;
    const copy = duplicateProperty(original, "copy-1");
    expect(copy.id).toBe("copy-1");
    expect(copy.status).toBe("new");
    expect(copy.title).toBe(`${original.title} (copy)`);
    copy.gallery.push({ url: "asset:pool", label: "x" });
    expect(original.gallery).toHaveLength(4);
  });

  it("moves a listing up or down, never past the ends", () => {
    expect(moveItem(["a", "b", "c"], 2, -1)).toEqual(["a", "c", "b"]);
    expect(moveItem(["a", "b", "c"], 0, -1)).toEqual(["a", "b", "c"]);
  });
});

describe("admin PIN", () => {
  it("defaults to 1234", () => {
    expect(DEFAULT_ADMIN_PIN).toBe("1234");
    expect(pinMatches("1234", DEFAULT_ADMIN_PIN)).toBe(true);
    expect(pinMatches("0000", DEFAULT_ADMIN_PIN)).toBe(false);
  });
});

describe("video tour source swapping", () => {
  it("plays an MP4 file directly", () => {
    expect(resolveVideoSource("/videos/tour.mp4")).toEqual({ kind: "file", src: "/videos/tour.mp4" });
  });
  it("embeds a YouTube link", () => {
    const s = resolveVideoSource("https://youtu.be/dQw4w9WgXcQ");
    expect(s.kind === "embed" && s.src).toContain("youtube.com/embed/dQw4w9WgXcQ");
  });
  it("embeds an Instagram reel as vertical", () => {
    const s = resolveVideoSource("https://www.instagram.com/reel/C1abcDEF/");
    expect(s).toMatchObject({ kind: "embed", provider: "instagram", vertical: true });
  });
  it("embeds a TikTok video", () => {
    const s = resolveVideoSource("https://www.tiktok.com/@primehaven/video/7301234567890");
    expect(s.kind === "embed" && s.src).toBe("https://www.tiktok.com/embed/v2/7301234567890");
  });
  it("falls back when no link is set", () => {
    expect(resolveVideoSource("")).toEqual({ kind: "none" });
  });
});
