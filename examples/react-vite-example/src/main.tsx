import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { BetterTranslateProvider } from "@better-translate/react";

import App from "./App.tsx";
import { createFailingTranslator, createTranslator } from "./i18n.ts";
import "./index.css";

async function bootstrap() {
  const [translator, failureTranslator] = await Promise.all([
    createTranslator(),
    createFailingTranslator(),
  ]);

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <BetterTranslateProvider translator={translator}>
        <App failureTranslator={failureTranslator} />
      </BetterTranslateProvider>
    </StrictMode>,
  );
}

void bootstrap();
