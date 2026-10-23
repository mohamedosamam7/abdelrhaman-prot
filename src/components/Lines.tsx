import type { ElementType, ReactNode } from "react";

interface Props {
  as?: ElementType;
  lines: ReactNode[];
  className?: string;
  id?: string;
}

/** Heading split into masked lines that rise into place on reveal. */
export function Lines({ as: Tag = "h2", lines, className, id }: Props) {
  return (
    <Tag className={className} id={id} data-reveal="lines">
      {lines.map((line, i) => (
        <span className="line-mask" key={i}>
          <span>{line}</span>
        </span>
      ))}
    </Tag>
  );
}
