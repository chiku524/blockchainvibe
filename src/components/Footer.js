import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Github, Twitter, Globe, Mail } from 'lucide-react';

const FooterContainer = styled.footer`
  border-top: 1px solid ${props => props.theme.colors.border};
  background: ${props => props.theme.colors.surface};
  position: relative;
  z-index: 2;
`;

const FooterInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;

  @media (min-width: 640px) {
    grid-template-columns: 1fr 1fr;
    padding: 1.5rem;
  }
  @media (min-width: 900px) {
    grid-template-columns: 2fr 1fr 1fr 1fr;
    gap: 2rem;
    padding: 2rem;
  }
  @media (min-width: 1200px) {
    grid-template-columns: 2fr 1fr 1fr 1fr 1fr;
  }
`;

const Brand = styled.div`
  color: ${props => props.theme.colors.text};
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const BrandLogo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
`;

const LogoImage = styled.img`
  height: 40px;
  width: auto;
  object-fit: contain;
`;

const BrandTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  font-size: ${props => props.theme.fontSize.xl};
  font-weight: ${props => props.theme.fontWeight.bold};
  background: ${props => props.theme.gradients.text};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const BrandText = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

const Column = styled.div``;

const ColumnTitle = styled.h4`
  margin: 0 0 0.75rem 0;
  color: ${props => props.theme.colors.text};
  font-weight: ${props => props.theme.fontWeight.semibold};
`;

const LinkList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const FooterLink = styled.a`
  color: ${props => props.theme.colors.textSecondary};
  text-decoration: none;
  font-size: ${props => props.theme.fontSize.sm};
  &:hover { color: ${props => props.theme.colors.text}; }
`;

const FooterRouterLink = styled(Link)`
  color: ${props => props.theme.colors.textSecondary};
  text-decoration: none;
  font-size: ${props => props.theme.fontSize.sm};
  &:hover { color: ${props => props.theme.colors.text}; }
`;

const BottomBar = styled.div`
  border-top: 1px solid ${props => props.theme.colors.border};
  padding: 1rem 0;
`;

const BottomInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSize.xs};
  flex-wrap: wrap;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: 0 1.5rem;
    font-size: ${props => props.theme.fontSize.sm};
  }
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: 0 2rem;
  }
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Socials = styled.div`
  display: flex;
  gap: 0.75rem;
`;

const IconLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.full};
  color: ${props => props.theme.colors.textSecondary};
  &:hover { color: ${props => props.theme.colors.text}; border-color: ${props => props.theme.colors.primary}; }
`;

const Footer = () => {
  return (
    <FooterContainer>
      <FooterInner>
        <Brand>
          <BrandLogo>
            <LogoImage src="/logo.svg" alt="BlockchainVibe Logo" />
            <BrandTitle>BlockchainVibe</BrandTitle>
          </BrandLogo>
          <BrandText>Your hub for crypto news, airdrops, and launches — powered by AI.</BrandText>
          <BrandText style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>Tip: Press ⌘K (Mac) or Ctrl+K (Win) to search from anywhere.</BrandText>
        </Brand>
        <Column>
          <ColumnTitle>Discover</ColumnTitle>
          <LinkList>
            <FooterRouterLink to="/airdrops">Latest airdrops</FooterRouterLink>
            <FooterRouterLink to="/new-token-launches">New token launches</FooterRouterLink>
            <FooterRouterLink to="/launches">Launches & Drops hub</FooterRouterLink>
            <FooterRouterLink to="/calendar">Crypto calendar</FooterRouterLink>
            <FooterRouterLink to="/alerts">Alerts</FooterRouterLink>
          </LinkList>
        </Column>
        <Column>
          <ColumnTitle>Resources</ColumnTitle>
          <LinkList>
            <FooterRouterLink to="/docs">Documentation</FooterRouterLink>
            <FooterRouterLink to="/docs/whitepaper">Whitepaper</FooterRouterLink>
            <FooterRouterLink to="/docs/api-reference">API Reference</FooterRouterLink>
            <FooterRouterLink to="/docs/ai-integration">AI Integration</FooterRouterLink>
            <FooterLink href="https://github.com/chiku524/ai-news-agent" target="_blank" rel="noreferrer">GitHub</FooterLink>
          </LinkList>
        </Column>
        <Column>
          <ColumnTitle>Support</ColumnTitle>
          <LinkList>
            <FooterRouterLink to="/docs/help-center">Help Center</FooterRouterLink>
            <FooterRouterLink to="/docs/contact-us">Contact Us</FooterRouterLink>
            <FooterRouterLink to="/docs/bug-report">Report a Bug</FooterRouterLink>
            <FooterLink href="https://github.com/chiku524/ai-news-agent/issues" target="_blank" rel="noreferrer">GitHub Issues</FooterLink>
          </LinkList>
        </Column>
        <Column>
          <ColumnTitle>Legal</ColumnTitle>
          <LinkList>
            <FooterRouterLink to="/docs/terms">Terms of Service</FooterRouterLink>
            <FooterRouterLink to="/docs/privacy">Privacy Policy</FooterRouterLink>
          </LinkList>
        </Column>
      </FooterInner>
      <BottomBar>
        <BottomInner>
          <div>© {new Date().getFullYear()} BlockchainVibe. All rights reserved.</div>
          <Socials>
            <IconLink href="https://blockchainvibe.news" aria-label="Website"><Globe size={18} /></IconLink>
            <IconLink href="https://github.com/chiku524/ai-news-agent" target="_blank" rel="noreferrer" aria-label="GitHub"><Github size={18} /></IconLink>
            <IconLink href="#" aria-label="Twitter"><Twitter size={18} /></IconLink>
            <IconLink href="mailto:contact@blockchainvibe.news" aria-label="Email"><Mail size={18} /></IconLink>
          </Socials>
        </BottomInner>
      </BottomBar>
    </FooterContainer>
  );
};

export default Footer;
