import React from 'react';
import styled from 'styled-components';
import { Book, MessageCircle, Bug, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navigation from './Navigation';
import AnimatedBackground from './AnimatedBackground';
import Footer from './Footer';
import { useTheme } from '../contexts/ThemeContext';

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  position: relative;
  z-index: 2;
  isolation: isolate;
`;

const ContentContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 5rem 1rem 3rem;
  position: relative;
  z-index: 1;
  box-sizing: border-box;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: 6rem 1.5rem 4rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    padding: 8rem 2rem 4rem;
  }
`;

const Hero = styled.div`
  text-align: center;
  margin-bottom: 2rem;

  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    margin-bottom: 4rem;
  }
`;

const HeroTitle = styled.h1`
  font-size: ${props => props.theme.fontSize['2xl']};
  font-weight: ${props => props.theme.fontWeight.bold};
  margin-bottom: 0.75rem;
  background: ${props => props.theme.gradients.text};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.fontSize['4xl']};
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    font-size: ${props => props.theme.fontSize['5xl']};
    margin-bottom: 1rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  max-width: 600px;
  margin: 0 auto;
  padding: 0 0.5rem;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.theme.fontSize.lg};
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    font-size: ${props => props.theme.fontSize.xl};
  }
`;

const SearchBar = styled.div`
  max-width: 600px;
  margin: 1.5rem auto;
  position: relative;
  padding: 0 0.5rem;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    margin: 2rem auto;
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 2.75rem 0.75rem 0.75rem;
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSize.sm};
  box-sizing: border-box;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: 1rem 3rem 1rem 1rem;
    font-size: ${props => props.theme.fontSize.md};
  }
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.theme.colors.textSecondary};

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    right: 1rem;
  }
`;

const QuickLinks = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 2rem;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.5rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 2rem;
    margin-bottom: 4rem;
  }
`;

const QuickLinkCard = styled(Link)`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1.25rem;
  text-decoration: none;
  transition: all ${props => props.theme.transitions.normal};
  display: flex;
  flex-direction: column;
  gap: 0.75rem;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: 2rem;
    gap: 1rem;
  }
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${props => props.theme.shadows.xl};
    border-color: ${props => props.theme.colors.primary};
  }
`;

const QuickLinkIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.theme.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme.colors.textInverse};
`;

const QuickLinkTitle = styled.h3`
  font-size: ${props => props.theme.fontSize.xl};
  font-weight: ${props => props.theme.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const QuickLinkDescription = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
  line-height: 1.6;
`;

const Section = styled.section`
  margin-bottom: 4rem;
`;

const SectionTitle = styled.h2`
  font-size: ${props => props.theme.fontSize['3xl']};
  font-weight: ${props => props.theme.fontWeight.bold};
  margin-bottom: 2rem;
  color: ${props => props.theme.colors.text};
`;

const FAQGrid = styled.div`
  display: grid;
  gap: 1.5rem;
`;

const FAQCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1.5rem;
  transition: all ${props => props.theme.transitions.normal};
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const FAQQuestion = styled.h4`
  font-size: ${props => props.theme.fontSize.lg};
  font-weight: ${props => props.theme.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const FAQAnswer = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.8;
  margin: 0;
`;

const HelpCenter = () => {
  const { theme, setTheme } = useTheme();
  const quickLinks = [
    {
      icon: <Book size={24} />,
      title: 'Getting Started',
      description: 'Learn how to set up and use BlockchainVibe',
      link: '/docs/getting-started'
    },
    {
      icon: <MessageCircle size={24} />,
      title: 'Contact Support',
      description: 'Get help from our support team',
      link: '/docs/contact-us'
    },
    {
      icon: <Bug size={24} />,
      title: 'Report a Bug',
      description: 'Found an issue? Let us know',
      link: '/docs/bug-report'
    }
  ];

  const faqs = [
    {
      question: 'How do I get started with BlockchainVibe?',
      answer: 'Simply click "Sign In" and choose your preferred OAuth provider (Google, GitHub, Twitter/X, or Discord). Once authenticated, you can start browsing news and customizing your feed in Settings.'
    },
    {
      question: 'Is BlockchainVibe free to use?',
      answer: 'Yes! BlockchainVibe is completely free to use. All features including AI personalization, analytics, and news aggregation are available at no cost.'
    },
    {
      question: 'How does the AI personalization work?',
      answer: 'Our AI agents analyze your reading history, interests, and engagement patterns to calculate personalized relevance scores for each article. The more you read and interact, the better the recommendations become.'
    },
    {
      question: 'Can I use BlockchainVibe without signing up?',
      answer: 'Yes, you can browse the public news feed and trending articles without an account. However, signing up enables personalization, saved articles, and analytics features.'
    },
    {
      question: 'How often is news updated?',
      answer: 'News is updated in real-time. Our News Fetcher Agent continuously monitors all sources, so new articles appear within minutes of publication.'
    },
    {
      question: 'What sources does BlockchainVibe aggregate from?',
      answer: 'We aggregate news from 50+ trusted blockchain sources including CoinDesk, CoinTelegraph, Decrypt, The Block, Bitcoin Magazine, and many more.'
    },
    {
      question: 'How do I customize my news feed?',
      answer: 'Go to Settings and select your interests (Bitcoin, Ethereum, DeFi, NFT, etc.). The AI will then prioritize articles related to your selected topics.'
    },
    {
      question: 'Can I export my reading data?',
      answer: 'Yes! Go to Settings > Privacy > Export Data to download your reading history, saved articles, and profile data in JSON format.'
    }
  ];

  return (
    <PageContainer>
      <AnimatedBackground />
      <Navigation theme={theme} onThemeChange={setTheme} />
      <ContentContainer>
        <Hero>
          <HeroTitle>Help Center</HeroTitle>
          <HeroSubtitle>
            Find answers to common questions, troubleshooting guides, and helpful resources 
            to get the most out of BlockchainVibe.
          </HeroSubtitle>
          <SearchBar>
            <SearchInput type="text" placeholder="Search for help..." />
            <SearchIcon size={20} />
          </SearchBar>
        </Hero>

        <QuickLinks>
          {quickLinks.map((link, index) => (
            <QuickLinkCard key={index} to={link.link}>
              <QuickLinkIcon>{link.icon}</QuickLinkIcon>
              <QuickLinkTitle>{link.title}</QuickLinkTitle>
              <QuickLinkDescription>{link.description}</QuickLinkDescription>
            </QuickLinkCard>
          ))}
        </QuickLinks>

        <Section>
          <SectionTitle>Frequently Asked Questions</SectionTitle>
          <FAQGrid>
            {faqs.map((faq, index) => (
              <FAQCard key={index}>
                <FAQQuestion>{faq.question}</FAQQuestion>
                <FAQAnswer>{faq.answer}</FAQAnswer>
              </FAQCard>
            ))}
          </FAQGrid>
        </Section>

        <Section>
          <SectionTitle>Still Need Help?</SectionTitle>
          <FAQCard>
            <FAQAnswer>
              Can't find what you're looking for?{' '}
              <Link to="/docs/contact-us" style={{ color: 'inherit', textDecoration: 'underline' }}>
                Contact our support team
              </Link>{' '}
              or{' '}
              <Link to="/docs/bug-report" style={{ color: 'inherit', textDecoration: 'underline' }}>
                report a bug
              </Link>{' '}
              if you've found an issue.
            </FAQAnswer>
          </FAQCard>
        </Section>
      </ContentContainer>
      <Footer />
    </PageContainer>
  );
};

export default HelpCenter;

