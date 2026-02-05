// News Sources Configuration for BlockchainVibe
// This file defines RSS feeds and API endpoints for news aggregation

export const NEWS_SOURCES = {
  // RSS Feeds (Free and Legal - No API Keys Required)
  RSS_FEEDS: [
    // Tier 1: Major General News Sources (Highest Priority)
    {
      name: "CoinDesk",
      url: "https://www.coindesk.com/arc/outboundfeeds/rss/?outputType=xml",
      category: "general",
      priority: 1,
      enabled: true
    },
    {
      name: "CoinTelegraph",
      url: "https://cointelegraph.com/rss",
      category: "general", 
      priority: 1,
      enabled: true
    },
    {
      name: "Decrypt",
      url: "https://decrypt.co/feed",
      category: "general",
      priority: 1,
      enabled: true
    },
    {
      name: "The Block",
      url: "https://www.theblock.co/rss.xml",
      category: "general",
      priority: 1,
      enabled: true
    },
    {
      name: "CryptoSlate",
      url: "https://cryptoslate.com/feed/",
      category: "general",
      priority: 1,
      enabled: true
    },
    {
      name: "Blockworks",
      url: "https://blockworks.co/feed",
      category: "general",
      priority: 1,
      enabled: true
    },
    {
      name: "The Defiant",
      url: "https://thedefiant.io/feed",
      category: "defi",
      priority: 1,
      enabled: true
    },
    {
      name: "Messari",
      url: "https://messari.io/rss",
      category: "general",
      priority: 1,
      enabled: true
    },
    
    // Tier 2: Specialized and Regional Sources
    {
      name: "Bitcoin Magazine",
      url: "https://bitcoinmagazine.com/rss",
      category: "bitcoin",
      priority: 2,
      enabled: true
    },
    {
      name: "Ethereum Foundation",
      url: "https://blog.ethereum.org/feed.xml",
      category: "ethereum",
      priority: 2,
      enabled: true
    },
    {
      name: "BeInCrypto",
      url: "https://beincrypto.com/feed/",
      category: "general",
      priority: 2,
      enabled: true
    },
    {
      name: "UToday",
      url: "https://u.today/rss",
      category: "general",
      priority: 2,
      enabled: true
    },
    {
      name: "AMBCrypto",
      url: "https://ambcrypto.com/feed/",
      category: "general",
      priority: 2,
      enabled: true
    },
    {
      name: "CryptoPotato",
      url: "https://cryptopotato.com/feed/",
      category: "general",
      priority: 2,
      enabled: true
    },
    {
      name: "CoinJournal",
      url: "https://coinjournal.net/feed/",
      category: "general",
      priority: 2,
      enabled: true
    },
    {
      name: "Crypto Briefing",
      url: "https://cryptobriefing.com/feed/",
      category: "general",
      priority: 2,
      enabled: true
    },
    {
      name: "Crypto News",
      url: "https://cryptonews.com/feed/",
      category: "general",
      priority: 2,
      enabled: true
    },
    
    // Tier 3: Platform-Specific and Technical Sources
    {
      name: "Polkadot Blog",
      url: "https://polkadot.network/blog/feed/",
      category: "web3",
      priority: 3,
      enabled: true
    },
    {
      name: "Solana Foundation",
      url: "https://solana.com/news/rss.xml",
      category: "web3",
      priority: 3,
      enabled: true
    },
    {
      name: "Polygon Blog",
      url: "https://blog.polygon.technology/feed/",
      category: "layer2",
      priority: 3,
      enabled: true
    },
    {
      name: "Arbitrum Blog",
      url: "https://arbitrum.io/blog/feed/",
      category: "layer2",
      priority: 3,
      enabled: true
    },
    {
      name: "Optimism Blog",
      url: "https://optimism.io/feed",
      category: "layer2",
      priority: 3,
      enabled: true
    },
    {
      name: "Uniswap Blog",
      url: "https://uniswap.org/blog/feed.xml",
      category: "defi",
      priority: 3,
      enabled: true
    },
    {
      name: "Chainlink Blog",
      url: "https://blog.chain.link/feed/",
      category: "defi",
      priority: 3,
      enabled: true
    },
    
    // Tier 4: Additional Quality Sources
    {
      name: "CoinGape",
      url: "https://coingape.com/feed/",
      category: "general",
      priority: 4,
      enabled: true
    },
    {
      name: "NewsBTC",
      url: "https://www.newsbtc.com/feed/",
      category: "general",
      priority: 4,
      enabled: true
    },
    {
      name: "CryptoCompare",
      url: "https://www.cryptocompare.com/rss/news/",
      category: "general",
      priority: 4,
      enabled: true
    },
    {
      name: "Bitcoinist",
      url: "https://bitcoinist.com/feed/",
      category: "bitcoin",
      priority: 4,
      enabled: true
    },
    {
      name: "Ethereum World News",
      url: "https://ethereumworldnews.com/feed/",
      category: "ethereum",
      priority: 4,
      enabled: true
    },
    {
      name: "DeFi Pulse",
      url: "https://defipulse.com/blog/rss",
      category: "defi",
      priority: 4,
      enabled: true
    },
    {
      name: "Aave",
      url: "https://medium.com/feed/@aaveaave",
      category: "defi",
      priority: 3,
      enabled: true
    },
    {
      name: "Compound Finance",
      url: "https://medium.com/feed/compound-finance",
      category: "defi",
      priority: 3,
      enabled: true
    },
    {
      name: "MakerDAO",
      url: "https://blog.makerdao.com/feed/",
      category: "defi",
      priority: 3,
      enabled: true
    },
    {
      name: "Avalanche",
      url: "https://medium.com/feed/avalancheavax",
      category: "web3",
      priority: 3,
      enabled: true
    },
    {
      name: "Cosmos",
      url: "https://blog.cosmos.network/feed",
      category: "web3",
      priority: 3,
      enabled: true
    },
    {
      name: "Algorand",
      url: "https://www.algorand.com/blog/rss.xml",
      category: "web3",
      priority: 3,
      enabled: true
    },
    {
      name: "Near Protocol",
      url: "https://near.org/blog/feed/",
      category: "web3",
      priority: 3,
      enabled: true
    },
    {
      name: "Fantom",
      url: "https://fantom.foundation/blog/feed/",
      category: "web3",
      priority: 3,
      enabled: true
    },
    {
      name: "Crypto.com",
      url: "https://crypto.com/news/rss",
      category: "general",
      priority: 2,
      enabled: true
    },
    {
      name: "Binance Blog",
      url: "https://www.binance.com/en/blog/rss.xml",
      category: "general",
      priority: 2,
      enabled: true
    },
    {
      name: "Coinbase Blog",
      url: "https://blog.coinbase.com/feed",
      category: "general",
      priority: 2,
      enabled: true
    },
    {
      name: "Kraken Intelligence",
      url: "https://kraken.com/learn/feed",
      category: "general",
      priority: 2,
      enabled: true
    },
    {
      name: "Ledger Blog",
      url: "https://www.ledger.com/blog/feed",
      category: "general",
      priority: 3,
      enabled: true
    },
    {
      name: "OpenZeppelin",
      url: "https://blog.openzeppelin.com/feed/",
      category: "defi",
      priority: 3,
      enabled: true
    },
    {
      name: "Yearn Finance",
      url: "https://yearn.finance/news/feed",
      category: "defi",
      priority: 3,
      enabled: true
    },
    {
      name: "SushiSwap",
      url: "https://sushi.com/blog/feed",
      category: "defi",
      priority: 3,
      enabled: true
    },
    {
      name: "Curve Finance",
      url: "https://curve.fi/blog/rss.xml",
      category: "defi",
      priority: 3,
      enabled: true
    },
    {
      name: "1inch Network",
      url: "https://blog.1inch.io/feed/",
      category: "defi",
      priority: 3,
      enabled: true
    },
    {
      name: "dYdX",
      url: "https://dydx.exchange/blog/feed",
      category: "defi",
      priority: 3,
      enabled: true
    },
    {
      name: "Axie Infinity",
      url: "https://axie.substack.com/feed",
      category: "gaming",
      priority: 3,
      enabled: true
    },
    {
      name: "The Sandbox",
      url: "https://www.sandbox.game/blog/feed/",
      category: "gaming",
      priority: 3,
      enabled: true
    },
    {
      name: "Decentraland",
      url: "https://decentraland.org/blog/feed/",
      category: "gaming",
      priority: 3,
      enabled: true
    },
    {
      name: "CoinGecko",
      url: "https://www.coingecko.com/en/feed",
      category: "general",
      priority: 2,
      enabled: true
    },
    {
      name: "Zcash",
      url: "https://electriccoin.co/blog/feed/",
      category: "general",
      priority: 4,
      enabled: true
    },
    {
      name: "Monero",
      url: "https://getmonero.org/feed.xml",
      category: "general",
      priority: 4,
      enabled: true
    },
    {
      name: "Litecoin Foundation",
      url: "https://litecoin-foundation.org/feed/",
      category: "bitcoin",
      priority: 4,
      enabled: true
    },
    {
      name: "Stellar",
      url: "https://stellar.org/blog/feed",
      category: "web3",
      priority: 3,
      enabled: true
    },
    {
      name: "Ripple",
      url: "https://ripple.com/insights/feed/",
      category: "web3",
      priority: 3,
      enabled: true
    },
    {
      name: "Tezos",
      url: "https://tezos.com/feed/",
      category: "web3",
      priority: 3,
      enabled: true
    },
    {
      name: "Filecoin",
      url: "https://filecoin.io/blog/feed/",
      category: "web3",
      priority: 3,
      enabled: true
    },
    {
      name: "IPFS",
      url: "https://blog.ipfs.io/feed/",
      category: "web3",
      priority: 3,
      enabled: true
    },
    {
      name: "Hedera",
      url: "https://hedera.com/blog/feed",
      category: "web3",
      priority: 3,
      enabled: true
    },
    {
      name: "Internet Computer",
      url: "https://medium.com/feed/@dfinity",
      category: "web3",
      priority: 3,
      enabled: true
    },
    {
      name: "Celo",
      url: "https://celo.org/blog/feed",
      category: "web3",
      priority: 3,
      enabled: true
    },
    {
      name: "Terra",
      url: "https://terra.money/blog/feed",
      category: "defi",
      priority: 3,
      enabled: true
    },
    {
      name: "Harmony",
      url: "https://harmony.one/blog/feed",
      category: "web3",
      priority: 3,
      enabled: true
    },
    {
      name: "Cronos",
      url: "https://cronos.org/blog/feed",
      category: "web3",
      priority: 3,
      enabled: true
    },
    {
      name: "Gnosis Chain",
      url: "https://www.gnosis.io/blog/feed",
      category: "layer2",
      priority: 3,
      enabled: true
    },
    {
      name: "Immutable X",
      url: "https://www.immutable.com/blog/feed",
      category: "nft",
      priority: 3,
      enabled: true
    },
    {
      name: "OpenSea",
      url: "https://opensea.io/blog/rss.xml",
      category: "nft",
      priority: 2,
      enabled: true
    },
    {
      name: "Rarible",
      url: "https://rarible.com/blog/feed",
      category: "nft",
      priority: 3,
      enabled: true
    },
    {
      name: "SuperRare",
      url: "https://superrare.com/blog/feed",
      category: "nft",
      priority: 3,
      enabled: true
    },
    {
      name: "Foundation",
      url: "https://foundation.app/blog/feed",
      category: "nft",
      priority: 3,
      enabled: true
    },
    // Launches & Drops: Airdrops
    {
      name: "Airdrop Alert",
      url: "https://airdropalert.com/feed/rssfeed",
      category: "airdrop",
      priority: 2,
      enabled: true
    }
  ],

  // News APIs (Paid Services)
  NEWS_APIS: [
    {
      name: "NewsAPI",
      url: "https://newsapi.org/v2/everything",
      apiKey: null, // Injected at runtime from env.NEWSAPI_KEY (wrangler secret)
      enabled: true,
      rateLimit: 1000, // requests per day
      cost: "Free tier: 1000 requests/day",
      priority: 1
    },
    {
      name: "GNews",
      url: "https://gnews.io/api/v4/search",
      apiKey: null, // Set in wrangler.toml if needed
      enabled: false, // Enable when you have API key
      rateLimit: 100, // requests per day
      cost: "Free tier: 100 requests/day",
      priority: 2
    },
    {
      name: "CryptoPanic",
      url: "https://cryptopanic.com/api/v1/posts/",
      apiKey: null, // Set in wrangler.toml if needed
      enabled: false, // Enable when you have API key
      rateLimit: 1000, // requests per day
      cost: "Free tier: 1000 requests/day",
      priority: 1
    },
    {
      name: "CryptoCompare",
      url: "https://min-api.cryptocompare.com/data/v2/news/",
      apiKey: null, // Optional API key for higher rate limits
      enabled: true, // Free tier available
      rateLimit: 100000, // requests per month (free tier)
      cost: "Free tier: 100k requests/month",
      priority: 1
    },
    {
      name: "CoinMarketCap News",
      url: "https://pro-api.coinmarketcap.com/v1/cryptocurrency/news",
      apiKey: null, // Requires API key
      enabled: false,
      rateLimit: 10000, // requests per month
      cost: "Paid service",
      priority: 1
    },
    {
      name: "Messari API",
      url: "https://data.messari.io/api/v1/news",
      apiKey: null, // Requires API key
      enabled: false,
      rateLimit: 1000, // requests per day
      cost: "Paid service",
      priority: 1
    }
  ],

  // Reddit API (for community sentiment)
  REDDIT_SOURCES: [
    {
      name: "r/CryptoCurrency",
      subreddit: "CryptoCurrency",
      enabled: false, // Requires Reddit API setup
      priority: 2,
      url: "https://www.reddit.com/r/CryptoCurrency/hot.json"
    },
    {
      name: "r/ethereum", 
      subreddit: "ethereum",
      enabled: false,
      priority: 2,
      url: "https://www.reddit.com/r/ethereum/hot.json"
    },
    {
      name: "r/defi",
      subreddit: "defi", 
      enabled: false,
      priority: 3,
      url: "https://www.reddit.com/r/defi/hot.json"
    },
    {
      name: "r/bitcoin",
      subreddit: "bitcoin",
      enabled: false,
      priority: 2,
      url: "https://www.reddit.com/r/bitcoin/hot.json"
    },
    {
      name: "r/CryptoMarkets",
      subreddit: "CryptoMarkets",
      enabled: false,
      priority: 3,
      url: "https://www.reddit.com/r/CryptoMarkets/hot.json"
    },
    {
      name: "r/ethfinance",
      subreddit: "ethfinance",
      enabled: false,
      priority: 3,
      url: "https://www.reddit.com/r/ethfinance/hot.json"
    }
  ],
  
  // Additional premium RSS feeds
  PREMIUM_FEEDS: [
    {
      name: "Bloomberg Crypto",
      url: "https://www.bloomberg.com/feeds/crypto.rss",
      category: "general",
      priority: 1,
      enabled: true
    },
    {
      name: "Reuters Crypto",
      url: "https://www.reuters.com/rssFeed/cryptoCurrency",
      category: "general",
      priority: 1,
      enabled: true
    },
    {
      name: "Forbes Crypto",
      url: "https://www.forbes.com/crypto-blockchain/feed/",
      category: "general",
      priority: 1,
      enabled: true
    },
    {
      name: "ConsenSys",
      url: "https://consensys.net/blog/feed/",
      category: "ethereum",
      priority: 2,
      enabled: true
    },
    {
      name: "0x Labs",
      url: "https://0x.org/blog/feed",
      category: "defi",
      priority: 3,
      enabled: true
    },
    {
      name: "Balancer",
      url: "https://balancer.fi/blog/feed",
      category: "defi",
      priority: 3,
      enabled: true
    },
    {
      name: "Lido",
      url: "https://blog.lido.fi/feed/",
      category: "defi",
      priority: 3,
      enabled: true
    },
    {
      name: "Rocket Pool",
      url: "https://rocketpool.net/blog/feed",
      category: "defi",
      priority: 3,
      enabled: true
    },
    {
      name: "Frax Finance",
      url: "https://frax.finance/blog/feed",
      category: "defi",
      priority: 3,
      enabled: true
    },
    {
      name: "Convex Finance",
      url: "https://www.convexfinance.com/blog/feed",
      category: "defi",
      priority: 3,
      enabled: true
    }
  ]
};

