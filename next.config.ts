import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Dev only: lets phones/other machines on the LAN preview `next dev` via
   * this computer's network address. Without it Next.js blocks its dev
   * resources for that origin and the page never hydrates. Update the IP if
   * the network address changes (shown as "Network:" when `npm run dev` starts).
   */
  allowedDevOrigins: ["192.168.1.9", "192.168.1.70", "172.20.10.8"],
  experimental: {
    /**
     * The site's CSS is small (~13 KB compressed). Inlining it in the HTML
     * removes the render-blocking stylesheet requests before the first paint
     * (measured: three of them on the home page since the featured-projects
     * section was added). Production builds only; see the Next.js inlineCss docs.
     */
    inlineCss: true,
  },
  images: {
    // Dashboard uploads: published files (public bucket) and, for an
    // administrator's draft preview only, short-lived signed URLs.
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/media/**" },
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/sign/media-draft/**" },
    ],
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1080, 1280, 1600, 2048],
    imageSizes: [256, 384, 512],
    qualities: [75, 85],
  },
};

export default nextConfig;
