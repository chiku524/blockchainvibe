import React from 'react';
import styled from 'styled-components';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, 
  ExternalLink, 
  Heart, 
  Share2, 
  Bookmark, 
  Clock,
  User,
  Tag
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

import { useNewsDetail } from '../hooks/useNews';
import LoadingSpinner from './LoadingSpinner';

const DetailContainer = styled.div`
  max-width: 800px;
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

const BackButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  margin-bottom: 1.5rem;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    margin-bottom: 2rem;
  }
  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ArticleContainer = styled.article`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
`;

const ArticleHeader = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${props => props.theme.colors.border};

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: 1.5rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    padding: 2rem;
  }
`;

const ArticleTitle = styled.h1`
  font-size: ${props => props.theme.fontSize.xl};
  font-weight: ${props => props.theme.fontWeight.bold};
  color: ${props => props.theme.colors.text};
  line-height: 1.3;
  margin-bottom: 0.75rem;
  word-break: break-word;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.fontSize['2xl']};
    margin-bottom: 1rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    font-size: ${props => props.theme.fontSize['3xl']};
  }
`;

const ArticleMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    gap: 2rem;
    margin-bottom: 1.5rem;
  }
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSize.sm};
`;

const SourceName = styled.span`
  font-weight: ${props => props.theme.fontWeight.semibold};
  color: ${props => props.theme.colors.primary};
`;

const ArticleImage = styled.img`
  width: 100%;
  height: 200px;
  object-fit: cover;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    height: 300px;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    height: 400px;
  }
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 200px;
  background: ${props => props.theme.gradients.surface};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  color: ${props => props.theme.colors.textMuted};

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    height: 300px;
    font-size: 3.5rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    height: 400px;
    font-size: 4rem;
  }
`;

const ArticleContent = styled.div`
  padding: 1rem;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: 1.5rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    padding: 2rem;
  }
`;

const ArticleExcerpt = styled.p`
  font-size: ${props => props.theme.fontSize.base};
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.7;
  margin-bottom: 1.5rem;
  font-style: italic;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.fontSize.lg};
    margin-bottom: 2rem;
  }
`;

const ArticleBody = styled.div`
  font-size: ${props => props.theme.fontSize.base};
  color: ${props => props.theme.colors.text};
  line-height: 1.7;
  margin-bottom: 2rem;
  
  p {
    margin-bottom: 1.5rem;
  }
  
  h2, h3, h4 {
    font-weight: ${props => props.theme.fontWeight.bold};
    margin: 2rem 0 1rem 0;
    color: ${props => props.theme.colors.text};
  }
  
  h2 {
    font-size: ${props => props.theme.fontSize.xl};
  }
  
  h3 {
    font-size: ${props => props.theme.fontSize.lg};
  }
  
  ul, ol {
    margin: 1rem 0;
    padding-left: 2rem;
  }
  
  li {
    margin-bottom: 0.5rem;
  }
  
  blockquote {
    border-left: 4px solid ${props => props.theme.colors.primary};
    padding-left: 1.5rem;
    margin: 2rem 0;
    font-style: italic;
    color: ${props => props.theme.colors.textSecondary};
  }
  
  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: underline;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 2rem;
`;

const TagItem = styled.span`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background: ${props => props.theme.colors.surfaceHover};
  color: ${props => props.theme.colors.textSecondary};
  padding: 0.5rem 0.75rem;
  border-radius: ${props => props.theme.borderRadius.md};
  font-size: ${props => props.theme.fontSize.sm};
  font-weight: ${props => props.theme.fontWeight.medium};
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-top: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.background};
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  border-radius: ${props => props.theme.borderRadius.md};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  font-size: ${props => props.theme.fontSize.sm};
  font-weight: ${props => props.theme.fontWeight.medium};
  
  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }
  
  &.active {
    background: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.textInverse};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const ExternalLinkButton = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.textInverse};
  border-radius: ${props => props.theme.borderRadius.md};
  text-decoration: none;
  font-size: ${props => props.theme.fontSize.sm};
  font-weight: ${props => props.theme.fontWeight.medium};
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background: ${props => props.theme.colors.primaryHover};
    transform: translateY(-1px);
  }
