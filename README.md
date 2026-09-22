Source for [streetartfestivals.uk](https://www.streetartfestivals.uk) — a map and calendar of every street art and graffiti festival in the UK and Ireland, built with Next.js (App Router).

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the result.

## Structure

- `src/data/data.json` — festival and site data, hand-maintained.
- `src/app` — routes: the atlas homepage, per-festival pages, sitemap/robots/manifest, and a small set of machine-readable endpoints (`/llms.txt`, `/api/openapi.json`, `/.well-known/api-catalog`) aimed at AI agents and answer engines.
- `src/components/atlas` — the map + calendar + programme list shell used on the homepage.
- `src/components/festival` — the per-festival detail page's map, gallery, and calendar-export widgets.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to load Archivo.

## Deploy

Deployed on [Vercel](https://vercel.com).
