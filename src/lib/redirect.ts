/**
 * Same-site redirect with a relative Location header. Browsers resolve it
 * against the address they requested, so it can never point at another site
 * and doesn't depend on how the server sees its own host (e.g. 0.0.0.0).
 * Callers pass validated site paths only.
 */
export function localRedirect(path: string, status: 303 | 307 = 307, init?: ResponseInit) {
  if (!path.startsWith("/") || path.startsWith("//")) throw new Error("localRedirect: site paths only");
  const headers = new Headers(init?.headers);
  headers.set("Location", path);
  headers.set("Cache-Control", "no-store");
  return new Response(null, { ...init, status, headers });
}
