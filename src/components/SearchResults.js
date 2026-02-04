import React from 'react';
import styled from 'styled-components';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSearchNews } from '../hooks/useNews';
import { useUser } from '../hooks/useUser';
import NewsCard from './NewsCard';
import LoadingSpinner from './LoadingSpinner';
import ErrorState from './ErrorState';
import EmptyState from './EmptyState';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { getErrorMessage } from '../utils/errorHandler';

const SearchContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SearchHeader = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 2rem;
  margin-bottom: 2rem;
`;

const SearchTitle = styled.h1`
  font-size: ${props => props.theme.fontSize['2xl']};
  font-weight: ${props => props.theme.fontWeight.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const SearchSubtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSize.lg};
  margin-bottom: 1.5rem;
`;

const SearchStats = styled.div`
  display: flex;
  align-items: center;
  gap: 2rem;
  flex-wrap: wrap;
`;

const StatItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSize.sm};
`;

const ResultsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1rem;
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

const SuggestionsContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1.5rem;
  margin-top: 2rem;
`;

const SuggestionsTitle = styled.h3`
  font-size: ${props => props.theme.fontSize.lg};
  font-weight: ${props => props.theme.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 1rem;
`;

const SuggestionsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const SuggestionTag = styled.button`
  background: ${props => props.theme.colors.surfaceHover};
  color: ${props => props.theme.colors.textSecondary};
  border: 1px solid ${props => props.theme.colors.border};
  padding: 0.5rem 1rem;
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.fontSize.sm};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.textInverse};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = searchParams.get('q') || '';
  const { data: searchData, isLoading, error, refetch, isFetching } = useSearchNews(query);
  const { trackActivity } = useUser();
  useDocumentTitle(query ? `Search: ${query}` : 'Search');

  const handleNewsInteraction = async (newsId, action) => {
    try {
      await trackActivity({
        newsId,
        action,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
    }
  };

  if (isLoading) {
    return (
      <SearchContainer>
        <LoadingSpinner message={`Searching for "${query}"...`} />
      </SearchContainer>
    );
  }

  if (error) {
    return (
      <SearchContainer style={{ padding: '2rem' }}>
        <ErrorState
          title="Search error"
          message={getErrorMessage(error)}
          onRetry={() => refetch()}
          isRetrying={isFetching}
        />
      </SearchContainer>
    );
  }

  if (!searchData || !searchData.results || searchData.results.length === 0) {
    const suggestions = ['Bitcoin', 'Ethereum', 'DeFi', 'NFTs', 'Web3', 'Blockchain', 'Crypto'];
    return (
      <SearchContainer>
        <SearchHeader>
          <SearchTitle>Search Results for "{query}"</SearchTitle>
          <SearchSubtitle>No articles found matching your search.</SearchSubtitle>
        </SearchHeader>
        <EmptyState
          icon="🔍"
          title="No results found"
          description="Try adjusting your search terms or browse trending news."
          action={
            <SuggestionsContainer>
              <SuggestionsTitle>Popular search terms</SuggestionsTitle>
              <SuggestionsList>
                {suggestions.map((term) => (
                  <SuggestionTag key={term} onClick={() => navigate(`/search?q=${encodeURIComponent(term)}`)}>
                    {term}
                  </SuggestionTag>
                ))}
              </SuggestionsList>
            </SuggestionsContainer>
          }
        />
      </SearchContainer>
    );
  }

  return (
    <SearchContainer>
      <SearchHeader>
        <SearchTitle>Search Results for "{query}"</SearchTitle>
        <SearchSubtitle>
          Found {searchData.total_count || searchData.results.length} articles
        </SearchSubtitle>
        
        <SearchStats>
          <StatItem>
            <span>📊</span>
            {searchData.total_count || searchData.results.length} results
          </StatItem>
          <StatItem>
            <span>⏱️</span>
            {searchData.search_time ? `${searchData.search_time.toFixed(2)}s` : 'Fast'} search
          </StatItem>
          {searchData.mettа_context && (
            <StatItem>
              <span>🧠</span>
              AI-enhanced search
            </StatItem>
          )}
        </SearchStats>
      </SearchHeader>

      <ResultsContainer>
        {searchData.results.map((news) => (
          <NewsCard
            key={news.id}
            news={news}
            onInteraction={handleNewsInteraction}
          />
        ))}
      </ResultsContainer>

      {searchData.suggestions && searchData.suggestions.length > 0 && (
        <SuggestionsContainer>
          <SuggestionsTitle>Related Searches</SuggestionsTitle>
          <SuggestionsList>
            {searchData.suggestions.map((suggestion, index) => (
              <SuggestionTag key={index}>
                {suggestion}
              </SuggestionTag>
            ))}
          </SuggestionsList>
        </SuggestionsContainer>
      )}
    </SearchContainer>
  );
};

export default SearchResults;
