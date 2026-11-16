import { createFileRoute } from "@tanstack/react-router";
import { MEDIA_BUCKET, MEDIA_PATH_PATTERN } from "@/lib/listing-content";

const TYPES: Record<string, string> = { jpg: "image/jpeg", png: "image/png", webp: "image/webp" };

/**
 * Serves owner-uploaded listing photos one file at a time.
 * The bucket is private with no client read policy; only paths matching
 * MEDIA_PATH_PATTERN are fetched server-side, so the bucket cannot be listed.
 */
export const Route = createFileRoute("/api/public/media/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = params._splat ?? "";
        if (!MEDIA_PATH_PATTERN.test(path)) return new Response("Not found", { status: 404 });
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from(MEDIA_BUCKET).download(path);
        if (error || !data) return new Response("Not found", { status: 404 });
        const ext = path.split(".").pop() ?? "jpg";
        return new Response(data, {
          headers: {
            "content-type": TYPES[ext] ?? "application/octet-stream",
            "cache-control": "public, max-age=31536000, immutable",
            "x-content-type-options": "nosniff",
          },
        });
      },
    },
  },
});
