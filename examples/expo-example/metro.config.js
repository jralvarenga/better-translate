const path = require("path");
const { getDefaultConfig } = require("expo/metro-config");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

config.watchFolders = [workspaceRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(workspaceRoot, "node_modules"),
];
config.resolver.extraNodeModules = {
  react: path.resolve(projectRoot, "node_modules/react"),
  "react/jsx-dev-runtime": path.resolve(
    projectRoot,
    "node_modules/react/jsx-dev-runtime",
  ),
  "react/jsx-runtime": path.resolve(
    projectRoot,
    "node_modules/react/jsx-runtime",
  ),
};

module.exports = config;
