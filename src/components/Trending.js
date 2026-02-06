import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  Eye, 
  Heart, 
  MessageCircle,
  RefreshCw,
  Zap
} from 'lucide-react';
import toast from 'react-hot-toast';

import NewsCard from './NewsCard';
import NewsCardSkeleton from './NewsCardSkeleton';
import { useQuery } from 'react-query';
import { newsAPI } from '../services/api';

const TrendingContainer = styled.div`
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

const TrendingHeader = styled.div`
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
    padding: 2rem;
    margin-bottom: 2rem;
  }
`;

const HeaderContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const TrendingTitle = styled.h1`
  font-size: ${props => props.theme.fontSize['2xl']};
  font-weight: ${props => props.theme.fontWeight.bold};
  background: ${props => props.theme.gradients.text};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  word-break: break-word;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.fontSize['3xl']};
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    font-size: ${props => props.theme.fontSize['4xl']};
  }
`;

const TrendingSubtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin: 0.5rem 0 0 0;
  font-size: ${props => props.theme.fontSize.sm};

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.fontSize.lg};
  }
`;

const FilterControls = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    justify-content: space-between;
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: ${props => props.active ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.active ? props.theme.colors.textInverse : props.theme.colors.textSecondary};
  border: 1px solid ${props => props.active ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSize.sm};
  font-weight: ${props => props.theme.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background: ${props => props.active ? props.theme.colors.primaryHover : props.theme.colors.hover};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const SelectRow = styled.div`
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
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
  min-width: 160px;
  &:hover { border-color: ${props => props.theme.colors.primary}; }
  &:focus { outline: none; box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20; border-color: ${props => props.theme.colors.primary}; }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 2rem;
  }
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1.5rem;
  text-align: center;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const StatIcon = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  background: ${props => props.gradient || props.theme.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
  color: ${props => props.theme.colors.textInverse};
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.fontSize['2xl']};
  font-weight: ${props => props.theme.fontWeight.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const NewsSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.fontSize.xl};
  font-weight: ${props => props.theme.fontWeight.bold};
  color: ${props => props.theme.colors.text};
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const NewsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const LoadMoreButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 1rem;
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.textInverse};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSize.base};
  font-weight: ${props => props.theme.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  margin-top: 2rem;
  
  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const Sidebar = styled.aside`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const SidebarCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1.5rem;
`;

const SidebarTitle = styled.h3`
  font-size: ${props => props.theme.fontSize.lg};
  font-weight: ${props => props.theme.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0 0 1rem 0;
`;

const TrendingList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const TrendingItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background: ${props => props.theme.colors.primary}10;
    transform: translateX(4px);
  }
`;

const TrendingNumber = styled.div`
  width: 1.5rem;
  height: 1.5rem;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.textInverse};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: ${props => props.theme.fontSize.xs};
  font-weight: ${props => props.theme.fontWeight.bold};
`;

const TrendingText = styled.div`
  flex: 1;
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.theme.colors.text};
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
  font-weight: ${props => props.theme.fontWeight.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 1rem;
`;

const EmptyStateDescription = styled.p`
  font-size: ${props => props.theme.fontSize.lg};
  margin-bottom: 2rem;
`;

const Trending = () => {
  const [timeFilter, setTimeFilter] = useState('24h');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [sortBy, setSortBy] = useState('engagement');
  const [page, setPage] = useState(1);
  const [allNews, setAllNews] = useState([]);

  const timeFilters = [
    { value: '24h', label: '24 Hours' },
    { value: '7d', label: '7 Days' },
    { value: '30d', label: '30 Days' },
    { value: 'all', label: 'All Time' }
  ];

  const categoryFilters = [
    { value: 'all', label: 'All Categories' },
    { value: 'defi', label: 'DeFi' },
    { value: 'nft', label: 'NFTs' },
    { value: 'layer2', label: 'Layer 2' },
    { value: 'web3', label: 'Web3' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'regulation', label: 'Regulation' }
  ];

  const sortOptions = [
    { value: 'engagement', label: 'Most Engaged' },
    { value: 'views', label: 'Most Views' },
    { value: 'likes', label: 'Most Liked' },
    { value: 'comments', label: 'Most Discussed' },
    { value: 'recent', label: 'Most Recent' }
  ];

  const { data: trendingData, isLoading, error, refetch } = useQuery(
    ['trending', timeFilter, categoryFilter, sortBy, page],
    () => newsAPI.getTrendingNews({ 
      timeFilter: timeFilter === 'all' ? null : timeFilter, 
      categoryFilter, 
      sortBy, 
      page,
      limit: 10 
    }),
    {
      staleTime: 2 * 60 * 1000, // 2 minutes
      cacheTime: 5 * 60 * 1000, // 5 minutes
      refetchOnMount: false, // Don't refetch on mount to prevent infinite loops
      refetchOnWindowFocus: false, // Don't refetch on window focus
      keepPreviousData: true, // Keep previous data while loading new data
      // Show cached data immediately while fetching
      placeholderData: (previousData) => previousData,
    }
  );


  const trendingTopicLabels = allNews.length > 0
    ? [...new Set(allNews.flatMap(a => (a.categories || []).filter(Boolean)))].slice(0, 8)
    : [];

  useEffect(() => {
    if (trendingData?.articles) {
      if (page === 1) {
        setAllNews(trendingData.articles);
      } else {
        setAllNews(prev => {
          // Avoid duplicates when appending
          const existingIds = new Set(prev.map(a => a.id));
          const newArticles = trendingData.articles.filter(a => !existingIds.has(a.id));
          return [...prev, ...newArticles];
        });
      }
    }
  }, [trendingData, page]);

  useEffect(() => {
    // Reset page and clear news when filters change
    setPage(1);
    setAllNews([]);
  }, [timeFilter, categoryFilter, sortBy]);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleRefresh = () => {
    setPage(1);
    setAllNews([]);
    refetch();
    toast.success('Trending news refreshed!');
  };

  const totalArticles = allNews.length;
  const uniqueSources = Array.from(new Set(allNews.map(a => a.source).filter(Boolean))).length;
  const totalWithImages = allNews.filter(a => a.image_url).length;
  const latestUpdated = trendingData?.last_updated;

  // Show skeleton loaders while loading (instead of full spinner)
  const showSkeletons = isLoading && page === 1 && (!allNews || allNews.length === 0);

  if (error) {
    return (
      <TrendingContainer>
        <EmptyState>
          <EmptyStateIcon>⚠️</EmptyStateIcon>
          <EmptyStateTitle>Error Loading Trending News</EmptyStateTitle>
          <EmptyStateDescription>
            There was an error loading the trending news. Please try again.
          </EmptyStateDescription>
          <FilterButton onClick={handleRefresh}>
            <RefreshCw size={18} />
            Try Again
          </FilterButton>
        </EmptyState>
      </TrendingContainer>
    );
  }

  const serviceUnavailable = trendingData?.serviceUnavailable || trendingData?.message;

  return (
    <TrendingContainer>
      {serviceUnavailable && (
        <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.5)', borderRadius: '8px', color: 'inherit' }}>
          <strong>Service notice:</strong> {trendingData?.message || 'We couldn’t load news right now. Please try again in a moment.'}
        </div>
      )}
      <TrendingHeader>
        <HeaderContent>
          <TrendingTitle>
            <TrendingUp size={32} />
            Trending Now
          </TrendingTitle>
          <TrendingSubtitle>
            The most popular blockchain articles across the community
          </TrendingSubtitle>
        </HeaderContent>
        
        <FilterControls>
          <FilterButton onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw size={16} />
            Refresh
          </FilterButton>
        </FilterControls>
      </TrendingHeader>

      <StatsGrid>
        <StatCard>
          <StatIcon>
            <Eye size={20} />
          </StatIcon>
          <StatValue>{totalArticles}</StatValue>
          <StatLabel>Trending Articles</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon>
            <Heart size={20} />
          </StatIcon>
          <StatValue>{uniqueSources}</StatValue>
          <StatLabel>Unique Sources</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon>
            <MessageCircle size={20} />
          </StatIcon>
          <StatValue>{totalWithImages}</StatValue>
          <StatLabel>Articles with Images</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon>
            <TrendingUp size={20} />
          </StatIcon>
          <StatValue>{latestUpdated ? new Date(latestUpdated).toLocaleTimeString() : '—'}</StatValue>
          <StatLabel>Last Updated</StatLabel>
        </StatCard>
      </StatsGrid>

      <FilterControls style={{ marginBottom: '2rem' }}>
        <SelectRow>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SelectLabel htmlFor="trending-timeframe">Timeframe</SelectLabel>
            <Select id="trending-timeframe" name="timeframe" value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} aria-label="Timeframe">
              {timeFilters.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </Select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SelectLabel htmlFor="trending-category">Category</SelectLabel>
            <Select id="trending-category" name="category" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} aria-label="Category">
              {categoryFilters.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </Select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <SelectLabel htmlFor="trending-sort">Sort</SelectLabel>
            <Select id="trending-sort" name="sortBy" value={sortBy} onChange={(e) => setSortBy(e.target.value)} aria-label="Sort">
              {sortOptions.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </Select>
          </div>
        </SelectRow>
      </FilterControls>

      <ContentGrid>
        <NewsSection>
          <SectionTitle>
            <TrendingUp size={24} />
            Most Popular Articles
          </SectionTitle>
          
          <NewsGrid>
            {showSkeletons ? (
              // Show skeleton loaders while loading
              Array.from({ length: 6 }).map((_, index) => (
                <NewsCardSkeleton key={`skeleton-${index}`} />
              ))
            ) : (
              <AnimatePresence>
                {allNews.map((article, index) => (
                  <motion.div
                    key={article.id || index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <NewsCard
                      article={article}
                      onBookmark={() => {}}
                      onLike={() => {}}
                      onShare={() => {}}
                      showEngagement={true}
                      rank={index + 1}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </NewsGrid>

          {allNews.length > 0 && (
            <LoadMoreButton onClick={handleLoadMore} disabled={isLoading}>
              {isLoading ? (
                <>
                  <RefreshCw size={16} className="animate-spin" />
                  Loading...
                </>
              ) : (
                <>
                  <Zap size={16} />
                  Load More Trending Articles
                </>
              )}
            </LoadMoreButton>
          )}
        </NewsSection>

        <Sidebar>
          <SidebarCard>
            <SidebarTitle>Trending Topics</SidebarTitle>
            <TrendingList>
              {trendingTopicLabels.length > 0 ? trendingTopicLabels.map((topic, index) => (
                <TrendingItem key={topic}>
                  <TrendingNumber>{index + 1}</TrendingNumber>
                  <TrendingText>{topic}</TrendingText>
                </TrendingItem>
              )) : (
                <TrendingText style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.875rem' }}>Topics appear from the articles in the feed above.</TrendingText>
              )}
            </TrendingList>
          </SidebarCard>

          <SidebarCard>
            <SidebarTitle>Top Sources</SidebarTitle>
            <TrendingList>
              {uniqueSources > 0 ? Array.from(new Set(allNews.map(a => a.source).filter(Boolean))).slice(0, 5).map((source, index) => (
                <TrendingItem key={source}>
                  <TrendingNumber>{index + 1}</TrendingNumber>
                  <TrendingText>{source}</TrendingText>
                </TrendingItem>
              )) : (
                <TrendingText style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.875rem' }}>Sources appear when articles are loaded.</TrendingText>
              )}
            </TrendingList>
          </SidebarCard>
        </Sidebar>
      </ContentGrid>
    </TrendingContainer>
  );
};

export default Trending;
