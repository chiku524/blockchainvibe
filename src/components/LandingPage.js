import React, { useRef } from 'react';
import styled from 'styled-components';
import { motion, useInView } from 'framer-motion';
import { useQuery } from 'react-query';
import { 
  ArrowRight, 
  TrendingUp, 
  Brain, 
  Shield, 
  Star,
  Newspaper,
  Gift
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Navigation from './Navigation';
import AnimatedBackground from './AnimatedBackground';
import Footer from './Footer';
import PageMeta from './PageMeta';
import { launchesAPI } from '../services/api';

const LandingContainer = styled.div`
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text};
  position: relative;
  z-index: 2;
  isolation: isolate;
`;


const HeroSection = styled.section`
  min-height: 100vh;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, 
    ${props => props.theme.colors.primary}10 0%, 
    ${props => props.theme.colors.secondary}10 100%);
  position: relative;
  padding-top: 72px;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  box-sizing: border-box;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding-top: 80px;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse"><path d="M 10 0 L 0 0 0 10" fill="none" stroke="%236366f1" stroke-width="0.5" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grid)"/></svg>');
    opacity: 0.3;
  }
`;

const HeroContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  text-align: center;
  position: relative;
  z-index: 1;
  width: 100%;
  box-sizing: border-box;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: 1.5rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: 2rem;
  }
`;

const HeroTitle = styled(motion.h1)`
  font-size: clamp(2.5rem, 8vw, 4rem);
  font-weight: ${props => props.theme.fontWeight.extrabold};
  background: ${props => props.theme.gradients.text};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1.5rem;
  line-height: 1.2;
`;

const HeroSubtitle = styled(motion.p)`
  font-size: clamp(1.125rem, 3vw, 1.5rem);
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`;

const CTAButtons = styled(motion.div)`
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
  margin-bottom: 3rem;
`;

const PrimaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: ${props => props.theme.gradients.primary};
  color: ${props => props.theme.colors.textInverse};
  border: none;
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.fontSize.sm};
  font-weight: ${props => props.theme.fontWeight.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.normal};
  box-shadow: ${props => props.theme.shadows.lg};

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: 1rem 2rem;
    font-size: ${props => props.theme.fontSize.lg};
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: ${props => props.theme.shadows.xl};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const SecondaryButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: transparent;
  color: ${props => props.theme.colors.text};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  font-size: ${props => props.theme.fontSize.sm};
  font-weight: ${props => props.theme.fontWeight.semibold};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.normal};

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: 1rem 2rem;
    font-size: ${props => props.theme.fontSize.lg};
  }
  
  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    border-color: ${props => props.theme.colors.primary};
    color: ${props => props.theme.colors.primary};
  }
`;

const WhatsOnSection = styled.section`
  padding: 3rem 1rem;
  background: ${props => props.theme.colors.background};
  position: relative;
  z-index: 1;
  box-sizing: border-box;
  border-top: 1px solid ${props => props.theme.colors.border};
`;

const WhatsOnContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const WhatsOnTitle = styled.h2`
  font-size: ${props => props.theme.fontSize['2xl']};
  font-weight: ${props => props.theme.fontWeight.bold};
  color: ${props => props.theme.colors.text};
  text-align: center;
  margin-bottom: 0.5rem;
`;

const WhatsOnSubtitle = styled.p`
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  text-align: center;
  margin-bottom: 1.5rem;
`;

const WhatsOnList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
`;

const WhatsOnLink = styled.a`
  display: block;
  padding: 0.75rem 1rem;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  color: ${props => props.theme.colors.text};
  text-decoration: none;
  font-weight: ${props => props.theme.fontWeight.medium};
  transition: border-color 0.2s;
  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const WhatsOnCta = styled.button`
  display: block;
  margin: 0 auto;
  padding: 0.75rem 1.5rem;
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.textInverse};
  border: none;
  border-radius: ${props => props.theme.borderRadius.lg};
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
  margin-right: auto;
  &:hover { opacity: 0.9; }
`;

const FeaturesSection = styled.section`
  padding: 3rem 1rem;
  background: ${props => props.theme.colors.surface};
  margin-top: 1rem;
  position: relative;
  z-index: 1;
  box-sizing: border-box;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: 4rem 1.5rem;
    margin-top: 2rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    padding: 6rem 2rem;
  }
`;

const FeaturesContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled(motion.h2)`
  font-size: ${props => props.theme.fontSize['2xl']};
  font-weight: ${props => props.theme.fontWeight.bold};
  text-align: center;
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

const SectionSubtitle = styled.p`
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  text-align: center;
  margin-bottom: 2rem;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  padding: 0 0.5rem;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.theme.fontSize.lg};
    margin-bottom: 3rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    font-size: ${props => props.theme.fontSize.xl};
    margin-bottom: 4rem;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  margin-bottom: 2rem;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-bottom: 4rem;
  }
`;

const FeatureCard = styled(motion.div)`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1.25rem;
  text-align: center;
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

const FeatureIcon = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: ${props => props.theme.gradients.primary};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
  color: ${props => props.theme.colors.textInverse};
  font-size: 1.5rem;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    width: 80px;
    height: 80px;
    margin-bottom: 1.5rem;
    font-size: 2rem;
  }
`;

const FeatureTitle = styled.h3`
  font-size: ${props => props.theme.fontSize.lg};
  font-weight: ${props => props.theme.fontWeight.bold};
  margin-bottom: 0.5rem;
  color: ${props => props.theme.colors.text};

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.theme.fontSize.xl};
    margin-bottom: 1rem;
  }
`;

const FeatureDescription = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  line-height: 1.6;
  font-size: ${props => props.theme.fontSize.sm};

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    font-size: inherit;
  }
`;

const CTASection = styled.section`
  padding: 3rem 1rem;
  background: ${props => props.theme.colors.surface};
  text-align: center;
  position: relative;
  z-index: 1;
  box-sizing: border-box;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: 4rem 1.5rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    padding: 6rem 2rem;
  }
`;

const CTAContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const CTATitle = styled.h2`
  font-size: ${props => props.theme.fontSize['2xl']};
  font-weight: ${props => props.theme.fontWeight.bold};
  margin-bottom: 0.75rem;
  color: ${props => props.theme.colors.text};

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.theme.fontSize['3xl']};
    margin-bottom: 1rem;
  }
`;

const CTADescription = styled.p`
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-bottom: 1.5rem;
  padding: 0 0.5rem;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    font-size: ${props => props.theme.fontSize.lg};
    margin-bottom: 2rem;
  }
`;


// Pricing Section Styles
const PricingSection = styled.section`
  padding: 3rem 0;
  background: ${props => props.theme.colors.background};
  position: relative;
  z-index: 1;
  box-sizing: border-box;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: 4rem 0;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    padding: 6rem 0;
  }
`;

const PricingContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: 0 1.5rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    padding: 0 2rem;
  }
`;

const PricingGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;
  margin-top: 2rem;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
    gap: 1.5rem;
    margin-top: 3rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 4rem;
  }
`;

const PricingCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.xl};
  padding: 1.25rem;
  position: relative;
  transition: all ${props => props.theme.transitions.normal};

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: 2rem;
  }
  
  ${props => props.featured && `
    border-color: ${props.theme.colors.primary};
    transform: scale(1.05);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  `}
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  }
`;

const PricingBadge = styled.div`
  position: absolute;
  top: -10px;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.textInverse};
  padding: 0.5rem 1rem;
  border-radius: ${props => props.theme.borderRadius.full};
  font-size: ${props => props.theme.fontSize.sm};
  font-weight: ${props => props.theme.fontWeight.medium};
`;

const PricingHeader = styled.div`
  margin-bottom: 2rem;
`;

const PricingTitle = styled.h3`
  font-size: ${props => props.theme.fontSize.xl};
  font-weight: ${props => props.theme.fontWeight.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 1rem;
`;

const PricingPrice = styled.div`
  font-size: ${props => props.theme.fontSize['4xl']};
  font-weight: ${props => props.theme.fontWeight.bold};
  color: ${props => props.theme.colors.primary};
  
  span {
    font-size: ${props => props.theme.fontSize.lg};
    color: ${props => props.theme.colors.textSecondary};
  }
`;

const PricingFeatures = styled.div`
  margin-bottom: 2rem;
`;

const PricingFeature = styled.div`
  padding: 0.5rem 0;
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSize.md};
`;

const PricingButton = styled.button`
  width: 100%;
  padding: 1rem 2rem;
  border-radius: ${props => props.theme.borderRadius.lg};
  font-weight: ${props => props.theme.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  border: none;
  
  ${props => props.variant === 'primary' && `
    background: ${props.theme.colors.primary};
    color: ${props.theme.colors.textInverse};
    
    &:hover {
      background: ${props.theme.colors.primaryHover};
    }
  `}
  
  ${props => props.variant === 'secondary' && `
    background: transparent;
    color: ${props.theme.colors.text};
    border: 1px solid ${props.theme.colors.border};
    
    &:hover {
      background: ${props.theme.colors.surfaceHover};
    }
  `}
`;

// About Section Styles
const AboutSection = styled.section`
  padding: 3rem 0;
  background: ${props => props.theme.colors.surface};
  position: relative;
  z-index: 1;
  box-sizing: border-box;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: 4rem 0;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    padding: 6rem 0;
  }
