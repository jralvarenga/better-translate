# Elysia Better Translate Example

This app demonstrates `better-translate/core` in a Bun + Elysia server with a
feature-based structure:

- `src/app.ts` creates the Elysia app.
- `src/modules/translations/index.ts` contains the translation routes.
- `src/modules/translations/service.ts` owns translation state and Better Translate setup.
- `src/modules/translations/model.ts` defines Elysia schemas for params and responses.

## Development

```bash
bun run dev
```

Open [http://localhost:2902](http://localhost:2902) after starting the server.
Set `PORT` if `2902` is already in use.

From the workspace root you can also run:

```bash
bun run dev:elysia-example
```

## Routes

- `GET /` returns `{ key, message, currentLocale }` for the root message.
- `GET /hello` returns `{ key, message, currentLocale }` for the greeting.
- `GET /greeting/:name` returns `{ key, message, currentLocale }` for an interpolated greeting.
- `GET /account/balance` returns `{ key, message, currentLocale }` for a nested translation key.
- `GET /current-locale` returns the active locale, fallback locale, and supported locales.
- `GET /change-locale/:language` changes the in-memory locale for the whole server process and returns `{ message, currentLocale, supportedLocales }`.

## Example Flow

1. `GET /` returns an English JSON payload on first startup.
2. `GET /change-locale/es` changes the app-wide locale to Spanish.
3. `GET /greeting/Ada` now returns an interpolated Spanish `message`.
4. `GET /hello` returns a Spanish `message`.
5. `GET /account/balance` returns the Spanish label from the preloaded locale file.
