// Social Authentication Service
class SocialAuthService {
  constructor() {
    // OAuth Client IDs with fallbacks for production
    this.googleClientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '579208613672-c4pvdarqdnckdai6re7n9nei5svk72st.apps.googleusercontent.com';
    this.githubClientId = process.env.REACT_APP_GITHUB_CLIENT_ID || 'Ov23lisuJwAjEECYLj0y';
    this.twitterClientId = process.env.REACT_APP_TWITTER_CLIENT_ID || 'ZTBIVVZpeUIyVm9uaU1iRFhiVnI6MTpjaQ';
    this.discordClientId = process.env.REACT_APP_DISCORD_CLIENT_ID || '1431187449215717457';
    
    // Set redirect URI based on environment
    // Check if we're in production by looking at the hostname
    const isProduction = window.location.hostname === 'blockchainvibe.news' || 
                        window.location.hostname.includes('blockchainvibe.pages.dev') ||
                        process.env.NODE_ENV === 'production';
    
    // Force production URLs if we're on the production domain
    if (window.location.hostname === 'blockchainvibe.news' || window.location.hostname.includes('blockchainvibe.pages.dev')) {
      this.redirectUri = 'https://blockchainvibe.news/auth/callback';
      this.apiUrl = 'https://blockchainvibe-api.nico-chikuji.workers.dev';
    } else if (isProduction) {
      // Use environment variables if available, otherwise fallback to production URLs
      this.redirectUri = process.env.REACT_APP_REDIRECT_URI || 'https://blockchainvibe.news/auth/callback';
      this.apiUrl = process.env.REACT_APP_API_URL || 'https://blockchainvibe-api.nico-chikuji.workers.dev';
    } else {
      // Development environment
      this.redirectUri = process.env.REACT_APP_REDIRECT_URI || 'http://localhost:3000/auth/callback';
      this.apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
    }
    
  }

  // Google OAuth
  async signInWithGoogle() {
    try {
      // Check if we're in demo mode (no client ID configured)
      if (!this.googleClientId || this.googleClientId === 'your_google_client_id_here' || this.googleClientId.trim() === '') {
        this.handleDemoAuth('Google');
        return;
      }
      
      // Store provider in localStorage for callback detection
      localStorage.setItem('oauth_provider', 'google');
      
      // Use Google's OAuth 2.0 flow
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${this.googleClientId}&` +
        `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
        `response_type=code&` +
        `scope=openid%20email%20profile&` +
        `access_type=offline&` +
        `state=google`;

      // Redirect to Google OAuth
      window.location.href = googleAuthUrl;
    } catch (error) {
      throw new Error('Failed to sign in with Google');
    }
  }

  async loadGoogleAPI() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => {
        window.google.accounts.id.initialize({
          client_id: this.googleClientId,
        });
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }


