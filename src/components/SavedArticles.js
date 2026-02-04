import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bookmark, 
  Search, 
  Calendar,
  Tag,
  Heart
} from 'lucide-react';
import toast from 'react-hot-toast';

import NewsCard from './NewsCard';
import LoadingSpinner from './LoadingSpinner';
import { userAPI } from '../services/api';

const SavedContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  width: 100%;
  box-sizing: border-box;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: 1.5rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    padding: 2rem;
  }
`;

const SavedHeader = styled.div`
  margin-bottom: 1.5rem;

  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    margin-bottom: 3rem;
  }
`;

const SavedTitle = styled.h1`
  font-size: ${props => props.theme.fontSize['2xl']};
  font-weight: ${props => props.theme.fontWeight.bold};
  background: ${props => props.theme.gradients.text};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  word-break: break-word;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.fontSize['3xl']};
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    font-size: ${props => props.theme.fontSize['4xl']};
    margin-bottom: 1rem;
  }
`;

const SavedSubtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSize.sm};
  margin-bottom: 1rem;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.fontSize.lg};
    margin-bottom: 2rem;
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: column;
    align-items: stretch;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    margin-bottom: 2rem;
  }
`;

const SearchContainer = styled.div`
  position: relative;
  flex: 1;
  min-width: 0;
  max-width: 400px;

  @media (max-width: ${props => props.theme.breakpoints.md}) {
    max-width: none;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSize.sm};
  transition: all ${props => props.theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 3px ${props => props.theme.colors.primary}20;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.textMuted};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.textMuted};
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const FilterButton = styled.button`
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
  
  &.active {
    background: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.textInverse};
    border-color: ${props => props.theme.colors.primary};
  }
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

const ArticlesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 2rem;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
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

const ActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.textInverse};
  border: none;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSize.sm};
  font-weight: ${props => props.theme.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-1px);
  }
`;

const SavedArticles = () => {
  const [savedArticles, setSavedArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const items = await userAPI.getSavedArticles();
        setSavedArticles(items);
        setFilteredArticles(items);
      } catch (_) {
        setSavedArticles([]);
        setFilteredArticles([]);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    let filtered = savedArticles;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    // Sort articles
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(b.savedAt) - new Date(a.savedAt);
        case 'relevance':
          return b.relevanceScore - a.relevanceScore;
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    setFilteredArticles(filtered);
  }, [savedArticles, searchQuery, sortBy]);

  const handleRemoveArticle = (articleId) => {
    setSavedArticles(prev => prev.filter(article => article.id !== articleId));
    toast.success('Article removed from saved list');
  };

  const handleShareArticle = (article) => {
    if (navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: article.url
      });
    } else {
      navigator.clipboard.writeText(article.url);
      toast.success('Article link copied to clipboard');
    }
  };

  if (isLoading) {
    return (
      <SavedContainer>
        <LoadingSpinner message="Loading saved articles..." />
      </SavedContainer>
    );
  }

  return (
    <SavedContainer>
      <SavedHeader>
        <SavedTitle>
          <Bookmark size={32} />
          Saved Articles
        </SavedTitle>
        <SavedSubtitle>
          Your curated collection of blockchain news and insights
        </SavedSubtitle>
      </SavedHeader>

      <StatsContainer>
        <StatCard>
          <StatValue>{savedArticles.length}</StatValue>
          <StatLabel>Total Saved</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{new Set(savedArticles.map(a => a.category)).size}</StatValue>
          <StatLabel>Categories</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{savedArticles.length === 0 ? '—' : Math.round((savedArticles.reduce((acc, a) => acc + (a.relevanceScore || 0), 0) / savedArticles.length) * 100) + '%'}</StatValue>
          <StatLabel>Avg Relevance</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{savedArticles.filter(a => new Date(a.savedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}</StatValue>
          <StatLabel>This Week</StatLabel>
        </StatCard>
      </StatsContainer>

      <ControlsContainer>
        <SearchContainer>
          <SearchIcon>
            <Search size={18} />
          </SearchIcon>
          <SearchInput
            type="text"
            placeholder="Search saved articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </SearchContainer>

        <FilterContainer>
          <FilterButton
            className={sortBy === 'date' ? 'active' : ''}
            onClick={() => setSortBy('date')}
          >
            <Calendar size={16} />
            Date
          </FilterButton>
          <FilterButton
            className={sortBy === 'relevance' ? 'active' : ''}
            onClick={() => setSortBy('relevance')}
          >
            <Heart size={16} />
            Relevance
          </FilterButton>
          <FilterButton
            className={sortBy === 'title' ? 'active' : ''}
            onClick={() => setSortBy('title')}
          >
            <Tag size={16} />
            Title
          </FilterButton>
        </FilterContainer>
      </ControlsContainer>

      {filteredArticles.length === 0 ? (
        <EmptyState>
          <EmptyStateIcon>📚</EmptyStateIcon>
          <EmptyStateTitle>
            {searchQuery ? 'No articles found' : 'No saved articles yet'}
          </EmptyStateTitle>
          <EmptyStateDescription>
            {searchQuery 
              ? `No articles match "${searchQuery}". Try a different search term.`
              : 'Start saving articles you find interesting to see them here.'
            }
          </EmptyStateDescription>
          {!searchQuery && (
            <ActionButton onClick={() => window.location.href = '/news'}>
              Browse News
            </ActionButton>
          )}
        </EmptyState>
      ) : (
        <ArticlesGrid>
          <AnimatePresence>
            {filteredArticles.map((article, index) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
              >
                <NewsCard
                  news={article}
                  onInteraction={(id, action) => {
                    if (action === 'unsave') {
                      handleRemoveArticle(id);
                    } else if (action === 'share') {
                      handleShareArticle(article);
                    }
                  }}
                  showSaveButton={false}
                  showShareButton={true}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </ArticlesGrid>
      )}
    </SavedContainer>
  );
};

export default SavedArticles;
