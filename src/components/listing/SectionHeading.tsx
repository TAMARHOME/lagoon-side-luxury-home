import type { ReactNode } from "react";
import { GoldText } from "./GoldText";

export function SectionHeading({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;
  /** Owner-written heading; *starred* words show in gold. */
  title: string;
  children?: ReactNode;
}) {
  return (
    <div className="max-w-2xl">
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <h2 className="mt-4 font-display text-4xl font-medium leading-[1.05] text-foreground md:text-5xl">
        <GoldText text={title} />
      </h2>
      {children && <p className="mt-4 text-base leading-relaxed text-muted-foreground">{children}</p>}
    </div>
  );
}