`;

const AboutContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: 0 1.5rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    padding: 0 2rem;
  }
`;

const AboutContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  align-items: center;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    gap: 4rem;
  }
`;

const AboutText = styled.div`
  text-align: left;
`;

const AboutDescription = styled.p`
  font-size: ${props => props.theme.fontSize.lg};
  line-height: 1.7;
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 1.5rem;
`;

const AboutStats = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const AboutStat = styled(motion.div)`
  text-align: center;
  
  h3 {
    font-size: ${props => props.theme.fontSize['3xl']};
    font-weight: ${props => props.theme.fontWeight.bold};
    color: ${props => props.theme.colors.primary};
    margin-bottom: 0.5rem;
  }
  
  p {
    color: ${props => props.theme.colors.textSecondary};
    font-size: ${props => props.theme.fontSize.md};
  }
`;

// Contact Section Styles
const ContactSection = styled.section`
  padding: 3rem 0;
  background: ${props => props.theme.colors.background};
  position: relative;
  z-index: 1;
  box-sizing: border-box;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: 4rem 0;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    padding: 6rem 0;
  }
`;

const ContactContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  text-align: center;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: 0 1.5rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    padding: 0 2rem;
  }
`;

const ContactContent = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-top: 2rem;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-top: 3rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    gap: 4rem;
    margin-top: 4rem;
  }
`;

const ContactInfo = styled.div`
  text-align: left;
`;

const ContactItem = styled.div`
  margin-bottom: 2rem;
  
  h4 {
    font-size: ${props => props.theme.fontSize.lg};
    font-weight: ${props => props.theme.fontWeight.semibold};
    color: ${props => props.theme.colors.text};
    margin-bottom: 0.5rem;
  }
  
  p {
    color: ${props => props.theme.colors.textSecondary};
    font-size: ${props => props.theme.fontSize.md};
  }
`;

const ContactForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const FormInput = styled.input`
  padding: 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSize.md};
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const FormTextarea = styled.textarea`
  padding: 1rem;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  background: ${props => props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  font-size: ${props => props.theme.fontSize.md};
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }
`;

const FormButton = styled.button`
  padding: 1rem 2rem;
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.textInverse};
  border: none;
  border-radius: ${props => props.theme.borderRadius.lg};
  font-weight: ${props => props.theme.fontWeight.medium};
  cursor: pointer;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background: ${props => props.theme.colors.primaryHover};
  }
`;


