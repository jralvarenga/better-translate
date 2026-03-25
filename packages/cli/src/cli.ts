import pc from "picocolors";

import { extractProject } from "./extract.js";
import { generateProject } from "./generate.js";
import { createSpinnerLogger } from "./logger.js";

function usage(): string {
  return [
    "Usage:",
    "  bt extract [--config ./better-translate.config.ts] [--dry-run] [--max-length 40]",
    "  bt generate [--config ./better-translate.config.ts] [--dry-run]",
  ].join("\n");
}

function parseCommonArgs(argv: readonly string[]): {
  configPath?: string;
  dryRun: boolean;
  maxLength?: number;
} {
  let configPath: string | undefined;
  let dryRun = false;
  let maxLength: number | undefined;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }

    if (arg === "--config" || arg === "-c") {
      const value = argv[index + 1];

      if (!value) {
        throw new Error("--config requires a file path.");
      }

      configPath = value;
      index += 1;
      continue;
    }

    if (arg === "--max-length") {
      const value = argv[index + 1];

      if (!value) {
        throw new Error("--max-length requires a number.");
      }

      if (!/^\d+$/.test(value)) {
        throw new Error("--max-length must be a positive integer.");
      }

      const parsed = Number.parseInt(value, 10);

      if (!Number.isInteger(parsed) || parsed <= 0) {
        throw new Error("--max-length must be a positive integer.");
      }

      maxLength = parsed;
      index += 1;
      continue;
    }

    throw new Error(`Unknown argument "${arg}".`);
  }

  return {
    configPath,
    dryRun,
    maxLength,
  };
}

export async function runCli(
  argv = process.argv.slice(2),
  options: {
    cwd?: string;
    stderr?: (message: string) => void;
    stdout?: (message: string) => void;
  } = {},
): Promise<number> {
  const stderr = options.stderr ?? console.error;
  const stdout = options.stdout ?? console.log;
  const [command, ...args] = argv;

  if (!command || command === "--help" || command === "-h") {
    stdout(usage());
    return command ? 0 : 1;
  }

  if (command !== "extract" && command !== "generate") {
    stderr(`Unknown command "${command}".\n${usage()}`);
    return 1;
  }

  try {
    const parsed = parseCommonArgs(args);

    if (command === "generate" && parsed.maxLength !== undefined) {
      stderr(`--max-length is not valid for "generate".\n${usage()}`);
      return 1;
    }

    console.log(pc.bold("\n  better-translate\n"));

    if (command === "extract") {
      await extractProject({
        configPath: parsed.configPath,
        cwd: options.cwd,
        dryRun: parsed.dryRun,
        logger: createSpinnerLogger(),
        maxLength: parsed.maxLength,
      });
    } else {
      await generateProject({
        configPath: parsed.configPath,
        cwd: options.cwd,
        dryRun: parsed.dryRun,
        logger: createSpinnerLogger(),
      });
    }

    return 0;
  } catch (error) {
    stderr(
      `Better Translate ${command} failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return 1;
  }
}
