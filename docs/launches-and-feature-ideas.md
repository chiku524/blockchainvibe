# Launches & Drops + Feature Ideas for BlockchainVibe

Ideas to attract new users: a dedicated **Launches & Drops** section (airdrops, NFT drops, new token launches) plus other news-related innovations. Last updated: February 2025.

---

## 1. Launches & Drops Section (Implemented)

A single section aggregates **airdrops**, **NFT drops**, and **new token/coin launches**. Implemented backend: `GET /api/launches/drops`; frontend: `/launches` with tabs Airdrops | New tokens | NFT drops.

### 1.1 Data Sources (Free & Low-Cost)

| Type | Source | Format | Notes |
|------|--------|--------|--------|
| **Airdrops** | [Airdrop Alert RSS](https://airdropalert.com/rss-feed/) | RSS | Free. |
| **New coins / Trending** | [CoinGecko API (free)](https://www.coingecko.com/api/documentations/v3) | REST | `GET /search/trending`, `GET /coins/markets`. |
| **New token pairs** | [DexScreener API](https://docs.dexscreener.com/api/reference) | REST | `GET /token-profiles/latest/v1`, `GET /token-boosts/latest/v1`. Rate limits: 60–300 req/min. |
| **NFT collections** | [CoinGecko NFTs (beta)](https://www.coingecko.com/api/documentations/v3) | REST | `GET /nfts/list`, `GET /nfts/{id}`. |

### 1.2 API Keys (Optional)

No API keys required. Optional: set `COINGECKO_API_KEY` in Worker env for CoinGecko Pro (higher limits). DexScreener and Airdrop Alert work without keys; responses are cached to respect rate limits.

---

## 2. More Innovative Ideas to Attract Users

### 2.1 “Claim & Earn” / Airdrop eligibility

- Integrate **Drops.bot** (or similar) for wallet connection and “Eligible airdrops” / “Claimable” amounts. Combines news + eligibility in one app.

### 2.2 New listings & trending alerts

- “New on CoinGecko” / “Trending now” widget; optional email/push digest.

### 2.3 NFT floor & trending collections

- CoinGecko NFTs for trending collections (floor, volume) in a widget or NFT tab.

### 2.4 “Crypto calendar”

- Calendar view: product launches, TGEs, airdrop snapshots, mainnet upgrades, conferences. Data: RSS + optional event APIs.

### 2.5 Community sentiment + news

- Enable Reddit sources and add “Community buzz” block (e.g. r/CryptoCurrency, r/ethereum).

### 2.6 “Explain this airdrop” with AI

- Per airdrop/token: short AI summary, steps to qualify, risks. Reuse existing AI/agents.

### 2.7 Launches in “For You”

- Boost airdrop/new-listing items in For You for users who read launch content or visit Launches often.

### 2.8 SEO and landing pages

- Dedicated landing pages: “Latest crypto airdrops”, “New token launches” with structured data from the Worker.

---

## 3. Summary

| Idea | Attraction | Effort | Data source |
|------|------------|--------|-------------|
| Launches & Drops (implemented) | High | Done | Airdrop Alert RSS, CoinGecko, DexScreener, CoinGecko NFTs |
| “Explain this airdrop” (AI) | High | Low | Existing agents + Launches data |
| Trending / New listings widget | Medium | Low | CoinGecko free |
| Crypto calendar | Medium | Medium | RSS + optional event APIs |
| Community buzz (Reddit) | Medium | Low | Existing Reddit in news-sources |
| Airdrop eligibility (wallet) | High | High | Drops.bot (contact) |
| SEO landing pages | High | Low | Same Launches API |
