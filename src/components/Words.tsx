import { Fragment } from "react";

/**
 * Word-by-word heading reveal, adapted from the React Bits "BlurText"
 * technique (reactbits.dev, MIT + Commons Clause) but driven by the site's own
 * RevealObserver and CSS transitions: no extra animation runtime.
 *
 * Splits on spaces only, so Arabic letters always stay joined inside a word,
 * and the heading remains plain readable text for assistive technology.
 * `start` continues the stagger across several runs in one heading.
 */
export function Words({ text, start = 0 }: { text: string; start?: number }) {
  const words = text.split(/\s+/).filter(Boolean);
  return (
    <>
      {words.map((w, i) => (
        <Fragment key={i}>
          {i > 0 && " "}
          <span className="w" style={{ ["--i" as string]: start + i }}>
            {w}
          </span>
        </Fragment>
      ))}
    </>
  );
}

export const wordCount = (text: string) => text.split(/\s+/).filter(Boolean).length;
