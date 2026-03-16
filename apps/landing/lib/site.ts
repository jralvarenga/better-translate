const githubUrl =
  process.env.NEXT_PUBLIC_GITHUB_URL ??
  "https://github.com/jralvarenga/better-translate";

export const siteLinks = {
  changelog: `${githubUrl}/releases`,
  github: githubUrl,
  npm: "https://www.npmjs.com/package/better-translate",
} as const;
