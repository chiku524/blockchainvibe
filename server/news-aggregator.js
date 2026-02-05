// News Aggregation Service for BlockchainVibe
// Handles RSS feeds, APIs, and content processing

import { NEWS_SOURCES, NEWS_CATEGORIES, CATEGORY_KEYWORDS, BLOCKCHAIN_CORE_TERMS } from './news-sources.js';
import { sourceHealthMonitor } from './services/source-health-monitor.js';
import { deduplicateArticles, quickDeduplicate } from './utils/deduplication.js';
import { enhancedRelevanceScorer } from './services/enhanced-relevance-scorer.js';
import { contentEnricher } from './services/content-enricher.js';

export class NewsAggregator {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.feedTimeout = 12000; // 12 seconds per RSS feed
    this.totalFetchTimeout = 30000; // 30 seconds total so more feeds can complete
  }

  // Timeout helper function
  async withTimeout(promise, timeoutMs, timeoutMessage) {
    return Promise.race([
      promise,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error(timeoutMessage || `Operation timed out after ${timeoutMs}ms`)), timeoutMs)
      )
    ]);
  }

  // Main method to fetch news from all sources
  async fetchNews(options = {}) {
    const {
      limit = 20,
      category = 'all',
      timeFilter = '24h',
      sortBy = 'relevance',
      userProfile = null
    } = options;

    const env = options.env || {};

    try {
      // Fetch from RSS feeds (primary source)
      const rssNews = await this.fetchFromRSSFeeds(limit * 2);
      
      // Fetch from APIs if enabled (API keys can come from options.env); pass sort/time for efficient trending
      const apiNews = await this.fetchFromAPIs(limit, env, { sortBy, timeFilter });
      
      // Combine and deduplicate using enhanced deduplication
      const allNews = deduplicateArticles([...rssNews, ...apiNews], 0.75);
      
      // Filter by category
      const filteredNews = category === 'all' 
        ? allNews 
        : allNews.filter(article => this.matchesCategory(article, category));
      
      // Filter by time
      let timeFilteredNews = this.filterByTime(filteredNews, timeFilter);
      if (timeFilteredNews.length === 0 && filteredNews.length > 0) {
        timeFilteredNews = filteredNews;
      }
      
      // Sort articles
      const sortedNews = this.sortArticles(timeFilteredNews, sortBy);
      if (sortedNews.length === 0) return [];

      let scoredNews;
      try {
        const enrichedNews = contentEnricher.enrichArticles(sortedNews);
        scoredNews = enrichedNews.map(article => ({
          ...article,
          relevance_score: enhancedRelevanceScorer.calculateRelevanceScore(article, userProfile)
        }));
      } catch (enrichError) {
        console.error('Enrichment error, returning articles without enrichment:', enrichError);
        scoredNews = sortedNews.map(article => ({
          ...article,
          relevance_score: article.relevance_score ?? 0.5
        }));
      }

      scoredNews.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));

      (async () => {
        try {
          const { webSocketService } = await import('./services/websocket-service.js');
          for (const article of scoredNews) {
            if (article.is_breaking) {
              webSocketService.broadcastBreakingNews(article);
            }
          }
        } catch (error) {
          // WebSocket not available, continue without broadcasting
        }
      })();

      return scoredNews.slice(0, limit);
      
    } catch (error) {
      console.error('News aggregation error:', error);
      return this.getFallbackNews(limit);
    }
  }

  // Fetch news from RSS feeds with health monitoring
  async fetchFromRSSFeeds(limit) {
    // Get all feeds including premium feeds
    const allFeeds = [...NEWS_SOURCES.RSS_FEEDS, ...(NEWS_SOURCES.PREMIUM_FEEDS || [])];
    
    // Filter by enabled status only (always use all enabled feeds to maximize article variety)
    const configEnabled = allFeeds.filter(feed => feed.enabled);
    const enabledFeeds = configEnabled;
    
    // Sort by priority (lower number = higher priority)
    const sortedFeeds = [...enabledFeeds].sort((a, b) => (a.priority || 4) - (b.priority || 4));
    
    // Limit to top priority feeds
    const feedLimit = 20;
    const priorityFeeds = sortedFeeds.slice(0, feedLimit);
    
    const newsPromises = priorityFeeds.map(async (feed) => {
      const startTime = Date.now();
      try {
        const articles = await this.withTimeout(
          this.parseRSSFeed(feed),
          this.feedTimeout,
          `RSS feed ${feed.name} timed out`
        );
        
        const responseTime = Date.now() - startTime;
        // Record success
        sourceHealthMonitor.recordSuccess(feed.name, responseTime, articles?.length || 0);
        
        // Add source priority to articles
        return articles.map(article => ({
          ...article,
          source_priority: feed.priority || 4
        }));
      } catch (error) {
        const responseTime = Date.now() - startTime;
        // Record failure
        sourceHealthMonitor.recordFailure(feed.name, error);
        return [];
      }
    });
    
    try {
      // Race total timeout against all feeds settling; on timeout, use whatever has settled so far
      const results = new Array(newsPromises.length);
      const settled = Promise.allSettled(newsPromises).then(settledResults => {
        settledResults.forEach((r, i) => { results[i] = r; });
      });
      const timeout = new Promise((resolve) => setTimeout(resolve, this.totalFetchTimeout));
      await Promise.race([settled, timeout]);

      const allArticles = results
        .filter(r => r && r.status === 'fulfilled')
        .flatMap(r => r.value)
        .filter(article => article && article.title);

      if (allArticles.length > 0 && results.some(r => r === undefined)) {
        console.log(`[NewsAggregator] Total timeout; using ${allArticles.length} articles from feeds that responded in time`);
      }
      return allArticles.slice(0, limit);
    } catch (error) {
      console.error('RSS feed parsing error:', error);
      return [];
    }
  }

  // Parse individual RSS feed
  async parseRSSFeed(feed) {
    try {
      console.log(`Fetching RSS feed: ${feed.name} from ${feed.url}`);
      
      // Create AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.feedTimeout);
      
      try {
        const response = await fetch(feed.url, {
          headers: {
            'User-Agent': 'BlockchainVibe/1.0 (News Aggregator)'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          console.error(`RSS feed ${feed.name} returned ${response.status}`);
          throw new Error(`RSS feed ${feed.name} returned ${response.status}`);
        }
        
        const xmlText = await response.text();
        console.log(`RSS feed ${feed.name} response length:`, xmlText.length);
        const articles = this.parseRSSXML(xmlText, feed);
        console.log(`RSS feed ${feed.name} parsed ${articles.length} articles`);
        return articles;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          console.warn(`RSS feed ${feed.name} timed out after ${this.feedTimeout}ms`);
          throw new Error(`RSS feed ${feed.name} timed out`);
        }
        throw fetchError;
      }
    } catch (error) {
      console.error(`Error parsing RSS feed ${feed.name}:`, error.message || error);
      return [];
    }
  }

  // Parse RSS XML content
  parseRSSXML(xmlText, feed) {
    try {
      console.log(`Parsing XML for ${feed.name}, length: ${xmlText.length}`);
      
      // Enhanced XML parsing for 2025 RSS feeds
      const items = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];
      console.log(`Found ${items.length} items in ${feed.name}`);
      
      if (items.length === 0) {
        console.log(`No items found in ${feed.name}, trying alternative parsing`);
        // Try alternative parsing for different RSS formats
        const altItems = xmlText.match(/<entry>[\s\S]*?<\/entry>/g) || [];
        console.log(`Found ${altItems.length} entries in ${feed.name}`);
        return this.parseAtomXML(xmlText, feed);
      }
      
      const articles = items.map((item, index) => {
        const title = this.extractXMLContent(item, 'title');
        const link = this.extractXMLContent(item, 'link');
        const description = this.extractXMLContent(item, 'description');
        const pubDate = this.extractXMLContent(item, 'pubDate');
        const guid = this.extractXMLContent(item, 'guid');
        const author = this.extractXMLContent(item, 'author') || 
                      this.extractXMLContent(item, 'dc:creator') || 
                      this.extractXMLContent(item, 'creator') || 
                      feed.name;
        
        console.log(`Item ${index}: title="${title}", link="${link}"`);
        
        if (!title || !link) {
          console.log(`Skipping item ${index} - missing title or link`);
          return null;
        }
        
        // Enhanced content extraction for 2025
        const content = this.extractXMLContent(item, 'content:encoded') || 
                       this.extractXMLContent(item, 'content') ||
                       this.extractXMLContent(item, 'description') || 
                       this.extractXMLContent(item, 'summary');
        
        // Extract categories from multiple possible tags
        const categories = this.extractCategories(item, feed.category);
        
        // Extract media/image URLs
        const imageUrl = this.extractImageFromDescription(description) || 
                        this.extractXMLContent(item, 'media:thumbnail') ||
                        this.extractXMLContent(item, 'enclosure');
        
        const article = {
          id: guid || `${feed.name}-${index}-${Date.now()}`,
          title: this.cleanText(title),
          url: link,
          source: feed.name,
          published_at: pubDate ? new Date(pubDate).toISOString() : new Date().toISOString(),
          summary: this.cleanText(description),
          content: this.cleanText(content),
          excerpt: this.cleanText(description),
          categories: categories,
          tags: this.extractTags(title + ' ' + description),
          image_url: imageUrl,
          author: author,
          relevance_score: 0.5, // Will be calculated later
          engagement_metrics: {
            likes: Math.floor(Math.random() * 100),
            views: Math.floor(Math.random() * 1000),
            comments: Math.floor(Math.random() * 50)
          },
          processing_timestamp: new Date().toISOString()
        };
        
        console.log(`Created article: ${article.title}`);
        return article;
      }).filter(Boolean);
      
      console.log(`Successfully parsed ${articles.length} articles from ${feed.name}`);
      return articles;
    } catch (error) {
      console.error(`Error parsing XML for ${feed.name}:`, error);
      return [];
    }
  }

  // Parse Atom XML format
  parseAtomXML(xmlText, feed) {
    try {
      const entries = xmlText.match(/<entry>[\s\S]*?<\/entry>/g) || [];
      console.log(`Found ${entries.length} Atom entries in ${feed.name}`);
      
      return entries.map((entry, index) => {
        const title = this.extractXMLContent(entry, 'title');
        const link = this.extractXMLContent(entry, 'link');
        const summary = this.extractXMLContent(entry, 'summary');
        const published = this.extractXMLContent(entry, 'published');
        const id = this.extractXMLContent(entry, 'id');
        const author = this.extractXMLContent(entry, 'author') || feed.name;
        
        if (!title || !link) return null;
        
        return {
          id: id || `${feed.name}-atom-${index}-${Date.now()}`,
          title: this.cleanText(title),
          url: link,
          source: feed.name,
          published_at: published ? new Date(published).toISOString() : new Date().toISOString(),
          summary: this.cleanText(summary),
          content: this.cleanText(summary),
          excerpt: this.cleanText(summary),
          categories: [feed.category],
          tags: this.extractTags(title + ' ' + summary),
          image_url: null,
          author: author,
          relevance_score: 0.5,
          engagement_metrics: {
            likes: Math.floor(Math.random() * 100),
            views: Math.floor(Math.random() * 1000),
            comments: Math.floor(Math.random() * 50)
          },
          processing_timestamp: new Date().toISOString()
        };
      }).filter(Boolean);
    } catch (error) {
      console.error(`Error parsing Atom XML for ${feed.name}:`, error);
      return [];
    }
  }

  // Fetch from news APIs (env provides runtime keys e.g. NEWSAPI_KEY; apiOptions = { sortBy, timeFilter })
  async fetchFromAPIs(limit, env = {}, apiOptions = {}) {
    const enabledAPIs = NEWS_SOURCES.NEWS_APIS
      .filter(api => {
        if (!api.enabled) return false;
        if (api.name === 'NewsAPI_ai' || api.name === 'NewsAPI_org') return !!(api.apiKey || env.NEWSAPI_KEY);
        return !!api.apiKey;
      })
      .map(api => ({
        ...api,
        apiKey: api.apiKey || ((api.name === 'NewsAPI_ai' || api.name === 'NewsAPI_org') ? env.NEWSAPI_KEY : null)
      }))
      .filter(api => api.apiKey);
    const newsPromises = enabledAPIs.map(api => this.fetchFromAPI(api, limit, apiOptions));
    
    try {
      const results = await Promise.allSettled(newsPromises);
      return results
        .filter(result => result.status === 'fulfilled')
        .flatMap(result => result.value)
        .filter(article => article && article.title);
    } catch (error) {
      console.error('API fetching error:', error);
      return [];
    }
  }

  // Fetch from NewsAPI.ai (Event Registry) - POST, blockchain/crypto, production-ready
  async fetchFromNewsAPIAi(api, limit, sortBy, timeFilter) {
    const articlesSortBy = (sortBy === 'engagement' || sortBy === 'trending') ? 'socialScore' : (sortBy === 'date' ? 'date' : 'rel');
    const dateStart = this.newsApiFromDate(timeFilter);
    const body = {
      resultType: 'articles',
      keyword: ['Bitcoin', 'Ethereum', 'cryptocurrency', 'blockchain', 'DeFi', 'NFT', 'web3'],
      keywordOper: 'or',
      lang: 'eng',
      articlesSortBy,
      articlesCount: Math.min(Math.max(limit, 10), 100),
      apiKey: api.apiKey
    };
    if (dateStart) body.dateStart = dateStart.slice(0, 10);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.feedTimeout);
    try {
      const response = await fetch(api.url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'User-Agent': 'BlockchainVibe/1.0' },
        body: JSON.stringify(body),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) throw new Error(`NewsAPI.ai returned ${response.status}`);
      const data = await response.json();
      const raw = data.articles?.results || [];
      const articles = this.transformNewsAPIAiData(raw, api);
      return articles.filter(a => this.isBlockchainRelevant(a));
    } catch (err) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') console.warn('[NewsAPI.ai] timed out');
      else console.error('[NewsAPI.ai]', err.message || err);
      return [];
    }
  }

  // Fetch from individual API (apiOptions = { sortBy, timeFilter } for trending + recency)
  async fetchFromAPI(api, limit, apiOptions = {}) {
    try {
      const { sortBy = 'relevance', timeFilter = '24h' } = apiOptions;

      if (api.name === 'NewsAPI_ai') {
        return await this.fetchFromNewsAPIAi(api, limit, sortBy, timeFilter);
      }

      let url = api.url;
      const params = new URLSearchParams();

      if (api.name === 'NewsAPI_org') {
        params.append('q', 'bitcoin OR ethereum OR cryptocurrency OR blockchain OR defi OR "web3" OR "crypto market"');
        params.append('language', 'en');
        const pageSize = Math.min(Math.max(limit, 10), 25);
        params.append('pageSize', pageSize);
        const newsApiSort = (sortBy === 'engagement' || sortBy === 'trending') ? 'popularity' : (sortBy === 'date' ? 'publishedAt' : 'relevancy');
        params.append('sortBy', newsApiSort);
        const fromDate = this.newsApiFromDate(timeFilter);
        if (fromDate) params.append('from', fromDate);
        params.append('apiKey', api.apiKey);
      } else if (api.name === 'GNews') {
        params.append('q', 'bitcoin OR ethereum OR cryptocurrency');
        params.append('lang', 'en');
        params.append('max', limit);
        params.append('apikey', api.apiKey);
      } else if (api.name === 'CryptoPanic') {
        params.append('auth_token', api.apiKey);
        params.append('public', 'true');
        params.append('filter', 'hot');
      }
      
      url += '?' + params.toString();
      
      // Add timeout to API calls
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.feedTimeout);
      
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'BlockchainVibe/1.0 (News Aggregator)'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`API ${api.name} returned ${response.status}`);
        }
        
        const data = await response.json();
        if (api.name === 'NewsAPI_org') {
          if (data.status !== 'ok') {
            console.warn('[NewsAPI.org]', data.code || 'error', data.message || '');
            return [];
          }
        }
        let articles = this.transformAPIData(data, api);
        if (api.name === 'NewsAPI_org') {
          articles = articles.filter(a => this.isBlockchainRelevant(a));
        }
        return articles;
      } catch (fetchError) {
        clearTimeout(timeoutId);
        if (fetchError.name === 'AbortError') {
          console.warn(`API ${api.name} timed out after ${this.feedTimeout}ms`);
          throw new Error(`API ${api.name} timed out`);
        }
        throw fetchError;
      }
    } catch (error) {
      console.error(`Error fetching from ${api.name}:`, error.message || error);
      return [];
    }
  }

  // Transform NewsAPI.ai (Event Registry) response to our format
  transformNewsAPIAiData(raw, api) {
    return raw.map((a, idx) => {
      const url = a.url || '';
      const authorName = Array.isArray(a.authors) && a.authors[0] ? a.authors[0].name : null;
      const text = ((a.title || '') + ' ' + (a.body || '')).trim();
      return {
        id: this.safeArticleId(url, 'NewsAPI_ai'),
        title: a.title || 'Untitled',
        url,
        source: a.source?.title || a.source?.uri || 'News',
        source_id: a.source?.uri || null,
        published_at: a.dateTimePub || a.dateTime || a.date || new Date().toISOString(),
        summary: (a.body || '').substring(0, 300),
        content: a.body || '',
        excerpt: (a.body || '').substring(0, 200),
        categories: this.categorizeContent(text),
        tags: this.extractTags(text),
        image_url: a.image || null,
        author: authorName,
        relevance_score: (a.relevance != null) ? Math.min(1, a.relevance) : 0.5,
        sentiment: a.sentiment,
        _source_api: 'NewsAPI_ai',
        engagement_metrics: {
          likes: 0,
          views: a.wgt || 0,
          comments: 0
        }
      };
    });
  }

  // Transform API data to our format
  transformAPIData(data, api) {
    let articles = [];
    
    if (api.name === 'NewsAPI_org') {
      articles = Array.isArray(data.articles) ? data.articles : [];
    } else if (api.name === 'GNews') {
      articles = data.articles || [];
    } else if (api.name === 'CryptoPanic') {
      articles = data.results || [];
    }
    
    return articles.map((article, idx) => {
      const url = article.url || article.link;
      const rawId = article.url || article.id || `${api.name}-${Date.now()}-${idx}`;
      const id = (api.name === 'NewsAPI_org' && url) ? this.safeArticleId(url, api.name) : rawId;
      return {
        id,
        title: article.title || article.headline,
        url,
        source: article.source?.name || article.source?.title || api.name,
        source_id: article.source?.id || null,
        published_at: article.publishedAt || article.created_at || new Date().toISOString(),
        summary: article.description || article.summary,
        content: article.content || article.description,
        excerpt: article.description || article.summary,
        categories: this.categorizeContent(article.title + ' ' + (article.description || '')),
        tags: this.extractTags(article.title + ' ' + (article.description || '')),
        image_url: article.urlToImage || article.image,
        author: article.author || null,
        relevance_score: 0.5,
        _source_api: api.name,
        engagement_metrics: {
          likes: Math.floor(Math.random() * 100),
          views: Math.floor(Math.random() * 1000),
          comments: Math.floor(Math.random() * 50)
        }
      };
    });
  }

  // URL-safe article id for routing and AI tracking (detail page, analytics)
  safeArticleId(url, source) {
    if (!url || typeof url !== 'string') return `${source}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    try {
      const hash = url.split('').reduce((a, c) => ((a << 5) - a + c.charCodeAt(0)) | 0, 0);
      return `${source}-${Math.abs(hash).toString(36)}`;
    } catch {
      return `${source}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    }
  }

  // Deduplicate news articles
  deduplicateNews(articles) {
    const seen = new Set();
    return articles.filter(article => {
      const key = article.title.toLowerCase().trim();
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  // Filter by category
  matchesCategory(article, category) {
    if (category === 'all') return true;
    
    const articleText = (article.title + ' ' + article.summary).toLowerCase();
    const keywords = CATEGORY_KEYWORDS[category] || [];
    
    return keywords.some(keyword => articleText.includes(keyword.toLowerCase()));
  }

  // NewsAPI from-date for recency (ISO 8601); use 7d default so we get enough articles
  newsApiFromDate(timeFilter) {
    const now = Date.now();
    const ms = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      'today': 24 * 60 * 60 * 1000,
      'week': 7 * 24 * 60 * 60 * 1000,
      'month': 30 * 24 * 60 * 60 * 1000
    };
    const span = ms[timeFilter] || ms['7d'];
    return new Date(now - span).toISOString().slice(0, 19) + 'Z';
  }

  // Keep only articles that clearly pertain to blockchain/crypto (avoids other industries)
  isBlockchainRelevant(article) {
    const text = ((article.title || '') + ' ' + (article.summary || '') + ' ' + (article.content || '')).toLowerCase();
    return BLOCKCHAIN_CORE_TERMS.some(term => text.includes(term.toLowerCase()));
  }

  // Filter by time
  filterByTime(articles, timeFilter) {
    // Handle 'all' or empty timeFilter - return all articles
    if (!timeFilter || timeFilter === 'all') {
      return articles;
    }
    
    const now = new Date();
    const timeMap = {
      '1h': 60 * 60 * 1000,
      '24h': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      // Also handle alternative formats
      'today': 24 * 60 * 60 * 1000,
      'week': 7 * 24 * 60 * 60 * 1000,
      'month': 30 * 24 * 60 * 60 * 1000
    };
    
    const timeLimit = timeMap[timeFilter];
    if (!timeLimit) return articles;
    
    return articles.filter(article => {
      if (!article.published_at) return false;
      const articleDate = new Date(article.published_at);
      if (isNaN(articleDate.getTime())) return false;
      return (now - articleDate) <= timeLimit;
    });
  }

  // Sort articles
  sortArticles(articles, sortBy) {
    switch (sortBy) {
      case 'relevance':
        return articles.sort((a, b) => (b.relevance_score || 0) - (a.relevance_score || 0));
      case 'date':
        return articles.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
      case 'engagement':
        return articles.sort((a, b) => {
          const aEngagement = (a.engagement_metrics?.likes || 0) + (a.engagement_metrics?.views || 0);
          const bEngagement = (b.engagement_metrics?.likes || 0) + (b.engagement_metrics?.views || 0);
          return bEngagement - aEngagement;
        });
      default:
        return articles;
    }
  }

  // Calculate relevance scores based on user profile
  async calculateRelevanceScores(articles, userProfile) {
    const userInterests = userProfile.interests || userProfile.preferences?.topics || userProfile.topics || [];
    const readingHistory = userProfile.reading_history || [];
    
    return articles.map(article => {
      let relevance = article.relevance_score || 0.5;
      const articleText = (article.title + ' ' + article.summary).toLowerCase();
      
      // Boost relevance based on user interests
      userInterests.forEach(interest => {
        if (articleText.includes(interest.toLowerCase())) {
          relevance += 0.2;
        }
      });
      
      // Boost relevance based on reading history
      readingHistory.forEach(history => {
        if (articleText.includes(history.toLowerCase())) {
          relevance += 0.1;
        }
      });
      
      // Boost relevance for preferred sources
      if (userProfile.preferred_sources?.includes(article.source)) {
        relevance += 0.15;
      }
      
      return {
        ...article,
        relevance_score: Math.min(relevance, 1.0)
      };
    });
  }

  // Categorize content based on keywords
  categorizeContent(text) {
    const categories = [];
    const lowerText = text.toLowerCase();
    
    Object.entries(CATEGORY_KEYWORDS).forEach(([category, keywords]) => {
      if (keywords.some(keyword => lowerText.includes(keyword))) {
        categories.push(category);
      }
    });
    
    return categories.length > 0 ? categories : ['general'];
  }

  // Extract tags from content
  extractTags(text) {
    const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by'];
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.includes(word))
      .slice(0, 5);
    
    return [...new Set(words)];
  }

  // Utility methods
  extractXMLContent(xml, tag) {
    // Try multiple patterns for different XML structures
    const patterns = [
      new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'),
      new RegExp(`<${tag}>([\\s\\S]*?)<\\/${tag}>`, 'i'),
      new RegExp(`<${tag}[^>]*\\/>`, 'i') // Self-closing tags
    ];
    
    for (const pattern of patterns) {
      const match = xml.match(pattern);
      if (match) {
        return match[1] ? match[1].trim() : '';
      }
    }
    
    return '';
  }

  cleanText(text) {
    return text
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&[^;]+;/g, ' ') // Remove HTML entities
      .replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1') // Remove CDATA wrappers
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  extractImageFromDescription(description) {
    const imgRegex = /<img[^>]+src="([^"]+)"/i;
    const match = description.match(imgRegex);
    return match ? match[1] : null;
  }

  // Extract categories from RSS item
  extractCategories(item, defaultCategory) {
    const categories = [];
    
    // Try different category tags
    const categoryTags = ['category', 'dc:subject', 'subject'];
    
    categoryTags.forEach(tag => {
      const categoryContent = this.extractXMLContent(item, tag);
      if (categoryContent) {
        // Split by common separators
        const cats = categoryContent.split(/[,;|]/).map(cat => cat.trim()).filter(Boolean);
        categories.push(...cats);
      }
    });
    
    // If no categories found, use default
    if (categories.length === 0) {
      categories.push(defaultCategory);
    }
    
    return [...new Set(categories)]; // Remove duplicates
  }

  // No dummy data when all sources fail; return empty so caller can show maintenance message
  getFallbackNews(_limit) {
    return [];
  }
}
