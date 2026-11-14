import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "dark" | "light";
const STORAGE_KEY = "ph-theme";

/** Switches between the default Dark Luxury theme and the Warm Ivory & Gold daytime mode. */
export function ThemeToggle({ className }: { className?: string | undefined }) {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    setTheme(document.documentElement.classList.contains("light") ? "light" : "dark");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    const root = document.documentElement;
    root.classList.remove("dark", "light");
    root.classList.add(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      /* storage unavailable: theme still switches for this visit */
    }
    setTheme(next);
  }

  const toLight = theme === "dark";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={toLight ? "Switch to Warm Ivory daytime mode" : "Switch to Dark Luxury mode"}
      title={toLight ? "Daytime mode" : "Dark mode"}
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-full border border-border bg-background/40 text-primary backdrop-blur-md transition-colors hover:border-border-gold",
        className,
      )}
    >
      {toLight ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}
