import { Fragment } from "react";
import { parseTitle } from "@/lib/listing-content";

/** Renders owner-written text where *starred* words appear in gold italics. */
export function GoldText({ text }: { text: string }) {
  return (
    <>
      {parseTitle(text).map((p, i) =>
        p.gold ? (
          <span key={i} className="italic text-gold">
            {p.text}
          </span>
        ) : (
          <Fragment key={i}>{p.text}</Fragment>
        ),
      )}
    </>
  );
}
