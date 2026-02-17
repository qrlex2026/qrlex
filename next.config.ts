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
  // Required headers for FFmpeg WASM (SharedArrayBuffer)
  async headers() {
    return [
      {
        source: "/panel/:path*",
        headers: [
          { key: "Cross-Origin-Embedder-Policy", value: "require-corp" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
