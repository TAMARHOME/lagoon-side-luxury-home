import { describe, expect, it } from "vitest";
import { defaultContent } from "@/config/listing";
import { buildWhatsAppUrl, mergeContent, parseTitle, resolveListing, splitPrice } from "@/lib/listing-content";
import { DEFAULT_ADMIN_PIN, pinMatches } from "@/lib/admin-pin.server";
import { resolveVideoSource } from "@/lib/video-source";

describe("listing booking rules", () => {
  const listing = resolveListing(defaultContent);

  it("sends bookings to the requested WhatsApp link", () => {
    expect(listing.whatsappUrl).toBe(
      "https://wa.me/2348000000000?text=Hello,%20I%20am%20interested%20in%20the%20Lekki%20Phase%201%20Duplex",
    );
  });

  it("shows the nightly rate as ₦150,000", () => {
    expect(listing.priceLabel).toBe("₦150,000");
  });

  it("uses the owner's new WhatsApp number in every booking link", () => {
    expect(buildWhatsAppUrl("2348012345678")).toMatch(/^https:\/\/wa\.me\/2348012345678\?text=/);
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

describe("saved admin content", () => {
  it("keeps defaults for anything never saved", () => {
    expect(mergeContent(null)).toEqual(defaultContent);
  });

  it("applies saved edits and ignores invalid ones", () => {
    const merged = mergeContent({ price: "₦200,000 / night", whatsappNumber: "not-a-number", agent: { name: "Tife" } });
    expect(merged.price).toBe("₦200,000 / night");
    expect(merged.whatsappNumber).toBe(defaultContent.whatsappNumber);
    expect(merged.agent).toEqual({ name: "Tife", bio: defaultContent.agent.bio });
  });

  it("rejects photo links that are not https or uploaded photos", () => {
    const merged = mergeContent({ images: { ...defaultContent.images, hero: "javascript:alert(1)" } });
    expect(merged.images.hero).toBeNull();
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
