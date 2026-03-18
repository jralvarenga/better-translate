import { existsSync } from "node:fs";
import path from "node:path";

import dotenv from "dotenv";

export function loadEnvFiles(cwd: string): string[] {
  const mode = process.env.NODE_ENV || "development";
  const candidates = [".env", ".env.local", `.env.${mode}`, `.env.${mode}.local`];
  const loaded: string[] = [];

  for (const name of candidates) {
    const filePath = path.join(cwd, name);

    if (!existsSync(filePath)) {
      continue;
    }

    dotenv.config({
      override: true,
      path: filePath,
      quiet: true,
    });
    loaded.push(filePath);
  }

  return loaded;
}

export function loadEnvFilesFromDirectories(
  directories: readonly string[],
): string[] {
  const loaded = new Set<string>();

  for (const directory of directories) {
    for (const filePath of loadEnvFiles(directory)) {
      loaded.add(filePath);
    }
  }

  return [...loaded];
}