// Categories for content classification
export const NEWS_CATEGORIES = {
  "general": "General Crypto News",
  "bitcoin": "Bitcoin",
  "ethereum": "Ethereum", 
  "defi": "DeFi",
  "nft": "NFTs",
  "airdrop": "Airdrops",
  "layer2": "Layer 2",
  "web3": "Web3",
  "gaming": "Gaming",
  "regulation": "Regulation",
  "trading": "Trading",
  "mining": "Mining",
  "solana": "Solana",
  "cardano": "Cardano",
  "polkadot": "Polkadot"
};

// Core terms required for NewsAPI articles (avoids off-topic from other industries)
export const BLOCKCHAIN_CORE_TERMS = [
  'bitcoin', 'btc', 'ethereum', 'eth', 'cryptocurrency', 'crypto ', 'crypto.', 'crypto,', 'blockchain',
  'defi', 'decentralized finance', 'nft', 'non-fungible', 'web3', 'altcoin', 'smart contract',
  'token sale', 'ico', 'ido', 'coinbase', 'binance', 'crypto exchange', 'wallet', 'mining',
  'sec ', 'sec.', 'crypto regulation', 'stablecoin', 'dao', 'dex', 'uniswap', 'layer 2',
  'arbitrum', 'optimism', 'polygon', 'solana', 'sol ', 'sol.', 'airdrop', 'token launch'
];

