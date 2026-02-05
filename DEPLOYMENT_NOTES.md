# Deployment Notes

## Cloudflare Pages Configuration

### Important: Repository Name Change
If you renamed your repository from `ai-news-agent` to `blockchainvibe`, you must update your Cloudflare Pages project settings:

**The Issue**: Cloudflare Pages may fail to initialize the build environment if it's still connected to the old repository URL, even though GitHub redirects it.

**Solution Options**:

#### Option 1: Update Existing Project (Recommended if you can access settings)
1. **Go to Cloudflare Dashboard** → Pages → Your Project → Settings → Builds & deployments
2. **Update Repository Connection**:
   - Look for "Source" or "Connected repository" section
   - If there's an "Edit" or "Change" button, click it
   - Reconnect to: `https://github.com/chiku524/blockchainvibe`
   - If you can't edit, try disconnecting and reconnecting (see Option 2)

3. **Update Root Directory**:
   - In the same Settings → Builds & deployments section
   - Set **Root directory** to: `.` (or leave it blank/empty)
   - **DO NOT** set it to `blockchainvibe` - the codebase is now at the root

#### Option 2: Create New Cloudflare Pages Project (If you can't disconnect)
If you're unable to disconnect the old repository, create a new Cloudflare Pages project:

1. **Create New Project**:
   - Go to Cloudflare Dashboard → Pages → Create a project
   - Connect to Git → Select GitHub
   - Choose repository: `chiku524/blockchainvibe` (the new name)
   - Click "Begin setup"

2. **Configure Build Settings**:
   - **Framework preset**: Create React App (or None)
   - **Build command**: `npm run build:ci`
   - **Build output directory**: `build`
   - **Root directory**: `.` (or leave empty)

3. **Set Environment Variables**:
   - Add all your `REACT_APP_*` environment variables
   - Set `REACT_APP_API_URL` to your Worker URL
   - Optional: Subscription is built but disabled by default. See [SUBSCRIPTION.md](./SUBSCRIPTION.md) to enable it later.

4. **Deploy**:
   - Click "Save and Deploy"
   - Once deployed, you can delete the old project

#### Option 3: Delete and Recreate (Recommended - CLI + Dashboard)
**✅ COMPLETED**: Project has been successfully deleted and recreated.

**Step 1: Delete Deployments** (Required first):
   If you have too many deployments (>100), use the deletion script:
   ```bash
   cd /path/to/delete-all-deployments
   CF_API_TOKEN="YOUR_TOKEN" \
   CF_ACCOUNT_ID="10374f367672f4d19db430601db0926b" \
   CF_PAGES_PROJECT_NAME="blockchainvibe" \
   CF_DELETE_ALIASED_DEPLOYMENTS=true \
   npm start
   ```
   **Important**: Use `CF_DELETE_ALIASED_DEPLOYMENTS=true` to avoid infinite loops.

**Step 2: Delete Project via CLI**:
   ```bash
   wrangler pages project delete blockchainvibe
   ```

**Step 3: Create New Project via CLI**:
   ```bash
   wrangler pages project create blockchainvibe --production-branch main
   ```

**Step 3: Connect to Git via Dashboard**:
   - Go to Cloudflare Dashboard → Pages → `blockchainvibe` project
   - Go to Settings → Builds & deployments
   - Click "Connect to Git"
   - Select GitHub and authorize
   - Choose repository: `chiku524/blockchainvibe` (the NEW repository name)
   - Click "Begin setup"

**Step 4: Configure Build Settings**:
   - **Build command**: `npm run build:ci`
   - **Build output directory**: `build`
   - **Root directory**: `.` (or leave empty) - **CRITICAL: Must be root, not `blockchainvibe`**
   - **Production branch**: `main`

**Step 5: Set Environment Variables**:
   - Add all your `REACT_APP_*` environment variables
   - Set `REACT_APP_API_URL` to your Worker URL

**Step 6: Save and Deploy**:
   - Click "Save and Deploy"
   - The build should now work with the correct repository connection

#### Option 4: Update Git Remote (Already done locally)
The local git remote has been updated to point to the new repository URL.

### Build Settings
- **Build command**: `npm run build:ci` (uses CI=true to treat warnings as errors)
- **Build output directory**: `build`
- **Root directory**: `.` (root of repository) - **MUST be set to `.` or left empty**

### Environment Variables
Cloudflare Pages automatically sets `CI=true` which causes react-scripts to treat ESLint warnings as errors.

### ESLint Configuration
The ESLint config has been updated to be more lenient with unused variables:
- Unused vars starting with `_` are allowed (for intentionally unused variables)
- Empty destructuring patterns are now warnings instead of errors
- Rest siblings are ignored in unused var checks

### Preventing Build Failures

1. **Before committing**: Always run `npm run build` locally to catch errors early
2. **Unused imports**: Remove unused imports and variables before committing
3. **Intentionally unused vars**: Prefix with `_` (e.g., `const { _unused } = data;`)
4. **Empty patterns**: Avoid empty destructuring `const { } = data;` - use `const _data = data;` instead

