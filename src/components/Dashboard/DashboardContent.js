import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  TrendingUp, 
  RefreshCw, 
  Search,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from 'react-query';
import toast from 'react-hot-toast';

import NewsCard from '../NewsCard';
import NewsCardSkeleton from '../NewsCardSkeleton';
import ProfileCompletionModal from '../Auth/ProfileCompletionModal';
import { newsAPI } from '../../services/api';
import { handleApiError } from '../../utils/errorHandler';
import { useAIInsights } from '../../hooks/useAI';

const DashboardContainer = styled.div`
  min-height: 100vh;
  padding: 2rem;
  position: relative;
  z-index: 2;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const Title = styled.h1`
  font-size: ${props => props.theme.fontSize['3xl']};
  font-weight: ${props => props.theme.fontWeight.bold};
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const Subtitle = styled.p`
  font-size: ${props => props.theme.fontSize.lg};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0.5rem 0 0 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
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
  width: 300px;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSize.sm};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.textSecondary};
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
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 1fr;
  }
`;

const NewsSection = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1.5rem;
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

const DashboardContent = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [user, setUser] = useState(null);
  const [analytics, setAnalytics] = useState({ articlesRead: 0, timeSpentMinutes: 0 });
  const { data: insightsData } = useAIInsights();
  const aiInsights = insightsData?.insights || [];

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

  const trendingTopics = [
    'Bitcoin ETF Approval',
    'Ethereum Layer 2 Scaling',
    'DeFi Yield Farming',
    'NFT Market Recovery',
    'Web3 Gaming Boom',
    'CBDC Development'
  ];

  // Don't show full loading spinner - show skeleton loaders instead

  return (
    <DashboardContainer>
      <Header>
        <div>
          <Title>Welcome back, {user?.name || 'User'}!</Title>
          <Subtitle>Here's your personalized blockchain news feed</Subtitle>
        </div>
        <HeaderActions>
          <SearchContainer>
            <SearchIcon size={20} />
            <form onSubmit={handleSearch}>
              <SearchInput
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
            <SidebarTitle>Trending Topics</SidebarTitle>
            <TrendingList>
              {trendingTopics.map((topic, index) => (
                <TrendingItem key={index} onClick={() => navigate(`/search?q=${encodeURIComponent(topic)}`)}>
                  <TrendingNumber>{index + 1}</TrendingNumber>
                  <TrendingText>{topic}</TrendingText>
                </TrendingItem>
              ))}
            </TrendingList>
          </SidebarCard>

          <SidebarCard>
            <SidebarTitle>Quick Analytics</SidebarTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Reading Streak</span>
                <span style={{ color: '#10b981', fontWeight: 'bold' }}>7 days</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Favorite Topic</span>
                <span style={{ color: '#3b82f6' }}>DeFi</span>
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
              AI Insights
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
