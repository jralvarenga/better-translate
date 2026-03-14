import { Elysia } from "elysia";
import { translationModule } from "./modules/translations";
import { initializeTranslations } from "./modules/translations/service";

/**
 * Creates the Elysia application after the global translation runtime has been
 * configured for the current process.
 */
export async function createApp() {
  await initializeTranslations();

  return new Elysia({
    name: "elysia-example",
  }).use(translationModule);
}
