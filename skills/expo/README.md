# Expo Skill

Use this guide when the app is Expo or React Native.

## Correct package combination

- required: `@better-translate/core`
- required: `@better-translate/react`

There is no separate native adapter package.

## Correct integration

1. Create the translator with `@better-translate/core`
2. Wrap the app with `BetterTranslateProvider`
3. Use `useTranslations()` inside screens and components

## Important rule

Do not look for `@better-translate/react-native`.

Expo support lives inside `@better-translate/react`.

## When to change packages

Only add more packages if the app actually needs them:

- add `@better-translate/md` for localized content files
- add `@better-translate/cli` for generated locale files
