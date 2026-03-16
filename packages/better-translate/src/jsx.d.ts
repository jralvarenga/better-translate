declare namespace JSX {
  interface Element {}
  interface ElementClass {}
  interface IntrinsicElements {
    [elementName: string]: unknown;
  }
  type ElementType = string | ((props: Record<string, unknown>) => unknown);
}
