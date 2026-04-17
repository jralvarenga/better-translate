/// <reference types="vitest/config" />

import path from "node:path";
import { fileURLToPath } from "node:url";

import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const config = {
  plugins: [react()],
  resolve: {
    alias: {
      "@better-translate/core": path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "../../packages/core/dist/index.js",
      ),
      "@better-translate/react": path.resolve(
        path.dirname(fileURLToPath(import.meta.url)),
        "../../packages/react/dist/index.js",
      ),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: path.resolve(
      path.dirname(fileURLToPath(import.meta.url)),
      "src/test/setup.ts",
    ),
  },
};

export default defineConfig(config);