// Keywords for content filtering and categorization
export const CATEGORY_KEYWORDS = {
  "bitcoin": ["bitcoin", "btc", "satoshi", "lightning network", "bitcoin etf", "halving"],
  "ethereum": ["ethereum", "eth", "ethereum 2.0", "eth2", "beacon chain", "eth merge", "shanghai"],
  "defi": ["defi", "decentralized finance", "yield farming", "liquidity", "uniswap", "compound", "aave", "maker", "curve"],
  "nft": ["nft", "non-fungible token", "opensea", "art", "collectible", "nft marketplace"],
  "airdrop": ["airdrop", "airdrop campaign", "free tokens", "token distribution", "claim", "snapshot", "ido", "tge", "token generation event", "new listing", "token launch", "nft drop", "mint"],
  "layer2": ["layer 2", "polygon", "arbitrum", "optimism", "rollup", "l2", "zk-rollup", "sidechain"],
  "web3": ["web3", "metaverse", "dapp", "dapps", "blockchain app"],
  "gaming": ["gaming", "play-to-earn", "p2e", "axie", "sandbox", "web3 gaming", "gamefi"],
  "regulation": ["regulation", "sec", "cftc", "compliance", "legal", "regulatory", "sec approval"],
  "trading": ["trading", "exchange", "binance", "coinbase", "price", "market", "crypto exchange"],
  "mining": ["mining", "miner", "hashrate", "difficulty", "proof of work"],
  "solana": ["solana", "sol", "phantom", "solana ecosystem"],
  "cardano": ["cardano", "ada", "plutus", "alonzo"],
  "polkadot": ["polkadot", "dot", "parachain", "kusama"]
};
