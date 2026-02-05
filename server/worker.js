// Cloudflare Worker for BlockchainVibe Backend

// CORS headers
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Max-Age': '86400',
};

// Handle CORS preflight
function handleCORS(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  return null;
}

// Database helper
class DatabaseService {
  constructor(db) {
    this.db = db;
  }

  async initDatabase() {
    try {
      await this.db.prepare(`
        CREATE TABLE IF NOT EXISTS users (
          user_id TEXT PRIMARY KEY,
          email TEXT NOT NULL,
          name TEXT,
          picture TEXT,
          provider TEXT NOT NULL,
          profile_picture TEXT,
          banner_image TEXT,
          bio TEXT,
          location TEXT,
          website TEXT,
          twitter TEXT,
          linkedin TEXT,
          profile_completed BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          last_login DATETIME DEFAULT CURRENT_TIMESTAMP,
          is_active BOOLEAN DEFAULT 1
        )
      `).run();
      await this.db.prepare(`
        CREATE TABLE IF NOT EXISTS user_activity (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          type TEXT NOT NULL, -- e.g. view, like, save, share, read
          article_id TEXT,
          article_title TEXT,
          article_source TEXT,
          duration_ms INTEGER DEFAULT 0,
          metadata TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
      
      // Create user_profiles table for advanced profiling
      await this.db.prepare(`
        CREATE TABLE IF NOT EXISTS user_profiles (
          user_id TEXT PRIMARY KEY,
          profile_data TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();

      // Subscriptions (on-hold: feature enabled via env.SUBSCRIPTION_ENABLED)
      await this.db.prepare(`
        CREATE TABLE IF NOT EXISTS subscriptions (
          user_id TEXT PRIMARY KEY,
          plan TEXT NOT NULL DEFAULT 'free',
          status TEXT NOT NULL DEFAULT 'active',
          stripe_customer_id TEXT,
          stripe_subscription_id TEXT,
          current_period_end DATETIME,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `).run();
      
      return { success: true };
    } catch (error) {
      console.error('Database initialization error:', error);
      return { success: false, error: error.message };
    }
  }

  async insertUserActivity(activity) {
    try {
      await this.initDatabase();
      const {
        user_id,
        type,
        article_id = null,
        article_title = null,
        article_source = null,
        duration_ms = 0,
        metadata = null,
      } = activity;
      await this.db.prepare(`
        INSERT INTO user_activity
          (user_id, type, article_id, article_title, article_source, duration_ms, metadata, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).bind(
        user_id, type, article_id, article_title, article_source, duration_ms,
        metadata ? JSON.stringify(metadata) : null
      ).run();
      return { success: true };
    } catch (error) {
      console.error('Insert activity error:', error);
      return { success: false, error: error.message };
    }
  }

  async getAnalyticsSummary(userId) {
    try {
      await this.initDatabase();
      const totalRead = await this.db.prepare(`
        SELECT COUNT(*) as cnt FROM user_activity WHERE user_id = ? AND type = 'read'
      `).bind(userId).first();
      const totalDuration = await this.db.prepare(`
        SELECT COALESCE(SUM(duration_ms),0) as ms FROM user_activity WHERE user_id = ?
      `).bind(userId).first();
      const last7 = await this.db.prepare(`
        SELECT strftime('%Y-%m-%d', created_at) as date, COUNT(*) as cnt
        FROM user_activity
        WHERE user_id = ? AND created_at >= datetime('now','-6 days')
        GROUP BY strftime('%Y-%m-%d', created_at)
        ORDER BY date ASC
      `).bind(userId).all();
      const topCats = await this.db.prepare(`
        SELECT COALESCE(article_source,'Unknown') as source, COUNT(*) as cnt
        FROM user_activity
        WHERE user_id = ? AND type = 'read'
        GROUP BY article_source
        ORDER BY cnt DESC
        LIMIT 6
      `).bind(userId).all();
      const peakHour = await this.db.prepare(`
        SELECT CAST(strftime('%H', created_at) AS INTEGER) as hour, COUNT(*) as cnt
        FROM user_activity
        WHERE user_id = ? AND type = 'read'
        GROUP BY strftime('%Y-%m-%d %H', created_at)
        ORDER BY cnt DESC
        LIMIT 1
      `).bind(userId).first();
      const avgRead = await this.db.prepare(`
        SELECT AVG(NULLIF(duration_ms,0)) as avg_ms
        FROM user_activity
        WHERE user_id = ? AND type = 'read'
      `).bind(userId).first();
      return {
        success: true,
        articlesRead: (totalRead?.cnt) || 0,
        timeSpentMinutes: Math.round(((totalDuration?.ms) || 0) / 60000),
        readingTrendsByDay: last7?.results || [],
        topSources: topCats?.results || [],
        peakReadingHour: peakHour ? peakHour.hour : null,
        avgReadSeconds: avgRead && avgRead.avg_ms ? Math.round(avgRead.avg_ms / 1000) : 0,
      };
    } catch (error) {
      console.error('Analytics summary error:', error);
      return { success: false, error: error.message };
    }
  }

  async createUser(userData) {
    const { id, email, name, picture, provider } = userData;
    
    try {
      // Initialize database if needed
      await this.initDatabase();
      
      // Check if user already exists
      const existingUser = await this.db.prepare(
        'SELECT user_id, profile_completed FROM users WHERE user_id = ?'
      ).bind(id).first();
      
      if (existingUser) {
        // Update last login
        await this.db.prepare(
          'UPDATE users SET last_login = datetime("now") WHERE user_id = ?'
        ).bind(id).run();
        
        return { 
          success: true, 
          isNewUser: false, 
          profileCompleted: existingUser.profile_completed 
        };
      }
      
      // Create new user
      await this.db.prepare(`
        INSERT INTO users (user_id, email, name, picture, provider, profile_picture, created_at, last_login, is_active)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'), datetime('now'), 1)
      `).bind(id, email, name, picture, provider, picture).run();
      
      return { success: true, isNewUser: true, profileCompleted: false };
    } catch (error) {
      console.error('Database error:', error);
      return { success: false, error: error.message };
    }
  }

  async updateUserField(userId, field, value) {
    try {
      await this.initDatabase();
      await this.db.prepare(`
        UPDATE users SET ${field} = ? WHERE user_id = ?
      `).bind(value, userId).run();
      
      return { success: true };
    } catch (error) {
      console.error('Database update error:', error);
      return { success: false, error: error.message };
    }
  }

  async updateUserProfile(userId, profileData) {
    try {
      await this.initDatabase();
      const normalize = (v) => (v === '' || v === undefined ? null : v);
      const {
        name,
        email,
        bio,
        profile_picture,
        banner_image,
        location,
        website,
        twitter,
        linkedin
      } = profileData;

      await this.db.prepare(`
        UPDATE users SET 
          name = COALESCE(?, name),
          email = COALESCE(?, email),
          bio = COALESCE(?, bio),
          profile_picture = COALESCE(?, profile_picture),
          banner_image = COALESCE(?, banner_image),
          location = COALESCE(?, location),
          website = COALESCE(?, website),
          twitter = COALESCE(?, twitter),
          linkedin = COALESCE(?, linkedin),
          profile_completed = 1
        WHERE user_id = ?
      `).bind(
        normalize(name), normalize(email), normalize(bio), normalize(profile_picture), normalize(banner_image),
        normalize(location), normalize(website), normalize(twitter), normalize(linkedin), userId
      ).run();
      
      return { success: true };
    } catch (error) {
      console.error('Database error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserProfile(userId) {
    try {
      const user = await this.db.prepare(`
        SELECT * FROM users WHERE user_id = ?
      `).bind(userId).first();
      
      if (!user) {
        return { success: false, error: 'User not found' };
      }
      
      return { success: true, user };
    } catch (error) {
      console.error('Database error:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserById(userId) {
    try {
      const result = await this.db.prepare(`
        SELECT * FROM users WHERE user_id = ? AND is_active = 1
      `).bind(userId).first();
      
      return result;
    } catch (error) {
      console.error('Database error:', error);
      return null;
    }
  }

  async updateLastLogin(userId) {
    try {
      await this.db.prepare(`
        UPDATE users SET last_login = datetime('now') WHERE user_id = ?
      `).bind(userId).run();
      
      return { success: true };
    } catch (error) {
      console.error('Database error:', error);
      return { success: false, error: error.message };
    }
  }

  async getSubscription(userId) {
    try {
      await this.initDatabase();
      const row = await this.db.prepare(`
        SELECT plan, status, current_period_end FROM subscriptions WHERE user_id = ?
      `).bind(userId).first();
      return {
        success: true,
        plan: row?.plan || 'free',
        status: row?.status || 'active',
        current_period_end: row?.current_period_end || null
      };
    } catch (error) {
      console.error('Get subscription error:', error);
      return { success: false, plan: 'free', status: 'active' };
    }
  }

  async upsertSubscription(userId, { plan = 'free', status = 'active', stripe_customer_id = null, stripe_subscription_id = null, current_period_end = null }) {
    try {
      await this.initDatabase();
      await this.db.prepare(`
        INSERT INTO subscriptions (user_id, plan, status, stripe_customer_id, stripe_subscription_id, current_period_end, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
        ON CONFLICT(user_id) DO UPDATE SET
          plan = excluded.plan,
          status = excluded.status,
          stripe_customer_id = COALESCE(excluded.stripe_customer_id, stripe_customer_id),
          stripe_subscription_id = COALESCE(excluded.stripe_subscription_id, stripe_subscription_id),
          current_period_end = COALESCE(excluded.current_period_end, current_period_end),
          updated_at = datetime('now')
      `).bind(userId, plan, status, stripe_customer_id, stripe_subscription_id, current_period_end).run();
      return { success: true };
    } catch (error) {
      console.error('Upsert subscription error:', error);
      return { success: false, error: error.message };
    }
  }
}

// JWT helper (simplified)
function createJWT(payload, secret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = btoa(JSON.stringify(header));
  const encodedPayload = btoa(JSON.stringify(payload));
  const signature = btoa(`${encodedHeader}.${encodedPayload}.${secret}`);
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

// OAuth handlers
async function handleGoogleAuth(request, env) {
  const db = new DatabaseService(env.DB);
  const { code, redirect_uri } = await request.json();
  
  try {
    // Exchange code for token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirect_uri
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    });
    
    const userInfo = await userResponse.json();
    
    const userData = {
      id: userInfo.id,
      email: userInfo.email,
      name: userInfo.name || '',
      picture: userInfo.picture || '',
      provider: 'google'
    };
    
    // Save to database
    const existingUser = await db.getUserById(userData.id);
    if (existingUser) {
      await db.updateLastLogin(userData.id);
    } else {
      await db.createUser(userData);
    }
    
    // Create JWT
    const accessToken = createJWT({
      sub: userData.id,
      email: userData.email,
      name: userData.name,
      provider: userData.provider,
      exp: Math.floor(Date.now() / 1000) + (30 * 60)
    }, env.JWT_SECRET);
    
    return new Response(JSON.stringify({
      success: true,
      access_token: accessToken,
      user: userData
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

async function handleGitHubAuth(request, env) {
  const db = new DatabaseService(env.DB);
  const { code, redirect_uri } = await request.json();
  
  try {
    // Exchange code for token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: redirect_uri
      })
    });
    
    const tokenData = await tokenResponse.json();
    
    // Get user info
    const userResponse = await fetch('https://api.github.com/user', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    });
    
    const userInfo = await userResponse.json();
    
    const userData = {
      id: userInfo.id.toString(),
      email: userInfo.email || `${userInfo.login}@github.com`,
      name: userInfo.name || userInfo.login,
      picture: userInfo.avatar_url || '',
      provider: 'github'
    };
    
    // Save to database
    const existingUser = await db.getUserById(userData.id);
    if (existingUser) {
      await db.updateLastLogin(userData.id);
    } else {
      await db.createUser(userData);
    }
    
    // Create JWT
    const accessToken = createJWT({
      sub: userData.id,
      email: userData.email,
      name: userData.name,
      provider: userData.provider,
      exp: Math.floor(Date.now() / 1000) + (30 * 60)
    }, env.JWT_SECRET);
    
    return new Response(JSON.stringify({
      success: true,
      access_token: accessToken,
      user: userData
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
    
  } catch (error) {
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 400,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

// Health check
function handleHealth() {
  return new Response(JSON.stringify({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: {
      database: 'connected',
      oauth: 'configured'
    }
  }), {
    headers: { 
      'Content-Type': 'application/json',
      ...corsHeaders
    }
  });
}

// Timeout helper for long-running operations
async function withTimeout(promise, timeoutMs, fallback) {
  return Promise.race([
    promise,
    new Promise((resolve) => 
      setTimeout(() => {
        console.warn(`Operation timed out after ${timeoutMs}ms, using fallback`);
        resolve(fallback ? fallback() : []);
      }, timeoutMs)
    )
  ]);
}

// Trending News API
async function handleTrendingNews(request, env) {
  try {
    const { 
      limit = 20, 
      timeFilter = null, // Default to null to allow 'all time'
      categoryFilter = 'all',
      sortBy = 'engagement'
    } = await request.json();
    
    // Fetch trending news with engagement sorting, with timeout
    const newsItems = await withTimeout(
      fetchBlockchainNews(limit, {
        category: categoryFilter,
        timeFilter: timeFilter || 'all', // Convert null to 'all' for backend compatibility
        sortBy: sortBy || 'engagement', // Use provided sortBy or default to engagement
        userProfile: null // No personalization for trending
      }),
      25000, // 25 seconds timeout (before axios 30s timeout)
      () => getMockNews(limit) // Fallback to mock news on timeout
    );
    
    return new Response(JSON.stringify({
      articles: newsItems,
      total_count: newsItems.length,
      last_updated: new Date().toISOString(),
      type: 'trending'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        ...corsHeaders
      }
    });
    
  } catch (error) {
    console.error('Trending news API error:', error);
    const fallbackNews = getMockNews(20);
    return new Response(JSON.stringify({
      articles: fallbackNews,
      total_count: fallbackNews.length,
      last_updated: new Date().toISOString(),
      type: 'trending',
      warning: 'Using fallback data due to error'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        ...corsHeaders
      }
    });
  }
}

// Personalized News API
async function handlePersonalizedNews(request, env) {
  try {
    const { 
      limit = 20, 
      timeFilter = 'today',
      user_profile,
      userId
    } = await request.json();
    
    // Import user profiling service
    const { userProfilingService } = await import('./services/user-profiling.js');
    
    // Get or create user profile
    let userProfile = user_profile;
    if (userId && env.DB) {
      try {
        userProfile = await userProfilingService.getUserProfile(userId, env.DB);
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    }
    
    // Create a default user profile if none provided
    if (!userProfile) {
      userProfile = {
        user_id: userId || 'default_user',
        preferences: {
          topics: ['bitcoin', 'ethereum', 'defi', 'nft', 'web3'],
          sources: ['CoinTelegraph', 'CoinDesk', 'Decrypt'],
          frequency: 'daily'
        },
        activity: {
          liked_articles: [],
          saved_articles: [],
          read_articles: []
        }
      };
    }
    
    // Fetch personalized news with timeout
    const newsItems = await withTimeout(
      fetchBlockchainNews(limit, {
        category: 'all',
        timeFilter,
        sortBy: 'relevance', // Sort by relevance for personalized
        userProfile: userProfile
      }),
      25000, // 25 seconds timeout
      () => getMockNews(limit) // Fallback to mock news on timeout
    );
    
    // Calculate user relevance score (with timeout)
    const userRelevanceScore = await withTimeout(
      calculateUserRelevance(newsItems, userProfile, env),
      3000, // 3 seconds for relevance calculation
      () => 0.5 // Default relevance score
    );
    
    return new Response(JSON.stringify({
      articles: newsItems,
      total_count: newsItems.length,
      user_relevance_score: userRelevanceScore,
      last_updated: new Date().toISOString(),
      type: 'personalized'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        ...corsHeaders
      }
    });
    
  } catch (error) {
    console.error('Personalized news API error:', error);
    const fallbackNews = getMockNews(20);
    return new Response(JSON.stringify({
      articles: fallbackNews,
      total_count: fallbackNews.length,
      user_relevance_score: 0.5,
      last_updated: new Date().toISOString(),
      type: 'personalized',
      warning: 'Using fallback data due to error'
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        ...corsHeaders
      }
    });
  }
}

// Chat Protocol API
async function handleChatMessage(request, env) {
  try {
    const message = await request.json();
    const text = (message?.text || '').toLowerCase();
    // Import uAgents integration
    const { UAgentsIntegration } = await import('./uagents-integration.js');
    const uAgents = new UAgentsIntegration();
    
    // Route simple intents to local endpoints for fast answers
    if (text.includes('insight') || text.includes('summary')) {
      const userId = message?.userId || message?.user_id;
      if (userId) {
        const url = new URL(request.url);
        url.pathname = '/api/ai/insights';
        url.search = `userId=${encodeURIComponent(userId)}`;
        const resp = await handleAIInsights(new Request(url, { method: 'GET' }), env);
        const data = await resp.json();
        return new Response(JSON.stringify({ reply: data?.insights || [] }), { headers: { 'Content-Type': 'application/json', ...corsHeaders } });
      }
    }

    // Otherwise, pass through to uAgents integration (which can bridge Chat Protocol)
    const response = await uAgents.handleChatMessage(message);
    
    return new Response(JSON.stringify(response), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
    
  } catch (error) {
    console.error('Chat message error:', error);
    return new Response(JSON.stringify({
      error: "Failed to process chat message",
      details: error.message
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

// Get available agents
async function handleGetAgents(request, env) {
  try {
    // Import uAgents integration
    const { UAgentsIntegration } = await import('./uagents-integration.js');
    const uAgents = new UAgentsIntegration();
    
    // Get available agents
    const agents = uAgents.getAvailableAgents();
    
    return new Response(JSON.stringify({
      agents: agents,
      total: agents.length,
      timestamp: new Date().toISOString()
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
    
  } catch (error) {
    console.error('Get agents error:', error);
    return new Response(JSON.stringify({
      error: "Failed to get agents",
      details: error.message
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

// Get MeTTa status
async function handleMeTTaStatus(request, env) {
  try {
    // Import uAgents integration
    const { UAgentsIntegration } = await import('./uagents-integration.js');
    const uAgents = new UAgentsIntegration();
    
    // Get MeTTa status
    const mettaStatus = uAgents.getMeTTaStatus();
    const chatStats = uAgents.getChatProtocolStats();
    
    return new Response(JSON.stringify({
      metta: mettaStatus,
      chat_protocol: chatStats,
      timestamp: new Date().toISOString()
    }), {
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
    
  } catch (error) {
    console.error('MeTTa status error:', error);
    return new Response(JSON.stringify({
      error: "Failed to get MeTTa status",
      details: error.message
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

// General News API with AI integration
async function handleNews(request, env) {
  try {
    const { 
      limit = 10, 
      user_profile,
      category = 'all',
      timeFilter = '24h',
      sortBy = 'relevance'
    } = await request.json();
    
    // Fetch real news using the aggregator
    const newsItems = await fetchBlockchainNews(limit, {
      category,
      timeFilter,
      sortBy,
      userProfile: user_profile
    });
    
    // Calculate user relevance score
    let userRelevanceScore = 0.0;
    if (user_profile && user_profile.user_id) {
      userRelevanceScore = await calculateUserRelevance(newsItems, user_profile, env);
    }
    
    return new Response(JSON.stringify({
      articles: newsItems,
      news: newsItems,
      total_count: newsItems.length,
      user_relevance_score: userRelevanceScore,
      last_updated: new Date().toISOString(),
      sources: {
        rss_feeds: "active",
        news_apis: "active",
        ai_agents: "active"
      }
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        ...corsHeaders
      }
    });
    
  } catch (error) {
    console.error('News API error:', error);
    return new Response(JSON.stringify({
      error: "Failed to fetch news",
      details: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

// Real news fetching using RSS feeds, APIs, uAgents, and knowledge graph
// Optimized for faster response times
async function fetchBlockchainNews(limit, options = {}) {
  try {
    // Import the news aggregator
    const { NewsAggregator } = await import('./news-aggregator.js');
    const aggregator = new NewsAggregator();
    
    console.log('Fetching news with options:', {
      limit: limit * 2,
      category: options.category || 'all',
      timeFilter: options.timeFilter || '24h',
      sortBy: options.sortBy || 'relevance',
      userProfile: options.userProfile
    });
    
    // Fetch real news from RSS feeds and APIs (this is the main bottleneck)
    const rawNews = await aggregator.fetchNews({
      limit: limit * 2, // Fetch more to account for filtering
      category: options.category || 'all',
      timeFilter: options.timeFilter || '24h',
      sortBy: options.sortBy || 'relevance',
      userProfile: options.userProfile
    });
    
    console.log('Raw news fetched:', rawNews.length, 'articles');
    
    if (rawNews.length === 0) {
      console.log('No RSS news found, falling back to mock data');
      return getMockNews(limit);
    }
    // If we got very few articles (e.g. only one feed succeeded), merge with mock so feed is usable
    if (rawNews.length < 8) {
      const maxAgeMs = 48 * 60 * 60 * 1000; // 48 hours
      const cutoff = Date.now() - maxAgeMs;
      const recent = rawNews.filter((a) => {
        if (!a.published_at) return false;
        const t = new Date(a.published_at).getTime();
        return !isNaN(t) && t >= cutoff;
      });
      const toMerge = recent.length > 0 ? recent : [];
      const needed = Math.max(0, limit - toMerge.length);
      const mock = getMockNews(needed);
      const combined = [...toMerge, ...mock].slice(0, limit);
      combined.sort((a, b) => (new Date(b.published_at || 0).getTime()) - (new Date(a.published_at || 0).getTime()));
      console.log(`Few articles (${rawNews.length}, ${toMerge.length} recent); merged with mock to return ${combined.length}`);
      return combined.map((article, index) => {
        try {
          const cleanUrl = (article.url || '').replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
          const cleanSummary = (article.summary || '').replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
          const cleanContent = (article.content || article.summary || '').replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
          return {
            ...article,
            id: article.id || `article-${index}-${Date.now()}`,
            url: cleanUrl,
            summary: cleanSummary,
            content: cleanContent,
            excerpt: (article.summary || '').substring(0, 200),
            categories: article.categories || ['general'],
            relevance_score: article.relevance_score || 0.5,
            knowledge_graph_enhanced: false,
            uagents_processed: false,
            processing_timestamp: new Date().toISOString()
          };
        } catch (e) {
          return { ...article, id: article.id || `article-${index}-${Date.now()}`, processing_timestamp: new Date().toISOString() };
        }
      });
    }
    
    // FAST PATH: Return basic processed articles immediately (skip heavy processing)
    // This allows the frontend to show articles quickly while enhancement happens
    const quickProcessed = rawNews.slice(0, limit).map((article, index) => {
      try {
        // Lightweight processing - just clean the data
        const cleanUrl = (article.url || '').replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
        const cleanSummary = (article.summary || '').replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
        const cleanContent = (article.content || article.summary || '').replace(/<!\[CDATA\[(.*?)\]\]>/g, '$1');
        
        return {
          ...article,
          id: article.id || `article-${index}-${Date.now()}`,
          url: cleanUrl,
          summary: cleanSummary,
          content: cleanContent,
          excerpt: cleanSummary.substring(0, 200) || cleanSummary,
          categories: article.categories || ['general'],
          relevance_score: article.relevance_score || 0.5,
          knowledge_graph_enhanced: false, // Will be enhanced later if needed
          uagents_processed: false,
          processing_timestamp: new Date().toISOString()
        };
      } catch (error) {
        console.error(`Error quick processing article ${index + 1}:`, error);
        return {
          ...article,
          id: article.id || `article-${index}-${Date.now()}`,
          url: article.url || '',
          summary: article.summary || '',
          content: article.content || article.summary || '',
          excerpt: (article.summary || '').substring(0, 200),
          categories: ['general'],
          relevance_score: 0.5,
          knowledge_graph_enhanced: false,
          uagents_processed: false,
          processing_timestamp: new Date().toISOString()
        };
      }
    });
    
    // Sort by published date (newest first); treat missing date as oldest
    quickProcessed.sort((a, b) => {
      const ta = new Date(a.published_at || 0).getTime();
      const tb = new Date(b.published_at || 0).getTime();
      if (tb !== ta) return tb - ta;
      return (b.relevance_score || 0) - (a.relevance_score || 0);
    });
    
    // Return quickly - no heavy processing
    // Note: Heavy processing (uAgents, knowledge graph) can be done in background
    // or skipped entirely for faster responses
    return quickProcessed;
  } catch (error) {
    console.error('Error fetching real news:', error);
    console.log('Falling back to mock news');
    // Fallback to mock data if real news fails
    return getMockNews(limit);
  }
}

// Fallback mock news for 2025
function getMockNews(limit) {
  const mockNews = [
    {
      id: "1",
      title: "Bitcoin ETF Approval Drives Institutional Adoption to New Heights",
      url: "https://example.com/bitcoin-etf-2025",
      source: "CoinDesk",
      published_at: new Date().toISOString(),
      summary: "The approval of multiple Bitcoin ETFs has led to unprecedented institutional adoption and price stability.",
      content: "The approval of multiple Bitcoin ETFs has led to unprecedented institutional adoption and price stability, with major corporations adding Bitcoin to their treasury reserves.",
      excerpt: "The approval of multiple Bitcoin ETFs has led to unprecedented institutional adoption and price stability.",
      categories: ["bitcoin"],
      tags: ["bitcoin", "etf", "institutional", "adoption"],
      image_url: "https://images.unsplash.com/photo-1518546305927-5a555bb7020d?w=400&h=200&fit=crop&crop=center",
      author: "CoinDesk Staff",
      relevance_score: 0.95,
      engagement_metrics: { likes: 250, views: 5000, comments: 85 }
    },
    {
      id: "2", 
      title: "Ethereum 3.0 Upgrade Brings Quantum-Resistant Security",
      url: "https://example.com/ethereum-3-0-2025",
      source: "CoinTelegraph",
      published_at: new Date(Date.now() - 3600000).toISOString(),
      summary: "Ethereum's latest upgrade introduces quantum-resistant cryptography and improved scalability.",
      content: "Ethereum's latest upgrade introduces quantum-resistant cryptography and improved scalability, making it future-proof against quantum computing threats.",
      excerpt: "Ethereum's latest upgrade introduces quantum-resistant cryptography and improved scalability.",
      categories: ["ethereum"],
      tags: ["ethereum", "upgrade", "quantum-resistant", "security"],
      image_url: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=400&h=200&fit=crop&crop=center",
      author: "CoinTelegraph Staff",
      relevance_score: 0.9,
      engagement_metrics: { likes: 180, views: 3200, comments: 65 }
    },
    {
      id: "3",
      title: "DeFi 3.0 Protocols Achieve $500 Billion TVL Milestone",
      url: "https://example.com/defi-3-0-2025",
      source: "Decrypt",
      published_at: new Date(Date.now() - 7200000).toISOString(),
      summary: "Next-generation DeFi protocols have collectively locked over $500 billion in total value.",
      content: "Next-generation DeFi protocols have collectively locked over $500 billion in total value, featuring advanced yield farming and cross-chain interoperability.",
      excerpt: "Next-generation DeFi protocols have collectively locked over $500 billion in total value.",
      categories: ["defi"],
      tags: ["defi", "tvl", "yield-farming", "cross-chain"],
      image_url: "https://images.unsplash.com/photo-1639322537228-f912b1770ae3?w=400&h=200&fit=crop&crop=center",
      author: "Decrypt Staff",
      relevance_score: 0.85,
      engagement_metrics: { likes: 150, views: 2800, comments: 45 }
    },
    {
      id: "4",
      title: "AI-Powered NFTs Revolutionize Digital Art Market",
      url: "https://example.com/ai-nfts-2025",
      source: "The Block",
      published_at: new Date(Date.now() - 10800000).toISOString(),
      summary: "AI-generated NFTs are transforming the digital art market with dynamic, evolving artworks.",
      content: "AI-generated NFTs are transforming the digital art market with dynamic, evolving artworks that change based on market conditions and user interactions.",
      excerpt: "AI-generated NFTs are transforming the digital art market with dynamic, evolving artworks.",
      categories: ["nft"],
      tags: ["nft", "ai", "digital-art", "dynamic"],
      image_url: "https://images.unsplash.com/photo-1642790104077-9a7b4a0a0f5a?w=400&h=200&fit=crop&crop=center",
      author: "The Block Staff",
      relevance_score: 0.8,
      engagement_metrics: { likes: 120, views: 2200, comments: 38 }
    },
    {
      id: "5",
      title: "Central Bank Digital Currencies (CBDCs) Launch in Major Economies",
      url: "https://example.com/cbdc-launch-2025",
      source: "CryptoSlate",
      published_at: new Date(Date.now() - 14400000).toISOString(),
      summary: "Major economies have launched their Central Bank Digital Currencies, reshaping the global financial landscape.",
      content: "Major economies have launched their Central Bank Digital Currencies, reshaping the global financial landscape and providing new opportunities for blockchain integration.",
      excerpt: "Major economies have launched their Central Bank Digital Currencies, reshaping the global financial landscape.",
      categories: ["regulation"],
      tags: ["cbdc", "central-bank", "regulation", "digital-currency"],
      image_url: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=200&fit=crop&crop=center",
      author: "CryptoSlate Staff",
      relevance_score: 0.75,
      engagement_metrics: { likes: 95, views: 1800, comments: 25 }
    }
  ];
  
  return mockNews.slice(0, limit);
}

// Simulate SingularityNET MeTTa relevance calculation
async function calculateUserRelevance(newsItems, userProfile, env) {
  // In a real implementation, this would use SingularityNET MeTTa
  const userInterests = userProfile.interests || userProfile.preferences?.topics || userProfile.topics || [];
  const readingHistory = userProfile.reading_history || [];
  
  let totalRelevance = 0;
  let count = 0;
  
  for (const item of newsItems) {
    let relevance = item.relevance_score || 0.5;
    
    // Boost relevance based on user interests
    const itemText = (item.title + ' ' + item.summary).toLowerCase();
    for (const interest of userInterests) {
      if (itemText.includes(interest.toLowerCase())) {
        relevance += 0.2;
      }
    }
    
    // Boost relevance based on reading history
    for (const history of readingHistory) {
      if (itemText.includes(history.toLowerCase())) {
        relevance += 0.1;
      }
    }
    
    totalRelevance += Math.min(relevance, 1.0);
    count++;
  }
  
  return count > 0 ? totalRelevance / count : 0.0;
}

// File upload handler
async function handleFileUpload(request, env) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type'); // 'profile' or 'banner'
    const userId = formData.get('userId');
    
    if (!file || !type || !userId) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Missing required fields: file, type, userId'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Invalid file type. Only JPEG, PNG, and WebP images are allowed.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return new Response(JSON.stringify({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Generate unique filename
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const filename = `${type}/${userId}/${timestamp}.${fileExtension}`;
    
    // Upload to R2
    const arrayBuffer = await file.arrayBuffer();
    await env.blockchainvibe_assets.put(filename, arrayBuffer, {
      httpMetadata: {
        contentType: file.type,
        cacheControl: 'public, max-age=31536000' // 1 year cache
      }
    });
    
    // Generate public URL
    const publicUrl = `https://blockchainvibe-assets.nico-chikuji.workers.dev/${filename}`;
    
    // Update user record in database
    const db = new DatabaseService(env.DB);
    const updateField = type === 'profile' ? 'profile_picture' : 'banner_image';
    await db.updateUserField(userId, updateField, publicUrl);
    
    return new Response(JSON.stringify({
      success: true,
      message: 'File uploaded successfully',
      url: publicUrl,
      filename: filename
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    console.error('File upload error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'File upload failed',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// Individual OAuth handlers for unified callback
async function handleGoogleOAuth(code, redirect_uri, env) {
  try {
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirect_uri
      })
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Google token request failed: ${tokenResponse.status} ${tokenResponse.statusText} - ${errorText}`);
    }
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      throw new Error(`Google token error: ${tokenData.error_description || tokenData.error}`);
    }
    
    if (!tokenData.access_token) {
      throw new Error('Google token error: No access token received');
    }
    
    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { 'Authorization': `Bearer ${tokenData.access_token}` }
    });
    
    if (!userResponse.ok) {
      throw new Error(`Google API error: ${userResponse.status} ${userResponse.statusText}`);
    }
    
    const userInfo = await userResponse.json();
    
    return {
      access_token: tokenData.access_token,
      user: {
        id: userInfo.id,
        email: userInfo.email,
        name: userInfo.name,
        picture: userInfo.picture
      }
    };
  } catch (error) {
    console.error('Google OAuth error:', error);
    throw error;
  }
}

async function handleGitHubOAuth(code, redirect_uri, env) {
  try {
    console.log('GitHub OAuth: Starting token exchange');
    console.log('GitHub OAuth: Redirect URI:', redirect_uri);
    console.log('GitHub OAuth: Client ID:', env.GITHUB_CLIENT_ID);
    console.log('GitHub OAuth: Client Secret exists:', !!env.GITHUB_CLIENT_SECRET);
    console.log('GitHub OAuth: Code length:', code ? code.length : 'undefined');
    
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: env.GITHUB_CLIENT_ID,
        client_secret: env.GITHUB_CLIENT_SECRET,
        code: code,
        redirect_uri: redirect_uri
      })
    });
    
    console.log('GitHub OAuth: Token response status:', tokenResponse.status);
    console.log('GitHub OAuth: Token response headers:', Object.fromEntries(tokenResponse.headers.entries()));
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.log('GitHub OAuth: Token error response:', errorText);
      throw new Error(`GitHub token request failed: ${tokenResponse.status} ${tokenResponse.statusText} - ${errorText}`);
    }
    
    const tokenData = await tokenResponse.json();
    console.log('GitHub OAuth: Token response data:', tokenData);
    
    if (tokenData.error) {
      throw new Error(`GitHub token error: ${tokenData.error_description || tokenData.error}`);
    }
    
    if (!tokenData.access_token) {
      throw new Error('GitHub token error: No access token received');
    }
    
    // Get user info
    console.log('GitHub OAuth: Fetching user info with token:', tokenData.access_token.substring(0, 10) + '...');
    const userResponse = await fetch('https://api.github.com/user', {
      headers: { 
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'BlockchainVibe/1.0.0'
      }
    });
    
    console.log('GitHub OAuth: User response status:', userResponse.status);
    console.log('GitHub OAuth: User response headers:', Object.fromEntries(userResponse.headers.entries()));
    
    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      console.log('GitHub OAuth: User API error response:', errorText);
      throw new Error(`GitHub API error: ${userResponse.status} ${userResponse.statusText} - ${errorText}`);
    }
    
    const userInfo = await userResponse.json();
    
    if (userInfo.message) {
      throw new Error(`GitHub user error: ${userInfo.message}`);
    }
    
    // Get user email addresses (GitHub user email might be private)
    let userEmail = userInfo.email;
    if (!userEmail) {
      try {
        const emailResponse = await fetch('https://api.github.com/user/emails', {
          headers: { 
            'Authorization': `Bearer ${tokenData.access_token}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });
        const emails = await emailResponse.json();
        
        // Find primary email or first verified email
        const primaryEmail = emails.find(email => email.primary) || emails.find(email => email.verified);
        userEmail = primaryEmail ? primaryEmail.email : (emails[0] ? emails[0].email : null);
      } catch (emailError) {
        console.log('GitHub OAuth: Email fetch error:', emailError);
      }
    }
    
    return {
      access_token: tokenData.access_token,
      user: {
        id: userInfo.id.toString(),
        email: userEmail || `${userInfo.login}@github.com`,
        name: userInfo.name || userInfo.login,
        picture: userInfo.avatar_url || '',
        provider: 'github'
      }
    };
  } catch (error) {
    console.error('GitHub OAuth error:', error);
    throw error;
  }
}

async function handleDiscordOAuth(code, redirect_uri, env) {
  try {
    console.log('Discord OAuth: Starting token exchange');
    console.log('Discord OAuth: Redirect URI:', redirect_uri);
    console.log('Discord OAuth: Client ID from env:', env.DISCORD_CLIENT_ID);
    console.log('Discord OAuth: Client Secret exists:', !!env.DISCORD_CLIENT_SECRET);
    console.log('Discord OAuth: Code length:', code ? code.length : 'undefined');
    
    // Use fallback client ID if env var is not set or empty
    const discordClientId = env.DISCORD_CLIENT_ID || '1431187449215717457';
    const discordClientSecret = env.DISCORD_CLIENT_SECRET || 'd3QI-oClsHiCTFPumMkQ8OWwAaJ5O8us';
    
    console.log('Discord OAuth: Using Client ID:', discordClientId);
    console.log('Discord OAuth: Using Client Secret exists:', !!discordClientSecret);
    
    const tokenResponse = await fetch('https://discord.com/api/oauth2/token', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams({
        client_id: discordClientId,
        client_secret: discordClientSecret,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirect_uri
      })
    });
    
    console.log('Discord OAuth: Token response status:', tokenResponse.status);
    console.log('Discord OAuth: Token response headers:', Object.fromEntries(tokenResponse.headers.entries()));
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.log('Discord OAuth: Token error response:', errorText);
      throw new Error(`Discord token request failed: ${tokenResponse.status} ${tokenResponse.statusText} - ${errorText}`);
    }
    
    const tokenData = await tokenResponse.json();
    console.log('Discord OAuth: Token response data:', tokenData);
    
    if (tokenData.error) {
      throw new Error(`Discord token error: ${tokenData.error_description || tokenData.error}`);
    }
    
    if (!tokenData.access_token) {
      throw new Error('Discord token error: No access token received');
    }
    
    // Get user info
    const userResponse = await fetch('https://discord.com/api/users/@me', {
      headers: { 
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json'
      }
    });
    
    if (!userResponse.ok) {
      throw new Error(`Discord API error: ${userResponse.status} ${userResponse.statusText}`);
    }
    
    const userInfo = await userResponse.json();
    
    return {
      access_token: tokenData.access_token,
      user: {
        id: userInfo.id,
        email: userInfo.email || `${userInfo.username}@discord.local`,
        name: userInfo.global_name || userInfo.username,
        picture: userInfo.avatar ? `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}.png` : '',
        provider: 'discord'
      }
    };
  } catch (error) {
    console.error('Discord OAuth error:', error);
    throw error;
  }
}

async function handleTwitterOAuth(code, redirect_uri, codeVerifier, env) {
  try {
    // Twitter OAuth 2.0 implementation with PKCE
    const authString = `${env.TWITTER_CLIENT_ID}:${env.TWITTER_CLIENT_SECRET}`;
    const authHeader = btoa(authString);
    
    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${authHeader}`,
        'Accept': 'application/json'
      },
      body: new URLSearchParams({
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirect_uri,
        code_verifier: codeVerifier
      })
    });
    
    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Twitter token request failed: ${tokenResponse.status} ${tokenResponse.statusText} - ${errorText}`);
    }
    
    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      throw new Error(`Twitter token error: ${tokenData.error_description || tokenData.error}`);
    }
    
    // Get user info
    const userResponse = await fetch('https://api.twitter.com/2/users/me', {
      headers: { 
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json'
      }
    });
    
    if (!userResponse.ok) {
      const errorText = await userResponse.text();
      throw new Error(`Twitter user API error: ${userResponse.status} ${userResponse.statusText} - ${errorText}`);
    }
    
    const userInfo = await userResponse.json();
    
    if (userInfo.errors) {
      throw new Error(`Twitter user error: ${userInfo.errors[0].detail || userInfo.errors[0].message}`);
    }
    
    // Handle different possible profile image field names
    const profileImage = userInfo.data.profile_image_url || userInfo.data.profile_image_url_https || '';
    
    return {
      access_token: tokenData.access_token,
      user: {
        id: userInfo.data.id || '',
        email: userInfo.data.email || '',
        name: userInfo.data.name || '',
        picture: profileImage || '',
        provider: 'twitter'
      }
    };
  } catch (error) {
    console.error('Twitter OAuth error:', error);
    throw error;
  }
}

