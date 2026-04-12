import path from "node:path";
import readline from "node:readline";

import type { MarkdownWriteConfirmationRequest } from "./types.js";

const MAX_PREVIEW_WRITES = 5;

function pluralize(count: number, singular: string, plural: string): string {
  return `${count} ${count === 1 ? singular : plural}`;
}

function formatSummary(request: MarkdownWriteConfirmationRequest): string {
  const parts: string[] = [];

  if (request.createCount > 0) {
    parts.push(
      `create ${pluralize(request.createCount, "new file", "new files")}`,
    );
  }

  if (request.overwriteCount > 0) {
    parts.push(
      `overwrite ${pluralize(request.overwriteCount, "existing file", "existing files")}`,
    );
  }

  if (parts.length === 0) {
    return "write translated markdown files";
  }

  if (parts.length === 1) {
    return parts[0] ?? "write translated markdown files";
  }

  return `${parts[0]} and ${parts[1]}`;
}

function formatTargetPath(targetPath: string, projectCwd: string): string {
  const relativePath = path.relative(projectCwd, targetPath);

  if (
    relativePath.length > 0 &&
    !relativePath.startsWith("..") &&
    !path.isAbsolute(relativePath)
  ) {
    return relativePath;
  }

  return targetPath;
}

export async function confirmMarkdownWrites(
  request: MarkdownWriteConfirmationRequest,
): Promise<boolean> {
  if (request.writes.length === 0) {
    return true;
  }

  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error(
      "Markdown translation would create or overwrite translated .md/.mdx files in a non-interactive environment. Re-run with --yes to continue.",
    );
  }

  const locales = Array.from(
    new Set(request.writes.map((write) => write.locale)),
  )
    .sort()
    .join(", ");
  const projectCwd = request.projectCwd ?? process.cwd();
  const previewWrites = request.writes.slice(0, MAX_PREVIEW_WRITES);
  const remainingCount = request.writes.length - previewWrites.length;
  const preview = previewWrites
    .map(
      (write) =>
        `  - ${write.action}: ${formatTargetPath(write.targetPath, projectCwd)}`,
    )
    .join("\n");
  const prompt = [
    "",
    `This run will ${formatSummary(request)} as translated markdown files (.md/.mdx).`,
    `Target locales: ${locales}`,
    "Planned markdown writes:",
    preview,
    remainingCount > 0
      ? `  - ...and ${remainingCount} more planned write${remainingCount === 1 ? "" : "s"}`
      : "",
    "",
    "Continue? [y/N] ",
  ]
    .filter(Boolean)
    .join("\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const answer = await new Promise<string>((resolve) => {
      rl.question(prompt, resolve);
    });
    const normalized = answer.trim().toLowerCase();

    return normalized === "y" || normalized === "yes";
  } finally {
    rl.close();
  }
}
