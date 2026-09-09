import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/api/webhook/:path*",
        destination: "https://api.manbazar.com/api/webhook/:path*",
      },
      {
        source: "/api/v1/courier/webhooks/:path*",
        destination: "https://api.manbazar.com/api/v1/courier/webhooks/:path*",
      },
    ];
  },
};

export default nextConfig;
