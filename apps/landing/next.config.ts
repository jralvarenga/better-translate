import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@better-translate/md"],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'ik.imagekit.io',
      },
    ],
  },
};

export default nextConfig;
