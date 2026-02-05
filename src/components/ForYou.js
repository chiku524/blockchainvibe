import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Clock, 
  RefreshCw,
  TrendingUp,
  Bookmark,
  Eye,
  Target,
  Brain
} from 'lucide-react';
import toast from 'react-hot-toast';

import NewsCard from './NewsCard';
import LoadingSpinner from './LoadingSpinner';
import { useQuery } from 'react-query';
import { newsAPI } from '../services/api';

const ForYouContainer = styled.div`
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

const ForYouHeader = styled.div`
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

const ForYouTitle = styled.h1`
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

const ForYouSubtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin: 0.5rem 0 0 0;
  font-size: ${props => props.theme.fontSize.sm};

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.fontSize.lg};
  }
`;

const PersonalizationInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 1rem;
  padding: 1rem;
  background: ${props => props.theme.colors.primary}10;
  border-radius: ${props => props.theme.borderRadius.md};
  border: 1px solid ${props => props.theme.colors.primary}20;
`;

const PersonalizationText = styled.span`
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.theme.colors.primary};
  font-weight: ${props => props.theme.fontWeight.medium};
`;

const AIPoweredBadge = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  margin-top: 0.75rem;
  padding: 0.35rem 0.75rem;
  background: ${props => props.theme.colors.primary}15;
  color: ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.fontSize.xs};
  font-weight: ${props => props.theme.fontWeight.medium};
  text-decoration: none;
  cursor: pointer;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.9;
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
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

const PreferenceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const PreferenceItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.md};
`;

const PreferenceIcon = styled.div`
  width: 2rem;
  height: 2rem;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary}20;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.primary};
`;

