import { defineConfig } from 'astro/config';

const owner = process.env.GITHUB_REPOSITORY_OWNER;
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1];
const isUserSite = owner && repo === `${owner}.github.io`;
const hasCustomSite = Boolean(process.env.SITE_URL);

export default defineConfig({
  site: process.env.SITE_URL ?? (owner ? `https://${owner}.github.io` : 'https://example.com'),
  base: process.env.BASE_PATH ?? (!hasCustomSite && owner && repo && !isUserSite ? `/${repo}` : undefined),
});
