import { execFileSync } from "node:child_process";
import { getPublishablePackages } from "./release-packages.mjs";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function gitInherit(args) {
  execFileSync("git", args, { stdio: "inherit" });
}

const existingTags = new Set(
  git(["tag", "--list", "@better-translate/*@*"])
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean),
);

const publishablePackages = getPublishablePackages();
const missingTags = publishablePackages
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
