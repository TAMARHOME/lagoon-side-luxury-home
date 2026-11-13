import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";
import { IMAGE_SLOTS, MEDIA_BUCKET, MEDIA_PREFIX, listingContentSchema, mergeContent } from "./listing-content";
import { pinMatches } from "./admin-pin.server";
import { clientKey, getAdminSession, isAdminUnlocked, requireAdmin } from "./admin-session.server";

const MAX_ATTEMPTS = 8;
const WINDOW_MINUTES = 15;

/** Public read of the landing page content (falls back to defaults). */
export const getSiteContent = createServerFn({ method: "GET" }).handler(async () => {
  const url = process.env["SUPABASE_URL"];
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"];
  if (!url || !key) return mergeContent(null);
  const db = createClient<Database>(url, key, {
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
  const { data, error } = await db.from("site_content").select("content").eq("id", "main").maybeSingle();
  if (error) console.error("getSiteContent failed", error);
  return mergeContent(data?.content ?? null);
});

export const getAdminStatus = createServerFn({ method: "GET" }).handler(async () => ({
  unlocked: await isAdminUnlocked(),
}));

export const unlockAdmin = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => z.object({ pin: z.string().max(64) }).parse(input))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const who = clientKey();
    const since = new Date(Date.now() - WINDOW_MINUTES * 60_000).toISOString();
    const { count } = await supabaseAdmin
      .from("admin_unlock_attempts")
      .select("id", { count: "exact", head: true })
      .eq("client_key", who)
      .gte("created_at", since);
    if ((count ?? 0) >= MAX_ATTEMPTS) return { ok: false as const, reason: "too_many" as const };

    if (!pinMatches(data.pin)) {
      await supabaseAdmin.from("admin_unlock_attempts").insert({ client_key: who });
      await supabaseAdmin
        .from("admin_unlock_attempts")
        .delete()
        .lt("created_at", new Date(Date.now() - 86_400_000).toISOString());
      return { ok: false as const, reason: "wrong" as const, remaining: Math.max(0, MAX_ATTEMPTS - (count ?? 0) - 1) };
    }

    await supabaseAdmin.from("admin_unlock_attempts").delete().eq("client_key", who);
    const session = await getAdminSession();
    await session.update({ unlocked: true });
    return { ok: true as const };
  });

export const lockAdmin = createServerFn({ method: "POST" }).handler(async () => {
  const session = await getAdminSession();
  await session.clear();
  return { ok: true };
});

export const saveSiteContent = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => listingContentSchema.parse(input))
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin
      .from("site_content")
      .upsert({ id: "main", content: data, updated_at: new Date().toISOString() });
    if (error) {
      console.error("saveSiteContent failed", error);
      throw new Error("Could not save changes. Please try again.");
    }
    return mergeContent(data);
  });

const IMAGE_TYPES = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp" } as const;

/** Gives the unlocked owner a one-time upload slot for a new photo. */
export const createImageUpload = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) =>
    z
      .object({
        slot: z.enum(IMAGE_SLOTS),
        contentType: z.enum(Object.keys(IMAGE_TYPES) as [keyof typeof IMAGE_TYPES, ...(keyof typeof IMAGE_TYPES)[]]),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await requireAdmin();
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const path = `${data.slot}/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${IMAGE_TYPES[data.contentType]}`;
    const { data: signed, error } = await supabaseAdmin.storage.from(MEDIA_BUCKET).createSignedUploadUrl(path);
    if (error || !signed) {
      console.error("createImageUpload failed", error);
      throw new Error("Could not prepare the upload. Please try again.");
    }
    return { path, token: signed.token, url: `${MEDIA_PREFIX}${path}` };
  });