const PreferenceText = styled.div`
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

const ForYou = () => {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState('24h');
  const [page, setPage] = useState(1);
  const [allNews, setAllNews] = useState([]);

  const timeFilters = [
    { value: '24h', label: 'Today' },
    { value: '7d', label: 'This Week' },
    { value: '30d', label: 'This Month' }
  ];

  const { data: forYouData, isLoading, error, refetch } = useQuery(
    ['forYou', timeFilter, page],
    () => newsAPI.getPersonalizedNews({ 
      timeFilter, 
      page,
      limit: 10,
      user_profile: null // Let backend handle default profile
    }),
    {
      staleTime: 3 * 60 * 1000, // 3 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnMount: false, // Don't refetch on mount to prevent infinite loops
      keepPreviousData: true, // Keep previous data while loading new data
    }
  );

  useEffect(() => {
    if (forYouData?.articles) {
      if (page === 1) {
        setAllNews(forYouData.articles);
      } else {
        setAllNews(prev => {
          // Avoid duplicates when appending
          const existingIds = new Set(prev.map(a => a.id));
          const newArticles = forYouData.articles.filter(a => !existingIds.has(a.id));
          return [...prev, ...newArticles];
        });
      }
    }
  }, [forYouData, page]);

  useEffect(() => {
    // Reset page and clear news when timeFilter changes
    setPage(1);
    setAllNews([]);
  }, [timeFilter]);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const handleRefresh = () => {
    setPage(1);
    setAllNews([]);
    refetch();
    toast.success('For You feed refreshed!');
  };

  const [stats, setStats] = useState({ relevanceScore: '—', articlesRead: '—', savedArticles: '—', readingStreak: '—', statsAvailable: false });
  const [insights, setInsights] = useState({ peakHour: null, avgReadSec: 0, topSource: '—' });
  useEffect(() => {
    (async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user?.user_id || user?.id;
        if (!userId) {
          setStats(prev => ({ ...prev, relevanceScore: '—', articlesRead: '—', savedArticles: '—', readingStreak: '—', statsAvailable: false }));
          return;
        }
        const res = await fetch(`${process.env.REACT_APP_API_URL_PROD || 'https://blockchainvibe-api.nico-chikuji.workers.dev'}/api/analytics/summary?userId=${encodeURIComponent(userId)}`);
        const data = await res.json();
        if (!res.ok || !data?.success) {
          setStats(prev => ({ ...prev, statsAvailable: false }));
          return;
        }
        setStats({
          relevanceScore: '—',
          articlesRead: data.articlesRead ?? 0,
          savedArticles: '—',
          readingStreak: '—',
          statsAvailable: true
        });
        setInsights({
          peakHour: data.peakReadingHour ?? null,
          avgReadSec: data.avgReadSeconds ?? 0,
          topSource: (data.topSources && data.topSources[0]?.source) ? data.topSources[0].source : '—'
        });
      } catch (_) {
        setStats(prev => ({ ...prev, statsAvailable: false }));
      }
    })();
  }, []);

  const userPreferencesNote = 'Sign in and read articles to see your preferences and insights here.';

  if (isLoading && page === 1) {
    return (
      <ForYouContainer>
        <LoadingSpinner message="Personalizing your feed..." />
      </ForYouContainer>
    );
  }

  if (error) {
    return (
      <ForYouContainer>
        <EmptyState>
          <EmptyStateIcon>⚠️</EmptyStateIcon>
          <EmptyStateTitle>Error Loading Your Feed</EmptyStateTitle>
          <EmptyStateDescription>
            There was an error loading your personalized feed. Please try again.
          </EmptyStateDescription>
          <FilterButton onClick={handleRefresh}>
            <RefreshCw size={18} />
            Try Again
          </FilterButton>
        </EmptyState>
      </ForYouContainer>
    );
  }

  return (
    <ForYouContainer>
      <ForYouHeader>
        <HeaderContent>
          <ForYouTitle>
            <Sparkles size={32} />
            For You
          </ForYouTitle>
          <ForYouSubtitle>
            Articles curated specifically for your interests and reading patterns
          </ForYouSubtitle>
          
          <PersonalizationInfo>
            <Brain size={16} />
            <PersonalizationText>
              AI-powered recommendations based on your reading history and preferences
            </PersonalizationText>
          </PersonalizationInfo>
          <AIPoweredBadge as="button" type="button" onClick={() => navigate('/ai-insights')}>
            <Sparkles size={12} />
            Insights & agents
          </AIPoweredBadge>
        </HeaderContent>
        
        <FilterControls>
          <FilterButton onClick={handleRefresh} disabled={isLoading}>
            <RefreshCw size={16} />
            Refresh
          </FilterButton>
        </FilterControls>
      </ForYouHeader>

      {(forYouData?.serviceUnavailable || forYouData?.message) && (
        <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.5)', borderRadius: '8px', color: 'inherit' }}>
          <strong>Service notice:</strong> {forYouData?.message || 'News service is temporarily unavailable. Please try again later.'}
        </div>
      )}

      <StatsGrid>
        <StatCard>
          <StatIcon>
            <Target size={20} />
          </StatIcon>
          <StatValue>{stats.relevanceScore}</StatValue>
          <StatLabel>Relevance Score</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon>
            <Eye size={20} />
          </StatIcon>
          <StatValue>{typeof stats.articlesRead === 'number' ? stats.articlesRead : '—'}</StatValue>
          <StatLabel>Articles Read</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon>
            <Bookmark size={20} />
          </StatIcon>
          <StatValue>{stats.savedArticles}</StatValue>
          <StatLabel>Saved Articles</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatIcon>
            <TrendingUp size={20} />
          </StatIcon>
          <StatValue>{stats.readingStreak}</StatValue>
          <StatLabel>Day Streak</StatLabel>
        </StatCard>
      </StatsGrid>

      <FilterControls style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {timeFilters.map(filter => (
            <FilterButton
              key={filter.value}
              active={timeFilter === filter.value}
              onClick={() => setTimeFilter(filter.value)}
            >
              <Clock size={14} />
              {filter.label}
            </FilterButton>
          ))}
        </div>
      </FilterControls>

      <ContentGrid>
        <NewsSection>
          <SectionTitle>
            <Sparkles size={24} />
            Recommended for You
          </SectionTitle>
          
          <NewsGrid>
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
                    showRelevance={true}
                    relevanceScore={article.relevance_score != null ? Math.round((article.relevance_score || 0) * 100) : null}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
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
                  <Sparkles size={16} />
                  Load More Recommendations
                </>
              )}
            </LoadMoreButton>
          )}
        </NewsSection>

        <Sidebar>
          <SidebarCard>
            <SidebarTitle>Your Preferences</SidebarTitle>
            <PreferenceList>
              <PreferenceItem>
                <PreferenceIcon><Target size={14} /></PreferenceIcon>
                <PreferenceText>{userPreferencesNote}</PreferenceText>
              </PreferenceItem>
            </PreferenceList>
          </SidebarCard>

          <SidebarCard>
            <SidebarTitle>Reading Insights</SidebarTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Peak Reading Time</span>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>{insights.peakHour === null ? '—' : `${insights.peakHour}:00`}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Avg. Read Time</span>
                <span style={{ color: '#3b82f6' }}>{Math.round(insights.avgReadSec)}s</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Top Source</span>
                <span style={{ color: '#8b5cf6' }}>{insights.topSource}</span>
              </div>
            </div>
          </SidebarCard>
        </Sidebar>
      </ContentGrid>
    </ForYouContainer>
  );
};

export default ForYou;
