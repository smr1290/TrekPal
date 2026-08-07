import path from "path";
import type { NextConfig } from "next";

/**
 * Same-origin API proxy (production).
 *
 * Browsers (especially phones) block cross-site cookies between
 * `*.vercel.app` and `*.up.railway.app`. Rewriting `/backend/*` to the
 * Railway API makes Set-Cookie first-party on the Vercel host so login works.
 *
 * Vercel env:
 *   API_PROXY_TARGET=https://your-api.up.railway.app
 *   NEXT_PUBLIC_API_URL=/backend
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
