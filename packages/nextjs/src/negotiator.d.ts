declare module "negotiator" {
  export default class Negotiator {
    constructor(options: {
      headers: Record<string, string>;
    });

    languages(availableLanguages?: readonly string[]): string[];
  }
}
