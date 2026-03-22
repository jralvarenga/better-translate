import { Component, type ReactNode } from "react";

import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { useTranslations } from "@better-translate/react";

import type { AppTranslator } from "./i18n.ts";
import { renderApp } from "./test/render-app.tsx";

class TestErrorBoundary extends Component<
  { children: ReactNode; onError(error: unknown): void },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    this.props.onError(error);
  }

  render() {
    if (this.state.hasError) {
      return null;
    }

    return this.props.children;
  }
}

describe("react-vite-example", () => {
  it("renders with the default locale", async () => {
    await renderApp();

    expect(
      screen.getByRole("heading", { name: "Better Translate React example" }),
    ).toBeTruthy();
    expect(screen.getByText("Hello")).toBeTruthy();
    expect(screen.getByTestId("current-locale").textContent).toBe("en");
  });

  it("supports overriding the initial locale", async () => {
    await renderApp({ initialLocale: "es" });

    expect(
      screen.getByRole("heading", {
        name: "Ejemplo React de Better Translate",
      }),
    ).toBeTruthy();
    expect(screen.getByText("Hola")).toBeTruthy();
    expect(screen.getByTestId("current-locale").textContent).toBe("es");
  });

  it("switches to a cached locale", async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.click(screen.getByRole("button", { name: "Switch to Spanish" }));

    await waitFor(() => {
      expect(screen.getByTestId("current-locale").textContent).toBe("es");
    });
    expect(screen.getByText("Hola")).toBeTruthy();
  });

  it("auto-loads a locale before switching to it", async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.click(screen.getByRole("button", { name: "Switch to French" }));

    await waitFor(() => {
      expect(screen.getByTestId("current-locale").textContent).toBe("fr");
    });
    expect(screen.getByText("Bonjour")).toBeTruthy();
  });

  it("loads locale messages without switching locale", async () => {
    const user = userEvent.setup();
    await renderApp();

    await user.click(screen.getByRole("button", { name: "Load French cache" }));

    await waitFor(() => {
      expect(screen.getByTestId("cached-locales").textContent).toContain("fr");
    });
    expect(screen.getByTestId("message-panel-locale").textContent).toBe("en");
    expect(screen.getByTestId("french-cache-status").textContent).toBe(
      "French cache ready",
    );
  });

  it("interpolates params through the locale-bound t helper", async () => {
    const user = userEvent.setup();
    await renderApp();

    const saluteInput = screen.getByLabelText("Salute");
    const nameInput = screen.getByLabelText("Name");

    await user.clear(saluteInput);
    await user.type(saluteInput, "Dra.");
    await user.clear(nameInput);
    await user.type(nameInput, "Ada");

    expect(screen.getByTestId("formal-greeting").textContent).toBe("Dra. Ada");
  });

  it("keeps the previous locale and exposes localeError when loading fails", async () => {
    const user = userEvent.setup();
    await renderApp();

    await waitFor(() => {
      expect(
        screen.getByRole("button", { name: "Try failing French locale" }),
      ).toBeTruthy();
    });

    await user.click(
      screen.getByRole("button", { name: "Try failing French locale" }),
    );

    await waitFor(() => {
      expect(screen.getByTestId("failure-locale").textContent).toBe("en");
      expect(screen.getByTestId("failure-error").textContent).toBe(
        "Locale failed to load",
      );
    });
  });

  it("throws when used outside the provider", () => {
    const originalError = console.error;
    const consoleError = vi.fn();
    console.error = consoleError;
    let capturedError: unknown;

    function Consumer() {
      useTranslations<AppTranslator>();
      return null;
    }

    act(() => {
      render(
        <TestErrorBoundary
          onError={(error) => {
            capturedError = error;
          }}
        >
          <Consumer />
        </TestErrorBoundary>,
      );
    });

    expect(capturedError).toBeInstanceOf(Error);
    expect((capturedError as Error).message).toBe(
      "useTranslations() must be used inside <BetterTranslateProvider />.",
    );

    console.error = originalError;
  });
});
