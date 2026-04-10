import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import path from "node:path";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

const publishablePackages = [
  "packages/core",
  "packages/astro",
  "packages/cli",
  "packages/md",
  "packages/nextjs",
  "packages/react",
  "packages/tanstack-router",
];

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function gitInherit(args) {
  execFileSync("git", args, { stdio: "inherit" });
}

function readPackageJson(packageDirectory) {
  return JSON.parse(
    readFileSync(path.join(packageDirectory, "package.json"), "utf8"),
  );
}

const existingTags = new Set(
  git(["tag", "--list", "@better-translate/*@*"])
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean),
);

const missingTags = publishablePackages
  .map((packageDirectory) => readPackageJson(packageDirectory))
  .map((pkg) => `${pkg.name}@${pkg.version}`)
  .filter((tag) => !existingTags.has(tag))
  .sort((left, right) => left.localeCompare(right));

if (missingTags.length === 0) {
  console.log("No missing release tags detected.");
  process.exit(0);
}

console.log("Missing release tags:");
for (const tag of missingTags) {
  console.log(`- ${tag}`);
}

if (dryRun) {
  console.log("Dry run enabled. Skipping tag creation.");
  process.exit(0);
}

for (const tag of missingTags) {
  gitInherit(["tag", tag]);
}

for (const tag of missingTags) {
  const createdTag = git(["tag", "--list", tag]);
  if (createdTag !== tag) {
    console.error(`Failed to create tag: ${tag}`);
    process.exit(1);
  }
}

console.log(`Created ${missingTags.length} release tag(s).`);
