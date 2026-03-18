declare module "react-test-renderer" {
  import type { ReactElement } from "react";

  export interface ReactTestRenderer {
    update(nextElement: ReactElement): void;
    unmount(): void;
  }

  export function act<T>(callback: () => T | Promise<T>): Promise<void>;

  export function create(element: ReactElement): ReactTestRenderer;
}
