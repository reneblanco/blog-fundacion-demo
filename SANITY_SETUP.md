# Sanity setup

This project is ready to use Sanity as the editorial CMS.

## 1. Create the Sanity project

Create a Sanity project named `Memoblog`.

Recommended values:

- Dataset: `production`
- Dataset visibility: public
- Studio name: `memoblog`

## 2. Install Studio dependencies

Run this locally:

```bash
npm install sanity @sanity/vision
```

## 3. Configure environment variables

Create these variables in Netlify:

```bash
PUBLIC_SANITY_PROJECT_ID=your-project-id
PUBLIC_SANITY_DATASET=production
PUBLIC_SANITY_STUDIO_URL=https://memoblog.sanity.studio
```

Use the same values locally in `.env` when developing.

## 4. Deploy the Studio

After logging in to Sanity, run:

```bash
npx sanity deploy
```

The deployed Studio URL should match `PUBLIC_SANITY_STUDIO_URL`.

## 5. Add a Netlify deploy hook

In Netlify, create a build hook for the site.

In Sanity, create a webhook that calls the Netlify build hook when a `post`,
`author`, or `category` document changes.

## Notes

The Astro site keeps using local Markdown posts until `PUBLIC_SANITY_PROJECT_ID`
is configured. Once Sanity is configured, `/blog` and individual post pages use
Sanity content.
