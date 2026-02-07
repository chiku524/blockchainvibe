import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  TrendingUp,
  RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

import NewsCard from './NewsCard';
import NewsCardSkeleton from './NewsCardSkeleton';
import ErrorState from './ErrorState';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { useNews } from '../hooks/useNews';
import { useUser } from '../hooks/useUser';
import PageMeta from './PageMeta';
import { getErrorMessage } from '../utils/errorHandler';
import { newsAPI, getNewsApiBase } from '../services/api';

const FeedContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  min-height: 100vh;
  position: relative;
  z-index: 2;
  width: 100%;
  box-sizing: border-box;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: 1.5rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    padding: 2rem;
  }
`;

const FeedHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.borderRadius.lg};
  border: 1px solid ${props => props.theme.colors.border};
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 1rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    padding: 1.5rem;
    margin-bottom: 2rem;
  }
`;

const FeedTitle = styled.h1`
  font-size: ${props => props.theme.fontSize['2xl']};
  font-weight: ${props => props.theme.fontWeight.bold};
  background: ${props => props.theme.gradients.text};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  word-break: break-word;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.fontSize['3xl']};
  }
`;

const FeedSubtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin: 0.5rem 0 0 0;
  font-size: ${props => props.theme.fontSize.sm};

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.fontSize.lg};
  }
`;

const FeedControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    justify-content: space-between;
  }
`;

const ControlButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSize.sm};
  font-weight: ${props => props.theme.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    border-color: ${props => props.theme.colors.primary};
  }
  
  &:active:not(:disabled) {
    transform: scale(0.92);
    opacity: 0.85;
    background: ${props => props.theme.colors.surfaceHover};
  }
  
  &.active {
    background: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.textInverse};
    border-color: ${props => props.theme.colors.primary};
  }

  &:disabled {
    opacity: 0.8;
    cursor: wait;
    pointer-events: none;
  }
  
  &.pressed {
    transform: scale(0.92);
    opacity: 0.85;
    background: ${props => props.theme.colors.surfaceHover};
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.1);
  }
`;

const FilterBar = styled.div`
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: 1rem;
    margin-top: 1rem;
    margin-bottom: 1rem;
    gap: 1rem;
  }
`;

const SelectGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SelectLabel = styled.span`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSize.sm};
`;

const Select = styled.select`
  padding: 0.6rem 0.8rem;
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSize.sm};
  transition: all ${props => props.theme.transitions.fast};
  min-width: 150px;
  &:hover { border-color: ${props => props.theme.colors.primary}; }
  &:focus { outline: none; box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20; border-color: ${props => props.theme.colors.primary}; }
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1.5rem;
  text-align: center;
  transition: transform ${props => props.theme.transitions.fast};
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.fontSize['2xl']};
  font-weight: ${props => props.theme.fontWeight.bold};
  color: ${props => props.theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSize.sm};
  font-weight: ${props => props.theme.fontWeight.medium};
`;

const NewsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
`;

const FeaturedNews = styled.div`
  grid-column: 1 / -1;
  margin-bottom: 2rem;
`;

const LoadMoreButton = styled.button`
  width: 100%;
  padding: 1rem 2rem;
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.fontSize.lg};
  font-weight: ${props => props.theme.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  
  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    border-color: ${props => props.theme.colors.primary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${props => props.theme.colors.textSecondary};
`;

const EmptyStateIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
`;

const EmptyStateTitle = styled.h3`
  font-size: ${props => props.theme.fontSize.xl};
  font-weight: ${props => props.theme.fontWeight.semibold};
  margin-bottom: 0.5rem;
  color: ${props => props.theme.colors.text};
`;

const EmptyStateDescription = styled.p`
  font-size: ${props => props.theme.fontSize.lg};
  margin-bottom: 2rem;
`;

const TrendingStrip = styled.div`
  margin-bottom: 1rem;
`;
const TrendingStripScroll = styled.div`
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.25rem 0;
`;
const TrendingChip = styled.button`
  flex-shrink: 0;
  padding: 0.5rem 1rem;
  border-radius: ${props => props.theme.borderRadius.full};
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSize.sm};
  font-weight: 500;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primary}10;
  }
