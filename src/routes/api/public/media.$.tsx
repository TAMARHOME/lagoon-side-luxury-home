import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { MEDIA_BUCKET, MEDIA_PATH_PATTERN } from "@/lib/listing-content";

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

/** Serves owner-uploaded listing photos (publicly viewable by design). */
export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = params._splat ?? "";
        if (!MEDIA_PATH_PATTERN.test(path)) return new Response("Not found", { status: 404 });
        const url = process.env["SUPABASE_URL"];
        const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
        if (!url || !key) return new Response("Unavailable", { status: 503 });
        const db = createClient(url, key, {
          auth: { persistSession: false, autoRefreshToken: false },
          global: {
            fetch: (input, init) => {
              const h = new Headers(init?.headers);
              if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
              h.set("apikey", key);
              return fetch(input, { ...init, headers: h });
            },
          },
        });
        const { data, error } = await db.storage.from(MEDIA_BUCKET).download(path);
        if (error || !data) return new Response("Not found", { status: 404 });
        const ext = path.split(".").pop() ?? "jpg";
        return new Response(data, {
          headers: {
            "content-type": TYPES[ext] ?? "application/octet-stream",
            "cache-control": "public, max-age=31536000, immutable",
          },
        });
      },
    },
  },
});
