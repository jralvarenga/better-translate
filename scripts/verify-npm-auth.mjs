import { execFileSync } from "node:child_process";

function npm(args) {
  return execFileSync("npm", args, { encoding: "utf8" }).trim();
}

function npmInherit(args) {
  execFileSync("npm", args, { stdio: "inherit" });
}

const registry = npm(["config", "get", "registry"]);
console.log(`npm registry: ${registry}`);

if (registry !== "https://registry.npmjs.org/") {
  console.error(
    `Expected npm registry to be https://registry.npmjs.org/ but got: ${registry}`,
  );
  process.exit(1);
}

npmInherit(["ping"]);

const username = npm(["whoami"]);
console.log(`npm authenticated as ${username}.`);
