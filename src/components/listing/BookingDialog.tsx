import { useState, type FormEvent, type ReactNode } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Building2, CalendarDays, KeyRound, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VISIT_TYPES, buildBookingMessage, buildWhatsAppUrl, defaultVisitType, type VisitType } from "@/lib/listing-content";
import type { ResolvedProperty } from "@/lib/listing-assets";
import { cn } from "@/lib/utils";
import { WhatsAppIcon } from "./WhatsAppIcon";

const VISIT_ICONS: Record<VisitType, typeof Building2> = {
  "Physical Inspection": Building2,
  "Short-Let Booking": KeyRound,
};

function todayIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

/** Wrap any button with this to ask for a date + visit type, then open WhatsApp pre-filled. */
export function BookingDialog({ property, children }: { property: ResolvedProperty; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [visitType, setVisitType] = useState<VisitType>(defaultVisitType(property.category));
  const [error, setError] = useState<string | null>(null);

  function onOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      setError(null);
      setVisitType(defaultVisitType(property.category));
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!date) {
      setError("Please choose your preferred date.");
      return;
    }
    const url = buildWhatsAppUrl(
      property.whatsappNumber,
      buildBookingMessage({ title: property.title, price: property.price, date, visitType }),
    );
    const win = window.open(url, "_blank");
    if (win) win.opener = null;
    else window.location.href = url;
    setOpen(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[70] bg-overlay/80 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <Dialog.Content className="fixed inset-x-3 bottom-3 z-[71] mx-auto max-w-md rounded-3xl border border-border-gold bg-card p-6 shadow-card focus:outline-none data-[state=open]:animate-in data-[state=open]:fade-in data-[state=open]:slide-in-from-bottom-4 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 md:p-8">
          <Dialog.Close
            aria-label="Close"
            className="absolute right-4 top-4 rounded-full border border-border p-2 text-muted-foreground transition-colors hover:border-border-gold hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </Dialog.Close>
          <p className="eyebrow">Reserve on WhatsApp</p>
          <Dialog.Title className="mt-3 pr-10 font-display text-3xl leading-tight text-foreground">{property.plainTitle}</Dialog.Title>
          <Dialog.Description className="mt-1 text-sm text-muted-foreground">
            <span className="font-semibold text-primary">{property.priceLabel}</span> {property.priceUnit} · {property.location}
          </Dialog.Description>

          <form onSubmit={onSubmit} className="mt-6 grid gap-5" noValidate>
            <div>
              <Label htmlFor={`date-${property.id}`} className="flex items-center gap-2 text-sm text-foreground">
                <CalendarDays className="h-4 w-4 text-primary" /> Preferred date
              </Label>
              <Input
                id={`date-${property.id}`}
                type="date"
                min={todayIso()}
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setError(null);
                }}
                className="mt-2 h-12 rounded-xl"
                aria-invalid={!!error}
              />
              {error && <p className="mt-2 text-xs text-destructive">{error}</p>}
            </div>

            <fieldset>
              <legend className="text-sm font-medium text-foreground">Visit type</legend>
              <div role="radiogroup" aria-label="Visit type" className="mt-2 grid grid-cols-2 gap-2">
                {VISIT_TYPES.map((t) => {
                  const Icon = VISIT_ICONS[t];
                  const active = visitType === t;
                  return (
                    <button
                      key={t}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setVisitType(t)}
                      className={cn(
                        "flex flex-col items-start gap-2 rounded-2xl border p-4 text-left text-sm transition-all",
                        active ? "border-border-gold bg-accent text-foreground shadow-gold" : "border-border text-muted-foreground hover:border-border-gold",
                      )}
                    >
                      <Icon className={cn("h-5 w-5", active ? "text-primary" : "text-muted-foreground")} />
                      <span className="font-medium">{t}</span>
                    </button>
                  );
                })}
              </div>
            </fieldset>

            <Button type="submit" variant="gold" size="xl" className="w-full">
              <WhatsAppIcon /> Continue to WhatsApp
            </Button>
            <p className="-mt-2 text-center text-xs text-muted-foreground">Opens WhatsApp with the property, price, date and visit type filled in.</p>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
