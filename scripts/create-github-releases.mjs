import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const beforeFileIndex = args.indexOf("--before-file");
const beforeFilePath =
  beforeFileIndex >= 0 ? args[beforeFileIndex + 1] : undefined;

if (!beforeFilePath) {
  console.error(
    "Usage: node ./scripts/create-github-releases.mjs --before-file <path> [--dry-run]",
  );
  process.exit(1);
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function gh(args) {
  return execFileSync("gh", args, { encoding: "utf8" }).trim();
}

function ghInherit(args) {
  execFileSync("gh", args, { stdio: "inherit" });
}

function parseTags(contents) {
  return new Set(
    contents
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean),
  );
}

function parseVersionFromTag(tag) {
  const atIndex = tag.lastIndexOf("@");
  if (atIndex === -1) {
    return "";
  }

  return tag.slice(atIndex + 1);
}

const beforeTags = parseTags(readFileSync(beforeFilePath, "utf8"));
const afterTags = parseTags(git(["tag", "--list", "@better-translate/*@*"]));

const newTags = [...afterTags]
  .filter((tag) => !beforeTags.has(tag))
  .sort((left, right) => left.localeCompare(right));

if (newTags.length === 0) {
  console.log("No new release tags were created.");
  process.exit(0);
}

console.log("GitHub Releases to create:");
for (const tag of newTags) {
  console.log(`- ${tag}`);
}

if (dryRun) {
  console.log("Dry run enabled. Skipping GitHub Release creation.");
  process.exit(0);
}

for (const tag of newTags) {
  try {
    gh(["release", "view", tag]);
    console.log(`GitHub Release already exists for ${tag}. Skipping.`);
    continue;
  } catch {
    // Create below.
  }

  const version = parseVersionFromTag(tag);
  const createArgs = [
    "release",
    "create",
    tag,
    "--title",
    tag,
    "--generate-notes",
  ];

  if (version.includes("-")) {
    createArgs.push("--prerelease");
  }

  ghInherit(createArgs);
}

console.log(`Processed ${newTags.length} GitHub Release tag(s).`);