### Local Build vs CI Build
- `npm run build` - Sets CI=false (warnings don't fail build) - use for local testing
- `npm run build:ci` - Uses CI=true (warnings fail build) - matches Cloudflare Pages behavior

### Quick Check
Before pushing to GitHub, always run:
```bash
npm run build:ci
```

This will simulate the exact build environment on Cloudflare Pages.

---

## ✅ Project Status

**Current Status**: Project successfully configured via CLI and API
- ✅ All deployments deleted (using force flag for aliased deployments)
- ✅ Old project deleted via CLI
- ✅ New project created: `blockchainvibe` with production branch `main`
- ✅ Build configuration set via API:
  - Build command: `npm run build:ci`
  - Build output: `build`
  - Root directory: `.`
- ✅ `wrangler.toml` configured for Pages deployment
- ⚠️  GitHub connection: Requires OAuth (see deployment options below)

**Deployment Options** (since GitHub connection via dashboard is unavailable):

**Option A: Direct Deployment via Wrangler CLI** (Recommended)
```bash
# Build the project
npm run build:ci

# Deploy to Cloudflare Pages
wrangler pages deploy ./build --project-name=blockchainvibe
```

**Option B: GitHub Actions** (Automatic deployments on push)
A GitHub Actions workflow has been created at `.github/workflows/deploy-pages.yml`
1. Add secrets to GitHub repository:
   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID`: `10374f367672f4d19db430601db0926b`
2. Push to `main` branch - automatic deployment will trigger

**Option C: Manual Deployment Script**
```bash
# Run the deployment script
# Build configuration is now handled via GitHub Actions workflow
npm run build:ci          # Builds the project
wrangler pages deploy ./build --project-name=blockchainvibe
```

---

## 🚀 Cloudflare Pages Optimizations (December 2025 Best Practices)

### ✅ Implemented Optimizations

1. **Enhanced Security Headers** (`public/_headers`):
   - ✅ X-Frame-Options: DENY
   - ✅ X-Content-Type-Options: nosniff
   - ✅ X-XSS-Protection enabled
   - ✅ Referrer-Policy: strict-origin-when-cross-origin
   - ✅ Permissions-Policy configured
   - ✅ **NEW**: Strict-Transport-Security (HSTS)
   - ✅ **NEW**: Content-Security-Policy (CSP)

2. **Optimized Caching Strategy** (`public/_headers`):
   - ✅ Static assets: 1 year cache with immutable flag
   - ✅ Images: 1 year cache (jpg, png, webp, svg, gif)
   - ✅ Fonts: 1 year cache (woff, woff2, ttf, eot)
   - ✅ JavaScript/CSS: 1 year cache with immutable
   - ✅ API responses: 5 minutes cache with Vary headers
   - ✅ HTML: No cache (must-revalidate) for instant updates

3. **Service Worker** (`public/sw.js`):
   - ✅ PWA support with offline caching
   - ✅ Runtime caching for dynamic content
   - ✅ Cache versioning for updates

4. **API Redirects** (`public/_redirects`):
   - ✅ All `/api/*` requests proxied to Cloudflare Workers
   - ✅ SPA fallback to index.html

5. **Updated Compatibility Dates** (December 10, 2025):
   - ✅ Pages: `2025-12-10` (current date)
   - ✅ Workers API: `2025-12-10` (updated from 2024-01-01)
   - ✅ Workers Assets: `2025-12-10` (updated from 2024-01-01)

6. **Wrangler.toml Configuration**:
   - ✅ Centralized configuration in codebase
   - ✅ Environment-specific settings
   - ✅ Build configuration optimized

7. **GitHub Actions Workflow**:
   - ✅ Automated deployments on push
   - ✅ Preview deployments for PRs
   - ✅ Optimized build process

### 📦 Deployment Scripts

Added to `package.json`:
- `npm run deploy:pages` - Build and deploy Pages
- `npm run deploy:worker` - Deploy Workers API
- `npm run deploy:assets` - Deploy Assets Worker

### Updates Not Showing Immediately After Deploy

If you've deployed both Worker and Pages but changes don't appear:

1. **Frontend (Pages)**: Push to `main` triggers GitHub Actions → Cloudflare Pages deploy. Wait for the workflow to finish (Actions tab on GitHub). Then do a **hard refresh** in the browser: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac).

2. **Backend (Worker)**: The Launches API (`/api/launches/drops`) is cached for 3 minutes. After deploying a new Worker, wait 3–5 minutes for the cache to expire, or hard refresh multiple times. The new response will then be cached.

3. **Browser cache**: If still seeing old content, try an incognito/private window or clear site data for blockchainvibe.news.

### Recommended Future Enhancements

1. **Cloudflare Images** (Optional):
   - Automatic image optimization
   - WebP/AVIF conversion
   - Responsive image delivery

2. **Cloudflare Analytics**:
   - Privacy-focused analytics (no cookies)
   - Real-time metrics
   - Can be added via dashboard

3. **Pages Functions** (If needed):
   - Edge-side API routes
   - Serverless functions at edge
   - Reduced latency for specific routes

4. **Performance Monitoring**:
   - Web Vitals tracking
   - Real User Monitoring (RUM)
   - Cloudflare Browser Insights

