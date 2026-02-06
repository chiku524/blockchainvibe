import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  TrendingUp, 
  RefreshCw, 
  Search,
  ChevronRight,
  Sparkles,
  Newspaper,
  Gift
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';

import NewsCard from '../NewsCard';
import NewsCardSkeleton from '../NewsCardSkeleton';
import ProfileCompletionModal from '../Auth/ProfileCompletionModal';
import TrendingCoinsWidget from '../Launches/TrendingCoinsWidget';
import AirdropsWidget from '../Launches/AirdropsWidget';
import LaunchesCalendar from '../Launches/LaunchesCalendar';
import { newsAPI, launchesAPI } from '../../services/api';
import { handleApiError } from '../../utils/errorHandler';
import { useAIInsights } from '../../hooks/useAI';

const DashboardContainer = styled.div`
  min-height: 100vh;
  padding: 1rem;
  position: relative;
  z-index: 2;
  max-width: 100%;
  box-sizing: border-box;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: 1.5rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    padding: 2rem;
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    align-items: stretch;
    margin-bottom: 1rem;
  }
`;

const Title = styled.h1`
  font-size: ${props => props.theme.fontSize['2xl']};
  font-weight: ${props => props.theme.fontWeight.bold};
  color: ${props => props.theme.colors.text};
  margin: 0;
  word-break: break-word;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.fontSize['3xl']};
  }
`;

const Subtitle = styled.p`
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0.5rem 0 0 0;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.fontSize.lg};
  }
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 0.75rem;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    width: 100%;
  }
`;

const HubQuickLinks = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const HubQuickLinkCard = styled.button`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  color: ${props => props.theme.colors.text};
  text-align: left;
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    box-shadow: ${props => props.theme.shadows.md};
  }
`;

const HubQuickLinkIcon = styled.div`
  width: 44px;
  height: 44px;
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.primary}18;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.primary};
`;

const HubQuickLinkLabel = styled.span`
  font-size: ${props => props.theme.fontSize.base};
  font-weight: ${props => props.theme.fontWeight.semibold};
`;
const HubQuickLinkDesc = styled.span`
  display: block;
  font-size: ${props => props.theme.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 0.15rem;
`;

const TrendingStrip = styled.div`
  margin-bottom: 1.5rem;
`;

const TrendingStripLabel = styled.span`
  font-size: ${props => props.theme.fontSize.xs};
  font-weight: ${props => props.theme.fontWeight.semibold};
  color: ${props => props.theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.05em;
  display: block;
  margin-bottom: 0.5rem;
`;

const TrendingStripScroll = styled.div`
  display: flex;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 0.25rem 0;
  scrollbar-width: thin;

  &::-webkit-scrollbar {
    height: 4px;
  }
`;

const TrendingChip = styled.button`
  flex-shrink: 0;
  padding: 0.5rem 1rem;
  border-radius: ${props => props.theme.borderRadius.full};
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSize.sm};
  font-weight: ${props => props.theme.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};

  &:hover {
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.primary}10;
  }
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
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.fontSize['2xl']};
  font-weight: ${props => props.theme.fontWeight.bold};
  color: ${props => props.theme.colors.primary};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.fontSize.xl};
  font-weight: ${props => props.theme.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin: 2rem 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchInput = styled.input`
  width: 100%;
  min-width: 0;
  max-width: 300px;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSize.sm};
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }

  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
  }

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    max-width: none;
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 0.75rem;
  color: ${props => props.theme.colors.textSecondary};
  width: 1.25rem;
  height: 1.25rem;
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.textInverse};
  border: none;
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.fontSize.sm};
  font-weight: ${props => props.theme.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;



const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
  }
`;

const NewsSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1rem;
  min-width: 0;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: 1.5rem;
  }
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;


const ViewAllButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  color: ${props => props.theme.colors.primary};
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSize.sm};
  font-weight: ${props => props.theme.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.textInverse};
  }
`;

const NewsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
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

const LaunchesWidgetsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const LaunchesWidgetWrap = styled.div`
  min-height: 0;
`;

const SidebarTitle = styled.h3`
  font-size: ${props => props.theme.fontSize.lg};
  font-weight: ${props => props.theme.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0 0 1rem 0;
`;

const SidebarCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.75rem;
`;

const ReminderItem = styled.a`
  display: block;
  padding: 0.5rem 0;
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.theme.colors.text};
  text-decoration: none;
  border-bottom: 1px solid ${props => props.theme.colors.border};

  &:last-child {
    border-bottom: none;
  }
  &:hover {
    color: ${props => props.theme.colors.primary};
  }
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

const MY_TOPICS_KEY = 'blockchainvibe_my_topics';
const AIRDROP_REMINDERS_KEY = 'blockchainvibe_airdrop_reminders';

