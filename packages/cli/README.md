# @better-translate/cli

`@better-translate/cli` extracts marked source strings into your source locale file, generates translated message files, and localizes markdown. Use it when you want Better Translate to create or update locale files for you.

Install the CLI and the provider package you want to use in your own project:

```sh
npm install -D @better-translate/cli @ai-sdk/openai
# or: npm install -D @better-translate/cli @ai-sdk/anthropic
# or: npm install -D @better-translate/cli @ai-sdk/moonshotai
```

Then configure the CLI with a real AI SDK language model. The flow is the same for any provider package:

```ts
import { openai } from "@ai-sdk/openai";
import { defineConfig } from "@better-translate/cli/config";

export default defineConfig({
  sourceLocale: "en",
  locales: ["es", "fr"],
  model: openai("gpt-5"),
  messages: {
    entry: "./src/messages/en.json",
  },
});
```

```ts
import { anthropic } from "@ai-sdk/anthropic";
import { defineConfig } from "@better-translate/cli/config";

export default defineConfig({
  sourceLocale: "en",
  locales: ["es", "fr"],
  model: anthropic("claude-sonnet-4-5"),
  messages: {
    entry: "./src/messages/en.json",
  },
});
```

```ts
import { moonshotai } from "@ai-sdk/moonshotai";
import { defineConfig } from "@better-translate/cli/config";

export default defineConfig({
  sourceLocale: "en",
  locales: ["es", "fr"],
  model: moonshotai("kimi-k2-0905-preview"),
  messages: {
    entry: "./src/messages/en.json",
  },
});
```

If you need provider-specific settings, create the model in your app first and pass it through. Credentials and provider configuration stay entirely in the provider package setup:

```ts
import { createOpenAI } from "@ai-sdk/openai";
import { defineConfig } from "@better-translate/cli/config";

const model = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL,
})("gpt-5");

export default defineConfig({
  sourceLocale: "en",
  locales: ["es", "fr"],
  model,
  messages: {
    entry: "./src/messages/en.json",
  },
});
```

Full docs: [better-translate-placeholder.com/en/docs/cli](https://better-translate-placeholder.com/en/docs/cli)

## Commands

Extract new source keys:

```sh
npx bt extract
```

Generate translated locale files:

```sh
npx bt generate
```

When markdown generation is enabled and `bt generate` would create or overwrite translated `.md` or `.mdx` files, the CLI asks for confirmation before it makes changes.

Use `--yes` or `-y` to skip that confirmation, especially in CI or other non-interactive environments:

```sh
npx bt generate --yes
```

In non-interactive environments, markdown generation requires `--yes` when translated markdown files would be written.
