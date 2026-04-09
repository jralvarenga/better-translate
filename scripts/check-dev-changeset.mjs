import { execFileSync } from "node:child_process";

const baseRef = process.env.BASE_REF;
const baseSha = process.env.BASE_SHA;
const headSha = process.env.HEAD_SHA || "HEAD";

if (!baseRef) {
  console.error("BASE_REF is required.");
  process.exit(1);
}

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

function tryGit(args) {
  try {
    return git(args);
  } catch {
    return null;
  }
}

function isChangesetFile(file) {
  return file.startsWith(".changeset/") && file.endsWith(".md");
}

function isReleaseRelevantPackageFile(file) {
  if (!file.startsWith("packages/")) {
    return false;
  }

  if (file.startsWith("packages/typescript-config/")) {
    return false;
  }

  const parts = file.split("/");
  if (parts.length < 3) {
    return false;
  }

  const relativePath = parts.slice(2).join("/");
  if (
    relativePath === "README.md" ||
    relativePath === "CHANGELOG.md" ||
    relativePath === "LICENSE" ||
    relativePath.startsWith("tests/")
  ) {
    return false;
  }

  return true;
}

const baseRevisionCandidates = [`origin/${baseRef}`];
if (baseSha) {
  baseRevisionCandidates.unshift(baseSha);
}

let baseRevision = null;
for (const candidate of baseRevisionCandidates) {
  if (tryGit(["rev-parse", "--verify", candidate])) {
    baseRevision = candidate;
    break;
  }
}

if (!baseRevision) {
  console.error(
    `Unable to resolve a base revision for ${baseRef}. Checked: ${baseRevisionCandidates.join(", ")}`,
  );
  process.exit(1);
}

let diffRange;
const mergeBase = tryGit(["merge-base", baseRevision, headSha]);
if (mergeBase) {
  diffRange = `${mergeBase}..${headSha}`;
} else {
  diffRange = `${baseRevision}..${headSha}`;
  console.warn(
    `No merge base found between ${baseRevision} and ${headSha}; falling back to ${diffRange}.`,
  );
}

const changedFilesOutput = git(["diff", "--name-only", diffRange]);
const changedFiles = changedFilesOutput
  .split("\n")
  .map((line) => line.trim())
  .filter(Boolean);

console.log(`Checking changeset requirement for diff range: ${diffRange}`);

if (changedFiles.length === 0) {
  console.log("No changed files detected.");
  process.exit(0);
}

console.log("Changed files:");
for (const file of changedFiles) {
  console.log(`- ${file}`);
}

const releaseRelevantFiles = changedFiles.filter(isReleaseRelevantPackageFile);
const hasChangeset = changedFiles.some(isChangesetFile);

if (releaseRelevantFiles.length === 0) {
  console.log(
    "No release-relevant publishable package changes detected. Skipping changeset requirement.",
  );
  process.exit(0);
}

if (hasChangeset) {
  console.log("Changeset file detected for release-relevant package changes.");
  process.exit(0);
}

console.error("Publishable package changes require a changeset file on PRs to dev.");
console.error("Release-relevant files:");
for (const file of releaseRelevantFiles) {
  console.error(`- ${file}`);
}
console.error("Add a .changeset/*.md file or keep the change docs-only/internal-only.");
process.exit(1);
