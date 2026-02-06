import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import AnimatedBackground from './AnimatedBackground';
import Footer from './Footer';
import { SubscriptionBanner } from './Subscription';
import { useSidebar } from '../contexts/SidebarContext';
import PageMeta from './PageMeta';

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

const QuickSearchOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 15vh 1rem 0;
  z-index: 2000;
  box-sizing: border-box;
`;

const QuickSearchBox = styled.div`
  width: 100%;
  max-width: 560px;
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.borderRadius.lg};
  box-shadow: ${(p) => p.theme.shadows['2xl']};
  overflow: hidden;
`;

const QuickSearchInput = styled.input`
  width: 100%;
  padding: 1rem 1.25rem;
  font-size: ${(p) => p.theme.fontSize.lg};
  border: none;
  background: transparent;
  color: ${(p) => p.theme.colors.text};
  outline: none;
  &::placeholder {
    color: ${(p) => p.theme.colors.textMuted};
  }
`;

const QuickSearchHint = styled.div`
  padding: 0.5rem 1.25rem;
  font-size: ${(p) => p.theme.fontSize.xs};
  color: ${(p) => p.theme.colors.textSecondary};
  border-top: 1px solid ${(p) => p.theme.colors.border};
`;

const Layout = ({ children, showSidebar = true }) => {
  const { collapsed } = useSidebar();
  const mainRef = useRef(null);
  const navigate = useNavigate();
  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [quickSearchQuery, setQuickSearchQuery] = useState('');
  const quickSearchInputRef = useRef(null);

  useEffect(() => {
    const onKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setQuickSearchOpen((o) => !o);
        setQuickSearchQuery('');
        setTimeout(() => quickSearchInputRef.current?.focus(), 50);
      }
      if (e.key === 'Escape') setQuickSearchOpen(false);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleQuickSearchSubmit = (e) => {
    e.preventDefault();
    const q = quickSearchQuery.trim();
    if (q) navigate(`/search?q=${encodeURIComponent(q)}`);
    setQuickSearchOpen(false);
    setQuickSearchQuery('');
  };

  const handleSkipClick = (e) => {
    e.preventDefault();
    mainRef.current?.focus({ preventScroll: false });
    mainRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <LayoutContainer>
      <PageMeta />
      {quickSearchOpen && (
        <QuickSearchOverlay onClick={() => setQuickSearchOpen(false)}>
          <QuickSearchBox onClick={(e) => e.stopPropagation()}>
            <form onSubmit={handleQuickSearchSubmit}>
              <QuickSearchInput
                ref={quickSearchInputRef}
                type="text"
                placeholder="Search news..."
                value={quickSearchQuery}
                onChange={(e) => setQuickSearchQuery(e.target.value)}
                aria-label="Quick search"
              />
            </form>
            <QuickSearchHint>Press Enter to search · Esc to close · ⌘K / Ctrl+K to open again</QuickSearchHint>
          </QuickSearchBox>
        </QuickSearchOverlay>
      )}
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
