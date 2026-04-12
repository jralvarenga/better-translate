import { readFileSync } from "node:fs";
import path from "node:path";

export const publishablePackageDirs = [
  "packages/core",
  "packages/astro",
  "packages/cli",
  "packages/md",
  "packages/nextjs",
  "packages/react",
  "packages/tanstack-router",
];

export function readPackageJson(packageDir) {
  return JSON.parse(
    readFileSync(path.join(packageDir, "package.json"), "utf8"),
  );
}

export function getPublishablePackages() {
  return publishablePackageDirs.map((packageDir) =>
    readPackageJson(packageDir),
  );
}
