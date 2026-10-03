# Deploy Veyra on Vercel

## Repository settings

- Repository: `dyvx/Nkoo`
- Production branch: `main`
- Root Directory: `./` (the app is at the repository root)
- Framework Preset: **Next.js**
- Node.js: **22.x**, pinned in `package.json` and `.nvmrc`
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: leave the framework default; do not change it to `out` or `dist`
- Environment Variables: **none required** for the mock demo

The repository includes `vercel.json` with the Next.js framework and reproducible install/build commands. No Vercel project token, GitHub token, project linkage credentials, or local `.vercel` directory is committed.

## Import and deploy

1. Sign in to [Vercel](https://vercel.com/new).
2. Import [`dyvx/Nkoo`](https://github.com/dyvx/Nkoo).
3. Confirm the settings above, with production branch `main`.
4. Select **Deploy**.

The mock catalog is bundled with the application. Original thumbnails, fonts, MP4s and WebMs are served from `public/`. There is no database, separate backend, external content API, authentication requirement, or runtime filesystem write. Library/profile persistence uses browser localStorage, guarded for server rendering.

The App Router's dynamic film and creator routes need Vercel's native Next.js support. This project intentionally **does not** use static export, custom catch-all rewrites, a custom production server, or Docker.

## Runtime compatibility

A clean `npm ci`, `npm run typecheck`, and `npm run build` were verified locally under Node.js 22. The build uses the same commands configured for Vercel. Production-route, media and responsive tests run against `next start`.

Node.js 22 is explicitly pinned rather than relying on a project's older runtime setting. Vercel has [deprecated Node.js 20 for new Builds and Functions as of October 1, 2026](https://vercel.com/changelog/node-js-20-is-being-deprecated); see its [supported runtime documentation](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions).

These are local compatibility checks, not a claim that an actual Vercel deployment has completed. A successful hosted deployment still needs to be confirmed in your Vercel project.

## After deployment

Open the deployment URL and verify:

- `/` loads the hero, sidebar or mobile navigation, and thumbnails.
- `/search?q=Coffee` filters correctly.
- `/categories` shows category counts and linked listings.
- `/video/v01` renders a film details page.
- `/watch/v01` plays its local 20-second preview; seeking, settings and progress work.
- `/library` and `/profile` retain local changes after a reload.
- MP4/WebM URLs return playable media, including browser range requests.

Vercel previews and production domains have separate browser storage. Demo changes are also scoped to each browser/device. Native fullscreen and picture-in-picture depend on browser/embedding permissions.

## Future APIs

Keep the providers set to `mock` until a backend adapter is intentionally added. `NEXT_PUBLIC_API_BASE_URL` is reserved for that later adapter and is not required now. Never put provider credentials or secret keys in a `NEXT_PUBLIC_*` variable.

See `README.md` for catalog/source adapter contracts and the separate, future server-side integration notes. The deployed demo remains entirely fictional and contains no real adult content or external content sources.
