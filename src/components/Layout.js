import React, { useRef } from 'react';
import styled from 'styled-components';
import Sidebar from './Sidebar';
import AnimatedBackground from './AnimatedBackground';
import Footer from './Footer';
import { SubscriptionBanner } from './Subscription';
import { useSidebar } from '../contexts/SidebarContext';

const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  position: relative;
`;

const SkipToContent = styled.a`
  position: absolute;
  top: -100px;
  left: 1rem;
  z-index: 1000;
  padding: 0.75rem 1.25rem;
  background: ${(p) => p.theme.colors.primary};
  color: ${(p) => p.theme.colors.textInverse};
  font-size: ${(p) => p.theme.fontSize.sm};
  font-weight: ${(p) => p.theme.fontWeight.medium};
  border-radius: ${(p) => p.theme.borderRadius.md};
  text-decoration: none;
  transition: top 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    top: 1rem;
    outline: 2px solid ${(p) => p.theme.colors.primary};
    outline-offset: 2px;
    box-shadow: ${(p) => p.theme.shadows.lg};
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  flex: 1;
`;

const MainContent = styled.main`
  flex: 1;
  margin-left: ${props => props.sidebarCollapsed ? '80px' : props.theme.layout.sidebarWidth};
  padding: 0;
  overflow-x: hidden;
  position: relative;
  z-index: 2;
  background: transparent;
  transition: margin-left ${props => props.theme.transitions.normal};
  
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    margin-left: 0;
  }
`;

const Layout = ({ children, showSidebar = true }) => {
  const { collapsed } = useSidebar();
  const mainRef = useRef(null);

  const handleSkipClick = (e) => {
    e.preventDefault();
    mainRef.current?.focus({ preventScroll: false });
    mainRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <LayoutContainer>
      <SkipToContent href="#main-content" onClick={handleSkipClick}>
        Skip to main content
      </SkipToContent>
      <AnimatedBackground />
      <ContentWrapper>
        {showSidebar && <Sidebar />}
        <MainContent
          id="main-content"
          ref={mainRef}
          tabIndex={-1}
          sidebarCollapsed={collapsed}
          aria-label="Main content"
        >
          <SubscriptionBanner />
          {children}
        </MainContent>
      </ContentWrapper>
      <Footer />
    </LayoutContainer>
  );
};

export default Layout;