`;

const TRENDING_TERMS = ['Bitcoin', 'Ethereum', 'Solana', 'DeFi', 'NFT', 'Airdrops', 'Layer 2', 'Web3'];

const NewsFeed = ({ category, timeframe, searchQuery }) => {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState('relevance');
  const [page, setPage] = useState(1);
  const [allNews, setAllNews] = useState([]);
  const [timeFilter, setTimeFilter] = useState(timeframe || '24h');
  const [categoryFilter, setCategoryFilter] = useState(category || 'all');

  const timeFilters = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: 'all', label: 'All Time' }
  ];

  const staticCategoryFilters = [
    { value: 'all', label: 'All Categories' },
    { value: 'defi', label: 'DeFi' },
    { value: 'nft', label: 'NFTs' },
    { value: 'layer2', label: 'Layer 2' },
    { value: 'web3', label: 'Web3' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'regulation', label: 'Regulation' }
  ];

  const { data: categoriesData } = useQuery(
    ['categories'],
    () => newsAPI.getCategories(),
    { staleTime: 10 * 60 * 1000, cacheTime: 15 * 60 * 1000 }
  );

  const categoryFilters = (categoriesData?.categories?.length > 0)
    ? [
        { value: 'all', label: 'All Categories' },
        ...categoriesData.categories.map((c) => ({
          value: (c.name || '').toLowerCase().replace(/\s+/g, '-'),
          label: c.count != null ? `${c.name} (${c.count})` : c.name
        }))
      ]
    : staticCategoryFilters;

  const { data: newsData, isLoading, error, refetch, isFetching } = useNews({
    category: categoryFilter,
    timeframe: timeFilter === 'all' ? null : timeFilter,
    searchQuery,
    sortBy,
    page,
    type: 'personalized'
  });

  const { trackActivity } = useUser();

  // Normalize API response to a consistent shape for NewsCard (works with NewsAPI, CryptoCompare, RSS)
  const normalizeForDisplay = (a) => ({
    ...a,
    id: a.id || `news-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    title: a.title || a.headline || 'Untitled',
    url: a.url || a.link || '#',
    summary: a.summary || a.description || '',
    excerpt: a.excerpt || (a.summary || a.description || '').substring(0, 200),
    content: a.content || a.summary || a.description || '',
    image_url: a.image_url || a.urlToImage || a.imageurl || null,
    source: a.source?.name || (typeof a.source === 'string' ? a.source : null) || 'News',
    published_at: a.published_at || a.publishedAt || new Date().toISOString(),
    author: a.author || null,
    categories: a.categories || ['general'],
  });

  useEffect(() => {
    if (newsData?.news && Array.isArray(newsData.news)) {
      const items = newsData.news.map(normalizeForDisplay).filter((a) => a.title && a.url && a.url !== '#');
      if (page === 1) {
        setAllNews(items);
      } else {
        setAllNews((prev) => {
          const existingIds = new Set(prev.map((a) => a.id));
          const newArticles = items.filter((a) => !existingIds.has(a.id));
          return [...prev, ...newArticles];
        });
      }
    }
  }, [newsData, page]);

  useEffect(() => {
    // Reset page and clear news when filters change
    setPage(1);
    setAllNews([]);
  }, [categoryFilter, timeFilter, searchQuery, sortBy]);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const [refreshPressed, setRefreshPressed] = useState(false);
  const handleRefresh = () => {
    setRefreshPressed(true);
    setTimeout(() => setRefreshPressed(false), 200);
    setPage(1);
    setAllNews([]);
    refetch().then(() => {
      toast.success('News feed refreshed!');
    }).catch(() => {
      toast.error('Could not refresh. Try again.');
    });
  };

  const handleNewsInteraction = async (newsId, action) => {
    try {
      await trackActivity({
        newsId,
        action,
        timestamp: new Date().toISOString()
      });
      
      toast.success(`News ${action}ed successfully!`);
    } catch (error) {
      toast.error(`Failed to ${action} news`);
    }
  };

  if (isLoading && page === 1) {
    return (
      <FeedContainer>
        <FeedHeader>
          <FeedTitle>News Hub</FeedTitle>
          <FeedSubtitle>Loading…</FeedSubtitle>
        </FeedHeader>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {[...Array(6)].map((_, i) => (
            <NewsCardSkeleton key={i} />
          ))}
        </div>
      </FeedContainer>
    );
  }

  if (error) {
    return (
      <FeedContainer>
        <ErrorState
          title="Error loading news"
          message={getErrorMessage(error)}
          onRetry={() => { setPage(1); setAllNews([]); refetch(); }}
          isRetrying={isFetching}
        />
      </FeedContainer>
    );
  }

  if (!allNews || allNews.length === 0) {
    const serviceUnavailable = newsData?.serviceUnavailable || newsData?.message;
    const apiOrigin = getNewsApiBase();
    return (
      <FeedContainer>
        {serviceUnavailable && (
          <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.5)', borderRadius: '8px', color: 'inherit' }}>
            <strong>Service notice:</strong> {newsData?.message || 'We couldn’t load news right now. Please try again in a moment.'}
            <div style={{ marginTop: '0.75rem', fontSize: '0.875rem', opacity: 0.9 }}>
              <strong>What we fetch:</strong> The app requests articles from the BlockchainVibe API (your Cloudflare Worker), which tries RSS feeds (CoinDesk, CoinTelegraph, etc.), the CryptoCompare news API (no key), and optionally NewsAPI when keys are set. You see this when the API responded but returned zero articles — both the main aggregator and the CryptoCompare fallback came back empty.
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', opacity: 0.9 }}>
              <strong>Common causes:</strong> (1) Worker not deployed or outdated — run <code style={{ background: 'rgba(0,0,0,0.1)', padding: '0.1em 0.3em', borderRadius: 4 }}>cd server &amp;&amp; npx wrangler deploy</code>. (2) Wrong API URL — we are calling <strong>{apiOrigin || 'unknown'}</strong>. (3) External sources unreachable from the worker.
            </div>
          </div>
        )}
        <EmptyState>
          <EmptyStateIcon>📰</EmptyStateIcon>
          <EmptyStateTitle>{serviceUnavailable ? 'News temporarily unavailable' : 'No news found'}</EmptyStateTitle>
          <EmptyStateDescription>
            {serviceUnavailable
              ? (newsData?.message || 'We couldn’t load news right now. Please try again in a moment.')
              : searchQuery
                ? `No news found for "${searchQuery}". Try a different search term.`
                : 'No news available for the selected filters. Try adjusting your preferences.'
            }
          </EmptyStateDescription>
          <ControlButton
            onClick={handleRefresh}
            disabled={isFetching}
            aria-busy={isFetching}
            className={refreshPressed || isFetching ? 'pressed' : ''}
          >
            <RefreshCw size={18} className={isFetching ? 'animate-spin' : undefined} />
            {isFetching ? 'Loading...' : 'Try Again'}
          </ControlButton>
        </EmptyState>
      </FeedContainer>
    );
  }

  const featuredNews = allNews[0];
  const regularNews = allNews.slice(1);

  const serviceUnavailable = newsData?.serviceUnavailable || newsData?.message;

  return (
    <FeedContainer>
      <PageMeta
        title={searchQuery ? `Search: ${searchQuery}` : undefined}
        description={searchQuery ? `Search results for "${searchQuery}" in crypto and blockchain news.` : undefined}
      />
      {serviceUnavailable && (
        <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.5)', borderRadius: '8px', color: 'inherit' }}>
          <strong>Service notice:</strong> {newsData?.message || 'We couldn’t load news right now. Please try again in a moment.'}
        </div>
      )}
      <FeedHeader>
        <div>
          <FeedTitle>
            {searchQuery ? `Search Results for "${searchQuery}"` : 'News Hub'}
          </FeedTitle>
          <FeedSubtitle>
            {newsData?.total_count || allNews.length} articles • 
            {newsData?.user_relevance_score ? 
              `${Math.round(newsData.user_relevance_score * 100)}% relevance` : 
              'Personalized for you'
            }
          </FeedSubtitle>
        </div>
        
        <FeedControls>
          <ControlButton
            className={sortBy === 'relevance' ? 'active' : ''}
            onClick={() => setSortBy('relevance')}
          >
            <TrendingUp size={18} />
            Relevance
          </ControlButton>
          
          <ControlButton
            className={sortBy === 'time' ? 'active' : ''}
            onClick={() => setSortBy('time')}
          >
            <Clock size={18} />
            Time
          </ControlButton>
          
          <ControlButton
            onClick={handleRefresh}
            disabled={isFetching}
            aria-busy={isFetching}
            title={isFetching ? 'Refreshing...' : 'Refresh feed'}
            className={refreshPressed || isFetching ? 'pressed' : ''}
          >
            <RefreshCw size={18} className={isFetching ? 'animate-spin' : undefined} />
            {isFetching ? 'Refreshing...' : 'Refresh'}
          </ControlButton>
        </FeedControls>
      </FeedHeader>

      {!searchQuery && (
        <TrendingStrip>
          <TrendingStripScroll>
            {TRENDING_TERMS.map((term) => (
              <TrendingChip key={term} type="button" onClick={() => navigate(`/search?q=${encodeURIComponent(term)}`)}>
                {term}
              </TrendingChip>
            ))}
          </TrendingStripScroll>
        </TrendingStrip>
      )}

      <FilterBar>
        <SelectGroup>
          <SelectLabel htmlFor="newsfeed-timeframe">Timeframe</SelectLabel>
          <Select id="newsfeed-timeframe" name="timeframe" value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} aria-label="Timeframe">
            {timeFilters.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </Select>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel htmlFor="newsfeed-category">Category</SelectLabel>
          <Select id="newsfeed-category" name="category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} aria-label="Category">
            {categoryFilters.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </Select>
        </SelectGroup>
      </FilterBar>

      {!searchQuery && categoryFilters.length > 0 && (
        <TrendingStrip>
          <TrendingStripScroll>
            {categoryFilters.map((f) => (
              <TrendingChip
                key={f.value}
                type="button"
                className={categoryFilter === f.value ? 'active' : ''}
                onClick={() => setCategoryFilter(f.value)}
                style={categoryFilter === f.value ? { borderColor: 'var(--primary)', color: 'var(--primary)', background: 'var(--primary)15' } : {}}
              >
                {f.value === 'all' ? 'All' : f.label.replace(/\s*\(\d+\)\s*$/, '').trim() || f.value}
              </TrendingChip>
            ))}
          </TrendingStripScroll>
        </TrendingStrip>
      )}

      {newsData && (
        <StatsContainer>
          <StatCard>
            <StatValue>{newsData.total_count || 0}</StatValue>
            <StatLabel>Total Articles</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{Math.round((newsData.user_relevance_score || 0) * 100)}%</StatValue>
            <StatLabel>Relevance Score</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{timeFilter}</StatValue>
            <StatLabel>Time Frame</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>{categoryFilter}</StatValue>
            <StatLabel>Category</StatLabel>
          </StatCard>
        </StatsContainer>
      )}

      <NewsGrid>
        {featuredNews && (
          <FeaturedNews>
            <NewsCard
              news={featuredNews}
              featured
              onInteraction={handleNewsInteraction}
            />
          </FeaturedNews>
        )}
        
        <AnimatePresence>
          {regularNews.map((news, index) => (
            <motion.div
              key={news.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <NewsCard
                news={news}
                onInteraction={handleNewsInteraction}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </NewsGrid>

      {newsData?.has_more && (
        <LoadMoreButton
          onClick={handleLoadMore}
          disabled={isFetching}
          aria-busy={isFetching}
        >
          {isFetching ? (
            <>
              <RefreshCw size={18} className="animate-spin" />
              Loading more news...
            </>
          ) : (
            'Load More News'
          )}
        </LoadMoreButton>
      )}
    </FeedContainer>
  );
};

export default NewsFeed;
