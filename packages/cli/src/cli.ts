import pc from "picocolors";

import { generateProject } from "./generate.js";
import { createSpinnerLogger } from "./logger.js";

function usage(): string {
  return [
    "Usage:",
    "  bt generate [--config ./better-translate.config.ts] [--dry-run]",
  ].join("\n");
}

function parseArgs(argv: readonly string[]): {
  configPath?: string;
  dryRun: boolean;
} {
  let configPath: string | undefined;
  let dryRun = false;

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

    throw new Error(`Unknown argument "${arg}".`);
  }

  return {
    configPath,
    dryRun,
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

  if (command !== "generate") {
    stderr(`Unknown command "${command}".\n${usage()}`);
    return 1;
  }

  try {
    const parsed = parseArgs(args);

    console.log(pc.bold("\n  better-translate\n"));

    await generateProject({
      configPath: parsed.configPath,
      cwd: options.cwd,
      dryRun: parsed.dryRun,
      logger: createSpinnerLogger(),
    });

    return 0;
  } catch (error) {
    stderr(
      `Better Translate generation failed: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
    return 1;
  }
}
