# Deployment & Cloudflare Optimization

Single reference for deploying BlockchainVibe (Pages + Workers) and Cloudflare best practices. Last updated: February 2025.

---

## Table of Contents

1. [Cloudflare Pages Configuration](#cloudflare-pages-configuration)
2. [Build Settings & Environment](#build-settings--environment)
3. [Deployment Options](#deployment-options)
4. [Optimizations & Security](#optimizations--security)
5. [Troubleshooting](#troubleshooting)
6. [Maintenance & Resources](#maintenance--resources)

---

## Cloudflare Pages Configuration

### Repository / Root Directory

If you renamed the repository (e.g. from `ai-news-agent` to `blockchainvibe`), update Cloudflare Pages:

- **Settings → Builds & deployments**: Reconnect to `https://github.com/chiku524/blockchainvibe` if needed.
- **Root directory**: Set to `.` (or leave empty). Do **not** set to a subfolder like `blockchainvibe`.

### Create New Pages Project (CLI)

```bash
wrangler pages project create blockchainvibe --production-branch main
```

Then in Dashboard: connect Git, set **Build command** `npm run build:ci`, **Build output directory** `build`, **Root directory** `.`, and add `REACT_APP_*` env vars (including `REACT_APP_API_URL`). Optional: see [Subscription](subscription.md) to enable subscription later.

---

## Build Settings & Environment

- **Build command**: `npm run build:ci` (CI mode; warnings fail the build).
- **Build output directory**: `build`.
- **Root directory**: `.`

Cloudflare sets `CI=true`; use `npm run build:ci` locally before pushing. ESLint: unused vars with `_` prefix are allowed; avoid empty destructuring.

**Quick check before push:**

```bash
npm run build:ci
```

---

## Deployment Options

### Option A: GitHub Actions (recommended)

1. Add secrets: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.
2. Push to `main` → automatic deploy. PRs get preview deployments.

Workflow: `.github/workflows/deploy-pages.yml`.

### Option B: Direct Wrangler CLI

```bash
npm run build:ci
wrangler pages deploy ./build --project-name=blockchainvibe
```

### Option C: npm scripts

- `npm run deploy:pages` — build and deploy Pages
- `npm run deploy:worker` — deploy Workers API (from `server/`)
- `npm run deploy:assets` — deploy Assets Worker

---

## Optimizations & Security

### Wrangler & compatibility

- **Compatibility dates**: `2025-12-10` in root and `server/wrangler.toml`.
- Keep Wrangler updated: `npm install -g wrangler@latest`.

### Worker secrets (optional)

To enable **NewsAPI.ai** (Event Registry) as a news source for blockchain/crypto headlines, set the API key as a Worker secret (do not commit the key):

```bash
cd server && wrangler secret put NEWSAPI_KEY
```

Paste your NewsAPI.ai key when prompted. The aggregator uses it for real-time article search (production-ready, 150k+ sources).

### Implemented

1. **Security headers** (`public/_headers`): X-Frame-Options, X-Content-Type-Options, CSP, HSTS, Referrer-Policy, Permissions-Policy.
2. **Caching**: Static assets/images/fonts 1 year; API 5 min with Vary; HTML no-cache.
3. **Service worker** (`public/sw.js`): PWA, offline and runtime caching.
4. **API proxying** (`public/_redirects`): `/api/*` → Worker; SPA fallback.

### Future (optional)

- Cloudflare Images, Analytics, Pages Functions, performance monitoring.

---

## Troubleshooting

### Updates not showing after deploy

1. **Frontend**: Wait for GitHub Actions to finish. A **normal refresh** should now load the latest build (service worker uses network-first for the document). If you still see old content, do a hard refresh once: `Ctrl+Shift+R` / `Cmd+Shift+R`.
2. **Worker**: Launches API is cached 3 min; wait 3–5 min or hard refresh. News API responses use `Cache-Control: no-cache` so the browser does not serve stale article lists.
3. **Browser**: If needed, try incognito or clear site data.

### News feed showing few or one article

- Aggregator uses partial results on total timeout and all enabled RSS feeds. See server `news-aggregator.js`. Redeploy Worker after changes.

---

## Maintenance & Resources

- **Wrangler**: Update quarterly; bump `compatibility_date` in both `wrangler.toml` files.
- **Monitoring**: Cloudflare Dashboard, GitHub Actions logs.

**Links**

- [Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Wrangler CLI](https://developers.cloudflare.com/workers/wrangler/)
- [GitHub Actions for Pages](https://github.com/cloudflare/pages-action)
