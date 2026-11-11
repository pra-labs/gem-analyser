import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Ensure standalone output compatibility for Docker / Cloudflare / Node servers
  output: process.env.NEXT_EXPORT === 'true' ? 'export' : undefined,
  typescript: {
    ignoreBuildErrors: false,
  },
};

export default nextConfig;
