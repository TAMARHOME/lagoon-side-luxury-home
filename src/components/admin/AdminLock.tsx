import { useState, type FormEvent } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, Loader2, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { unlockAdmin } from "@/lib/site-content.functions";
import heroImg from "@/assets/hero-duplex.jpg";

export function AdminLock() {
  const router = useRouter();
  const unlock = useServerFn(unlockAdmin);
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!pin.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const res = await unlock({ data: { pin } });
      if (res.ok) {
        await router.invalidate();
        return;
      }
      setPin("");
      setError(
        res.reason === "too_many"
          ? "Too many attempts. Please wait 15 minutes and try again."
          : `Incorrect PIN.${res.remaining <= 3 ? ` ${res.remaining} attempts left.` : ""}`,
      );
    } catch {
      setError("Couldn't check the PIN. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="relative flex min-h-[100svh] items-center justify-center overflow-hidden bg-background px-5 py-16">
      <img src={heroImg} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-25 blur-2xl" />
      <div className="absolute inset-0 bg-hero-overlay" />

      <form
        onSubmit={onSubmit}
        className="relative z-10 w-full max-w-sm animate-rise rounded-3xl border border-border-gold bg-card/80 p-8 text-center shadow-card backdrop-blur-xl md:p-10"
      >
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-border-gold bg-accent text-primary">
          <LockKeyhole className="h-7 w-7" />
        </span>
        <p className="eyebrow mt-6">Owner Access</p>
        <h1 className="mt-3 font-display text-4xl text-foreground">
          Prime<span className="italic text-gold">Haven</span>
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">Enter your PIN to manage your properties.</p>

        <label htmlFor="pin" className="sr-only">
          PIN
        </label>
        <input
          id="pin"
          type="password"
          inputMode="numeric"
          autoComplete="current-password"
          autoFocus
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          placeholder="••••"
          aria-invalid={!!error}
          aria-describedby={error ? "pin-error" : undefined}
          className="mt-8 h-16 w-full rounded-2xl border border-border bg-background/70 text-center font-display text-3xl tracking-[0.6em] text-foreground outline-none transition-colors placeholder:text-muted-foreground/40 focus:border-primary aria-[invalid=true]:border-destructive"
        />
        <p id="pin-error" role="alert" className="mt-3 min-h-5 text-sm text-destructive">
          {error}
        </p>

        <Button type="submit" variant="gold" size="xl" className="mt-4 w-full" disabled={busy || !pin.trim()}>
          {busy ? <Loader2 className="animate-spin" /> : <LockKeyhole />} Unlock Dashboard
        </Button>

        <Link to="/" className="mt-6 inline-flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-primary">
          <ArrowLeft className="h-3.5 w-3.5" /> Back to website
        </Link>
      </form>
    </div>
  );
}
