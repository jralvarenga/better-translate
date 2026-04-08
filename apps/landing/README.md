# Landing App

This is the localized Next.js landing site for better-translate.

## Local Development

1. Copy `.env.example` to `.env.local`.
2. Set `NEXT_PUBLIC_SITE_URL` to the origin you want metadata and sitemap entries to use.
3. Optionally set `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` if you want the Search Console verification meta tag locally or in production previews.
4. Run `bun run dev:landing` from the workspace root, or `bun dev` from this app directory.

## SEO Notes

- `app/robots.ts` and `app/sitemap.ts` provide native Next.js metadata routes.
- Canonical URLs and alternate language links are generated from `NEXT_PUBLIC_SITE_URL`.
- Docs pages only emit indexable alternates for locales that have real markdown source files on disk.
- Thank-you/support completion pages are intentionally `noindex`.
