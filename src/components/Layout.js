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
  overflow-x: hidden;
  width: 100%;
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
  min-height: 0;
`;

const MainAndFooterWrap = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  margin-left: ${props => (props.sidebarCollapsed ? '80px' : props.theme.layout.sidebarWidth)};
  transition: margin-left ${props => props.theme.transitions.normal};
  min-width: 0;
  max-width: 100%;
  overflow-x: hidden;

  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    margin-left: 0;
    width: 100%;
  }
`;

const MainContent = styled.main`
  flex: 1;
  padding: 0;
  overflow-x: hidden;
  position: relative;
  z-index: 2;
  background: transparent;
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
        <MainAndFooterWrap sidebarCollapsed={collapsed}>
          <MainContent
            id="main-content"
            ref={mainRef}
            tabIndex={-1}
            aria-label="Main content"
          >
            <SubscriptionBanner />
            {children}
          </MainContent>
          <Footer />
        </MainAndFooterWrap>
      </ContentWrapper>
    </LayoutContainer>
  );
};

export default Layout;
