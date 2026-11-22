import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * Dev only: lets phones/other machines on the LAN preview `next dev` via
   * this computer's network address. Without it Next.js blocks its dev
   * resources for that origin and the page never hydrates. Update the IP if
   * the network address changes (shown as "Network:" when `npm run dev` starts).
   */
  allowedDevOrigins: ["192.168.1.9", "192.168.1.70", "172.20.10.8"],
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 828, 1080, 1280, 1600, 2048],
    imageSizes: [256, 384, 512],
    qualities: [75, 85],
  },
};

export default nextConfig;
