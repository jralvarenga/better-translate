import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const requireNewTags = args.includes("--require-new-tags");
const beforeFileIndex = args.indexOf("--before-file");
const beforeFilePath =
  beforeFileIndex >= 0 ? args[beforeFileIndex + 1] : undefined;

if (!beforeFilePath) {
  console.error("Usage: node ./scripts/push-release-tags.mjs --before-file <path> [--dry-run]");
  process.exit(1);
}

const remote = process.env.GIT_REMOTE || "origin";
const tagPattern = /^@better-translate\/[0-9A-Za-z._-]+@\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/;

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function gitInherit(args) {
  execFileSync("git", args, { stdio: "inherit" });
}

function parseTags(contents) {
  return new Set(
    contents
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  );
}

const beforeTags = parseTags(readFileSync(beforeFilePath, "utf8"));
const afterTags = parseTags(git(["tag", "--list", "@better-translate/*@*"]));

const newTags = [...afterTags]
  .filter((tag) => !beforeTags.has(tag))
  .sort((left, right) => left.localeCompare(right));

if (newTags.length === 0) {
  const message = "No new release tags were created.";
  if (requireNewTags) {
    console.error(message);
    process.exit(1);
  }

  console.log(message);
  process.exit(0);
}

for (const tag of newTags) {
  if (!tagPattern.test(tag)) {
    console.error(`Unexpected tag format: ${tag}`);
    process.exit(1);
  }
}

console.log("New release tags:");
for (const tag of newTags) {
  console.log(`- ${tag}`);
}

if (dryRun) {
  console.log("Dry run enabled. Skipping tag push and remote verification.");
  process.exit(0);
}

for (const tag of newTags) {
  gitInherit(["push", remote, `refs/tags/${tag}:refs/tags/${tag}`]);
}

for (const tag of newTags) {
  const remoteRef = git(["ls-remote", "--tags", "--refs", remote, `refs/tags/${tag}`]);
  if (!remoteRef) {
    console.error(`Failed to verify pushed tag on ${remote}: ${tag}`);
    process.exit(1);
  }
}

console.log(`Verified ${newTags.length} pushed tag(s) on ${remote}.`);
