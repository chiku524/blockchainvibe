import React, { useState, memo } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  Clock, 
  Heart, 
  Share2, 
  Bookmark, 
  TrendingUp,
  MessageCircle,
  ChevronRight,
  Eye
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { userAPI } from '../services/api';

const CardContainer = styled(motion.div)`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  overflow: hidden;
  transition: all ${props => props.theme.transitions.normal};
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.xl};
    border-color: ${props => props.theme.colors.primary};
  }
  
  ${props => props.featured && `
    grid-column: 1 / -1;
    display: grid;
    grid-template-columns: 1fr;
    min-height: auto;

    @media (min-width: ${props => props.theme.breakpoints.md}) {
      grid-template-columns: 1fr 1fr;
      min-height: 400px;
    }
  `}
`;

const ImageContainer = styled.div`
  position: relative;
  height: ${props => props.featured ? '100%' : '200px'};
  overflow: hidden;
  background: ${props => props.theme.colors.background};
  
  ${props => props.featured && `
    @media (max-width: ${props => props.theme.breakpoints.md}) {
      height: 200px;
    }
  `}
`;

const NewsImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform ${props => props.theme.transitions.normal};
  loading: lazy;
  
  ${CardContainer}:hover & {
    transform: scale(1.05);
  }
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: ${props => props.theme.gradients.surface};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 3rem;
  color: ${props => props.theme.colors.textMuted};
`;

const CategoryBadge = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.textInverse};
  padding: 0.25rem 0.75rem;
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.fontSize.xs};
  font-weight: ${props => props.theme.fontWeight.semibold};
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const RelevanceScore = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.fontSize.xs};
  font-weight: ${props => props.theme.fontWeight.semibold};
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const RankBadge = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background: ${props => props.theme.colors.accent};
  color: ${props => props.theme.colors.textInverse};
  padding: 0.25rem 0.5rem;
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.fontSize.xs};
  font-weight: ${props => props.theme.fontWeight.bold};
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 2rem;
  height: 1.5rem;
`;

const ContentContainer = styled.div`
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: 1.5rem;
  }
  
  ${props => props.featured && `
    justify-content: center;
  `}
`;

const NewsHeader = styled.div`
  margin-bottom: 0.75rem;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    margin-bottom: 1rem;
  }
`;

const NewsTitle = styled.h3`
  font-size: ${props => props.featured ? props.theme.fontSize.xl : props.theme.fontSize.base};
  font-weight: ${props => props.theme.fontWeight.bold};
  color: ${props => props.theme.colors.text};
  line-height: 1.4;
  margin-bottom: 0.5rem;
  display: -webkit-box;
  -webkit-line-clamp: ${props => props.featured ? 3 : 2};
  -webkit-box-orient: vertical;
  overflow: hidden;
  word-break: break-word;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.featured ? props.theme.fontSize['2xl'] : props.theme.fontSize.lg};
  }
`;

const NewsExcerpt = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.featured ? props.theme.fontSize.sm : props.theme.fontSize.xs};
  line-height: 1.6;
  display: -webkit-box;
  -webkit-line-clamp: ${props => props.featured ? 4 : 3};
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 0.75rem;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.featured ? props.theme.fontSize.base : props.theme.fontSize.sm};
    margin-bottom: 1rem;
  }
`;

const NewsMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  color: ${props => props.theme.colors.textMuted};
  font-size: ${props => props.theme.fontSize.sm};
`;

const SourceName = styled.span`
  font-weight: ${props => props.theme.fontWeight.semibold};
  color: ${props => props.theme.colors.primary};
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const Tag = styled.span`
  background: ${props => props.theme.colors.surfaceHover};
  color: ${props => props.theme.colors.textSecondary};
  padding: 0.25rem 0.5rem;
  border-radius: ${props => props.theme.borderRadius.sm};
  font-size: ${props => props.theme.fontSize.xs};
  font-weight: ${props => props.theme.fontWeight.medium};
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5rem;
  border: none;
  background: none;
  color: ${props => props.theme.colors.textMuted};
  cursor: pointer;
  border-radius: ${props => props.theme.borderRadius.md};
  transition: all ${props => props.theme.transitions.fast};
  font-size: ${props => props.theme.fontSize.sm};
  
  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    color: ${props => props.theme.colors.primary};
  }
  
  &.active {
    color: ${props => props.theme.colors.primary};
  }
`;

const ReadMoreButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
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
    transform: translateX(2px);
  }
`;

