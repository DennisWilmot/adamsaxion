import path from "node:path";
import { fileURLToPath } from "node:url";
import type { NextConfig } from "next";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  transpilePackages: ["@adamsaxion/pricewar-engine", "@adamsaxion/pricewar-types"],
  turbopack: {
    root: path.resolve(__dirname, "..", ".."),
  },
  async redirects() {
    return [
      {
        source: "/lessons/lesson-1-supply-and-demand-fundamentals",
        destination: "/lessons/lesson-zero",
        permanent: true,
      },
      {
        source: "/play/match/:path*",
        destination: "/play/price-war/match/:path*",
        permanent: false,
      },
      {
        source: "/play/history",
        destination: "/play/price-war/history",
        permanent: false,
      },
      {
        source: "/play/tutorial",
        destination: "/play/price-war/tutorial",
        permanent: false,
      },
      {
        source: "/play/queue",
        destination: "/play/price-war/queue",
        permanent: false,
      },
    ];
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.googleusercontent.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
