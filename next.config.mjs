/** @type {import('next').NextConfig} */
const nextConfig = {
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
  // Required when proxying PostHog — otherwise Next.js will redirect
  // /ingest/decide/ (trailing slash) and break event ingestion.
  skipTrailingSlashRedirect: true,
};

export default nextConfig;
