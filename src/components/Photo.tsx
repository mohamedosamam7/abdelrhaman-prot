import Image from "next/image";
import type { CSSProperties } from "react";
import type { Photo as PhotoData } from "@/content/photos";
import { serveOriginal } from "@/lib/image";

interface Props {
  photo: PhotoData;
  /** Responsive `sizes` — always describe the rendered width honestly. */
  sizes: string;
  /**
   * Frame aspect ratio, e.g. "4 / 5". "natural" keeps the photograph's own
   * proportions; omit it when the frame's size is set by CSS.
   */
  ratio?: "natural" | string;
  priority?: boolean;
  reveal?: boolean;
  className?: string;
  style?: CSSProperties;
  quality?: 75 | 85;
}

/**
 * Every photograph on the site goes through this component, so crops
 * (object-position), responsive loading and reveals behave consistently.
 */
export function Photo({ photo, sizes, ratio, priority, reveal = true, className, style, quality }: Props) {
  const aspectRatio = ratio === "natural" ? `${photo.width} / ${photo.height}` : ratio;

  return (
    <div
      className={["frame", className].filter(Boolean).join(" ")}
      style={{ aspectRatio, ...style }}
      data-reveal={reveal ? "image" : undefined}
    >
      <Image
        src={photo.src}
        alt={photo.alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={quality}
        unoptimized={serveOriginal(photo.width)}
        style={{ objectPosition: photo.position ?? "50% 50%" }}
      />
    </div>
  );
}
