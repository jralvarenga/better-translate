import { randomUUID } from "node:crypto";
import { readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

import ts from "typescript";

async function importJavaScriptModule(
  modulePath: string,
): Promise<Record<string, unknown>> {
  return (await import(
    `${pathToFileURL(modulePath).href}?t=${Date.now()}`
  )) as Record<string, unknown>;
}

async function importTypeScriptModule(
  modulePath: string,
): Promise<Record<string, unknown>> {
  const source = await readFile(modulePath, "utf8");
  const tempPath = path.join(
    path.dirname(modulePath),
    `.better-translate-${randomUUID()}.mjs`,
  );
  const transpiled = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.Bundler,
      resolveJsonModule: true,
      target: ts.ScriptTarget.ES2022,
    },
    fileName: modulePath,
  });

  await writeFile(tempPath, transpiled.outputText, "utf8");

  try {
    return await importJavaScriptModule(tempPath);
  } finally {
    await rm(tempPath, {
      force: true,
    });
  }
}

export async function importModule(
  modulePath: string,
): Promise<Record<string, unknown>> {
  if (path.extname(modulePath) === ".ts") {
    return importTypeScriptModule(modulePath);
  }

  return importJavaScriptModule(modulePath);
}
