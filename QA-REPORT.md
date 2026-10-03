# Veyra prototype — verification

Verified on October 1, 2026 against the optimized Next.js production frontend.

## Results

- **Production build:** passed.
- **Strict TypeScript:** passed, including unused-local/parameter checks.
- **Production dependency audit:** zero reported vulnerabilities at verification time.
- **Playwright:** 13 tests passed.
- **Responsive checks:** all eight page types at 375, 390, 430, 768, 1024, 1440 and 1920 pixels — 56 page/width combinations, with no horizontal overflow or uncaught browser errors.
- **Local media:** real 20-second preview playback, seeking, mute/volume, speed changes, quality selection, fullscreen and watch-progress persistence verified.
- **Resume after reload:** separately verified that a saved position of 10.052932 seconds resumed at exactly the same position.
- **Other workflows:** search/category/sort/layout URL state, empty states, favorites, likes, playlist membership and creation, editable profile, persisted appearance/playback preferences, data reset, mobile navigation and search, keyboard shortcuts, modal focus restoration and reduced motion.
- **Assets:** local category artwork and normalized image URLs checked; no remote resource hosts requested by the browsing test.

## Scope and honest limits

Browser automation used Chromium and emulated viewports/touch input. Physical-device, Safari and Firefox testing was not performed. Local MP4 and WebM sources are both provided for compatibility.

The fictional full-film durations shown on cards are not the length of the real local media. The player explicitly identifies its silent 20-second, 720p visual preview. There is only one quality rendition; the picker offers Auto and 720p.

Native picture-in-picture/fullscreen depend on browser and embedding permissions. Restricted environments receive a useful message or a full-viewport fullscreen fallback.

A nonexistent route returns HTTP 404. For nonexistent IDs on streamed dynamic film routes, Next.js may send HTTP 200 along with its not-found UI and `noindex` directive; both behaviors are checked by the tests.

This is a frontend demo only. There are no external APIs, real adult content, real accounts, authentication, uploads, payments, tracking integrations or commercial streaming infrastructure. The README explains provider replacement and clearly separates a possible future server-side adapter from the current safe demo.

## Vercel readiness recheck — October 3, 2026

- Node.js **22.23.3**: clean `npm ci`, route type generation, strict TypeScript, and optimized production build passed.
- All **13 Playwright tests** passed against the production frontend under Node.js 22.
- All eight page routes returned HTTP 200 with a simulated `*.vercel.app` Host header.
- MP4 and WebM preview URLs returned valid HTTP 206 byte-range responses with the expected MIME types.
- Production dependency audit: zero reported vulnerabilities.
- `vercel.json` sets the native Next.js framework and reproducible install/build commands; no static-export output override.
- Node.js 22.x is pinned in `package.json` and `.nvmrc`. No runtime environment variables are required.

This recheck verifies local Vercel-compatible configuration and runtime behavior. An actual Vercel deployment was not performed or confirmed; that requires the connected Vercel project. See `VERCEL-DEPLOYMENT.md`.
