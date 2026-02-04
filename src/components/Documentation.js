import React from 'react';
import styled from 'styled-components';
import { FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from './Navigation';
import AnimatedBackground from './AnimatedBackground';
import Footer from './Footer';
import TableOfContents from './TableOfContents';
import { useTheme } from '../contexts/ThemeContext';

const DocsPageContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  position: relative;
  z-index: 2;
  isolation: isolate;
`;

const DocsContainer = styled.div`
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

const DocsHeader = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    margin-bottom: 3rem;
  }
`;

const DocsTitle = styled.h1`
  font-size: ${props => props.theme.fontSize['2xl']};
  font-weight: ${props => props.theme.fontWeight.bold};
  margin-bottom: 0.75rem;
  color: ${props => props.theme.colors.text};

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.fontSize['3xl']};
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    font-size: ${props => props.theme.fontSize['4xl']};
    margin-bottom: 1rem;
  }
`;

const DocsDescription = styled.p`
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  max-width: 600px;
  margin: 0 auto;
  padding: 0 0.5rem;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.theme.fontSize.lg};
  }
`;

const DocsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-top: 2rem;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 1.5rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 3rem;
  }
`;

const DocCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1.5rem;
  transition: all ${props => props.theme.transitions.normal};

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: 2rem;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.xl};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const DocIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.theme.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.75rem;
  color: ${props => props.theme.colors.textInverse};

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    width: 60px;
    height: 60px;
    margin-bottom: 1rem;
  }
`;

const DocCardTitle = styled.h3`
  font-size: ${props => props.theme.fontSize.lg};
  font-weight: ${props => props.theme.fontWeight.semibold};
  margin-bottom: 0.5rem;
  color: ${props => props.theme.colors.text};

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.theme.fontSize.xl};
  }
`;

const DocCardDescription = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.6;
  margin-bottom: 1rem;
  font-size: ${props => props.theme.fontSize.sm};

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    font-size: inherit;
  }
`;

const DocLink = styled(Link)`
  color: ${props => props.theme.colors.primary};
  text-decoration: none;
  font-weight: ${props => props.theme.fontWeight.medium};
  
  &:hover {
    text-decoration: underline;
  }
`;

const Documentation = () => {
  const { theme, setTheme } = useTheme();
  const docs = [
    {
      title: 'Getting Started',
      description: 'Quick start guide to get up and running with BlockchainVibe',
      link: '/docs/getting-started',
      icon: <FileText size={24} />
    },
    {
      title: 'Features',
      description: 'Complete overview of all platform features and capabilities',
      link: '/docs/features',
      icon: <FileText size={24} />
    },
    {
      title: 'API Reference',
      description: 'Complete REST API documentation with examples',
      link: '/docs/api-reference',
      icon: <FileText size={24} />
    },
    {
      title: 'AI Integration',
      description: 'Guide to AI agents, MeTTa Knowledge Graph, and Chat Protocol',
      link: '/docs/ai-integration',
      icon: <FileText size={24} />
    },
    {
      title: 'User Guide',
      description: 'Detailed instructions for using all platform features',
      link: '/docs/user-guide',
      icon: <FileText size={24} />
    },
    {
      title: 'Architecture',
      description: 'System architecture and infrastructure details',
      link: '/docs/architecture',
      icon: <FileText size={24} />
    }
  ];

  return (
    <DocsPageContainer>
      <AnimatedBackground />
      <Navigation theme={theme} onThemeChange={setTheme} />
      <DocsContainer>
        <TableOfContents />
        <ContentWrapper>
          <DocsHeader>
            <DocsTitle>Documentation</DocsTitle>
            <DocsDescription>
              Comprehensive documentation for BlockchainVibe. Learn how to use the platform,
              integrate with our API, and understand our AI-powered architecture.
            </DocsDescription>
          </DocsHeader>
          <DocsGrid>
            {docs.map((doc, index) => (
              <DocCard key={index}>
                <DocIcon>{doc.icon}</DocIcon>
                <DocCardTitle>{doc.title}</DocCardTitle>
                <DocCardDescription>{doc.description}</DocCardDescription>
                <DocLink to={doc.link}>
                  Read more →
                </DocLink>
              </DocCard>
            ))}
          </DocsGrid>
        </ContentWrapper>
      </DocsContainer>
      <Footer />
    </DocsPageContainer>
  );
};

export default Documentation;

