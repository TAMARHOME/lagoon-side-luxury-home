import { describe, expect, it } from "vitest";
import { listing } from "@/config/listing";
import { resolveVideoSource } from "@/lib/video-source";

describe("listing booking rules", () => {
  it("sends bookings to the requested WhatsApp link", () => {
    expect(listing.whatsappUrl).toBe(
      "https://wa.me/2348000000000?text=Hello,%20I%20am%20interested%20in%20the%20Lekki%20Phase%201%20Duplex",
    );
  });

  it("shows the nightly rate as ₦150,000", () => {
    expect(listing.priceLabel).toBe("₦150,000");
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
