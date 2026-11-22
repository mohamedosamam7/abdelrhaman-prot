/**
 * Supabase configuration. Only the URL and the publishable key may reach the
 * browser; the secret key is read exclusively in server-only modules.
 */
export const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
// The Vercel–Supabase integration may provide the older "anon" name; both are the public key.
export const supabasePublishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

/** True when the public site and dashboard can talk to Supabase at all. */
export const supabaseConfigured = /^https:\/\/[a-z0-9-]+\.supabase\.co$/.test(supabaseUrl.replace(/\/$/, "")) && supabasePublishableKey.length > 20;

/** Storage buckets: published media is public; uploads start in the private draft bucket. */
export const BUCKET_PUBLIC = "media";
export const BUCKET_DRAFT = "media-draft";

export function publicMediaUrl(path: string) {
  return `${supabaseUrl.replace(/\/$/, "")}/storage/v1/object/public/${BUCKET_PUBLIC}/${path.split("/").map(encodeURIComponent).join("/")}`;
}
