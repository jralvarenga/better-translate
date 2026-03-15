import type { FailureTranslator } from "./i18n.ts";

import { FeatureGrid } from "./components/feature-grid.tsx";
import { GreetingPanel } from "./components/greeting-panel.tsx";
import { HeaderPanel } from "./components/header-panel.tsx";
import { IsolatedErrorPanel } from "./components/isolated-error-panel.tsx";
import { LocaleStatusPanel } from "./components/locale-status-panel.tsx";
import { LocaleSwitcherPanel } from "./components/locale-switcher-panel.tsx";
import { MessagesPanel } from "./components/messages-panel.tsx";
import { SiteHeader } from "./components/site-header.tsx";
import "./App.css";

interface AppProps {
  failureTranslator: FailureTranslator;
}

function App({ failureTranslator }: AppProps) {
  return (
    <>
      <SiteHeader />
      <main className="app-shell">
        <HeaderPanel />
        <FeatureGrid>
          <LocaleStatusPanel />
          <LocaleSwitcherPanel />
          <GreetingPanel />
          <MessagesPanel />
          <IsolatedErrorPanel translator={failureTranslator} />
        </FeatureGrid>
      </main>
    </>
  );
}

export default App;
