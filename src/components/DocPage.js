import React from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import Navigation from './Navigation';
import AnimatedBackground from './AnimatedBackground';
import Footer from './Footer';
import MarkdownContent from './MarkdownContent';
import TableOfContents from './TableOfContents';
import PageMeta from './PageMeta';
import { getMetadataForRoute } from '../config/seo';
import { useTheme } from '../contexts/ThemeContext';

const DocPageContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  position: relative;
  z-index: 2;
  isolation: isolate;
`;

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 5rem 1rem 2rem;
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  align-items: flex-start;
  box-sizing: border-box;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    flex-direction: row;
    padding: 6rem 1.5rem 2rem;
    gap: 2rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    padding: 6rem 2rem 2rem;
  }
`;

const ContentWrapper = styled.div`
  flex: 1;
  min-width: 0;
  width: 100%;
`;

const PageContent = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1.25rem;
  min-height: 60vh;
  overflow-x: auto;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: 2rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    padding: 3rem;
  }
  
  h2 {
    font-size: ${props => props.theme.fontSize['2xl']};
    font-weight: ${props => props.theme.fontWeight.bold};
    margin-top: 3rem;
    margin-bottom: 1.5rem;
    color: ${props => props.theme.colors.text};
    padding-bottom: 0.5rem;
    border-bottom: 2px solid ${props => props.theme.colors.border};
  }
  
  h3 {
    font-size: ${props => props.theme.fontSize.xl};
    font-weight: ${props => props.theme.fontWeight.semibold};
    margin-top: 2rem;
    margin-bottom: 1rem;
    color: ${props => props.theme.colors.text};
  }
  
  h4 {
    font-size: ${props => props.theme.fontSize.lg};
    font-weight: ${props => props.theme.fontWeight.semibold};
    margin-top: 1.5rem;
    margin-bottom: 0.75rem;
    color: ${props => props.theme.colors.text};
  }
  
  ul, ol {
    margin: 1rem 0;
    padding-left: 2rem;
    line-height: 1.8;
  }
  
  li {
    margin-bottom: 0.5rem;
  }
  
  code {
    background: ${props => props.theme.colors.surface};
    padding: 0.2rem 0.4rem;
    border-radius: ${props => props.theme.borderRadius.sm};
    font-family: 'Courier New', monospace;
    font-size: 0.9em;
  }
  
  pre {
    background: ${props => props.theme.colors.surface};
    border: 1px solid ${props => props.theme.colors.border};
    border-radius: ${props => props.theme.borderRadius.md};
    padding: 1rem;
    overflow-x: auto;
    margin: 1.5rem 0;
  }
  
  pre code {
    background: none;
    padding: 0;
  }
  
  blockquote {
    border-left: 4px solid ${props => props.theme.colors.primary};
    padding-left: 1rem;
    margin: 1.5rem 0;
    color: ${props => props.theme.colors.textSecondary};
    font-style: italic;
  }
  
  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
  }
  
  th, td {
    border: 1px solid ${props => props.theme.colors.border};
    padding: 0.75rem;
    text-align: left;
  }
  
  th {
    background: ${props => props.theme.colors.surface};
    font-weight: ${props => props.theme.fontWeight.semibold};
  }
`;

const DocPage = () => {
  const { page } = useParams();
  const { theme, setTheme } = useTheme();
  
  const seoData = getMetadataForRoute(`/docs/${page}`);
  
  // Determine file path based on page type
  const getFilePath = () => {
    const legalPages = ['terms', 'privacy', 'whitepaper'];
    if (legalPages.includes(page)) {
      const fileName = page === 'terms' ? 'TERMS_OF_SERVICE' : 
                       page === 'privacy' ? 'PRIVACY_POLICY' : 'WHITEPAPER';
      return `/${fileName}.md`;
    }
    return `/docs/${page || 'index'}.md`;
  };
  
  return (
    <DocPageContainer>
      <PageMeta
        title={seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        canonicalPath={seoData.url}
      />
      <AnimatedBackground />
      <Navigation theme={theme} onThemeChange={setTheme} />
      <PageContainer>
        <TableOfContents />
        <ContentWrapper>
          <PageContent>
            <MarkdownContent filePath={getFilePath()} />
          </PageContent>
        </ContentWrapper>
      </PageContainer>
      <Footer />
    </DocPageContainer>
  );
};

export default DocPage;

