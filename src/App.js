import React, { Suspense, lazy, useEffect } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// Components
import LandingPage from './components/LandingPage';
import SignIn from './components/Auth/SignIn';
import Register from './components/Auth/Register';
import OAuthCallback from './components/Auth/OAuthCallback';
import Layout from './components/Layout';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorBoundary from './components/ErrorBoundary';

// Context
import { ThemeProvider as CustomThemeProvider, useTheme } from './contexts/ThemeContext';
import { SidebarProvider } from './contexts/SidebarContext';
import { SubscriptionProvider } from './contexts/SubscriptionContext';
import { userAPI } from './services/api';

// Lazy load components for better performance
const Dashboard = lazy(() => import('./components/Dashboard/Dashboard'));
const Trending = lazy(() => import('./components/Trending'));
const ForYou = lazy(() => import('./components/ForYou'));
const NewsFeed = lazy(() => import('./components/NewsFeed'));
const NewsDetail = lazy(() => import('./components/NewsDetail'));
const UserProfile = lazy(() => import('./components/UserProfile'));
const SearchResults = lazy(() => import('./components/SearchResults'));
const Analytics = lazy(() => import('./components/Analytics'));
const SavedArticles = lazy(() => import('./components/SavedArticles'));
const LikedArticles = lazy(() => import('./components/LikedArticles'));
const Settings = lazy(() => import('./components/Settings'));
const NotFound = lazy(() => import('./components/NotFound'));
const Documentation = lazy(() => import('./components/Documentation'));
const DocPage = lazy(() => import('./components/DocPage'));
const HelpCenter = lazy(() => import('./components/HelpCenter'));
const ContactUsPage = lazy(() => import('./components/ContactUsPage'));
const BugReportPage = lazy(() => import('./components/BugReportPage'));
const AIInsights = lazy(() => import('./components/AIInsights'));
const LaunchesPage = lazy(() => import('./components/Launches/LaunchesPage'));

// Enhanced React Query configuration with optimized caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false, // Prevent unnecessary refetches
      refetchOnReconnect: true, // Refetch when connection is restored
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.response?.status >= 400 && error?.response?.status < 500) {
          return false;
        }
        // Retry up to 2 times for network errors or 5xx errors
        return failureCount < 2;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
      staleTime: 5 * 60 * 1000, // 5 minutes - data is fresh for 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes - keep unused data in cache for 10 minutes
      keepPreviousData: true, // Keep previous data while fetching new data
      structuralSharing: true, // Enable structural sharing for better performance
    },
    mutations: {
      retry: 1, // Retry mutations once on failure
      retryDelay: 1000,
    },
  },
});

const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text};
    line-height: 1.6;
  }

  code {
    font-family: 'Fira Code', 'Monaco', 'Consolas', 'Courier New', monospace;
  }

  a {
    color: ${props => props.theme.colors.primary};
    text-decoration: none;
    transition: color 0.2s ease;
  }

  a:hover {
    color: ${props => props.theme.colors.primaryHover};
  }

  a:focus-visible {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
    border-radius: 2px;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    font-family: inherit;
  }

  button:focus-visible {
    outline: 2px solid ${props => props.theme.colors.primary};
    outline-offset: 2px;
  }

  input, textarea {
    font-family: inherit;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${props => props.theme.colors.background};
  }

  ::-webkit-scrollbar-thumb {
    background: ${props => props.theme.colors.border};
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${props => props.theme.colors.textSecondary};
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme.colors.background};
  position: relative;
  z-index: 1;