  // GitHub OAuth
  async signInWithGitHub() {
    try {
      // Check if we're in demo mode (no client ID configured)
      if (!this.githubClientId || this.githubClientId === 'your_github_client_id_here' || this.githubClientId.trim() === '') {
        this.handleDemoAuth('GitHub');
        return;
      }
      
      // Check if we're in development mode and GitHub OAuth might not work
      const isDevelopment = this.redirectUri.includes('localhost');
      if (isDevelopment) {
        // Show a warning that GitHub OAuth might not work in development
        if (window.confirm('GitHub OAuth is configured for production only. It may not work in development mode. Would you like to try anyway, or use Discord OAuth instead?')) {
          // User chose to try anyway, continue with GitHub OAuth
        } else {
          // User chose to use Discord instead
          await this.signInWithDiscord();
          return;
        }
      }
      
      // Store provider in localStorage for callback detection
      localStorage.setItem('oauth_provider', 'github');
      
      // Add a random parameter to force GitHub to show authorization screen
      const randomParam = Math.random().toString(36).substring(7);
      
      const githubAuthUrl = `https://github.com/login/oauth/authorize?` +
        `client_id=${this.githubClientId}&` +
        `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
        `scope=user:email&` +
        `state=github&` +
        `allow_signup=true&` +
        `random=${randomParam}&` +
        `prompt=consent`;


      // Redirect to GitHub OAuth
      window.location.href = githubAuthUrl;
    } catch (error) {
      throw new Error('Failed to sign in with GitHub');
    }
  }

  // Discord OAuth
  async signInWithDiscord() {
    try {
      // Check if we're in demo mode (no client ID configured)
      if (!this.discordClientId || this.discordClientId === 'your_discord_client_id_here' || this.discordClientId.trim() === '') {
        this.handleDemoAuth('Discord');
        return;
      }
      
      // Store provider in localStorage for callback detection
      localStorage.setItem('oauth_provider', 'discord');
      
      const discordAuthUrl = `https://discord.com/api/oauth2/authorize?` +
        `client_id=${this.discordClientId}&` +
        `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
        `response_type=code&` +
        `scope=identify%20email&` +
        `state=discord`;

      // Redirect to Discord OAuth
      window.location.href = discordAuthUrl;
    } catch (error) {
      throw new Error('Failed to sign in with Discord');
    }
  }

  // X (Twitter) OAuth
  async signInWithX() {
    try {
      // Check if we're in demo mode (no client ID configured)
      if (!this.twitterClientId || this.twitterClientId === 'your_twitter_client_id_here' || this.twitterClientId.trim() === '') {
        this.handleDemoAuth('X');
        return;
      }
      
      // Store provider in localStorage for callback detection
      localStorage.setItem('oauth_provider', 'twitter');
      
      // Generate PKCE code challenge
      const codeVerifier = this.generateCodeVerifier();
      const codeChallenge = await this.generateCodeChallenge(codeVerifier);
      
      // Store code verifier for later use
      localStorage.setItem('twitter_code_verifier', codeVerifier);
      
      const twitterAuthUrl = `https://twitter.com/i/oauth2/authorize?` +
        `response_type=code&` +
        `client_id=${this.twitterClientId}&` +
        `redirect_uri=${encodeURIComponent(this.redirectUri)}&` +
        `scope=tweet.read%20users.read&` +
        `state=twitter&` +
        `code_challenge=${codeChallenge}&` +
        `code_challenge_method=S256`;


      // Redirect to X (Twitter) OAuth
      window.location.href = twitterAuthUrl;
    } catch (error) {
      throw new Error('Failed to sign in with X');
    }
  }

  // Handle OAuth callbacks (for popup windows)
  async handleOAuthCallback() {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const state = urlParams.get('state');
    const errorDescription = urlParams.get('error_description');


    if (error) {
      throw new Error(`${error}: ${errorDescription || 'Unknown error'}`);
    }

    if (code) {
      // Determine which provider based on state or URL
      const provider = this.detectProvider(state);
      
      if (provider === 'google') {
        await this.handleGoogleCallback(code);
      } else if (provider === 'github') {
        await this.handleGitHubCallback(code);
      } else if (provider === 'twitter') {
        await this.handleTwitterCallback(code);
      } else if (provider === 'discord') {
        await this.handleDiscordCallback(code);
      } else {
        throw new Error('Unknown OAuth provider');
      }
    } else {
      throw new Error('No authorization code received');
    }
  }

  detectProvider(state) {
    // Check state parameter first, then localStorage
    if (state) {
      return state;
    }
    return localStorage.getItem('oauth_provider') || 'github';
  }

  async handleGoogleCallback(code) {
    try {
      const response = await fetch(`${this.apiUrl}/api/auth/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          redirect_uri: this.redirectUri,
          provider: 'google'
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google OAuth error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Store authentication data
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isNewUser', data.isNewUser || false);
        localStorage.setItem('profileCompleted', data.profileCompleted || false);
        
        // Clear any stored OAuth provider info
        localStorage.removeItem('oauth_provider');
        
        // Check if profile needs completion
        if (data.isNewUser && !data.profileCompleted) {
          // Store user data for profile completion modal
          localStorage.setItem('pendingProfileData', JSON.stringify(data.user));
          window.location.href = '/dashboard?showProfileModal=true';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        throw new Error(data.message || data.error || 'Google authentication failed');
      }
    } catch (error) {
      throw error; // Re-throw to be handled by the calling function
    }
  }

  async handleGitHubCallback(code) {
    try {
      const response = await fetch(`${this.apiUrl}/api/auth/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          redirect_uri: this.redirectUri,
          provider: 'github'
        })
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('GitHub OAuth error response:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Store authentication data
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isNewUser', data.isNewUser || false);
        localStorage.setItem('profileCompleted', data.profileCompleted || false);
        
        // Clear any stored OAuth provider info
        localStorage.removeItem('oauth_provider');
        
        // Check if profile needs completion
        if (data.isNewUser && !data.profileCompleted) {
          // Store user data for profile completion modal
          localStorage.setItem('pendingProfileData', JSON.stringify(data.user));
          window.location.href = '/dashboard?showProfileModal=true';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        throw new Error(data.message || data.error || 'GitHub authentication failed');
      }
    } catch (error) {
      throw error; // Re-throw to be handled by the calling function
    }
  }

