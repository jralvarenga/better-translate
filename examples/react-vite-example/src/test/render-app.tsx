import { render } from "@testing-library/react";

import {
  BetterTranslateProvider,
  createFailingTranslator,
  createTranslator,
  type AppTranslator,
} from "../i18n.ts";
import App from "../App.tsx";

export async function renderApp(options?: {
  initialLocale?: AppTranslator["defaultLocale"];
  translator?: AppTranslator;
}) {
  const [translator, failureTranslator] = await Promise.all([
    options?.translator ?? createTranslator(),
    createFailingTranslator(),
  ]);

  return render(
    <BetterTranslateProvider
      initialLocale={options?.initialLocale}
      translator={translator}
    >
      <App failureTranslator={failureTranslator} />
    </BetterTranslateProvider>,
  );
}