`;

const AppContent = () => {
  const { theme, currentTheme, setTheme } = useTheme();

  // Flush "reading_session" durations when user returns focus to the app
  useEffect(() => {
    const onFocus = async () => {
      try {
        const raw = localStorage.getItem('reading_session');
        if (!raw) return;
        const session = JSON.parse(raw);
        if (!session?.started_at || !session?.article_id) return;
        const durationMs = Date.now() - session.started_at;
        if (durationMs > 0) {
          await userAPI.trackActivity({
            type: 'read',
            article_id: session.article_id,
            article_title: session.article_title,
            article_source: session.article_source,
            duration_ms: durationMs,
            metadata: { method: 'focus_return' }
          });
        }
      } catch {}
      finally {
        try { localStorage.removeItem('reading_session'); } catch {}
      }
    };
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  return (
    <ThemeProvider theme={currentTheme}>
      <GlobalStyle />
      <SidebarProvider>
        <SubscriptionProvider>
        <Router>
          <AppContainer>
            <Routes>
            <Route path="/" element={<LandingPage theme={theme} onThemeChange={setTheme} />} />
            <Route path="/signin" element={<SignIn />} />
            <Route path="/register" element={<Register />} />
            <Route path="/auth/callback" element={<OAuthCallback />} />
            <Route path="/dashboard" element={
              <Layout>
                <Suspense fallback={<LoadingSpinner message="Loading dashboard..." />}>
                  <Dashboard />
                </Suspense>
              </Layout>
            } />
            <Route path="/trending" element={
              <Layout>
                <Suspense fallback={<LoadingSpinner message="Loading trending..." />}>
                  <Trending />
                </Suspense>
              </Layout>
            } />
            <Route path="/for-you" element={
              <Layout>
                <Suspense fallback={<LoadingSpinner message="Personalizing your feed..." />}>
                  <ForYou />
                </Suspense>
              </Layout>
            } />
            <Route path="/news" element={
              <Layout>
                <Suspense fallback={<LoadingSpinner message="Loading news..." />}>
                  <NewsFeed />
                </Suspense>
              </Layout>
            } />
            <Route path="/news/:id" element={
              <Layout>
                <Suspense fallback={<LoadingSpinner message="Loading article..." />}>
                  <NewsDetail />
                </Suspense>
              </Layout>
            } />
            <Route path="/search" element={
              <Layout>
                <Suspense fallback={<LoadingSpinner message="Loading search..." />}>
                  <SearchResults />
                </Suspense>
              </Layout>
            } />
            <Route path="/profile" element={
              <Layout>
                <Suspense fallback={<LoadingSpinner message="Loading profile..." />}>
                  <UserProfile />
                </Suspense>
              </Layout>
            } />
            <Route path="/analytics" element={
              <Layout>
                <Suspense fallback={<LoadingSpinner message="Loading analytics..." />}>
                  <Analytics />
                </Suspense>
              </Layout>
            } />
            <Route path="/ai-insights" element={
              <Layout>
                <Suspense fallback={<LoadingSpinner message="Loading AI insights..." />}>
                  <AIInsights />
                </Suspense>
              </Layout>
            } />
            <Route path="/launches" element={
              <Layout>
                <Suspense fallback={<LoadingSpinner message="Loading launches & drops..." />}>
                  <LaunchesPage />
                </Suspense>
              </Layout>
            } />
            <Route path="/saved" element={
              <Layout>
                <Suspense fallback={<LoadingSpinner message="Loading saved articles..." />}>
                  <SavedArticles />
                </Suspense>
              </Layout>
            } />
            <Route path="/liked" element={
              <Layout>
                <Suspense fallback={<LoadingSpinner message="Loading liked articles..." />}>
                  <LikedArticles />
                </Suspense>
              </Layout>
            } />
            <Route path="/settings" element={
              <Layout>
                <Suspense fallback={<LoadingSpinner message="Loading settings..." />}>
                  <Settings />
                </Suspense>
              </Layout>
            } />
            <Route path="/docs" element={
              <Suspense fallback={<LoadingSpinner message="Loading documentation..." />}>
                <Documentation />
              </Suspense>
            } />
            <Route path="/docs/help-center" element={
              <Suspense fallback={<LoadingSpinner message="Loading help center..." />}>
                <HelpCenter />
              </Suspense>
            } />
            <Route path="/docs/contact-us" element={
              <Suspense fallback={<LoadingSpinner message="Loading contact us..." />}>
                <ContactUsPage />
              </Suspense>
            } />
            <Route path="/docs/bug-report" element={
              <Suspense fallback={<LoadingSpinner message="Loading bug report..." />}>
                <BugReportPage />
              </Suspense>
            } />
            <Route path="/docs/:page" element={
              <Suspense fallback={<LoadingSpinner message="Loading page..." />}>
                <DocPage />
              </Suspense>
            } />
            <Route path="*" element={
              <Layout>
                <Suspense fallback={<LoadingSpinner message="Loading..." />}>
                  <NotFound />
                </Suspense>
              </Layout>
            } />
          </Routes>
          </AppContainer>
          
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: currentTheme.colors.surface,
                color: currentTheme.colors.text,
                border: `1px solid ${currentTheme.colors.border}`,
              },
            }}
          />
        </Router>
        </SubscriptionProvider>
      </SidebarProvider>
    </ThemeProvider>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <HelmetProvider>
        <QueryClientProvider client={queryClient}>
          <CustomThemeProvider>
            <AppContent />
          </CustomThemeProvider>
        </QueryClientProvider>
        <Toaster position="top-right" />
      </HelmetProvider>
    </ErrorBoundary>
  );
}

export default App;
