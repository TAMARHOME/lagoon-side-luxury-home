import { useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { ImagePlus, ImageUp, Link2, Loader2, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { compressImage } from "@/lib/compress-image";
import { resolveImage } from "@/lib/listing-assets";
import { MEDIA_BUCKET, isValidImageRef } from "@/lib/listing-content";
import { createImageUpload } from "@/lib/site-content.functions";
import { cn } from "@/lib/utils";

const ACCEPTED = ["image/jpeg", "image/png", "image/webp"] as const;
type Accepted = (typeof ACCEPTED)[number];

type Props = {
  kind: "property" | "agent";
  label: string;
  /** Saved photo reference, or null/"" when empty. */
  value: string | null;
  onChange: (ref: string) => void;
  /** Shown when there is no value (e.g. the original agent portrait). */
  fallbackSrc?: string | null | undefined;
  /** Optional second action: "Use original" or "Remove". */
  onClear?: (() => void) | undefined;
  clearLabel?: string | undefined;
  error?: string | undefined;
  aspect?: string | undefined;
  className?: string | undefined;
};

export function PhotoField({ kind, label, value, onChange, fallbackSrc, onClear, clearLabel, error, aspect = "aspect-[4/3]", className }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const createUpload = useServerFn(createImageUpload);
  const [busy, setBusy] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [link, setLink] = useState("");
  const src = resolveImage(value) ?? fallbackSrc ?? null;

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
      const { path, token, url } = await createUpload({ data: { kind, contentType } });
      const { error: upErr } = await supabase.storage.from(MEDIA_BUCKET).uploadToSignedUrl(path, token, blob, { contentType });
      if (upErr) throw upErr;
      onChange(url);
      toast.success("Photo uploaded", { description: "Press “Save & Publish Changes” to put it live." });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  function applyLink() {
    const v = link.trim();
    if (!/^https:\/\//.test(v) || !isValidImageRef(v)) {
      toast.error("Paste a full image link starting with https://");
      return;
    }
    onChange(v);
    setLink("");
    setLinkOpen(false);
  }

  return (
    <div className={cn("overflow-hidden rounded-2xl border bg-background/60", error ? "border-destructive" : "border-border", className)}>
      <div className={cn("relative bg-card", aspect)}>
        {src ? (
          <img src={src} alt={`${label} photo`} className="absolute inset-0 h-full w-full object-cover" />
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground transition-colors hover:text-primary"
          >
            <ImagePlus className="h-7 w-7" strokeWidth={1.5} />
            <span className="text-xs">Upload a photo</span>
          </button>
        )}
        {src && <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-overlay/85 to-transparent" />}
        {src && <span className="pointer-events-none absolute bottom-3 left-3 font-display text-lg text-foreground">{label}</span>}
        {busy && (
          <span className="absolute inset-0 flex items-center justify-center bg-overlay/60">
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
          </span>
        )}
      </div>
      <div className="grid gap-2 p-3">
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED.join(",")}
          className="hidden"
          aria-label={`Upload ${label} photo`}
          onChange={(e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (f) void handleFile(f);
          }}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" variant="goldOutline" size="sm" className="rounded-full" disabled={busy} onClick={() => inputRef.current?.click()}>
            <ImageUp /> {src ? "Replace" : "Upload"}
          </Button>
          <Button type="button" variant="ghost" size="sm" className="rounded-full text-muted-foreground" disabled={busy} onClick={() => setLinkOpen((o) => !o)}>
            <Link2 /> Link
          </Button>
          {onClear && (
            <Button type="button" variant="ghost" size="sm" className="rounded-full text-muted-foreground" disabled={busy} onClick={onClear}>
              {clearLabel === "Use original" ? <RotateCcw /> : <Trash2 />} {clearLabel ?? "Remove"}
            </Button>
          )}
        </div>
        {linkOpen && (
          <div className="flex gap-2">
            <Input
              value={link}
              placeholder="https://…/photo.jpg"
              aria-label={`${label} image link`}
              onChange={(e) => setLink(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLink();
                }
              }}
            />
            <Button type="button" variant="gold" size="sm" className="rounded-full" onClick={applyLink}>
              Use
            </Button>
          </div>
        )}
        {error && <p className="text-xs text-destructive">{error}</p>}
      </div>
    </div>
  );
}
