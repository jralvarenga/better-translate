import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { publishablePackageDirs } from "./release-packages.mjs";

const requiredFiles = new Set(["package.json", "README.md", "LICENSE"]);

function run(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: ["ignore", "pipe", "pipe"],
      ...options,
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk;
      process.stdout.write(chunk);
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk;
      process.stderr.write(chunk);
    });

    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) {
        resolve({ stdout, stderr });
        return;
      }

      reject(
        new Error(
          `${command} ${args.join(" ")} exited with code ${code}\n${stderr}`.trim(),
        ),
      );
    });
  });
}

async function main() {
  const cacheDir = await mkdtemp(
    path.join(os.tmpdir(), "better-translate-npm-cache-"),
  );

  try {
    for (const pkgDir of publishablePackageDirs) {
      console.log(`\n==> Checking ${pkgDir}`);

      const { stdout } = await run("npm", ["pack", "--dry-run", "--json"], {
        cwd: pkgDir,
        env: {
          ...process.env,
          npm_config_cache: cacheDir,
        },
      });

      const packResult = JSON.parse(stdout);
      const files = new Set(packResult[0]?.files?.map((file) => file.path));

      for (const requiredFile of requiredFiles) {
        if (!files.has(requiredFile)) {
          throw new Error(
            `${pkgDir} is missing ${requiredFile} in npm pack output.`,
          );
        }
      }

      const pkgJson = JSON.parse(
        await readFile(path.join(pkgDir, "package.json"), "utf8"),
      );
      const expectedHomepage = "https://better-translate.com";
      if (pkgJson.homepage !== expectedHomepage) {
        throw new Error(
          `${pkgDir} homepage "${pkgJson.homepage}" must equal ${expectedHomepage}`,
        );
      }
    }
  } finally {
    await rm(cacheDir, { recursive: true, force: true });
  }
}

await main();
