const githubUrl =
  process.env.NEXT_PUBLIC_GITHUB_URL ||
  "https://github.com/jralvarenga/better-translate";
const sponsorUrl =
  process.env.NEXT_PUBLIC_SPONSOR_URL ||
  "https://buy.polar.sh/polar_cl_kTi5esQphv7mygLZoq74PHArxF34gCvILfhMc3sx1gq";

export const siteLinks = {
  changelog: `${githubUrl}/releases`,
  github: githubUrl,
  npm: "https://www.npmjs.com/package/@better-translate/core",
  sponsor: sponsorUrl,
} as const;
