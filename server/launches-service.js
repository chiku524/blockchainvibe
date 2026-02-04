// Launches & Drops Service for BlockchainVibe
// Aggregates airdrops (RSS), trending coins (CoinGecko), new tokens (DexScreener), NFT drops (CoinGecko)
//
// API keys (all optional):
// - CoinGecko: No key needed for free tier (~10-30 req/min). Set COINGECKO_API_KEY for Pro (higher limits).
// - DexScreener: No API key; rate limit 60 req/min per endpoint.
// - Airdrop Alert: RSS only, no key.

const AIRDROP_ALERT_RSS = 'https://airdropalert.com/feed/rssfeed';
const COINGECKO_BASE = 'https://api.coingecko.com/api/v3';
const COINGECKO_PRO_BASE = 'https://pro-api.coingecko.com/api/v3';
const DEXSCREENER_BASE = 'https://api.dexscreener.com';
const CACHE_TTL_MS = 8 * 60 * 1000; // 8 minutes

function extractXMLContent(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = xml.match(regex);
  if (!match) return '';
  return (match[1] || '').replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1').trim();
}

/** Parse RSS XML to array of items */
function parseRSSItems(xmlText) {
  const items = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];
  return items.map((item) => {
    const title = extractXMLContent(item, 'title');
    const link = extractXMLContent(item, 'link');
    const description = extractXMLContent(item, 'description');
    const pubDate = extractXMLContent(item, 'pubDate');
    const guid = extractXMLContent(item, 'guid');
    if (!title || !link) return null;
    return {
      id: guid || link,
      title,
      link,
      description: description ? description.replace(/<[^>]+>/g, '').slice(0, 300) : '',
      date: pubDate ? new Date(pubDate).toISOString() : null,
      source: 'Airdrop Alert',
      type: 'airdrop',
    };
  }).filter(Boolean);
}

export class LaunchesService {
  constructor() {
    this.cache = null;
    this.cacheTime = 0;
  }

  _coinGeckoHeaders(apiKey) {
    const headers = { Accept: 'application/json' };
    if (apiKey) headers['x-cg-pro-api-key'] = apiKey;
    return headers;
  }

  _coinGeckoBase(apiKey) {
    return apiKey ? COINGECKO_PRO_BASE : COINGECKO_BASE;
  }

  async fetchAirdrops(limit = 20) {
    try {
      const res = await fetch(AIRDROP_ALERT_RSS, {
        headers: { 'User-Agent': 'BlockchainVibe/1.0 (Launches)' },
        signal: AbortSignal.timeout(12000),
      });
      if (!res.ok) return [];
      const text = await res.text();
      const items = parseRSSItems(text);
      return items.slice(0, limit);
    } catch (e) {
      console.error('LaunchesService fetchAirdrops error:', e);
      return [];
    }
  }

