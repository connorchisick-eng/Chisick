/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "framerusercontent.com" },
    ],
  },
  reactStrictMode: true,
};

export default nextConfig;
