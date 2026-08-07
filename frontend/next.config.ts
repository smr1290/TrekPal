import path from "path";
import type { NextConfig } from "next";

/**
 * Optional rewrite fallback. Prefer the Route Handler at
 * `app/backend/[...path]/route.ts` (reads API_PROXY_TARGET at runtime).
 */
const proxyTarget = (process.env.API_PROXY_TARGET || "").replace(/\/$/, "");

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  async rewrites() {
    // Route Handler handles /backend/* when present; keep rewrite as fallback.
    if (!proxyTarget) return [];
    return [
      {
        source: "/backend/:path*",
        destination: `${proxyTarget}/:path*`,
      },
    ];
  },
};

export default nextConfig;
