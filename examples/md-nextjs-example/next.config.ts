import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["@better-translate/core", "@better-translate/md"],
  turbopack: {
    root: path.resolve(import.meta.dirname, "../.."),
  },
};

export default nextConfig;
