export type VideoSource =
  | { kind: "none" }
  | { kind: "file"; src: string }
  | { kind: "embed"; provider: "youtube" | "instagram" | "tiktok"; src: string; vertical: boolean };

/** Turns a pasted MP4 / YouTube / Instagram / TikTok link into something the player can show. */
export function resolveVideoSource(raw: string): VideoSource {
  const url = raw.trim();
  if (!url) return { kind: "none" };

  if (/\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url)) return { kind: "file", src: url };

  const yt =
    url.match(/youtu\.be\/([\w-]{6,})/) ??
    url.match(/youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)([\w-]{6,})/);
  if (yt) {
    return {
      kind: "embed",
      provider: "youtube",
      src: `https://www.youtube.com/embed/${yt[1]}?autoplay=1&rel=0&modestbranding=1`,
      vertical: url.includes("/shorts/"),
    };
  }

  const ig = url.match(/instagram\.com\/(?:reel|reels|p|tv)\/([\w-]+)/);
  if (ig) {
    return {
      kind: "embed",
      provider: "instagram",
      src: `https://www.instagram.com/reel/${ig[1]}/embed`,
      vertical: true,
    };
  }

  const tt = url.match(/tiktok\.com\/.*\/video\/(\d+)/);
  if (tt) {
    return {
      kind: "embed",
      provider: "tiktok",
      src: `https://www.tiktok.com/embed/v2/${tt[1]}`,
      vertical: true,
    };
  }

  return { kind: "none" };
}
