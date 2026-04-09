import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

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

function readPackageJson(packageDir) {
  return JSON.parse(
    readFileSync(path.join(packageDir, "package.json"), "utf8"),
  );
}

const existingTags = new Set(
  git(["tag", "--list", "@better-translate/*@*"])
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean),
);

const missingTags = publishablePackages
  .map((packageDir) => readPackageJson(packageDir))
  .map((pkg) => ({
    name: pkg.name,
    version: pkg.version,
    tag: `${pkg.name}@${pkg.version}`,
  }))
  .filter((pkg) => !existingTags.has(pkg.tag));

if (missingTags.length === 0) {
  console.log("No unreleased publishable package versions detected on this commit.");
} else {
  console.log("Pending release tags:");
  for (const pkg of missingTags) {
    console.log(`- ${pkg.tag}`);
  }
}

const githubOutput = process.env.GITHUB_OUTPUT;
if (githubOutput) {
  const lines = [
    `should_release=${missingTags.length > 0 ? "true" : "false"}`,
    `missing_tags=${missingTags.map((pkg) => pkg.tag).join(",")}`,
  ];
  writeFileSync(githubOutput, `${lines.join("\n")}\n`, { flag: "a" });
}
