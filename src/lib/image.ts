/**
 * The client's photos were extracted from a PDF at only ~450–540px wide.
 * Resizing or re-encoding files that small (Next's default optimizer) only
 * adds blur and artifacts, and they are already 10–35 KB — so they are served
 * byte-for-byte. Larger originals added later go through the optimizer again.
 */
export const serveOriginal = (width: number) => width <= 800;
