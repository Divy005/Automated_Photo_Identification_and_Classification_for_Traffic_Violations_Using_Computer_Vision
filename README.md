# Vision Road Guardian — TrafficAI

Automated photo identification and classification for traffic violations using
computer vision. This is the web dashboard: upload images or short video clips
and get back annotated evidence, detected violations, and analytics.

The UI talks to two computer-vision inference backends:

- **Image detection** (helmet, triple riding, wrong-side, stop-line, illegal
  parking, plate read) — configurable via `VITE_IMAGE_API_URL`.
- **Video detection** (red-light / stop-line crossing with ROI selection) —
  configurable via `VITE_VIDEO_API_URL`.

## Tech stack

- [TanStack Start](https://tanstack.com/start) (React 19 + TanStack Router, SSR)
- Vite 8
- Tailwind CSS v4 + shadcn/ui (Radix primitives)
- TanStack Query, Recharts

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on the port Vite prints (default `5173`).

### Environment variables

Create a `.env` (or set them in your host) to point the app at your backends:

```bash
VITE_IMAGE_API_URL=https://your-image-api.example.com
VITE_VIDEO_API_URL=https://your-video-api.example.com
```

If unset, the app falls back to the demo backends defined in `src/lib/api.ts`.

## Scripts

| Script          | Description                          |
| --------------- | ------------------------------------ |
| `npm run dev`   | Start the dev server                 |
| `npm run build` | Production build (Vercel output)     |
| `npm run preview` | Preview the production build       |
| `npm run lint`  | Run ESLint                           |
| `npm run format`| Format with Prettier                 |

## Deploying to Vercel

The app is configured to build to Vercel's [Build Output API](https://vercel.com/docs/build-output-api/v3)
out of the box.

1. Import the repository in Vercel (or run `vercel`).
2. Vercel reads `vercel.json` and runs `NITRO_PRESET=vercel vite build`, which
   emits `.vercel/output/` — no extra configuration needed.
3. Add the `VITE_IMAGE_API_URL` / `VITE_VIDEO_API_URL` environment variables in
   the project settings if you use your own backends.

To produce a Vercel build locally:

```bash
npm run build      # NITRO_PRESET defaults to "vercel"
```

You can target other platforms with the Nitro preset, e.g.
`NITRO_PRESET=node-server npm run build`.

## Project structure

```
src/
  components/
    app/        # dashboard panels (image, video, analytics, examples)
    ui/         # shadcn/ui components
  lib/
    api.ts      # inference API clients
  routes/       # TanStack Router file routes
  router.tsx    # router + query client setup
  server.ts     # SSR entry with error-page fallback
```
