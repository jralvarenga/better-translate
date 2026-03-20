import { glob } from "astro/loaders";
import { defineCollection, z } from "astro:content";

const docs = defineCollection({
  loader: glob({
    base: "./src/content/docs",
    pattern: "**/*.{md,mdx}",
  }),
  schema: z.object({
    description: z.string().optional(),
    title: z.string(),
  }),
});

export const collections = {
  docs,
};
