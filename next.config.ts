import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
  },
  turbopack: {
    root: process.cwd(),
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.hoyolab.com",
      },
      {
        protocol: "https",
        hostname: "**.hoyoverse.com",
      },
      {
        protocol: "https",
        hostname: "enka.network",
      },
      {
        protocol: "https",
        hostname: "gi.yatta.moe",
      },
    ],
  },
};

export default nextConfig;
