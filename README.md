# Kiro Music site

Public, static landing page for Kiro Music. The application source stays private; this repository contains only the website, brand art, and illustrated interface previews. Built with Astro and plain CSS.

## Run locally

Requires Node.js 22.12–23.x and npm (`.nvmrc` pins 22.19.0).

```sh
npm ci
npm run dev
npm test
npm run format:check
npm run build
```

`dist/` is the deployable static output. `npm run build` succeeds even if GitHub is unreachable or no public release exists: the page then shows **Downloads coming soon** with no dead download links.

## Deploy to Vercel

1. Import `VAAM23/Kiro-Music-Site` into Vercel. Set the Node.js version to **22**. Framework: **Astro**; build: `npm run build`; output: `dist` (normally detected automatically).
2. Make a Vercel Deploy Hook for the `main` branch. Add its URL as the `VERCEL_DEPLOY_HOOK` Actions secret **in this public site repo**. Do not put that URL in Git.
3. The private app's tag-triggered release workflow publishes installers and `latest.json` **here**. When a public Release is published or edited with installer assets attached, `.github/workflows/redeploy-on-release.yml` requests a new Vercel build. An early `published` event with no assets skips deployment; the app's release-notes edit after upload triggers it again. You can also run the workflow manually.

The release version, notes and platform URLs come **only** from `https://api.github.com/repos/VAAM23/Kiro-Music-Site/releases/latest` **at build time**. Publishing a release without a Vercel rebuild does not update an already deployed static page. The download button detects Windows/macOS/Linux in the browser; both Mac architectures have explicit links (a browser cannot reliably detect the CPU). Supported formats: `.exe` / `.msi` (Windows), `.dmg` (`aarch64` Apple Silicon or `x64` Intel), `.AppImage` / `.deb` / `.rpm` (Linux). Updater-only `.sig`, `.tar.gz` and `latest.json` are never offered as installers. If the API fails or no installer exists, downloads are disabled. **Never delete version tags/releases** in this repository: the app's Tauri updater relies on their signed `latest.json` and assets.

## Replace illustrated previews

`public/previews/*.svg` are illustrative mockups based on the current app UI, **not actual screenshots**. Before announcing the site, replace them with real captures from the running app (and update the paths and copy in `src/pages/index.astro`). `scripts/generate-previews.mjs` regenerates the placeholders. The Kiro dog artwork is copied from the app's `assets/kiro-logo.png`.

## Check the page

Run `npm run build`, serve `dist/` locally, and run `node scripts/smoke.mjs` with Chrome installed (or set `BROWSER_PATH`). The browser smoke checks 390px/1440px layouts, overflow, the EN/ES toggle, and axe WCAG 2/2.1 AA rules. Run `npm audit` when updating dependencies. The site respects reduced motion. Local mobile Lighthouse (Chrome, blocking the machine's injected Kaspersky scripts) measured **99 performance / 100 accessibility**; confirm the scores again on the deployed Vercel URL.
