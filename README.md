# Personal Site

A small Astro personal site built for GitHub Pages.

## Local Development

```sh
npm install
npm run dev
```

## Deployment

The included GitHub Actions workflow deploys the static site to GitHub Pages.

For the cleanest GitHub Pages URL, create a repository named:

```txt
phillip-trummer.github.io
```

Then push this folder to that repository and set Pages source to GitHub Actions in the repository settings.

For a custom domain, set `SITE_URL` to your domain in the workflow or repository environment, and add a `public/CNAME` file containing only the domain name.