  async fetchTrendingCoins(apiKey = null) {
    try {
      const base = this._coinGeckoBase(apiKey);
      const res = await fetch(`${base}/search/trending`, {
        headers: this._coinGeckoHeaders(apiKey),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return [];
      const data = await res.json();
      const coins = (data.coins || []).map((c) => {
        const item = c.item || c;
        return {
          id: item.id || item.coin_id,
          name: item.name,
          symbol: (item.symbol || '').toUpperCase(),
          rank: item.market_cap_rank,
          thumb: item.thumb || item.small,
          price_btc: item.price_btc,
          slug: item.slug,
          link: item.id ? `https://www.coingecko.com/en/coins/${item.id}` : null,
          type: 'trending_coin',
        };
      });
      return coins;
    } catch (e) {
      console.error('LaunchesService fetchTrendingCoins error:', e);
      return [];
    }
  }

  async fetchNewTokens() {
    try {
      const [profilesRes, boostsRes] = await Promise.all([
        fetch(`${DEXSCREENER_BASE}/token-profiles/latest/v1`, {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(8000),
        }),
        fetch(`${DEXSCREENER_BASE}/token-boosts/latest/v1`, {
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(8000),
        }),
      ]);

      const out = [];
      if (profilesRes.ok) {
        const profiles = await profilesRes.json();
        const p = Array.isArray(profiles) ? profiles : (profiles && profiles.data ? profiles.data : []);
        const single = profiles && !Array.isArray(profiles) && !profiles.data ? [profiles] : p;
        single.forEach((t) => {
          if (t && (t.tokenAddress || t.chainId)) {
            out.push({
              id: t.tokenAddress || t.url,
              chainId: t.chainId,
              tokenAddress: t.tokenAddress,
              title: t.header || t.description?.slice(0, 60) || 'New token',
              description: t.description || '',
              icon: t.icon,
              url: t.url,
              links: t.links || [],
              type: 'new_token',
              date: t.claimDate || new Date().toISOString(),
            });
          }
        });
      }
      if (boostsRes.ok) {
        const boosts = await boostsRes.json();
        const b = Array.isArray(boosts) ? boosts : (boosts && boosts.data ? boosts.data : []);
        const singleB = boosts && !Array.isArray(boosts) && !boosts.data ? [boosts] : b;
        singleB.forEach((t) => {
          if (t && (t.tokenAddress || t.url) && !out.find((x) => x.tokenAddress === t.tokenAddress)) {
            out.push({
              id: t.tokenAddress || t.url,
              chainId: t.chainId,
              tokenAddress: t.tokenAddress,
              title: t.header || t.description?.slice(0, 60) || 'Boosted token',
              description: t.description || '',
              icon: t.icon,
              url: t.url,
              links: t.links || [],
              type: 'new_token',
              date: new Date().toISOString(),
            });
          }
        });
      }
      return out.slice(0, 25);
    } catch (e) {
      console.error('LaunchesService fetchNewTokens error:', e);
      return [];
    }
  }

  async fetchTrendingNFTs(apiKey = null) {
    try {
      const base = this._coinGeckoBase(apiKey);
      const res = await fetch(`${base}/search/trending`, {
        headers: this._coinGeckoHeaders(apiKey),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) return [];
      const data = await res.json();
      const nfts = (data.nfts || []).map((n) => {
        const item = n.item || n;
        return {
          id: item.id || item.nft_id,
          name: item.name,
          symbol: item.symbol,
          thumb: item.thumb || item.small,
          floor_price_native: item.floor_price_native,
          floor_price_usd: item.floor_price_usd,
          link: item.id ? `https://www.coingecko.com/en/nft/${item.id}` : null,
          type: 'nft',
        };
      });
      return nfts;
    } catch (e) {
      console.error('LaunchesService fetchTrendingNFTs error:', e);
      return [];
    }
  }

  /** Build calendar events from airdrops (by date) and optional token dates */
  buildCalendarEvents(airdrops, newTokens) {
    const events = [];
    airdrops.forEach((a) => {
      if (a.date) {
        events.push({
          id: a.id,
          title: a.title,
          date: a.date.slice(0, 10),
          type: 'airdrop',
          link: a.link,
        });
      }
    });
    (newTokens || []).forEach((t) => {
      if (t.date) {
        const date = t.date.slice(0, 10);
        if (!events.some((e) => e.date === date && e.title === t.title)) {
          events.push({
            id: t.id || t.tokenAddress,
            title: t.title || 'New token',
            date,
            type: 'token',
            link: t.url,
          });
        }
      }
    });
    events.sort((a, b) => a.date.localeCompare(b.date));
    return events;
  }

  async getAll(env = {}) {
    const now = Date.now();
    if (this.cache && now - this.cacheTime < CACHE_TTL_MS) {
      return this.cache;
    }
    const coinGeckoKey = env.COINGECKO_API_KEY || null;
    const [airdrops, trendingCoins, newTokens, nftDrops] = await Promise.all([
      this.fetchAirdrops(25),
      this.fetchTrendingCoins(coinGeckoKey),
      this.fetchNewTokens(),
      this.fetchTrendingNFTs(coinGeckoKey),
    ]);
    const calendarEvents = this.buildCalendarEvents(airdrops, newTokens);
    this.cache = {
      airdrops,
      trendingCoins,
      newTokens,
      nftDrops,
      calendarEvents,
      updatedAt: new Date().toISOString(),
    };
    this.cacheTime = now;
    return this.cache;
  }
}

export const launchesService = new LaunchesService();
