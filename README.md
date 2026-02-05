# 🚀 BlockchainVibe

![tag:innovationlab](https://img.shields.io/badge/innovationlab-3D8BD3)
![tag:hackathon](https://img.shields.io/badge/hackathon-5F43F1)

A modern, AI-powered blockchain news aggregator with OAuth authentication and Cloudflare deployment. Feel the vibe of blockchain intelligence!

## ✨ Features

- **🔐 OAuth Authentication**: Google, GitHub, and X (Twitter) login
- **🤖 AI-Powered News**: Fetch.ai uAgents for intelligent news gathering
- **🧠 Knowledge Graph**: SingularityNET MeTTa for relevance scoring
- **📰 Smart Aggregation**: Personalized news based on user interests
- **🌙 Dark/Light Theme**: Beautiful, responsive UI
- **☁️ Cloudflare Ready**: Optimized for Cloudflare Pages and Workers
- **🗄️ Database Integration**: User data persistence with SQLite/D1
- **📱 Mobile Responsive**: Works on all devices

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Python 3.8+
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd blockchainvibe
   ```

2. **Install dependencies**
   ```bash
   npm install
   cd server && npm install && cd ..
   ```

3. **Configure environment variables**
   ```bash
   # Copy environment files
   cp .env.example .env
   cp server/.env.example server/.env
   
   # Edit with your OAuth credentials
   nano .env
   nano server/.env
   ```

4. **Start development servers**
   ```bash
   npm run dev
   ```

5. **Open the application**
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000

## 🔧 Configuration

### OAuth Setup

1. **Google OAuth**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create OAuth 2.0 credentials
   - Add authorized origins: `http://localhost:3000`
   - Add redirect URI: `http://localhost:3000/auth/callback`

2. **GitHub OAuth**:
   - Go to [GitHub OAuth Apps](https://github.com/settings/developers)
   - Create new OAuth App
   - Set callback URL: `http://localhost:3000/auth/callback`

3. **X (Twitter) OAuth**:
   - Go to [Twitter Developer Portal](https://developer.twitter.com/)
   - Create new app
   - Set callback URL: `http://localhost:3000/auth/callback`

### Environment Variables

**Frontend (`.env` in root)**:
```env
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_GITHUB_CLIENT_ID=your_github_client_id
REACT_APP_TWITTER_CLIENT_ID=your_twitter_client_id
REACT_APP_REDIRECT_URI=http://localhost:3000/auth/callback
REACT_APP_API_URL=http://localhost:8000
```

**Backend (`server/.env`)**:
```env
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
TWITTER_CLIENT_ID=your_twitter_client_id
TWITTER_CLIENT_SECRET=your_twitter_client_secret
JWT_SECRET=your_jwt_secret
DATABASE_URL=sqlite:///./ai_news_agent.db
```

## ☁️ Cloudflare Deployment

### Prerequisites
- Cloudflare account
- Wrangler CLI installed (`npm install -g wrangler`)

### Deploy Backend (Workers)

1. **Create D1 Database**
   ```bash
   wrangler d1 create blockchainvibe-db
   ```

2. **Set environment variables**
   ```bash
   wrangler secret put GOOGLE_CLIENT_ID
   wrangler secret put GOOGLE_CLIENT_SECRET
   wrangler secret put GITHUB_CLIENT_ID
   wrangler secret put GITHUB_CLIENT_SECRET
   wrangler secret put TWITTER_CLIENT_ID
   wrangler secret put TWITTER_CLIENT_SECRET
   wrangler secret put JWT_SECRET
   ```

3. **Deploy Worker**
   ```bash
   cd server
   wrangler deploy
   ```

### Deploy Frontend (Pages)

1. **Connect to Cloudflare Pages**
   - Go to Cloudflare Pages dashboard
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set build output: `build`

2. **Set environment variables**
   - Add all `REACT_APP_*` variables
   - Set `REACT_APP_API_URL` to your Worker URL

3. **Deploy**
   - Click "Save and Deploy"

## 📁 Project Structure

```
blockchainvibe/
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── contexts/           # React contexts
│   ├── hooks/              # Custom hooks
│   ├── services/           # API services
│   └── styles/            # Styled components
├── public/                 # Static assets
│   ├── docs/               # Documentation
│   └── ...
├── server/                 # Cloudflare Workers backend
│   ├── agents/             # Python uAgents
│   ├── services/           # Backend services
│   ├── worker.js           # Cloudflare Worker
│   └── wrangler.toml       # Workers config
├── package.json            # Frontend dependencies
└── README.md
```

## 🤖 AI Integration

### Fetch.ai uAgents
The webapp uses Fetch.ai's uAgents framework for intelligent news gathering:
- **News Agent**: Fetches news from multiple blockchain sources
- **Relevance Scoring**: Calculates relevance based on blockchain keywords
- **Real-time Processing**: Asynchronous news aggregation
- **Source Diversity**: Multiple RSS feeds and news APIs

### SingularityNET MeTTa
Integration with SingularityNET's MeTTa knowledge graph:
- **Knowledge Graph**: Blockchain entity relationships
- **User Profiling**: Personalized relevance scoring
- **Entity Extraction**: NLP-based content analysis
- **Sentiment Analysis**: News sentiment evaluation

### How It Works
1. **News Gathering**: uAgents fetch news from blockchain sources
2. **Entity Extraction**: MeTTa extracts blockchain entities and relationships
3. **Relevance Scoring**: User-specific relevance based on interests and history
4. **Personalization**: News ranked by user relevance and MeTTa insights

### Agent Directory (Innovation Lab)

All agents are categorized under Innovation Lab and registered on Agentverse with Chat Protocol enabled for ASI:One discovery.

#### News Fetcher Agent
- **Agent ID**: `blockchainvibe-news-fetcher`
- **Name**: BlockchainVibe News Fetcher
- **Address**: Generated from seed `blockchainvibe_news_fetcher_2024` (managed by uAgents framework)
- **Endpoint**: `http://localhost:8001/submit` (development) / Production endpoint configured in Cloudflare Workers
- **Capabilities**: 
  - `news_fetching` - Fetches news from multiple RSS sources
  - `content_processing` - Parses and extracts metadata
  - `quality_scoring` - Evaluates article quality
- **Chat Protocol**: ✅ ASI:One compatible
- **Agentverse Registration**: ✅ Registered and discoverable

#### Relevance Scorer Agent
- **Agent ID**: `blockchainvibe-relevance-scorer`
- **Name**: BlockchainVibe Relevance Scorer
- **Address**: Generated from seed `blockchainvibe_relevance_scorer_2024` (managed by uAgents framework)
- **Endpoint**: `http://localhost:8003/submit` (development) / Production endpoint configured in Cloudflare Workers
- **Capabilities**:
  - `relevance_scoring` - Calculates personalized relevance scores
  - `personalization` - Tailors content to user preferences
  - `user_profiling` - Analyzes user behavior patterns
- **Chat Protocol**: ✅ ASI:One compatible
- **Agentverse Registration**: ✅ Registered and discoverable

**Agent Registration**: Agents are automatically registered with Chat Protocol on startup. See `server/uagents-integration.js` and `server/chat-protocol.js` for implementation details.

### Extra Resources Required

To run this project, you'll need access to:

1. **Fetch.ai uAgents Framework**
   - GitHub: https://github.com/fetchai/uAgents
   - Documentation: https://docs.fetch.ai/
   - Installation: `pip install uagents`
   
2. **SingularityNET MeTTa Knowledge Graph**
   - GitHub: https://github.com/singnet
   - Documentation: https://singnet.github.io/
   - Integration guide: See in-app docs at /docs (AI Integration)

3. **Cloudflare Infrastructure** (for production deployment)
   - Cloudflare Workers: https://developers.cloudflare.com/workers/
   - Cloudflare D1: https://developers.cloudflare.com/d1/
   - Cloudflare Pages: https://developers.cloudflare.com/pages/
   - Cloudflare R2: https://developers.cloudflare.com/r2/

4. **Agentverse & ASI:One** (for agent discovery)
   - Agentverse: https://agentverse.ai/
   - ASI:One: https://asi.one/
   - Chat Protocol documentation: See `ASI_AGENTS_TRACK_SETUP.md`

5. **OAuth Providers** (for authentication)
   - Google Cloud Console: https://console.cloud.google.com/
   - GitHub OAuth Apps: https://github.com/settings/developers
   - Twitter Developer Portal: https://developer.twitter.com/

## 🎥 Demo Video

**Demo Video (3-5 minutes)**: [Watch on YouTube](https://www.youtube.com/watch?v=vVkr_wuyFSM)

This demo video demonstrates:
- Agent system functionality and real-time communication
- uAgents integration for news processing
- MeTTa Knowledge Graph usage for entity extraction
- Chat Protocol integration for ASI:One compatibility
- User experience and platform features

## 🛠️ Development

### Available Scripts

- `npm start` - Start React development server
- `npm run build` - Build for production
- `npm test` - Run tests

### Tech Stack

**Frontend**:
- React 18
- Styled Components
- Framer Motion
- React Router
- React Query
- Lucide React

**Backend**:
- FastAPI
- SQLAlchemy
- PyJWT
- httpx

**AI & ML**:
- Fetch.ai uAgents (News gathering)
- SingularityNET MeTTa (Knowledge graph)
- NLTK (Natural language processing)
- Scikit-learn (Machine learning)

**Cloudflare**:
- Workers (Backend)
- Pages (Frontend)
- D1 (Database)

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📞 Support

For support, please open an issue on GitHub or contact the development team.

## 🏆 Hackathon Submission Compliance

### ✅ Submission Requirements

#### Code Requirements
- ✅ **GitHub Repository**: Public repository available at https://github.com/chiku524/blockchainvibe
- ✅ **README.md with Agent Details**: 
  - Agent names: `blockchainvibe-news-fetcher` and `blockchainvibe-relevance-scorer`
  - Agent addresses: Generated from seeds (managed by uAgents framework)
  - All agents categorized under Innovation Lab (badges included)
- ✅ **Extra Resources**: Links to Fetch.ai uAgents, SingularityNET MeTTa, Cloudflare services, Agentverse, and OAuth providers
- ✅ **Innovation Lab Badges**: Included in README.md

#### Video Requirements
- ✅ **Demo Video**: 3-5 minute demo video available on YouTube
- ✅ **Video Link**: https://www.youtube.com/watch?v=vVkr_wuyFSM

#### Agent Requirements
- ✅ **Agentverse Registration**: Agents registered on Agentverse
- ✅ **Chat Protocol Enabled**: All agents have Chat Protocol enabled for ASI:One discovery
- ✅ **Innovation Lab Categorization**: All agents categorized under Innovation Lab

### ✅ Judging Criteria Compliance

#### 1. Functionality & Technical Implementation (25%)
- ✅ **Agent System Works**: Both agents function as intended with real-time news processing
- ✅ **Real-time Communication**: Agents communicate and reason in real-time
- ✅ **Proper Integration**: Full integration with Fetch.ai uAgents framework
- ✅ **Documentation**: Technical documentation in repo `docs/` and in-app `/docs`

#### 2. Use of ASI Alliance Tech (20%)
- ✅ **Agentverse Registration**: Both agents registered on Agentverse platform
- ✅ **Chat Protocol Live**: Chat Protocol enabled and live for ASI:One compatibility
- ✅ **uAgents Usage**: Extensive use of Fetch.ai uAgents framework for news processing
- ✅ **MeTTa Knowledge Graph**: Integration with SingularityNET MeTTa for entity extraction and reasoning
- ✅ **Agent Discovery**: Agents discoverable through ASI:One interface

#### 3. Innovation & Creativity (20%)
- ✅ **Original Solution**: AI-powered blockchain news aggregation with personalization
- ✅ **Creative Approach**: Combines multiple AI technologies (uAgents, MeTTa, ML) for intelligent news curation
- ✅ **Unconventional Method**: Uses autonomous agents for news processing rather than traditional APIs

#### 4. Real-World Impact & Usefulness (20%)
- ✅ **Meaningful Problem**: Addresses information overload in blockchain news ecosystem
- ✅ **User Value**: Provides personalized, relevant news tailored to user interests
- ✅ **Practical Application**: Can be used by blockchain enthusiasts, traders, researchers, and developers

#### 5. User Experience & Presentation (15%)
- ✅ **Clear Demo**: Comprehensive demo video showing all features
- ✅ **Well-Structured**: Organized documentation and code structure
- ✅ **Smooth UX**: Intuitive interface with dark/light themes, responsive design
- ✅ **Comprehensive Documentation**: Detailed documentation covering all technologies and integration

### 📚 Documentation

- **Project docs** (deployment, subscription, features): [docs/](docs/) in this repo — see [docs/README.md](docs/README.md) for the index.
- **User & API docs** (getting started, features, API reference, AI integration, architecture): served at **https://blockchainvibe.news/docs** (source: `public/docs/`).

### 🔗 Quick Links

- **GitHub Repository**: https://github.com/chiku524/blockchainvibe
- **Demo Video**: https://www.youtube.com/watch?v=vVkr_wuyFSM
- **Live Website**: https://blockchainvibe.news
- **Documentation**: https://blockchainvibe.news/docs

---

**Built with ❤️ for the blockchain community**