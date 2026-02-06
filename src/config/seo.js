/**
 * Central SEO configuration and route → metadata mapping.
 * Used by PageMeta to inject accurate meta tags for every page.
 */

export const SEO_DEFAULTS = {
  siteName: 'BlockchainVibe',
  baseUrl: 'https://blockchainvibe.news',
  defaultImage: 'https://blockchainvibe.news/logo.png',
  twitterHandle: '@blockchainvibe',
  locale: 'en_US',
  themeColor: '#6366f1',
};

/**
 * Metadata per route. Key = pathname without leading slash (e.g. 'dashboard', 'for-you').
 * For dynamic segments use a pattern key and getMetadataForRoute handles matching.
 */
export const ROUTE_META = {
  // Public / landing
  '': {
    title: 'The Go-To Hub for Crypto & Blockchain',
    description: 'Your one-stop hub for all crypto and blockchain: aggregated news, airdrops and token launches, and AI-powered insights. News, drops, and launches in one place.',
    keywords: 'crypto hub, blockchain news, airdrops, token launches, crypto news aggregator, AI crypto',
    ogType: 'website',
  },
  // App routes
  dashboard: {
    title: 'Dashboard',
    description: 'Your hub for crypto news, airdrops, and launches. Personalized feed, trending topics, and AI digest.',
    keywords: 'crypto dashboard, blockchain news feed, airdrop reminders, my topics',
    url: '/dashboard',
  },
  trending: {
    title: 'Trending',
    description: 'Trending blockchain and crypto news. The most popular articles across the community.',
    keywords: 'trending crypto news, trending blockchain, popular crypto articles',
    url: '/trending',
  },
  'for-you': {
    title: 'For You',
    description: 'Personalized crypto and blockchain news based on your interests and reading history.',
    keywords: 'personalized crypto news, AI recommendations, tailored news feed',
    url: '/for-you',
  },
  news: {
    title: 'News Hub',
    description: 'All crypto and blockchain news in one place. Trending, personalized, and from trusted sources.',
    keywords: 'blockchain news, crypto news feed, cryptocurrency news',
    url: '/news',
  },
  launches: {
    title: 'Launches & Drops',
    description: 'Airdrops, new token launches, and NFT drops. One hub for all crypto launches. Explain any airdrop with AI.',
    keywords: 'crypto airdrops, token launches, NFT drops, new coin launch',
    url: '/launches',
  },
  airdrops: {
    title: 'Latest Crypto Airdrops',
    description: 'Discover the latest crypto airdrops and token distributions. Curated list updated regularly.',
    keywords: 'crypto airdrops, blockchain airdrops, token airdrop, free crypto',
    url: '/airdrops',
  },
  'new-token-launches': {
    title: 'New Token Launches',
    description: 'Discover new token and coin launches. Curated list updated regularly.',
    keywords: 'new token launch, new coin, crypto launch, token listing',
    url: '/new-token-launches',
  },
  calendar: {
    title: 'Crypto Calendar',
    description: 'Crypto and blockchain calendar: airdrops, launches, and events in one place.',
    keywords: 'crypto calendar, airdrop calendar, token launch dates',
    url: '/calendar',
  },
  alerts: {
    title: 'Alerts',
    description: 'Keyword alerts for crypto and blockchain news. Get notified when your topics appear.',
    keywords: 'crypto alerts, blockchain news alerts, keyword alerts',
    url: '/alerts',
  },
  search: {
    title: 'Search',
    description: 'Search blockchain and cryptocurrency news across the hub.',
    keywords: 'search crypto news, blockchain search',
    url: '/search',
  },
  'ai-insights': {
    title: 'AI Insights',
    description: 'Your AI digest and insights. Ask questions about your feed and get daily summaries.',
    keywords: 'AI crypto insights, blockchain AI, news digest',
    url: '/ai-insights',
  },
  analytics: {
    title: 'Analytics',
    description: 'Your reading insights and engagement with crypto news.',
    keywords: 'news analytics, reading insights, engagement metrics',
    url: '/analytics',
  },
  profile: {
    title: 'Profile',
    description: 'Your BlockchainVibe profile and account.',
    keywords: 'user profile, account',
    url: '/profile',
  },
  settings: {
    title: 'Settings',
    description: 'Customize your experience: preferences, notifications, and appearance.',
    keywords: 'settings, preferences, my topics',
    url: '/settings',
  },
  saved: {
    title: 'Saved Articles',
    description: 'Your saved blockchain and crypto articles.',
    keywords: 'saved articles, bookmarks',
    url: '/saved',
  },
  liked: {
    title: 'Liked Articles',
    description: 'Articles you liked across the news hub.',
    keywords: 'liked articles',
    url: '/liked',
  },
  signin: {
    title: 'Sign In',
    description: 'Sign in to BlockchainVibe to access your personalized hub.',
    keywords: 'sign in, login',
    url: '/signin',
    noIndex: true,
  },
  register: {
    title: 'Get Started',
    description: 'Create your BlockchainVibe account. Free to start.',
    keywords: 'register, sign up',
    url: '/register',
    noIndex: true,
  },
  'auth/callback': {
    title: 'Signing you in...',
    description: 'Completing sign in.',
    url: '/auth/callback',
    noIndex: true,
  },
  // Docs (pattern-matched in getMetadataForRoute)
  docs: {
    title: 'Documentation',
    description: 'BlockchainVibe documentation. API, guides, and help.',
    keywords: 'documentation, API, user guide',
    url: '/docs',
  },
  'docs/help-center': {
    title: 'Help Center',
    description: 'Get help with BlockchainVibe. FAQ and support.',
    keywords: 'help, support, FAQ',
    url: '/docs/help-center',
  },
  'docs/contact-us': {
    title: 'Contact Us',
    description: 'Contact the BlockchainVibe team.',
    keywords: 'contact, support',
    url: '/docs/contact-us',
  },
  'docs/bug-report': {
    title: 'Report a Bug',
    description: 'Report a bug or issue.',
    keywords: 'bug report',
    url: '/docs/bug-report',
  },
  'docs/api-reference': {
    title: 'API Reference',
    description: 'BlockchainVibe API reference for developers.',
    keywords: 'API reference, developer',
    url: '/docs/api-reference',
  },
  'docs/ai-integration': {
    title: 'AI Integration',
    description: 'Fetch.ai uAgents and SingularityNET MeTTa integration.',
    keywords: 'AI integration, uAgents, MeTTa',
    url: '/docs/ai-integration',
  },
  'docs/whitepaper': {
    title: 'Whitepaper',
    description: 'BlockchainVibe technical whitepaper.',
    keywords: 'whitepaper, technical',
    url: '/docs/whitepaper',
  },
  'docs/terms': {
    title: 'Terms of Service',
    description: 'Terms of service for BlockchainVibe.',
    keywords: 'terms of service',
    url: '/docs/terms',
  },
  'docs/privacy': {
    title: 'Privacy Policy',
    description: 'Privacy policy for BlockchainVibe.',
    keywords: 'privacy policy',
    url: '/docs/privacy',
  },
};

