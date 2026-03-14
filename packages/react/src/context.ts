import { createContext } from "react";

import type { AnyUseTranslationsValue } from "./types.js";

export const BetterTranslateContext =
  createContext<AnyUseTranslationsValue | null>(null);
