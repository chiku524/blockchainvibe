# News API Keys (Cloudflare Secrets)

BlockchainVibe can use **NewsAPI.ai** (Event Registry) and **NewsAPI.org** for more and richer news articles. Keys are stored as **Cloudflare Worker secrets** and are never committed to the repo.

- **NewsAPI.ai** – `NEWSAPI_KEY` – 150k+ sources, full content, sentiment; production-ready.
- **NewsAPI.org** – `NEWS_API_KEY` – Set this for NewsAPI.org (paid plan required for production domains like blockchainvibe.news).

CryptoCompare is always used (no key). When these secrets are set, the worker will also fetch from the corresponding APIs and merge results.

## Set the secrets

1. Open a terminal in the **server** directory:
   ```bash
   cd server
   ```

2. Set **NewsAPI.ai** key (you will be prompted to paste it):
   ```bash
   npx wrangler secret put NEWSAPI_KEY
   ```
   Paste your NewsAPI.ai API key when prompted, then press Enter.

3. Set **NewsAPI.org** key:
   ```bash
   npx wrangler secret put NEWS_API_KEY
   ```
   Paste your NewsAPI.org API key when prompted, then press Enter.

4. Redeploy the worker so the new secrets are used:
   ```bash
   npx wrangler deploy
   ```

## Verify

After deployment, open the News Hub (e.g. https://blockchainvibe.news/news). You should see articles from CryptoCompare, and when the keys are set, from NewsAPI.ai and NewsAPI.org as well. If NewsAPI.org returns errors on a production domain, ensure your plan allows the domain (developer plan is localhost-only).

## Rotate keys

If a key is ever exposed:

1. Revoke or regenerate the key in the provider’s dashboard (NewsAPI.ai / NewsAPI.org).
2. Update the Cloudflare secret:
   ```bash
   cd server
   npx wrangler secret put NEWSAPI_KEY    # or NEWS_API_KEY
   ```
   Paste the new key when prompted.
3. Redeploy: `npx wrangler deploy`.
