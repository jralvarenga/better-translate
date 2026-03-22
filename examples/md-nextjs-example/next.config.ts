import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@better-translate/core", "@better-translate/md"],
};

export default nextConfig;
