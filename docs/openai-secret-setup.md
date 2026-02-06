# OpenAI API Key (Cloudflare Secret)

BlockchainVibe uses an optional **OpenAI API key** for:

- **Explain this airdrop** – LLM-generated summary, steps, and risks (otherwise a template is used).
- **Article summarization** – 2–3 sentence TL;DR on article pages (otherwise a short extract is used).

The key is **never** committed to the repo. It is set as a **Cloudflare Worker secret** so the API runs in production with LLM support when you choose.

## Set the secret

1. Open a terminal in the **server** directory:
   ```bash
   cd server
   ```

2. Run (you will be prompted to paste the key):
   ```bash
   npx wrangler secret put OPENAI_API_KEY
   ```

3. When prompted, paste your OpenAI API key and press Enter.

4. Redeploy the worker if needed:
   ```bash
   npx wrangler deploy
   ```

## Rotate the key

If the key was ever exposed (e.g. in chat or logs):

1. In [OpenAI API keys](https://platform.openai.com/api-keys), **revoke** the old key.
2. **Create** a new key.
3. Update the Cloudflare secret:
   ```bash
   cd server
   npx wrangler secret put OPENAI_API_KEY
   ```
   Paste the new key when prompted.

## Without the secret

If `OPENAI_API_KEY` is not set:

- **Explain airdrop** still works with a built-in template (summary, steps, risks).
- **Article summary** still works using the first part of the article text.

No errors are shown to users; the app simply uses the fallbacks.