/** Normalize pathname to a key (no leading/trailing slash, lowercase) */
export function pathToKey(pathname) {
  if (!pathname || pathname === '/') return '';
  return pathname.replace(/^\/|\/$/g, '').toLowerCase();
}

/**
 * Get metadata for the current pathname. Used by PageMeta for route-based defaults.
 * Handles exact match and pattern match (e.g. /docs/help-center, /news/:id).
 */
export function getMetadataForRoute(pathname) {
  const key = pathToKey(pathname);
  if (!key) return ROUTE_META[''] || { title: SEO_DEFAULTS.siteName, description: '', url: '/' };

  // Exact match
  if (ROUTE_META[key]) return { ...ROUTE_META[key] };

  // Pattern match: /docs/*
  if (key.startsWith('docs/')) {
    if (ROUTE_META[key]) return { ...ROUTE_META[key] };
    return { ...ROUTE_META.docs, url: `/${key}` };
  }

  // Article detail: /news/:id
  if (key.startsWith('news/')) {
    return {
      title: 'Article',
      description: 'Read this article on BlockchainVibe.',
      url: `/${key}`,
      ogType: 'article',
    };
  }

  // Search with query is handled by page override (SearchResults passes title/description)
  if (key.startsWith('search')) return { ...ROUTE_META.search, url: '/search' };

  return ROUTE_META[''] || { title: SEO_DEFAULTS.siteName, description: '', url: '/' };
}