const NewsCard = ({ 
  news, 
  featured = false, 
  onInteraction,
  showEngagement = false,
  showRelevance = false,
  relevanceScore = null,
  rank = null,
  // Legacy support
  article = null,
  onBookmark = null,
  onLike = null,
  onShare = null
}) => {
  // Support both old and new prop names
  const articleData = article || news;
  const handleInteraction = onInteraction || ((id, action) => {
    switch (action) {
      case 'bookmark':
        onBookmark?.();
        break;
      case 'like':
        onLike?.();
        break;
      case 'share':
        onShare?.();
        break;
      default:
        break;
    }
  });
  const [isLiked, setIsLiked] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [isShared, setIsShared] = useState(false);

  const handleAction = (action) => {
    switch (action) {
      case 'like':
        setIsLiked(!isLiked);
        handleInteraction(articleData.id, isLiked ? 'unlike' : 'like');
        try {
          userAPI.trackActivity({
            type: isLiked ? 'unlike' : 'like',
            article_id: articleData.id,
            article_title: articleData.title,
            article_source: articleData.source,
            metadata: {
              url: articleData.url,
              image_url: articleData.image_url,
              category: (articleData.categories && articleData.categories[0]) || null,
              tags: articleData.tags || [],
            },
          });
        } catch {}
        break;
      case 'bookmark':
        setIsBookmarked(!isBookmarked);
        handleInteraction(articleData.id, isBookmarked ? 'unbookmark' : 'bookmark');
        try {
          userAPI.trackActivity({
            type: isBookmarked ? 'unbookmark' : 'bookmark',
            article_id: articleData.id,
            article_title: articleData.title,
            article_source: articleData.source,
            metadata: {
              url: articleData.url,
              image_url: articleData.image_url,
              category: (articleData.categories && articleData.categories[0]) || null,
              tags: articleData.tags || [],
            },
          });
        } catch {}
        break;
      case 'share':
        setIsShared(true);
        handleInteraction(articleData.id, 'share');
        // Reset after a short delay
        setTimeout(() => setIsShared(false), 2000);
        break;
      default:
        break;
    }
  };

  const handleReadMore = () => {
    try {
      const session = {
        article_id: articleData.id,
        article_title: articleData.title,
        article_source: articleData.source,
        started_at: Date.now()
      };
      localStorage.setItem('reading_session', JSON.stringify(session));
    } catch {}
    handleInteraction(articleData.id, 'read');
    try {
      userAPI.trackActivity({
        type: 'read',
        article_id: articleData.id,
        article_title: articleData.title,
        article_source: articleData.source,
        metadata: {
          url: articleData.url,
          image_url: articleData.image_url,
          category: (articleData.categories && articleData.categories[0]) || null,
          tags: articleData.tags || [],
        },
      });
    } catch {}
    window.open(articleData.url, '_blank');
  };

  const formatTimeAgo = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch {
      return 'Recently';
    }
  };


  return (
    <CardContainer
      featured={featured}
      isBreaking={articleData.is_breaking}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <ImageContainer featured={featured}>
        {articleData.image_url ? (
          <NewsImage 
            src={articleData.image_url} 
            alt={articleData.title}
            loading="lazy"
            decoding="async"
            onError={(e) => {
              // Fallback to placeholder on image load error
              e.target.style.display = 'none';
              const placeholder = e.target.nextElementSibling;
              if (placeholder) {
                placeholder.style.display = 'flex';
              }
            }}
          />
        ) : (
          <ImagePlaceholder>
            📰
          </ImagePlaceholder>
        )}
        
        {rank && (
          <RankBadge>
            #{rank}
          </RankBadge>
        )}
        
        {articleData.categories && articleData.categories.length > 0 && (
          <CategoryBadge>
            {articleData.categories[0]}
          </CategoryBadge>
        )}
        
        {/* Breaking News Badge */}
        {articleData.is_breaking && (
          <CategoryBadge style={{ 
            background: '#ef4444', 
            animation: 'pulse 2s infinite',
            zIndex: 10
          }}>
            🔥 BREAKING
          </CategoryBadge>
        )}
        
        {/* Sentiment Badge */}
        {articleData.sentiment && (
          <RelevanceScore style={{
            top: articleData.is_breaking ? '3.5rem' : '1rem',
            right: '1rem',
            background: articleData.sentiment.overall === 'bullish' ? 'rgba(34, 197, 94, 0.9)' :
                       articleData.sentiment.overall === 'bearish' ? 'rgba(239, 68, 68, 0.9)' :
                       'rgba(107, 114, 128, 0.9)',
            zIndex: 9
          }}>
            {articleData.sentiment.overall === 'bullish' ? '📈' : 
             articleData.sentiment.overall === 'bearish' ? '📉' : '➡️'}
            {articleData.sentiment.overall?.toUpperCase()}
          </RelevanceScore>
        )}
        
        {(showRelevance && relevanceScore) && (
          <RelevanceScore style={{ 
            top: articleData.sentiment ? (articleData.is_breaking ? '6rem' : '3.5rem') : (articleData.is_breaking ? '3.5rem' : '1rem'),
            right: '1rem',
            zIndex: 8
          }}>
            <TrendingUp size={12} />
            {relevanceScore}%
          </RelevanceScore>
        )}
        
        {articleData.relevance_score && !showRelevance && !articleData.sentiment && !articleData.is_breaking && (
          <RelevanceScore>
            <TrendingUp size={12} />
            {Math.round(articleData.relevance_score * 100)}%
          </RelevanceScore>
        )}
      </ImageContainer>

      <ContentContainer featured={featured}>
        <NewsHeader>
          <NewsTitle featured={featured}>
            {articleData.title}
          </NewsTitle>
          
          <NewsExcerpt featured={featured}>
            {articleData.content || articleData.excerpt || 'No description available.'}
          </NewsExcerpt>
        </NewsHeader>

        <NewsMeta>
          <MetaItem>
            <Clock size={14} />
            {formatTimeAgo(articleData.published_at)}
          </MetaItem>
          
          <MetaItem>
            <SourceName>{articleData.source}</SourceName>
          </MetaItem>
          
          {articleData.author && (
            <MetaItem>
              by {articleData.author}
            </MetaItem>
          )}
        </NewsMeta>

        {articleData.tags && articleData.tags.length > 0 && (
          <TagsContainer>
            {articleData.tags.slice(0, 3).map((tag, index) => (
              <Tag key={index}>
                {tag}
              </Tag>
            ))}
            {articleData.tags.length > 3 && (
              <Tag>+{articleData.tags.length - 3} more</Tag>
            )}
          </TagsContainer>
        )}

        <ActionsContainer>
          <ActionButtons>
            <ActionButton
              className={isLiked ? 'active' : ''}
              onClick={() => handleAction('like')}
            >
              <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
              {showEngagement ? (articleData.engagement_metrics?.likes || 0) : (articleData.likes || 0)}
            </ActionButton>
            
            <ActionButton
              className={isBookmarked ? 'active' : ''}
              onClick={() => handleAction('bookmark')}
            >
              <Bookmark size={16} fill={isBookmarked ? 'currentColor' : 'none'} />
            </ActionButton>
            
            <ActionButton
              className={isShared ? 'active' : ''}
              onClick={() => handleAction('share')}
            >
              <Share2 size={16} />
            </ActionButton>
            
            {showEngagement && (
              <ActionButton>
                <MessageCircle size={16} />
                {articleData.engagement_metrics?.comments || 0}
              </ActionButton>
            )}
            
            {showEngagement && (
              <ActionButton>
                <Eye size={16} />
                {articleData.engagement_metrics?.views || 0}
              </ActionButton>
            )}
          </ActionButtons>

          <ReadMoreButton onClick={handleReadMore}>
            Read More
            <ChevronRight size={16} />
          </ReadMoreButton>
        </ActionsContainer>
      </ContentContainer>
    </CardContainer>
  );
};

