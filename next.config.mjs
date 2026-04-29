import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const contentSecurityPolicy = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "img-src 'self' data: blob: https://framerusercontent.com https://*.posthog.com",
  "font-src 'self' data: https://fonts.cdnfonts.com https://fonts.gstatic.com",
  "style-src 'self' 'unsafe-inline' https://fonts.cdnfonts.com",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
  "connect-src 'self' https://*.posthog.com",
  "worker-src 'self' blob:",
  "upgrade-insecure-requests",
].join("; ");

/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "framerusercontent.com" },
    ],
  },
  reactStrictMode: true,
  // Reverse-proxy PostHog through our own domain so browser ad-blockers
  // (uBlock, Brave Shields, etc.) don't strip analytics. Paired with
  // NEXT_PUBLIC_POSTHOG_HOST=/ingest in the PostHog client init.
  async rewrites() {
    return [
      {
        source: "/ingest/static/:path*",
        destination: "https://us-assets.i.posthog.com/static/:path*",
      },
      {
        source: "/ingest/:path*",
        destination: "https://us.i.posthog.com/:path*",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: contentSecurityPolicy,
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
          },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
  // Required when proxying PostHog - otherwise Next.js will redirect
  // /ingest/decide/ (trailing slash) and break event ingestion.
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
