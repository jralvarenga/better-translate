import path from "node:path";
import readline from "node:readline";
import type { ReadStream, WriteStream } from "node:tty";

import type {
  MarkdownWriteConfirmationRequest,
  PurgeKeyConfirmationRequest,
} from "./types.js";

const MAX_PREVIEW_WRITES = 5;
const RAW_CONFIRMATION_DEBOUNCE_MS = 750;
const RAW_CONFIRMATION_KEYS = new Set(["y", "n"]);

interface RawConfirmationSessionState {
  blockedKey: string | null;
  lastKeyEventAt: number;
}

const rawConfirmationSessions = new WeakMap<
  ReadStream,
  RawConfirmationSessionState
>();

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

interface ConfirmationIo {
  input?: ReadStream;
  output?: WriteStream;
}

function drainBufferedInput(input: ReadStream): void {
  while (input.read() !== null) {
    // Discard any queued bytes so one confirmation keypress cannot spill into
    // the next prompt.
  }
}

function getRawConfirmationSession(
  input: ReadStream,
): RawConfirmationSessionState {
  const existing = rawConfirmationSessions.get(input);

  if (existing) {
    return existing;
  }

  const created: RawConfirmationSessionState = {
    blockedKey: null,
    lastKeyEventAt: 0,
  };
  rawConfirmationSessions.set(input, created);
  return created;
}

async function readConfirmation(
  prompt: string,
  io: ConfirmationIo = {},
): Promise<boolean> {
  const input = io.input ?? process.stdin;
  const output = io.output ?? process.stdout;

  if (!input.isTTY || !output.isTTY) {
    throw new Error("Confirmation requires an interactive environment.");
  }

  if (typeof input.setRawMode === "function") {
    readline.emitKeypressEvents(input);

    return new Promise<boolean>((resolve, reject) => {
      const session = getRawConfirmationSession(input);
      const previousRawMode = input.isRaw;
      const wasPaused = input.isPaused();
      const cleanup = () => {
        input.removeListener("keypress", handleKeypress);
        drainBufferedInput(input);

        if (!previousRawMode) {
          input.setRawMode?.(false);
        }

        if (wasPaused) {
          input.pause();
        }
      };
      const settle = (result: boolean, echoedValue?: string) => {
        if (echoedValue) {
          output.write(`${echoedValue}\n`);
        } else {
          output.write("\n");
        }

        cleanup();
        resolve(result);
      };

      const handleKeypress = (value: string, key: readline.Key) => {
        const normalizedValue =
          typeof value === "string" && value.length > 0
            ? value.toLowerCase()
            : "";
        const now = Date.now();

        if (key.ctrl && key.name === "c") {
          output.write("^C\n");
          cleanup();
          reject(new Error("Confirmation cancelled."));
          return;
        }

        if (key.name === "return" || key.name === "enter") {
          settle(false);
          return;
        }

        if (
          RAW_CONFIRMATION_KEYS.has(normalizedValue) &&
          session.blockedKey === normalizedValue &&
          now - session.lastKeyEventAt < RAW_CONFIRMATION_DEBOUNCE_MS
        ) {
          session.lastKeyEventAt = now;
          return;
        }

        if (normalizedValue === "y") {
          session.blockedKey = normalizedValue;
          session.lastKeyEventAt = now;
          settle(true, value);
          return;
        }

        if (normalizedValue === "n") {
          session.blockedKey = normalizedValue;
          session.lastKeyEventAt = now;
          settle(false, value);
        }
      };

      if (!previousRawMode) {
        input.setRawMode(true);
      }

      input.resume();
      output.write(prompt);
      input.on("keypress", handleKeypress);
    });
  }

  const rl = readline.createInterface({
    input,
    output,
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

export async function confirmMarkdownWrites(
  request: MarkdownWriteConfirmationRequest,
  io: ConfirmationIo = {},
): Promise<boolean> {
  if (request.writes.length === 0) {
    return true;
  }

  const input = io.input ?? process.stdin;
  const output = io.output ?? process.stdout;

  if (!input.isTTY || !output.isTTY) {
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

  return readConfirmation(prompt, {
    input,
    output,
  });
}

export async function confirmPurgeKey(
  request: PurgeKeyConfirmationRequest,
  io: ConfirmationIo = {},
): Promise<boolean> {
  const input = io.input ?? process.stdin;
  const output = io.output ?? process.stdout;

  if (!input.isTTY || !output.isTTY) {
    throw new Error(
      'Purge confirmation requires an interactive environment. Re-run "bt purge" with --yes to remove all unused keys.',
    );
  }

  return readConfirmation(`? Purge unused key "${request.key}"? (y/N) `, {
    input,
    output,
  });
}
