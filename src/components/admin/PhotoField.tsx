import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ImageUp, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/compress-image";
import { MEDIA_BUCKET, type ImageSlot } from "@/lib/listing-content";
import { createImageUpload } from "@/lib/site-content.functions";
import { DEFAULT_IMAGES } from "@/components/listing/ListingContext";
import { cn } from "@/lib/utils";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"] as const;
type Accepted = (typeof ACCEPTED)[number];

type Props = {
  slot: ImageSlot;
  label: string;
  value: string | null;
  onChange: (url: string | null) => void;
  className?: string | undefined;
  aspect?: string | undefined;
};

export function PhotoField({ slot, label, value, onChange, className, aspect = "aspect-[4/3]" }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const createUpload = useServerFn(createImageUpload);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    if (!ACCEPTED.includes(file.type as Accepted)) {
      toast.error("Please choose a JPG, PNG or WebP photo.");
      return;
    }
    setBusy(true);
    try {
      const blob = await compressImage(file);
      const contentType = (blob.type || file.type) as Accepted;
      if (blob.size > 10 * 1024 * 1024) throw new Error("That photo is larger than 10 MB.");
      const { path, token, url } = await createUpload({ data: { slot, contentType } });
      const { error } = await supabase.storage.from(MEDIA_BUCKET).uploadToSignedUrl(path, token, blob, { contentType });
      if (error) throw error;
      onChange(url);
      toast.success(`${label} photo uploaded`, { description: "Press “Save & Publish Changes” to put it live." });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("group overflow-hidden rounded-2xl border border-border bg-background/60", className)}>
      <div className={cn("relative", aspect)}>
        <img src={value ?? DEFAULT_IMAGES[slot]} alt={`${label} photo`} className="absolute inset-0 h-full w-full object-cover" />
        <span className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-overlay/85 to-transparent" />
        <span className="absolute bottom-3 left-3 font-display text-lg text-foreground">{label}</span>
        {value && (
          <span className="absolute right-3 top-3 rounded-full bg-gold px-2.5 py-1 text-[0.6rem] font-bold tracking-[0.15em] text-primary-foreground">
            NEW
          </span>
        )}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center bg-overlay/60">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </span>
        )}
      </div>
      <div className="flex flex-wrap items-center gap-2 p-3">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) void handleFile(f);
          }}
        />
        <Button type="button" variant="goldOutline" size="sm" className="rounded-full" disabled={busy} onClick={() => inputRef.current?.click()}>
          <ImageUp /> Replace photo
        </Button>
        {value && (
          <Button type="button" variant="ghost" size="sm" className="rounded-full text-muted-foreground" disabled={busy} onClick={() => onChange(null)}>
            <RotateCcw /> Use original
          </Button>
        )}
      </div>
    </div>
  );
}
