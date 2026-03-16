import { afterEach, describe, expect, it } from "bun:test";

import { getRequestLocale, setRequestLocale } from "./server.js";

describe("request locale store", () => {
  afterEach(() => {
    setRequestLocale(undefined);
  });

  it("returns the locale written through setRequestLocale", () => {
    setRequestLocale("es");

    expect(getRequestLocale()).toBe("es");
  });

  it("clears the locale when setRequestLocale receives undefined", () => {
    setRequestLocale("es");
    setRequestLocale(undefined);

    expect(getRequestLocale()).toBeUndefined();
  });
});