// PropTypes for type checking
NewsCard.propTypes = {
  news: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string,
    excerpt: PropTypes.string,
    image_url: PropTypes.string,
    url: PropTypes.string.isRequired,
    source: PropTypes.string.isRequired,
    published_at: PropTypes.string,
    author: PropTypes.string,
    categories: PropTypes.arrayOf(PropTypes.string),
    tags: PropTypes.arrayOf(PropTypes.string),
    relevance_score: PropTypes.number,
    engagement_metrics: PropTypes.shape({
      likes: PropTypes.number,
      comments: PropTypes.number,
      views: PropTypes.number,
    }),
    likes: PropTypes.number,
  }),
  article: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    title: PropTypes.string.isRequired,
    content: PropTypes.string,
    excerpt: PropTypes.string,
    image_url: PropTypes.string,
    url: PropTypes.string.isRequired,
    source: PropTypes.string.isRequired,
    published_at: PropTypes.string,
    author: PropTypes.string,
    categories: PropTypes.arrayOf(PropTypes.string),
    tags: PropTypes.arrayOf(PropTypes.string),
    relevance_score: PropTypes.number,
    engagement_metrics: PropTypes.shape({
      likes: PropTypes.number,
      comments: PropTypes.number,
      views: PropTypes.number,
    }),
    likes: PropTypes.number,
  }),
  featured: PropTypes.bool,
  onInteraction: PropTypes.func,
  showEngagement: PropTypes.bool,
  showRelevance: PropTypes.bool,
  relevanceScore: PropTypes.number,
  rank: PropTypes.number,
  onBookmark: PropTypes.func,
  onLike: PropTypes.func,
  onShare: PropTypes.func,
};

NewsCard.defaultProps = {
  featured: false,
  showEngagement: false,
  showRelevance: false,
  relevanceScore: null,
  rank: null,
  onInteraction: null,
  onBookmark: null,
  onLike: null,
  onShare: null,
};

// Memoize NewsCard to prevent unnecessary re-renders
export default memo(NewsCard, (prevProps, nextProps) => {
  // Custom comparison function for better memoization
  return (
    prevProps.news?.id === nextProps.news?.id &&
    prevProps.news?.image_url === nextProps.news?.image_url &&
    prevProps.featured === nextProps.featured &&
    prevProps.showEngagement === nextProps.showEngagement &&
    prevProps.showRelevance === nextProps.showRelevance &&
    prevProps.relevanceScore === nextProps.relevanceScore &&
    prevProps.rank === nextProps.rank
  );
});
