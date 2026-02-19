import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "pub-5b35497dfb5b4103971895d42f4b4222.r2.dev",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: "/media/:path*",
        destination: "https://pub-5b35497dfb5b4103971895d42f4b4222.r2.dev/:path*",
      },
    ];
  },
};

export default nextConfig;
