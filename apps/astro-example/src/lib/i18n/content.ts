import { getCollection, render } from "astro:content";
import { createContentCollectionHelpers } from "@better-translate/astro/content";

import { requestConfig } from "./request";

export const docs = createContentCollectionHelpers(requestConfig, {
  collection: "docs",
  getCollection,
  render,
});