const LandingPage = ({ theme, onThemeChange }) => {
  const navigate = useNavigate();
  const { data: launchesData } = useQuery(
    ['launches', 'landing'],
    () => launchesAPI.getDrops(),
    { staleTime: 10 * 60 * 1000 }
  );
  const landingAirdrops = launchesData?.airdrops ?? [];

  const Reveal = ({ children, delay = 0 }) => {
    const ref = useRef(null);
    const inView = useInView(ref, { once: true, amount: 0.2 });
    return (
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0, transitionEnd: { opacity: 1 } } : undefined}
        transition={{ duration: 0.6, delay }}
      >
        {children}
      </motion.div>
    );
  };

  const handleGetStarted = () => {
    navigate('/register');
  };

  const handleSignIn = () => {
    navigate('/signin');
  };

  const features = [
    {
      icon: <Newspaper size={32} />,
      title: "News Hub",
      description: "All forms of crypto and blockchain news in one feed — trending, personalized, and from trusted sources."
    },
    {
      icon: <Gift size={32} />,
      title: "Airdrops & Launches",
      description: "Discover airdrops, new token launches, and NFT drops. Explain any airdrop with AI in one click."
    },
    {
      icon: <Brain size={32} />,
      title: "AI-Enhanced Experience",
      description: "Summaries, personalization, and insights powered by AI so you stay informed without the noise."
    },
    {
      icon: <TrendingUp size={32} />,
      title: "Real-Time Trending",
      description: "See what’s moving the market with trending news and token launches as they happen."
    },
    {
      icon: <Shield size={32} />,
      title: "Personalized For You",
      description: "Your feed adapts to what you read and like — news and launches that match your interests."
    },
    {
      icon: <Star size={32} />,
      title: "One Hub for Everything",
      description: "News, airdrops, launches, and AI insights in one place. No more jumping between sites."
    }
  ];

  return (
    <LandingContainer>
      <PageMeta
        title="The Go-To Hub for Crypto & Blockchain"
        description="Your one-stop hub for all crypto and blockchain: aggregated news from every angle, airdrops and token launches, and AI-powered insights. News, drops, and launches in one place."
        canonicalPath="/"
      />
      <AnimatedBackground />
      <Navigation theme={theme} onThemeChange={onThemeChange} />
      <HeroSection>
        <HeroContent>
          <HeroTitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            The Go-To Hub for Crypto & Blockchain
          </HeroTitle>
          
          <HeroSubtitle
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            All forms of news, airdrops & launches, and AI-enhanced discovery — 
            one platform for everything that moves the chain.
          </HeroSubtitle>
          
          <CTAButtons
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <PrimaryButton onClick={handleGetStarted}>
              Get Started Free
              <ArrowRight size={20} />
            </PrimaryButton>
            
            <SecondaryButton onClick={handleSignIn}>
              Sign In
            </SecondaryButton>
          </CTAButtons>
        </HeroContent>
      </HeroSection>

      <WhatsOnSection>
        <WhatsOnContainer>
          <WhatsOnTitle>What’s on right now</WhatsOnTitle>
          <WhatsOnSubtitle>Airdrops and launches — see more in the hub</WhatsOnSubtitle>
          <WhatsOnList>
            {landingAirdrops.slice(0, 3).map((a, i) => (
              <WhatsOnLink key={a.id || i} href={a.link || '#'} target="_blank" rel="noopener noreferrer">
                {a.title} {a.source ? ` · ${a.source}` : ''}
              </WhatsOnLink>
            ))}
          </WhatsOnList>
          <WhatsOnCta type="button" onClick={() => navigate('/launches')}>
            <Gift size={18} />
            See all airdrops & launches
            <ArrowRight size={18} />
          </WhatsOnCta>
        </WhatsOnContainer>
      </WhatsOnSection>

      <FeaturesSection id="features">
        <FeaturesContainer>
          <Reveal>
            <SectionTitle>
              Why BlockchainVibe?
            </SectionTitle>
          </Reveal>
          <SectionSubtitle>
            News from every source, airdrops and launches in one place, and AI that makes it all easier to follow
          </SectionSubtitle>
          
          <FeaturesGrid>
            {features.map((feature, index) => (
              <Reveal key={index} delay={index * 0.1}>
                <FeatureCard>
                  <FeatureIcon>
                    {feature.icon}
                  </FeatureIcon>
                  <FeatureTitle>{feature.title}</FeatureTitle>
                  <FeatureDescription>{feature.description}</FeatureDescription>
                </FeatureCard>
              </Reveal>
            ))}
          </FeaturesGrid>
        </FeaturesContainer>
      </FeaturesSection>

      <PricingSection id="pricing">
        <PricingContainer>
          <Reveal>
            <SectionTitle>
              Simple, Transparent Pricing
            </SectionTitle>
          </Reveal>
          <SectionSubtitle>
            Choose the plan that fits your needs. No hidden fees, no surprises.
          </SectionSubtitle>
          
          <PricingGrid>
            <PricingCard>
              <PricingHeader>
                <PricingTitle>Free</PricingTitle>
                <PricingPrice>$0<span>/month</span></PricingPrice>
              </PricingHeader>
              <PricingFeatures>
                <PricingFeature>✓ 10 articles per day</PricingFeature>
                <PricingFeature>✓ Basic AI filtering</PricingFeature>
                <PricingFeature>✓ Email support</PricingFeature>
              </PricingFeatures>
              <PricingButton variant="secondary">Get Started</PricingButton>
            </PricingCard>
            
            <PricingCard featured>
              <PricingBadge>Most Popular</PricingBadge>
              <PricingHeader>
                <PricingTitle>Pro</PricingTitle>
                <PricingPrice>$29<span>/month</span></PricingPrice>
              </PricingHeader>
              <PricingFeatures>
                <PricingFeature>✓ Unlimited articles</PricingFeature>
                <PricingFeature>✓ Advanced AI personalization</PricingFeature>
                <PricingFeature>✓ Priority support</PricingFeature>
                <PricingFeature>✓ Custom feeds</PricingFeature>
              </PricingFeatures>
              <PricingButton variant="primary">Start Free Trial</PricingButton>
            </PricingCard>
            
            <PricingCard>
              <PricingHeader>
                <PricingTitle>Enterprise</PricingTitle>
                <PricingPrice>Custom</PricingPrice>
              </PricingHeader>
              <PricingFeatures>
                <PricingFeature>✓ Everything in Pro</PricingFeature>
                <PricingFeature>✓ White-label solution</PricingFeature>
                <PricingFeature>✓ Dedicated support</PricingFeature>
                <PricingFeature>✓ Custom integrations</PricingFeature>
              </PricingFeatures>
              <PricingButton variant="secondary">Contact Sales</PricingButton>
            </PricingCard>
          </PricingGrid>
        </PricingContainer>
      </PricingSection>

      <AboutSection id="about">
        <AboutContainer>
          <AboutContent>
            <AboutText>
              <Reveal>
                <SectionTitle>
                  About BlockchainVibe
                </SectionTitle>
              </Reveal>
              <SectionSubtitle>
                We're revolutionizing how the blockchain community consumes news through 
                cutting-edge AI technology and intelligent automation.
              </SectionSubtitle>
              <AboutDescription>
                BlockchainVibe is built to be the go-to hub for crypto and blockchain users: 
                all forms of news in one place, airdrops and launches everyone is looking for, 
                and AI that enhances how you discover and understand it all.
              </AboutDescription>
            </AboutText>
            <AboutStats>
              <Reveal delay={0.1}>
                <AboutStat>
                  <h3>50+</h3>
                  <p>News Sources</p>
                </AboutStat>
              </Reveal>
              <Reveal delay={0.2}>
                <AboutStat>
                  <h3>24/7</h3>
                  <p>AI Monitoring</p>
                </AboutStat>
              </Reveal>
              <Reveal delay={0.3}>
                <AboutStat>
                  <h3>99.9%</h3>
                  <p>Accuracy Rate</p>
                </AboutStat>
              </Reveal>
            </AboutStats>
          </AboutContent>
        </AboutContainer>
      </AboutSection>

      <ContactSection id="contact">
        <ContactContainer>
          <Reveal>
            <SectionTitle>
              Get in Touch
            </SectionTitle>
          </Reveal>
          <SectionSubtitle>
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </SectionSubtitle>
          
          <ContactContent>
            <ContactInfo>
              <ContactItem>
                <h4>Email</h4>
                <p>hello@blockchainvibe.news</p>
              </ContactItem>
              <ContactItem>
                <h4>Discord</h4>
                <p>Join our community</p>
              </ContactItem>
              <ContactItem>
                <h4>Twitter</h4>
                <p>@BlockchainVibe</p>
              </ContactItem>
            </ContactInfo>
            
            <ContactForm>
              <FormGroup>
                <FormInput id="landing-name" name="name" type="text" placeholder="Your Name" />
              </FormGroup>
              <FormGroup>
                <FormInput id="landing-email" name="email" type="email" placeholder="Your Email" />
              </FormGroup>
              <FormGroup>
                <FormTextarea id="landing-message" name="message" placeholder="Your Message" rows="5" />
              </FormGroup>
              <FormButton>Send Message</FormButton>
            </ContactForm>
          </ContactContent>
        </ContactContainer>
      </ContactSection>

      <CTASection>
        <CTAContainer>
          <CTATitle>Ready to Make This Your Crypto Hub?</CTATitle>
          <CTADescription>
            Join the hub: one place for crypto news, airdrops, launches, and AI-powered insights.
          </CTADescription>
          <CTAButtons>
            <PrimaryButton onClick={handleGetStarted}>
              Start Your Journey
              <ArrowRight size={20} />
            </PrimaryButton>
          </CTAButtons>
        </CTAContainer>
      </CTASection>

      <Footer />
    </LandingContainer>
  );
};

export default LandingPage;
