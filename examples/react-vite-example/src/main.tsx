import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import { BetterTranslateProvider, createFailingTranslator } from "./i18n.ts";
import "./index.css";

async function bootstrap() {
  const failureTranslator = await createFailingTranslator();

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <BetterTranslateProvider>
        <App failureTranslator={failureTranslator} />
      </BetterTranslateProvider>
    </StrictMode>,
  );
}

void bootstrap();
