import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

export function Section({
  n,
  title,
  description,
  action,
  children,
}: {
  n: string;
  title: string;
  description: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-border bg-card-gradient p-5 shadow-card md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span className="font-display text-3xl italic text-gold">{n}</span>
          <div>
            <h2 className="font-display text-2xl text-foreground md:text-3xl">{title}</h2>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
        {action}
      </div>
      <div className="gold-rule my-6" />
      <div className="grid gap-5">{children}</div>
    </section>
  );
}

export function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string;
  label: string;
  hint?: string | undefined;
  error?: string | undefined;
  children: ReactNode;
}) {
  return (
    <div>
      <Label htmlFor={id} className="text-sm text-foreground">
        {label}
      </Label>
      <div className="mt-2">{children}</div>
      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : hint ? <p className="mt-2 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly { id: T; label: string; icon?: LucideIcon }[];
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <p className="text-sm font-medium text-foreground">{label}</p>
      <div role="group" aria-label={label} className="mt-2 inline-flex flex-wrap rounded-full border border-border bg-background p-1">
        {options.map(({ id, label: l, icon: Icon }) => (
          <button
            key={id}
            type="button"
            aria-pressed={value === id}
            onClick={() => onChange(id)}
            className={cn(
              "flex items-center gap-2 rounded-full px-4 py-2 text-xs font-medium transition-all",
              value === id ? "bg-gold text-primary-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {Icon && <Icon className="h-4 w-4" />} {l}
          </button>
        ))}
      </div>
    </div>
  );
}
