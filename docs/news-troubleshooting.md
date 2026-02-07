# News feed: "Service temporarily unavailable"

The app shows this when the **worker** returns zero articles (RSS + APIs + CryptoCompare fallback all failed or timed out).

## Why it can still happen

1. **Worker not deployed**  
   The latest code (parallel fetch, CryptoCompare fallback with retry) must be deployed:
   ```bash
   cd server && npx wrangler deploy
   ```

2. **Wrong API URL**  
   The frontend uses `REACT_APP_API_URL_PROD` or `https://blockchainvibe-api.nico-chikuji.workers.dev`. If the app points at a different URL (e.g. old worker or localhost), that worker may not have the fallback.

3. **CryptoCompare unreachable from Workers**  
   The fallback calls `https://min-api.cryptocompare.com/data/v2/news/?lang=EN`. If that endpoint is down, blocks Cloudflare IPs, or times out, you get zero articles. The worker retries twice and uses a 15s timeout per attempt.

4. **Aggregator throws**  
   If the news-aggregator module throws (e.g. bad import or runtime error), the main fetch returns [] and the worker uses the CryptoCompare fallback. If the fallback also fails, the response is still zero articles.

## What the worker does now

- **Trending / Personalized:** Runs the main fetch (RSS + APIs) and the CryptoCompare fallback **in parallel**. Uses whichever returns articles; if both return something, prefers the main result.
- **Fallback:** Fetches CryptoCompare directly with 2 retries, 15s timeout per attempt, and robust parsing (`Data` or `data` array).
- **Normalizer:** All articles are normalized to a single shape so the frontend can always render them.

## Quick checks

- Open the worker URL in the browser (e.g. your Cloudflare Worker route). It should return JSON (e.g. "BlockchainVibe API" or a 404 for unknown paths).
- Deploy from the `server` directory and confirm the deploy log shows the latest worker.
- In Cloudflare dashboard → Workers → your worker → Logs, look for "CryptoCompare fallback" or errors to see if the fallback ran and why it might return [].
