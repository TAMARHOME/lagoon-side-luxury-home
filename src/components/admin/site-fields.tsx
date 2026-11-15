import { Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { SiteSettings } from "@/lib/listing-content";
import { Field } from "./form-parts";

/** Updates one area of the website settings, e.g. setSite("hero", { bookLabel }). */
export type SetSite = <K extends Exclude<keyof SiteSettings, "amenityText">>(key: K, patch: Partial<SiteSettings[K]>) => void;

export function TextField({
  id,
  label,
  value,
  onChange,
  error,
  hint,
  rows,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | undefined;
  hint?: string | undefined;
  rows?: number;
  placeholder?: string;
}) {
  return (
    <Field id={id} label={label} error={error} hint={hint}>
      {rows ? (
        <Textarea id={id} rows={rows} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <Input id={id} value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
      )}
    </Field>
  );
}

export function ShowToggle({ id, checked, onChange }: { id: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center gap-3 rounded-full border border-border px-4 py-2 text-xs text-muted-foreground">
      {checked ? <Eye className="h-4 w-4 text-primary" /> : <EyeOff className="h-4 w-4" />}
      <span className="min-w-[7.5rem]">{checked ? "Shown on website" : "Hidden from website"}</span>
      <Switch id={id} checked={checked} onCheckedChange={onChange} />
    </label>
  );
}