`;

const NewsDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: news, isLoading, error } = useNewsDetail(id);
  const [isLiked, setIsLiked] = React.useState(false);
  const [isBookmarked, setIsBookmarked] = React.useState(false);

  if (isLoading) {
    return (
      <DetailContainer>
        <LoadingSpinner message="Loading article..." />
      </DetailContainer>
    );
  }

  if (error || !news) {
    return (
      <DetailContainer>
        <BackButton onClick={() => navigate(-1)}>
          <ArrowLeft size={18} />
          Back to News
        </BackButton>
        <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
          <h2>Article Not Found</h2>
          <p>The article you're looking for doesn't exist or has been removed.</p>
        </div>
      </DetailContainer>
    );
  }

  const handleAction = (action) => {
    switch (action) {
      case 'like':
        setIsLiked(!isLiked);
        break;
      case 'bookmark':
        setIsBookmarked(!isBookmarked);
        break;
      case 'share':
        if (navigator.share) {
          navigator.share({
            title: news.title,
            text: news.content,
            url: news.url,
          });
        } else {
          navigator.clipboard.writeText(news.url);
        }
        break;
      default:
        break;
    }
  };

  const formatTimeAgo = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };

  return (
    <DetailContainer>
      <BackButton onClick={() => navigate(-1)}>
        <ArrowLeft size={18} />
        Back to News
      </BackButton>

      <ArticleContainer>
        <ArticleHeader>
          <ArticleTitle>{news.title}</ArticleTitle>
          
          <ArticleMeta>
            <MetaItem>
              <Clock size={16} />
              {formatTimeAgo(news.published_at)}
            </MetaItem>
            
            <MetaItem>
              <SourceName>{news.source}</SourceName>
            </MetaItem>
            
            {news.author && (
              <MetaItem>
                <User size={16} />
                by {news.author}
              </MetaItem>
            )}
          </ArticleMeta>
        </ArticleHeader>

        {news.image_url ? (
          <ArticleImage src={news.image_url} alt={news.title} />
        ) : (
          <ImagePlaceholder>
            📰
          </ImagePlaceholder>
        )}

        <ArticleContent>
          <ArticleExcerpt>
            {news.content || news.excerpt || 'No description available.'}
          </ArticleExcerpt>

          <ArticleBody>
            {news.full_content || news.content || (
              <p>
                This is a preview of the article. To read the full content, 
                please visit the original source using the link below.
              </p>
            )}
          </ArticleBody>

          {news.tags && news.tags.length > 0 && (
            <TagsContainer>
            {news.tags.map((tag, index) => (
              <TagItem key={index}>
                <Tag size={14} />
                {tag}
              </TagItem>
            ))}
            </TagsContainer>
          )}
        </ArticleContent>

        <ActionsContainer>
          <ActionButtons>
            <ActionButton
              className={isLiked ? 'active' : ''}
              onClick={() => handleAction('like')}
            >
              <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
              {isLiked ? 'Liked' : 'Like'}
            </ActionButton>
            
            <ActionButton
              className={isBookmarked ? 'active' : ''}
              onClick={() => handleAction('bookmark')}
            >
              <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
              {isBookmarked ? 'Saved' : 'Save'}
            </ActionButton>
            
            <ActionButton onClick={() => handleAction('share')}>
              <Share2 size={16} />
              Share
            </ActionButton>
          </ActionButtons>

          <ExternalLinkButton
            href={news.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Read Full Article
            <ExternalLink size={16} />
          </ExternalLinkButton>
        </ActionsContainer>
      </ArticleContainer>
    </DetailContainer>
  );
};

export default NewsDetail;
