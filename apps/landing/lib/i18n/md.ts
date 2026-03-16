import path from "path";
import { createMarkdownServerHelpers } from "@better-translate/md/server";

import { requestConfig } from "./request";

export const md = createMarkdownServerHelpers(requestConfig, {
  rootDir: path.join(process.cwd(), "docs"),
});