  async handleDiscordCallback(code) {
    try {
      const response = await fetch(`${this.apiUrl}/api/auth/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          redirect_uri: this.redirectUri,
          provider: 'discord'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Store authentication data
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isNewUser', data.isNewUser || false);
        localStorage.setItem('profileCompleted', data.profileCompleted || false);
        
        // Clear any stored OAuth provider info
        localStorage.removeItem('oauth_provider');
        
        // Check if profile needs completion
        if (data.isNewUser && !data.profileCompleted) {
          // Store user data for profile completion modal
          localStorage.setItem('pendingProfileData', JSON.stringify(data.user));
          window.location.href = '/dashboard?showProfileModal=true';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        throw new Error(data.message || data.error || 'Discord authentication failed');
      }
    } catch (error) {
      throw error; // Re-throw to be handled by the calling function
    }
  }

  async handleTwitterCallback(code) {
    try {
      // Get the stored code verifier
      const codeVerifier = localStorage.getItem('twitter_code_verifier');
      
      const response = await fetch(`${this.apiUrl}/api/auth/callback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          redirect_uri: this.redirectUri,
          provider: 'twitter',
          code_verifier: codeVerifier
        })
      });

      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      
      if (data.success) {
        // Store authentication data
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        localStorage.setItem('isNewUser', data.isNewUser || false);
        localStorage.setItem('profileCompleted', data.profileCompleted || false);
        
        // Clear any stored OAuth provider info
        localStorage.removeItem('oauth_provider');
        localStorage.removeItem('twitter_code_verifier');
        
        // Check if profile needs completion
        if (data.isNewUser && !data.profileCompleted) {
          // Store user data for profile completion modal
          localStorage.setItem('pendingProfileData', JSON.stringify(data.user));
          window.location.href = '/dashboard?showProfileModal=true';
        } else {
          window.location.href = '/dashboard';
        }
      } else {
        throw new Error(data.message || data.error || 'Twitter authentication failed');
      }
    } catch (error) {
      throw error; // Re-throw to be handled by the calling function
    }
  }

  // PKCE helper methods for Twitter OAuth 2.0
  generateCodeVerifier() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  async generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  // Demo authentication for testing without OAuth setup
  handleDemoAuth(provider) {
    const demoUsers = {
      Google: {
        id: 'demo_google_123',
        email: 'demo.google@example.com',
        name: 'Demo Google User',
        picture: 'https://via.placeholder.com/150/4285F4/FFFFFF?text=G',
        provider: 'google'
      },
      GitHub: {
        id: 'demo_github_456',
        email: 'demo.github@example.com',
        name: 'Demo GitHub User',
        picture: 'https://via.placeholder.com/150/333333/FFFFFF?text=GH',
        provider: 'github'
      },
      X: {
        id: 'demo_twitter_789',
        email: 'demo.twitter@example.com',
        name: 'Demo X User',
        picture: 'https://via.placeholder.com/150/1DA1F2/FFFFFF?text=X',
        provider: 'twitter'
      }
    };

    const user = demoUsers[provider];
    if (user) {
      // Create demo tokens
      const accessToken = `demo_${provider.toLowerCase()}_token_${Date.now()}`;
      const refreshToken = `demo_${provider.toLowerCase()}_refresh_${Date.now()}`;
      
      // Store demo authentication
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));
      
      // Show success message — user is in demo mode (OAuth not configured)
      alert(`Demo mode: You're signed in as a demo ${provider} user. OAuth is not configured for production sign-in. Configure OAuth client IDs to enable real authentication.`);
      
      // Redirect to dashboard
      setTimeout(() => {
        window.location.href = '/dashboard';
      }, 1000);
    }
  }

  // Sign out
  signOut() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('github_token');
    localStorage.removeItem('twitter_token');
    localStorage.removeItem('oauth_provider');
    window.location.href = '/';
  }

  // Get current user
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  // Check if user is authenticated
  isAuthenticated() {
    return !!localStorage.getItem('access_token');
  }
}

// Create singleton instance
const socialAuthService = new SocialAuthService();

export default socialAuthService;