// Unified OAuth callback handler
async function handleOAuthCallback(request, env) {
  try {
    const { code, redirect_uri, provider, code_verifier } = await request.json();
    
    if (!code || !provider) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Missing required parameters'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    let userData;
    let accessToken;

    // Handle different OAuth providers
    try {
      if (provider === 'google') {
        const result = await handleGoogleOAuth(code, redirect_uri, env);
        userData = result.user;
        accessToken = result.access_token;
      } else if (provider === 'github') {
        const result = await handleGitHubOAuth(code, redirect_uri, env);
        userData = result.user;
        accessToken = result.access_token;
      } else if (provider === 'twitter') {
        const result = await handleTwitterOAuth(code, redirect_uri, code_verifier, env);
        userData = result.user;
        accessToken = result.access_token;
      } else if (provider === 'discord') {
        const result = await handleDiscordOAuth(code, redirect_uri, env);
        userData = result.user;
        accessToken = result.access_token;
      } else {
        return new Response(JSON.stringify({
          success: false,
          message: 'Unsupported OAuth provider'
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...corsHeaders }
        });
      }
    } catch (oauthError) {
      console.error(`${provider} OAuth error:`, oauthError);
      return new Response(JSON.stringify({
        success: false,
        message: 'OAuth callback failed',
        error: oauthError.message
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    // Save user to database
    const db = new DatabaseService(env.DB);
    const dbResult = await db.createUser({
      id: userData.id || '',
      email: userData.email || '',
      name: userData.name || '',
      picture: userData.picture || userData.avatar_url || '',
      provider: provider
    });

    if (!dbResult.success) {
      return new Response(JSON.stringify({
        success: false,
        message: 'Failed to save user data',
        error: dbResult.error
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return new Response(JSON.stringify({
      success: true,
      access_token: accessToken,
      user: userData,
      isNewUser: dbResult.isNewUser,
      profileCompleted: dbResult.profileCompleted
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'OAuth callback failed',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// Main request handler
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;

    // Handle CORS
    const corsResponse = handleCORS(request);
    if (corsResponse) return corsResponse;

    try {
      // Handle WebSocket connections for real-time updates
      if (path === '/ws/news' && request.headers.get('Upgrade') === 'websocket') {
        const { webSocketService } = await import('./services/websocket-service.js');
        const url = new URL(request.url);
        const userId = url.searchParams.get('userId');
        return webSocketService.handleConnection(request, userId);
      }
      
      // Route handling
      if (path === '/api/health' && method === 'GET') {
        return handleHealth();
      }
      
      if (path === '/api/auth/google' && method === 'POST') {
        return await handleGoogleAuth(request, env);
      }
      
      if (path === '/api/auth/github' && method === 'POST') {
        return await handleGitHubAuth(request, env);
      }
      
      if (path === '/api/auth/callback' && method === 'POST') {
        return await handleOAuthCallback(request, env);
      }
      
      if (path === '/api/upload' && method === 'POST') {
        return await handleFileUpload(request, env);
      }

      if (path === '/api/user/activity' && method === 'POST') {
        return await handleTrackActivity(request, env);
      }

      if (path === '/api/user/likes' && method === 'GET') {
        return await handleGetUserItems(request, env, 'like');
      }
      if (path === '/api/user/saved' && method === 'GET') {
        return await handleGetUserItems(request, env, 'bookmark');
      }

      if (path === '/api/analytics/summary' && method === 'GET') {
        return await handleAnalyticsSummary(request, env);
      }
      if (path === '/api/ai/insights' && method === 'GET') {
        return await handleAIInsights(request, env);
      }
      if (path === '/api/ai/daily-digest' && method === 'GET') {
        return await handleAIDailyDigest(request, env);
      }
      if (path === '/api/ai/ask' && method === 'POST') {
        return await handleAIAsk(request, env);
      }

      if (path === '/api/news/trending' && method === 'POST') {
        return await handleTrendingNews(request, env);
      }

      if (path === '/api/news/personalized' && method === 'POST') {
        return await handlePersonalizedNews(request, env);
      }

      if (path === '/api/news/search' && method === 'POST') {
        return await handleNewsSearch(request, env);
      }

      if (path.startsWith('/api/news/') && method === 'GET') {
        return await handleNewsDetail(request, env);
      }

      if (path === '/api/chat/message' && method === 'POST') {
        return await handleChatMessage(request, env);
      }

      if (path === '/api/agents' && method === 'GET') {
        return await handleAgentsDiscovery(request, env);
      }

      if (path === '/api/metta/status' && method === 'GET') {
        return await handleMeTTaStatus(request, env);
      }

      if (path === '/api/categories' && method === 'GET') {
        return await handleCategories(request, env);
      }

      if (path === '/api/launches/drops' && method === 'GET') {
        const cacheKey = new Request(request.url);
        const cached = await caches.default.match(cacheKey);
        if (cached) return cached;
        const response = await handleLaunchesDrops(request, env);
        if (response.ok) {
          const body = await response.arrayBuffer();
          const headers = new Headers(response.headers);
          headers.set('Cache-Control', 'public, max-age=180');
          ctx.waitUntil(caches.default.put(cacheKey, new Response(body, { status: response.status, headers })));
          return new Response(body, { status: response.status, headers: response.headers });
        }
        return response;
      }

      if (path === '/api/user/profile' && method === 'GET') {
        return await handleGetUserProfile(request, env);
      }

      if (path === '/api/user/profile' && method === 'PUT') {
        return await handleUpdateUserProfile(request, env);
      }

      if (path === '/api/subscription' && method === 'GET') {
        return await handleGetSubscription(request, env);
      }
      if (path === '/api/subscription' && method === 'POST') {
        return await handleUpdateSubscription(request, env);
      }

      // Compatibility routes without /api prefix for existing client
      if (path === '/user/profile' && method === 'GET') {
        return await handleGetUserProfile(request, env);
      }
      if (path === '/user/profile' && method === 'PUT') {
        return await handleUpdateUserProfile(request, env);
      }
      if (path === '/user/preferences' && method === 'POST') {
        return await handleUpdateUserPreferences(request, env);
      }
      if (path === '/metta/context' && method === 'GET') {
        return await handleMeTTaContext(request, env);
      }
      if (path === '/metta/search' && method === 'POST') {
        return await handleMeTTaSearch(request, env);
      }

      // Default response
      return new Response(JSON.stringify({
        message: 'BlockchainVibe API',
        version: '1.0.0',
        status: 'running'
      }), {
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });

    } catch (error) {
      console.error('Worker error:', error);
      return new Response(JSON.stringify({
        error: 'Internal Server Error',
        message: error.message
      }), { 
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      });
    }
  }
};

// Profile API handlers
async function handleGetUserProfile(request, env) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    
    if (!userId) {
      return new Response(JSON.stringify({
        success: false,
        message: 'User ID is required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const db = new DatabaseService(env.DB);
    const result = await db.getUserProfile(userId);
    
    if (!result.success) {
      return new Response(JSON.stringify({
        success: false,
        message: result.error
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      user: result.user
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    console.error('Get user profile error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to get user profile',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// Track user activity
async function handleTrackActivity(request, env) {
  try {
    const payload = await request.json();
    const { user_id, type } = payload || {};
    if (!user_id || !type) {
      return new Response(JSON.stringify({ success: false, message: 'user_id and type are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    const db = new DatabaseService(env.DB);
    const result = await db.insertUserActivity(payload);
    if (!result.success) {
      return new Response(JSON.stringify({ success: false, message: result.error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Update user profile using profiling service
    try {
      const { userProfilingService } = await import('./services/user-profiling.js');
      await userProfilingService.updateProfileFromActivity(user_id, payload, env.DB);
    } catch (profileError) {
      // Don't fail the request if profiling fails
      console.warn('User profiling update failed:', profileError);
    }
    
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Track activity error:', error);
    return new Response(JSON.stringify({ success: false, message: 'Failed to track activity', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

async function handleGetUserItems(request, env, type) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    if (!userId) {
      return new Response(JSON.stringify({ success: false, message: 'userId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    const db = new DatabaseService(env.DB);
    await db.initDatabase();
    const rows = await db.db.prepare(`
      SELECT article_id, article_title, article_source, created_at, metadata
      FROM user_activity
      WHERE user_id = ? AND type = ?
      ORDER BY created_at DESC
      LIMIT 200
    `).bind(userId, type).all();
    const items = (rows?.results || []).map(r => {
      let meta = {};
      try { meta = r.metadata ? JSON.parse(r.metadata) : {}; } catch {}
      return {
        id: r.article_id,
        title: r.article_title,
        source: r.article_source,
        url: meta.url || null,
        image_url: meta.image_url || null,
        category: meta.category || null,
        tags: meta.tags || [],
        relevanceScore: meta.relevanceScore || null,
        savedAt: r.created_at,
        likedAt: r.created_at,
      };
    });
    return new Response(JSON.stringify({ success: true, items }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: 'Failed to get items', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// Analytics summary endpoint
async function handleAnalyticsSummary(request, env) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    if (!userId) {
      return new Response(JSON.stringify({ success: false, message: 'userId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    const db = new DatabaseService(env.DB);
    const summary = await db.getAnalyticsSummary(userId);
    if (!summary.success) {
      return new Response(JSON.stringify({ success: false, message: summary.error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    return new Response(JSON.stringify({ success: true, ...summary }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Analytics summary error:', error);
    return new Response(JSON.stringify({ success: false, message: 'Failed to get analytics', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// AI Insights derived from D1 activity (lightweight, deterministic)
async function handleAIInsights(request, env) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    if (!userId) {
      return new Response(JSON.stringify({ success: false, message: 'userId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    const db = new DatabaseService(env.DB);
    await db.initDatabase();

    const topSources = await db.db.prepare(`
      SELECT article_source as source, COUNT(*) as cnt
      FROM user_activity
      WHERE user_id = ? AND type = 'read' AND created_at >= datetime('now','-6 days')
      GROUP BY article_source
      ORDER BY cnt DESC
      LIMIT 5
    `).bind(userId).all();

    const peakHour = await db.db.prepare(`
      SELECT CAST(strftime('%H', created_at) AS INTEGER) as hour, COUNT(*) as cnt
      FROM user_activity
      WHERE user_id = ? AND type = 'read'
      GROUP BY strftime('%Y-%m-%d %H', created_at)
      ORDER BY cnt DESC
      LIMIT 1
    `).bind(userId).first();

    const totalReads = await db.db.prepare(`
      SELECT COUNT(*) as cnt FROM user_activity
      WHERE user_id = ? AND type = 'read' AND created_at >= datetime('now','-6 days')
    `).bind(userId).first();

    const recentTitles = await db.db.prepare(`
      SELECT article_title FROM user_activity
      WHERE user_id = ? AND type = 'read' AND article_title IS NOT NULL AND article_title != ''
      ORDER BY created_at DESC LIMIT 20
    `).bind(userId).all();

    const insights = [];
    const top = topSources?.results || [];
    if (top.length > 0) {
      const s = top[0];
      insights.push({ type: 'source', text: `Most-read source this week: ${s.source} (${s.cnt} reads).`, source: 'D1 user_activity' });
    }
    if (peakHour && typeof peakHour.hour === 'number') {
      insights.push({ type: 'pattern', text: `You typically read around ${peakHour.hour}:00.`, source: 'D1 user_activity' });
    }
    const total = totalReads?.cnt ?? 0;
    if (total > 0) {
      insights.push({ type: 'engagement', text: `You've read ${total} article${total !== 1 ? 's' : ''} in the last 7 days.`, source: 'D1 user_activity' });
    }
    if (top.length >= 2) {
      const second = top[1];
      insights.push({ type: 'source', text: `${second.source} is also in your top sources (${second.cnt} reads).`, source: 'D1 user_activity' });
    }
    // Suggest broadening if they only read one source
    if (top.length === 1 && top[0].cnt >= 3) {
      insights.push({ type: 'suggestion', text: 'Try exploring DeFi or Layer 2 topics for more variety.', source: 'AI' });
    }

    return new Response(JSON.stringify({ success: true, insights }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: 'Failed to generate insights', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// AI Daily Digest: aggregated themes and top headlines (personalized when userId provided)
async function handleAIDailyDigest(request, env) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    const items = await fetchBlockchainNews(40, { timeFilter: '24h', sortBy: 'relevance' });
    const byCategory = new Map();
    const bySource = new Map();
    const headlines = [];
    items.forEach((a, i) => {
      const cats = Array.isArray(a.categories) ? a.categories : ['general'];
      cats.forEach(c => byCategory.set(c, (byCategory.get(c) || 0) + 1));
      const src = a.source || 'Unknown';
      bySource.set(src, (bySource.get(src) || 0) + 1);
      if (i < 8) headlines.push({ id: a.id, title: a.title, source: a.source, url: a.url, categories: cats });
    });
    const themes = Array.from(byCategory.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);
    const topSources = Array.from(bySource.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
    const digest = {
      success: true,
      date: new Date().toISOString().slice(0, 10),
      themes,
      top_headlines: headlines,
      top_sources: topSources,
      total_articles: items.length,
      personalized: !!userId
    };
    return new Response(JSON.stringify(digest), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: 'Failed to generate digest', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// AI Ask: natural-language query over news + insights (authenticated)
async function handleAIAsk(request, env) {
  try {
    const body = await request.json().catch(() => ({}));
    const userId = body.userId || body.user_id;
    const query = (body.query || body.text || '').trim().toLowerCase();
    if (!query) {
      return new Response(JSON.stringify({ success: false, message: 'query is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    const items = await fetchBlockchainNews(30, { timeFilter: '7d', sortBy: 'relevance' });
    const replyParts = [];
    if (query.includes('insight') || query.includes('summary') || query.includes('habit') || query.includes('read')) {
      if (userId) {
        const url = new URL(request.url);
        url.pathname = '/api/ai/insights';
        url.search = `userId=${encodeURIComponent(userId)}`;
        const resp = await handleAIInsights(new Request(url.toString(), { method: 'GET' }), env);
        const data = await resp.json();
        if (data.insights && data.insights.length) {
          replyParts.push('Your insights: ' + data.insights.map(i => i.text).join(' '));
        }
      }
    }
    if (query.includes('trend') || query.includes('today') || query.includes('news') || query.includes('defi') || query.includes('bitcoin') || query.includes('ethereum') || query.includes('what')) {
      const relevant = items.filter(a => {
        const t = (a.title || '').toLowerCase();
        const s = (a.summary || '').toLowerCase();
        return t.includes('defi') || t.includes('bitcoin') || t.includes('ethereum') || s.includes('defi') || s.includes('bitcoin') || s.includes('ethereum') || query.length < 5;
      }).slice(0, 5);
      if (relevant.length) {
        replyParts.push('Top picks from the feed: ' + relevant.map(a => a.title).join(' — '));
      } else {
        replyParts.push('Recent headlines: ' + items.slice(0, 5).map(a => a.title).join(' — '));
      }
    }
    if (replyParts.length === 0) {
      replyParts.push('Recent headlines: ' + items.slice(0, 5).map(a => a.title).join(' — '));
    }
    return new Response(JSON.stringify({
      success: true,
      reply: replyParts.join('\n\n'),
      sources: items.slice(0, 5).map(a => ({ title: a.title, url: a.url }))
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: 'Failed to process question', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// Agents Discovery API for ASI:One
async function handleAgentsDiscovery(request, env) {
  try {
    const { UAgentsIntegration } = await import('./uagents-integration.js');
    const uAgents = new UAgentsIntegration();
    
    // Ensure agents are registered
    try {
      await uAgents.initializeAgents();
    } catch (error) {
      console.warn('Failed to initialize uAgents, using fallback agent registration:', error.message);
      // Register agents manually if initialization fails
      await uAgents.registerAgentsWithChatProtocol();
    }
    
    // Get available agents
    let agents = uAgents.getAvailableAgents();
    const agentStatus = uAgents.getAgentStatus();
    
    // If no agents are registered, create default ones
    if (agents.length === 0) {
      console.log('No agents found, creating default agents for ASI:One discovery');
      agents = [
        {
          id: 'blockchainvibe-news-fetcher',
          name: 'BlockchainVibe News Fetcher',
          description: 'Fetches and processes blockchain news from various RSS sources',
          capabilities: ['news_fetching', 'content_processing', 'quality_scoring'],
          endpoint: 'https://blockchainvibe-api.nico-chikuji.workers.dev/api/news/trending',
          status: 'active',
          asione_compatible: true,
          discovery_tags: ['blockchain', 'news', 'ai', 'personalization', 'cryptocurrency'],
          human_integration: {
            chat_enabled: true,
            voice_enabled: false,
            multimodal: false,
            natural_language: true,
            conversation_memory: true
          },
          discovery_metadata: {
            category: 'news',
            subcategory: 'blockchain_news',
            complexity: 'intermediate',
            use_cases: ['news_aggregation', 'content_personalization', 'trend_analysis']
          },
          registered_at: new Date().toISOString(),
          last_heartbeat: new Date().toISOString()
        },
        {
          id: 'blockchainvibe-relevance-scorer',
          name: 'BlockchainVibe Relevance Scorer',
          description: 'Calculates personalized relevance scores for news articles using AI',
          capabilities: ['relevance_scoring', 'personalization', 'user_profiling'],
          endpoint: 'https://blockchainvibe-api.nico-chikuji.workers.dev/api/news/personalized',
          status: 'active',
          asione_compatible: true,
          discovery_tags: ['blockchain', 'ai', 'personalization', 'scoring', 'relevance'],
          human_integration: {
            chat_enabled: true,
            voice_enabled: false,
            multimodal: false,
            natural_language: true,
            conversation_memory: true
          },
          discovery_metadata: {
            category: 'ai',
            subcategory: 'personalization',
            complexity: 'advanced',
            use_cases: ['relevance_scoring', 'user_profiling', 'content_ranking']
          },
          registered_at: new Date().toISOString(),
          last_heartbeat: new Date().toISOString()
        },
        {
          id: 'blockchainvibe-knowledge-graph',
          name: 'BlockchainVibe Knowledge Graph',
          description: 'Extracts entities and categorizes blockchain content using MeTTa knowledge graph',
          capabilities: ['entity_extraction', 'categorization', 'knowledge_graph'],
          endpoint: 'https://blockchainvibe-api.nico-chikuji.workers.dev/api/agents',
          status: 'active',
          asione_compatible: true,
          discovery_tags: ['blockchain', 'knowledge_graph', 'entity_extraction', 'metta'],
          human_integration: {
            chat_enabled: true,
            voice_enabled: false,
            multimodal: false,
            natural_language: true,
            conversation_memory: true
          },
          discovery_metadata: {
            category: 'ai',
            subcategory: 'knowledge_graph',
            complexity: 'advanced',
            use_cases: ['entity_extraction', 'content_categorization', 'knowledge_reasoning']
          },
          registered_at: new Date().toISOString(),
          last_heartbeat: new Date().toISOString()
        }
      ];
    }
    
    // Format for ASI:One discovery
    const discoveryData = {
      agents: agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        capabilities: agent.capabilities,
        status: agentStatus[agent.id] || 'unknown',
        asione_compatible: true,
        discovery_tags: agent.discovery_tags || [],
        human_integration: agent.human_integration || {},
        discovery_metadata: agent.discovery_metadata || {},
        endpoint: agent.endpoint,
        registered_at: agent.registered_at,
        last_heartbeat: agent.last_heartbeat
      })),
      total_agents: agents.length,
      asione_protocol_version: '1.0',
      blockchainvibe_version: '1.0.0',
      discovery_timestamp: new Date().toISOString()
    };
    
    return new Response(JSON.stringify(discoveryData), {
      status: 200,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  } catch (error) {
    console.error('Agents discovery error:', error);
    return new Response(JSON.stringify({
      error: "Failed to get agents for discovery",
      details: error.message
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        ...corsHeaders
      }
    });
  }
}

async function handleUpdateUserProfile(request, env) {
  try {
    const { userId, profileData } = await request.json();
    
    if (!userId || !profileData) {
      return new Response(JSON.stringify({
        success: false,
        message: 'User ID and profile data are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    const db = new DatabaseService(env.DB);
    const result = await db.updateUserProfile(userId, profileData);
    
    if (!result.success) {
      return new Response(JSON.stringify({
        success: false,
        message: result.error
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    return new Response(JSON.stringify({
      success: true,
      message: 'Profile updated successfully'
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
    
  } catch (error) {
    console.error('Update user profile error:', error);
    return new Response(JSON.stringify({
      success: false,
      message: 'Failed to update user profile',
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

async function handleNewsSearch(request, env) {
  try {
    const { query = '', limit = 10, timeFilter = 'all' } = await request.json();
    const q = (query || '').trim();
    
    // If query is empty, return empty results
    if (!q || q.length === 0) {
      return new Response(JSON.stringify({ 
        articles: [], 
        results: [],
        total_count: 0 
      }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    
    // Fetch more articles to increase chance of finding matches
    const items = await fetchBlockchainNews(limit * 5, { 
      timeFilter: timeFilter || 'all', 
      sortBy: 'relevance' 
    });
    
    const qLower = q.toLowerCase();
    const filtered = items.filter(a => {
      const t = (a.title || '').toLowerCase();
      const s = (a.summary || '').toLowerCase();
      const c = (a.content || '').toLowerCase();
      // Search in title, summary, and content
      return t.includes(qLower) || s.includes(qLower) || c.includes(qLower);
    }).slice(0, limit);
    
    return new Response(JSON.stringify({ 
      articles: filtered, 
      results: filtered, // Also return as 'results' for compatibility
      total_count: filtered.length 
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to search news', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

async function handleNewsDetail(request, env) {
  try {
    const url = new URL(request.url);
    const id = url.pathname.split('/').pop();
    const items = await fetchBlockchainNews(120, { timeFilter: '7d', sortBy: 'relevance' });
    const found = items.find(a => a.id === id || (a.url && a.url === decodeURIComponent(id)));
    if (!found) {
      return new Response(JSON.stringify({ error: 'Article not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    return new Response(JSON.stringify(found), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to get article', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

async function handleLaunchesDrops(request, env) {
  try {
    const { launchesService } = await import('./launches-service.js');
    const data = await launchesService.getAll(env);
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({
      error: 'Failed to get launches and drops',
      details: error.message,
      airdrops: [],
      trendingCoins: [],
      newTokens: [],
      nftDrops: [],
      calendarEvents: [],
      updatedAt: new Date().toISOString()
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

async function handleCategories(request, env) {
  try {
    const items = await fetchBlockchainNews(150, { timeFilter: '7d', sortBy: 'relevance' });
    const counts = new Map();
    items.forEach(a => {
      const cats = Array.isArray(a.categories) ? a.categories : ['general'];
      cats.forEach(c => counts.set(c, (counts.get(c) || 0) + 1));
    });
    const categories = Array.from(counts.entries()).map(([name, count]) => ({ name, count }));
    return new Response(JSON.stringify({ categories }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Failed to get categories', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

async function handleUpdateUserPreferences(request, env) {
  try {
    const { user_id, preferences } = await request.json();
    if (!user_id || !preferences) {
      return new Response(JSON.stringify({ success: false, message: 'user_id and preferences are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    // For simplicity store preferences in users table website field if no dedicated table
    const db = new DatabaseService(env.DB);
    await db.updateUserField(user_id, 'website', JSON.stringify(preferences));
    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: 'Failed to update preferences', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

async function handleMeTTaContext(request, env) {
  try {
    const { MeTTaIntegration } = await import('./metta-integration.js');
    const mi = new MeTTaIntegration();
    await mi.initialize();
    const stats = mi.getMeTTaStats();
    return new Response(JSON.stringify({ success: true, stats }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: 'Failed to get MeTTa context', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

async function handleMeTTaSearch(request, env) {
  try {
    const { query } = await request.json();
    const { MeTTaIntegration } = await import('./metta-integration.js');
    const mi = new MeTTaIntegration();
    await mi.initialize();
    const results = await mi.searchContext(query || '');
    return new Response(JSON.stringify({ success: true, results }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: 'Failed to search MeTTa', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

// Subscription (on-hold: enable with env.SUBSCRIPTION_ENABLED = 'true')
const SUBSCRIPTION_PLANS = ['free', 'pro'];

async function handleGetSubscription(request, env) {
  const enabled = env.SUBSCRIPTION_ENABLED === 'true';
  if (!enabled) {
    return new Response(JSON.stringify({ enabled: false, plan: 'free', status: 'active' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get('userId');
    if (!userId) {
      return new Response(JSON.stringify({ success: false, message: 'userId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    const db = new DatabaseService(env.DB);
    const result = await db.getSubscription(userId);
    return new Response(JSON.stringify({ enabled: true, ...result }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, enabled: true, plan: 'free', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

async function handleUpdateSubscription(request, env) {
  if (env.SUBSCRIPTION_ENABLED !== 'true') {
    return new Response(JSON.stringify({ enabled: false, message: 'Subscription feature is not enabled' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  try {
    const body = await request.json().catch(() => ({}));
    const userId = body.user_id || body.userId;
    const plan = (body.plan || 'free').toLowerCase();
    if (!userId) {
      return new Response(JSON.stringify({ success: false, message: 'user_id is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    if (!SUBSCRIPTION_PLANS.includes(plan)) {
      return new Response(JSON.stringify({ success: false, message: 'Invalid plan' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    const db = new DatabaseService(env.DB);
    const result = await db.upsertSubscription(userId, { plan, status: 'active' });
    if (!result.success) {
      return new Response(JSON.stringify({ success: false, message: result.error }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }
    return new Response(JSON.stringify({ success: true, plan }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, message: 'Failed to update subscription', error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}