const loadJson = (key, def = []) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : def;
  } catch {
    return def;
  }
};

const DashboardContent = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState({ articlesRead: 0, timeSpentMinutes: 0 });
  const [myTopics, setMyTopics] = useState(() => loadJson(MY_TOPICS_KEY, []));
  const [airdropReminders, setAirdropReminders] = useState(() => loadJson(AIRDROP_REMINDERS_KEY, []));
  const { data: insightsData } = useAIInsights();
  const aiInsights = insightsData?.insights || [];

  useEffect(() => {
    const refresh = () => {
      setMyTopics(loadJson(MY_TOPICS_KEY, []));
      setAirdropReminders(loadJson(AIRDROP_REMINDERS_KEY, []));
    };
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, []);

  // Check if profile completion is needed
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    const profileCompleted = localStorage.getItem('profileCompleted');
    const pendingProfileData = localStorage.getItem('pendingProfileData');
    
    setUser(userData);
    
    // Check URL parameters for profile modal
    const urlParams = new URLSearchParams(window.location.search);
    const showModal = urlParams.get('showProfileModal') === 'true';
    
    if ((userData && !profileCompleted) || showModal || pendingProfileData) {
      setShowProfileModal(true);
    }

    // Fetch analytics summary for quick cards
    (async () => {
      try {
        const uid = userData?.user_id || userData?.id;
        if (!uid) return;
        // Use API service instead of direct fetch
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'https://blockchainvibe-api.nico-chikuji.workers.dev'}/api/analytics/summary?userId=${encodeURIComponent(uid)}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('access_token') || ''}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setAnalytics({
            articlesRead: data?.articlesRead || 0,
            timeSpentMinutes: data?.timeSpentMinutes || 0,
          });
        }
      } catch (error) {
        // Silently fail - analytics are not critical
        console.error('Analytics fetch error:', error);
      }
    })();
  }, []);

  const { data: newsData, isLoading: newsLoading, error: newsError, refetch: refetchNews } = useQuery(
    ['news', 'trending'],
    () => newsAPI.getTrendingNews({ limit: 6 }),
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
    }
  );

  const { data: launchesData } = useQuery(
    ['launches', 'drops'],
    () => launchesAPI.getDrops(),
    {
      staleTime: 6 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );


  const handleProfileComplete = async (profileData) => {
    try {

      const backendProfileData = {
        name: profileData.name,
        email: profileData.email,
        bio: profileData.bio,
        profile_picture: profileData.profilePicture, // This is now a URL
        banner_image: profileData.bannerImage, // This is now a URL
        location: profileData.location,
        website: profileData.website,
        twitter: profileData.twitter,
        linkedin: profileData.linkedin
      };

      const userId = user?.user_id || user?.id;
      
      if (!userId) {
        throw new Error('User ID not found. Please try logging in again.');
      }

      const response = await fetch(`https://blockchainvibe-api.nico-chikuji.workers.dev/api/user/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`
        },
        body: JSON.stringify({
          userId,
          profileData: backendProfileData
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }

      await response.json();

      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      localStorage.setItem('profileCompleted', 'true');
      localStorage.removeItem('pendingProfileData');
      
      setUser(updatedUser);
      setShowProfileModal(false);
      toast.success('Profile completed successfully!');
    } catch (error) {
      handleApiError(error, toast.error, {
        customMessage: 'Failed to complete profile. Please try again.',
      });
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleRefresh = async () => {
    try {
      await refetchNews();
      toast.success('News refreshed!');
    } catch (error) {
      toast.error('Failed to refresh news');
    }
  };

  const trendingTopicLabels = (newsData?.articles && Array.isArray(newsData.articles))
    ? [...new Set(newsData.articles.flatMap(a => (a.categories || []).filter(Boolean)))].slice(0, 6)
    : [];
  const dashboardServiceUnavailable = newsData?.serviceUnavailable || newsData?.message;

  return (
    <DashboardContainer>
      {dashboardServiceUnavailable && (
        <div style={{ marginBottom: '1rem', padding: '1rem', background: 'rgba(245, 158, 11, 0.15)', border: '1px solid rgba(245, 158, 11, 0.5)', borderRadius: '8px', color: 'inherit' }}>
          <strong>Service notice:</strong> {newsData?.message || 'We couldn’t load news right now. Please try again in a moment.'}
        </div>
      )}
      <Header>
        <div>
          <Title>Welcome back, {user?.name || 'User'}!</Title>
          <Subtitle>Your hub for crypto news, airdrops, and launches — powered by AI</Subtitle>
        </div>
        <HeaderActions>
          <SearchContainer>
            <SearchIcon size={20} />
            <form onSubmit={handleSearch}>
              <SearchInput
                id="dashboard-search"
                name="searchQuery"
                type="text"
                placeholder="Search news..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </SearchContainer>
          <RefreshButton onClick={handleRefresh} disabled={newsLoading}>
            <RefreshCw size={16} />
            Refresh
          </RefreshButton>
        </HeaderActions>
      </Header>

      <HubQuickLinks>
        <HubQuickLinkCard type="button" onClick={() => navigate('/news')}>
          <HubQuickLinkIcon><Newspaper size={22} /></HubQuickLinkIcon>
          <div>
            <HubQuickLinkLabel>News Hub</HubQuickLinkLabel>
            <HubQuickLinkDesc>Trending, For You, All News</HubQuickLinkDesc>
          </div>
          <ChevronRight size={18} style={{ marginLeft: 'auto', color: 'var(--text-secondary)' }} />
        </HubQuickLinkCard>
        <HubQuickLinkCard type="button" onClick={() => navigate('/launches')}>
          <HubQuickLinkIcon><Gift size={22} /></HubQuickLinkIcon>
          <div>
            <HubQuickLinkLabel>Airdrops & Launches</HubQuickLinkLabel>
            <HubQuickLinkDesc>Airdrops, new tokens, NFT drops</HubQuickLinkDesc>
          </div>
          <ChevronRight size={18} style={{ marginLeft: 'auto', color: 'var(--text-secondary)' }} />
        </HubQuickLinkCard>
      </HubQuickLinks>

      <TrendingStrip>
        <TrendingStripLabel>Trending now</TrendingStripLabel>
        <TrendingStripScroll>
          {[
            ...new Set([
              'Bitcoin',
              'Ethereum',
              'Solana',
              'DeFi',
              'NFT',
              'Airdrops',
              ...(trendingTopicLabels || [])
            ])
          ]
            .slice(0, 12)
            .map((term) => (
              <TrendingChip
                key={term}
                type="button"
                onClick={() => navigate(`/search?q=${encodeURIComponent(term)}`)}
              >
                {term}
              </TrendingChip>
            ))}
        </TrendingStripScroll>
      </TrendingStrip>

      <StatsGrid>
        <StatCard>
          <StatValue>{analytics.articlesRead}</StatValue>
          <StatLabel>Articles Read Today</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatValue>{Math.floor(analytics.timeSpentMinutes)}</StatValue>
          <StatLabel>Minutes Reading</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatValue>{newsData?.articles?.length || 0}</StatValue>
          <StatLabel>Feed Articles Loaded</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatValue>{Math.round((newsData?.user_relevance_score || 0) * 100)}%</StatValue>
          <StatLabel>Relevance Score</StatLabel>
        </StatCard>
      </StatsGrid>

      <SectionHeader style={{ marginTop: 0, marginBottom: '1rem' }}>
        <SectionTitle style={{ margin: 0 }}>Launches & Drops</SectionTitle>
        <ViewAllButton onClick={() => navigate('/launches')}>
          View all
          <ChevronRight size={16} />
        </ViewAllButton>
      </SectionHeader>
      <LaunchesWidgetsGrid>
        <LaunchesWidgetWrap>
          <TrendingCoinsWidget
            coins={launchesData?.trendingCoins ?? []}
            compact
            maxItems={5}
          />
        </LaunchesWidgetWrap>
        <LaunchesWidgetWrap>
          <AirdropsWidget
            airdrops={launchesData?.airdrops ?? []}
            compact
            maxItems={5}
          />
        </LaunchesWidgetWrap>
        <LaunchesWidgetWrap>
          <LaunchesCalendar events={launchesData?.calendarEvents ?? []} compact />
        </LaunchesWidgetWrap>
      </LaunchesWidgetsGrid>

      <SectionTitle>
        <TrendingUp size={24} />
        Personalized News Feed
      </SectionTitle>

      <ContentGrid>
        <NewsSection>
          <SectionHeader>
            <SectionTitle>Latest Blockchain News</SectionTitle>
            <ViewAllButton onClick={() => navigate('/news')}>
              View All
              <ChevronRight size={16} />
            </ViewAllButton>
          </SectionHeader>
          
          <NewsGrid>
            {newsLoading && (!newsData?.articles || newsData.articles.length === 0) ? (
              // Show skeleton loaders while loading
              Array.from({ length: 6 }).map((_, index) => (
                <NewsCardSkeleton key={`skeleton-${index}`} />
              ))
            ) : newsData?.articles?.length > 0 ? (
              newsData.articles.slice(0, 6).map((article, index) => (
                <NewsCard
                  key={article.id || index}
                  article={article}
                  onBookmark={() => {}}
                  onLike={() => {}}
                  onShare={() => {}}
                />
              ))
            ) : (
              <div style={{ 
                gridColumn: '1 / -1', 
                textAlign: 'center', 
                padding: '2rem',
                color: '#666'
              }}>
                {newsError ? 'Error loading news. Please try again.' : 'No news articles available.'}
              </div>
            )}
          </NewsGrid>
        </NewsSection>

        <Sidebar>
          <SidebarCard>
            <SidebarCardHeader>
              <SidebarTitle style={{ margin: 0 }}>My topics</SidebarTitle>
              <ViewAllButton onClick={() => navigate('/settings#my-topics')} style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}>
                Manage
              </ViewAllButton>
            </SidebarCardHeader>
            {myTopics.length > 0 ? (
              <TrendingList>
                {myTopics.slice(0, 3).map((t) => (
                  <TrendingItem
                    key={t.id || t.label}
                    onClick={() => t.type === 'category' ? navigate(`/news?category=${encodeURIComponent(t.value)}`) : navigate(`/search?q=${encodeURIComponent(t.value)}`)}
                  >
                    <TrendingText>{t.label}</TrendingText>
                  </TrendingItem>
                ))}
              </TrendingList>
            ) : (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                <button type="button" onClick={() => navigate('/settings#my-topics')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                  Add topics
                </button>
                {' '}to get one-click links here.
              </p>
            )}
          </SidebarCard>

          <SidebarCard>
            <SidebarCardHeader>
              <SidebarTitle style={{ margin: 0 }}>Airdrop reminders</SidebarTitle>
              {airdropReminders.length > 0 && (
                <ViewAllButton onClick={() => navigate('/launches')} style={{ padding: '0.35rem 0.5rem', fontSize: '0.75rem' }}>
                  View all
                </ViewAllButton>
              )}
            </SidebarCardHeader>
            {airdropReminders.length > 0 ? (
              <TrendingList>
                {airdropReminders.slice(0, 5).map((r, i) => (
                  <ReminderItem key={r.id || i} href={r.link || '#'} target="_blank" rel="noopener noreferrer">
                    {r.title || 'Airdrop'}
                  </ReminderItem>
                ))}
              </TrendingList>
            ) : (
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', margin: 0 }}>
                Use <strong>Remind me</strong> on any airdrop in{' '}
                <button type="button" onClick={() => navigate('/launches')} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}>
                  Launches
                </button>.
              </p>
            )}
          </SidebarCard>

          <SidebarCard>
            <SidebarTitle>Trending Topics</SidebarTitle>
            <TrendingList>
              {trendingTopicLabels.length > 0 ? trendingTopicLabels.map((topic, index) => (
                <TrendingItem key={topic} onClick={() => navigate(`/search?q=${encodeURIComponent(topic)}`)}>
                  <TrendingNumber>{index + 1}</TrendingNumber>
                  <TrendingText>{topic}</TrendingText>
                </TrendingItem>
              )) : (
                <span style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.875rem' }}>Topics from your feed appear here.</span>
              )}
            </TrendingList>
          </SidebarCard>

          <SidebarCard>
            <SidebarTitle>Quick Analytics</SidebarTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Reading Streak</span>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>—</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Favorite Topic</span>
                <span style={{ color: '#3b82f6' }}>{trendingTopicLabels[0] || '—'}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Time Spent</span>
                <span style={{ color: '#8b5cf6' }}>2.5h today</span>
              </div>
            </div>
          </SidebarCard>

          <SidebarCard>
            <SidebarTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Sparkles size={18} />
              Your AI digest
            </SidebarTitle>
            {aiInsights.length > 0 ? (
              <>
                <TrendingList>
                  {aiInsights.slice(0, 3).map((item, index) => (
                    <TrendingItem key={index}>
                      <TrendingText>{item.text}</TrendingText>
                    </TrendingItem>
                  ))}
                </TrendingList>
                <ViewAllButton onClick={() => navigate('/ai-insights')} style={{ marginTop: '0.75rem' }}>
                  View all & ask AI
                  <ChevronRight size={16} />
                </ViewAllButton>
              </>
            ) : (
              <>
                <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                  Read articles to get personalized AI insights and daily digest.
                </p>
                <ViewAllButton onClick={() => navigate('/ai-insights')} style={{ marginTop: '0.75rem' }}>
                  Open AI Insights
                  <ChevronRight size={16} />
                </ViewAllButton>
              </>
            )}
          </SidebarCard>
        </Sidebar>
      </ContentGrid>

      {showProfileModal && (
        <ProfileCompletionModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          onComplete={handleProfileComplete}
          userData={user}
        />
      )}
    </DashboardContainer>
  );
};

export default DashboardContent;
