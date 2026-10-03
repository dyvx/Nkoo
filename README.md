# Veyra — Stay curious.

A complete, local-first streaming/discovery **UI prototype**, built with Next.js App Router, TypeScript, React, and Tailwind CSS. All films, creators, titles, stories, and categories are fictional. No adult content, external content feeds, authentication, or third-party APIs are included.

## Run it

Use Node.js **22.x** (pinned in `package.json` for Vercel).

```bash
npm ci
npm run dev
# http://localhost:3000
```

For the optimized production frontend:

```bash
npm run build
npm run start
```

Both servers bind to `0.0.0.0`, so the project can also run in a hosted preview. All browser-facing assets and media use relative URLs. There are no CDN scripts, external images, remotely hosted fonts, or client calls to localhost.

## Deploy to Vercel

Import [`dyvx/Nkoo`](https://github.com/dyvx/Nkoo) with Root Directory `./` and Framework Preset **Next.js**. Node.js **22.x** is pinned, and `vercel.json` configures `npm ci` and `npm run build`. No environment variables are required for the mock demo. Leave the framework Output Directory at its default.

See [`VERCEL-DEPLOYMENT.md`](./VERCEL-DEPLOYMENT.md) for setup, compatibility checks, and the hosted verification checklist. Local build checks do not mean that a hosted deployment has already completed.

## The experience

| Page         | Route           | Working features                                                                                                                                                                  |
| ------------ | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Home         | `/`             | Featured-film carousel, category filters, surprise discovery, trending periods, new uploads, recommendations, popular films, continue watching                                    |
| Search       | `/search`       | Suggestions, recent searches, category filters, sorting, grid/list view, skeletons, empty/error states                                                                            |
| Categories   | `/categories`   | Editorial picks, all categories, live demo counts, popular and recently active collections                                                                                        |
| Film details | `/video/:id`    | Title/metadata, creator information, follow, like, save, share, playlists, description, tags, related films                                                                       |
| Player       | `/watch/:id`    | Real local playback, seeking, volume/mute, speed, quality selection, native fullscreen with a layout fallback, native picture-in-picture when permitted, resume/progress tracking |
| Library      | `/library`      | Continue watching, saved films, history, recently viewed, playlist creation, membership, viewing and deletion                                                                     |
| Profile      | `/profile`      | Editable demo profile, saved/history overview, dark/light/system appearance, playback preferences, local-data reset                                                               |
| Creator      | `/creators/:id` | Creator profile, follow, sortable film catalog                                                                                                                                    |

Search/filter/sort/layout state is stored in URL query parameters. Library sections use `?tab=continue`, `saved`, `history`, or `playlists`. Profile preferences use `?tab=preferences`.

### The demo media

Ten **original AI-generated artworks** are used to create optimized WebP thumbnails, editorial reframings, and **20-second, silent local visual films** with gentle camera movement. Both MP4/H.264 and WebM/VP9 are included for browser compatibility.

Card durations and 4K labels describe the imaginary full-length films. The player clearly identifies the actual 720p visual preview and shows its real 20-second timeline. The quality picker offers only `Auto` and the available `720p` rendition; it does not pretend to provide unavailable qualities. The volume controls work on the native media element, but these previews intentionally contain no audio. Caption preferences take effect when a future provider supplies text tracks.

Picture-in-picture and native fullscreen depend on browser permissions, especially inside embedded previews. The UI handles restrictions with a useful toast or a full-viewport fallback rather than failing silently.

## Where to edit

```text
src/
  app/                    Routes, root layout, global responsive styles
  components/
    player/               Isolated VideoPlayer and PlayerControls
    AppProviders.tsx      Catalog snapshot, local library, preferences, toast state
    SiteShell.tsx         Navbar, Sidebar, MobileNav
    VideoCard.tsx         Reusable cards, rows and grids
    ui.tsx                Accessible modal, dropdown, toast helpers, empty/loading UI
    ...                   Reusable discovery, filtering, creator and detail components
  data/
    mockVideos.ts         All 32 fictional video records
    mockCategories.ts     All 8 category records and category artwork/icons
    mockCreators.ts       All 8 fictional creator records
    mockUser.ts           Seed profile, saved films, history and playlists
  lib/
    config.ts             Single product configuration entry point
    providers/
      catalog.ts          VideoCatalogProvider interface
      source.ts           VideoSourceProvider interface
      mock.ts             MockCatalogProvider and MockSourceProvider
      index.ts            Provider registries and configured factories
    utils.ts              Shared date/count/duration formatting
  types/index.ts          Video, Category, Creator, Playlist, User, VideoSource, etc.
public/
  images/                 Original art and optimized local derivatives
  media/                  Silent MP4 + WebM demo previews
  fonts/                  Self-hosted Manrope with OFL license
scripts/                  Optional artwork/media-generation and visual-check scripts
tests/platform.spec.ts    End-to-end browser tests
```

### Product configuration

Edit **`src/lib/config.ts`** for the brand name, accent, navigation, pinned categories, API base URL, provider selection, player defaults, keyboard seek step, preview duration, home-section sizes, and persistence key. Category definitions themselves live in `src/data/mockCategories.ts` rather than being duplicated in components.

CSS uses semantic design tokens for background, surfaces, contrast, spacing, and interaction styles. The accent is supplied by configuration as a root CSS variable. The logo is an original inline vector; `/public/icon.svg` is its favicon counterpart. If you change the mark, update both.

### Persistent demo state

`localStorage['veyra:demo:v1']` contains the demo profile, favorites, likes, followed creators, watch positions, recently viewed IDs, recent searches, playlists, and preferences. Storage failures fall back to in-memory state. Nothing is sent to a server. Reset everything through **Profile → Preferences → Reset demo data**.

When connecting a completely different catalog, change `storageKey` (or migrate IDs) to keep the previous demo library separate.

## Replacing the backend later

The UI consumes normalized interfaces, not a provider-specific payload. Do not put external response formats into card or page components.

1. Implement `VideoCatalogProvider` for catalog/search/category/creator data. Normalize your backend records into `Video`, `Category`, and `Creator`.
2. Implement `VideoSourceProvider` to resolve a selected video into a media URL, MIME type, codec fallbacks, optional quality renditions and optional captions.
3. Register the new factories in `src/lib/providers/index.ts` and select them in `APP_CONFIG.providers`.
4. Use the reserved API base URL configuration if your adapter needs it. Prefer same-origin routes for browser requests.
5. Keep the library state local, or implement a separate persistence adapter when authentication is actually required.

Quality switching already preserves playback position and play/pause state when an adapter supplies multiple file renditions. The standard HTML5 player currently supports browser-playable file URLs. DRM, protected media, and HLS/DASH engines would be separate future player integrations; none are installed for this prototype.

### A future `porn-api-js` adapter

This project **does not install, execute, or connect to `porn-api-js`**, and includes no adult catalog, source URL, imagery, or content. If you later choose to add a compliant integration, keep a Node-only/provider-specific package **on your backend**, behind your own API. The browser catalog adapter should call that API and map its output into the existing interfaces. Do not bundle server libraries, credentials, scraping logic, or provider-specific responses into the frontend. That future backend integration is separate from this safe fictional demo.

## Quality checks

```bash
npm run typecheck
npm run build
npm audit --omit=dev

# One-time browser setup:
npx playwright install --with-deps chromium
npm test
```

The Playwright suite tests all eight page types at **375, 390, 430, 768, 1024, 1440, and 1920 pixels**, checks overflow and browser errors, and exercises search, URL persistence, saved/liked state, playlists, real media controls, fullscreen, mobile navigation, profile editing, preferences, keyboard access, focus restoration, reduced motion and 404s. You can point tests at an existing server with `TEST_BASE_URL`.

```bash
TEST_BASE_URL=http://127.0.0.1:3000 npm test
npm run test:visual
```

The optional Python media scripts require Pillow, imageio-ffmpeg, and (only when converting fonts) fontTools/Brotli. They are **not runtime dependencies**; all prepared media is already included.

### Accessibility and responsive behavior

- Semantic buttons, labeled controls, visible focus rings and a skip link
- Focus-trapped modal dialogs with Escape and focus restoration
- Keyboard-operated dropdowns and an accessible native seek slider
- Player keyboard shortcuts: `K` / Space to play, `←` / `→` to seek, `M` to mute, `F` for fullscreen
- `/` focuses desktop search
- Safe-area-aware mobile header/bottom navigation and fullscreen controls
- Two-column phone grids, three-column tablet grids and dense desktop discovery
- Reduced-motion preferences respected across transitions and loading animations

This is a polished frontend demo, **not a deployed commercial streaming service**. It intentionally does not implement a backend, account authentication, payments, moderation infrastructure, analytics, uploads, or external streaming integrations.
