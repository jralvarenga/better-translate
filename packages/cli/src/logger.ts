import ora from "ora";
import pc from "picocolors";

import type { CliLogger } from "./types.js";

export function createSpinnerLogger(): CliLogger {
  const spinner = ora({ color: "cyan" });

  return {
    info(message) {
      // Suppress redundant noise
      if (
        message.startsWith("Prepared ") ||
        message.startsWith("Finished locale ")
      ) {
        return;
      }

      // Locale section header
      const localeMatch = message.match(/^Starting locale "(.+)"\.\.\./);
      if (localeMatch) {
        spinner.stop();
        console.log(`\n${pc.magenta("◆")} locale: ${pc.bold(localeMatch[1])}`);
        return;
      }

      // Spinner starts
      if (message === "Loading Better Translate config...") {
        spinner.start(message);
        return;
      }

      if (message.startsWith("Loading source messages from ")) {
        spinner.start(message);
        return;
      }

      const msgTranslateMatch = message.match(
        /^Requesting message translation for "(.+)"\.\.\./,
      );
      if (msgTranslateMatch) {
        spinner.start(`Translating messages → ${msgTranslateMatch[1]}`);
        return;
      }

      const mdTranslateMatch = message.match(
        /^Requesting markdown translation for ".+": (.+)/,
      );
      if (mdTranslateMatch) {
        spinner.start(`Translating ${mdTranslateMatch[1]}`);
        return;
      }

      // Spinner successes
      if (message.startsWith("Using config: ")) {
        spinner.succeed(message);
        return;
      }

      if (message.match(/^Loaded \d+ translation key/)) {
        spinner.succeed(message);
        return;
      }

      const writeMsgMatch = message.match(/^wrote messages:(\S+) (.+)/);
      if (writeMsgMatch) {
        const shortPath = (writeMsgMatch[2] ?? "")
          .split("/")
          .slice(-3)
          .join("/");
        spinner.succeed(`${pc.green("✓")} ${shortPath}`);
        return;
      }

      const writeMdMatch = message.match(/^wrote markdown:(\S+) (.+)/);
      if (writeMdMatch) {
        const shortPath = (writeMdMatch[2] ?? "")
          .split("/")
          .slice(-3)
          .join("/");
        spinner.succeed(`${pc.green("✓")} ${shortPath}`);
        return;
      }

      // Dry-run lines
      if (message.startsWith("[dry-run] ")) {
        spinner.stopAndPersist({ symbol: "◌", text: pc.dim(message) });
        return;
      }

      // Dim info lines
      if (
        message.startsWith("Using AI Gateway model:") ||
        message.startsWith("Using built-in OpenAI provider model:") ||
        message.startsWith("Source locale:") ||
        message.startsWith("Target locales:")
      ) {
        spinner.stop();
        console.log(pc.dim(message));
        return;
      }

      // Plain lines
      if (
        message.match(/^Found \d+ markdown file/) ||
        message === "Markdown generation disabled."
      ) {
        console.log(message);
        return;
      }

      // Summary line
      const summaryMatch = message.match(/^(generated|planned) \d+ file/);
      if (summaryMatch) {
        spinner.stop();
        console.log(
          pc.bold(
            pc.green(
              `\n✓ ${message.charAt(0).toUpperCase()}${message.slice(1)}`,
            ),
          ),
        );
        return;
      }

      // Dry run enabled notice
      if (message.startsWith("Dry run enabled")) {
        spinner.stop();
        console.log(pc.dim(message));
        return;
      }

      // Fallthrough
      console.log(message);
    },

    error(message) {
      spinner.fail(pc.red(message));
    },
  };
}
