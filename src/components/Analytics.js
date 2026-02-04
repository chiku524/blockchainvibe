import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown,
  Eye,
  Target,
  Brain,
  Zap,
  Calendar
} from 'lucide-react';
import { useUser } from '../hooks/useUser';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import api from '../services/api';
import InteractiveChart from './InteractiveChart';

const AnalyticsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  width: 100%;
  box-sizing: border-box;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: 1.5rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    padding: 2rem;
  }
`;

const AnalyticsHeader = styled.div`
  margin-bottom: 1.5rem;

  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    margin-bottom: 3rem;
  }
`;

const AnalyticsTitle = styled.h1`
  font-size: ${props => props.theme.fontSize['2xl']};
  font-weight: ${props => props.theme.fontWeight.bold};
  background: ${props => props.theme.gradients.text};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 0.5rem;
  word-break: break-word;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.fontSize['3xl']};
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    font-size: ${props => props.theme.fontSize['4xl']};
    margin-bottom: 1rem;
  }
`;

const AnalyticsSubtitle = styled.p`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSize.sm};
  margin-bottom: 1rem;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    font-size: ${props => props.theme.fontSize.lg};
    margin-bottom: 2rem;
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;

  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    margin-bottom: 3rem;
  }
`;

const StatCard = styled(motion.div)`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1rem;
  text-align: center;
  transition: transform ${props => props.theme.transitions.fast};

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: 1.5rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    padding: 2rem;
  }
  &:hover {
    transform: translateY(-4px);
  }
`;

const StatIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary}20;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: ${props => props.theme.colors.primary};
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.fontSize['3xl']};
  font-weight: ${props => props.theme.fontWeight.bold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  color: ${props => props.theme.colors.textSecondary};
  font-size: ${props => props.theme.fontSize.sm};
  font-weight: ${props => props.theme.fontWeight.medium};
  margin-bottom: 0.5rem;
`;

const StatChange = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.positive ? '#10b981' : '#ef4444'};
  font-weight: ${props => props.theme.fontWeight.medium};
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;

  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    grid-template-columns: 2fr 1fr;
    gap: 2rem;
    margin-bottom: 3rem;
  }
`;

const ChartCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1rem;
  min-width: 0;

  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: 1.5rem;
  }
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    padding: 2rem;
  }
`;

const ChartTitle = styled.h3`
  font-size: ${props => props.theme.fontSize.xl};
  font-weight: ${props => props.theme.fontWeight.semibold};
  margin-bottom: 1.5rem;
  color: ${props => props.theme.colors.text};
`;


const AIInsights = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 2rem;
  margin-bottom: 2rem;
`;

const AIInsightsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const AIInsightsTitle = styled.h3`
  font-size: ${props => props.theme.fontSize.xl};
  font-weight: ${props => props.theme.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0;
`;

const InsightItem = styled.div`
  padding: 1rem;
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.borderRadius.md};
  margin-bottom: 1rem;
  border-left: 4px solid ${props => props.theme.colors.primary};
`;

const InsightText = styled.p`
  color: ${props => props.theme.colors.text};
  margin: 0;
  line-height: 1.6;
`;

const InsightSource = styled.div`
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 0.5rem;
  font-style: italic;
`;

const CategoriesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 2rem;
`;

const CategoryCard = styled.div`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.md};
  padding: 1.5rem;
  text-align: center;
  transition: all ${props => props.theme.transitions.fast};
  
  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    transform: translateY(-2px);
  }
`;

const CategoryName = styled.div`
  font-weight: ${props => props.theme.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const CategoryCount = styled.div`
  font-size: ${props => props.theme.fontSize['2xl']};
  font-weight: ${props => props.theme.fontWeight.bold};
  color: ${props => props.theme.colors.primary};
  margin-bottom: 0.25rem;
`;

const CategoryPercentage = styled.div`
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
`;

const defaultTrendSeries = () => {
  const series = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    series.push({ label: d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), value: 0, category: 'reading' });
  }
  return series;
};

const Analytics = () => {
  const { isLoading } = useUser();
  useDocumentTitle('Analytics');
  const [analyticsData, setAnalyticsData] = useState({
    articlesRead: 0,
    timeSpent: 0,
    averageRelevance: 0,
    topCategories: [],
    aiInsights: [],
    readingTrends: { thisWeek: 0, lastWeek: 0, change: 0 },
    relevanceScore: { current: 0, previous: 0, change: 0 },
    _trendSeries: defaultTrendSeries(),
  });

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const userId = user?.user_id || user?.id;
        if (!userId) {
          setAnalyticsData(prev => ({ ...prev, articlesRead: 0, timeSpent: 0, topCategories: [], aiInsights: [], _trendSeries: defaultTrendSeries() }));
          return;
        }
        const res = await api.get(`/api/analytics/summary?userId=${encodeURIComponent(userId)}`);
        const data = res.data || {};
        // Fetch AI insights in parallel (same API as AI Insights page)
        let insights = [];
        try {
          const insRes = await api.get(`/api/ai/insights?userId=${encodeURIComponent(userId)}`);
          const insBody = insRes.data;
          insights = Array.isArray(insBody?.insights) ? insBody.insights : [];
        } catch (_) {}
        // Build last 7 days (including today) for chart: backend returns { date, cnt } per day with activity
        const trendByDate = {};
        (data.readingTrendsByDay || []).forEach(r => {
          const d = r.date || r.dow;
          const cnt = r.cnt ?? 0;
          trendByDate[d] = (trendByDate[d] || 0) + cnt;
        });
        const series = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          const dateStr = d.toISOString().slice(0, 10);
          const label = d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
          series.push({ label, value: trendByDate[dateStr] || 0, category: 'reading' });
        }
        const thisWeekTotal = series.reduce((a, b) => a + (b.value || 0), 0);
        const topSourcesRaw = data.topSources || [];
        const totalReads = topSourcesRaw.reduce((a, s) => a + (s.cnt || 0), 0);
        const topCategories = topSourcesRaw.map(s => ({
          name: s.source || 'Unknown',
          count: s.cnt || 0,
          percentage: totalReads > 0 ? Math.round(((s.cnt || 0) / totalReads) * 100) : 0,
        }));
        setAnalyticsData({
          articlesRead: data.articlesRead || 0,
          timeSpent: data.timeSpentMinutes || 0,
          averageRelevance: 0,
          topCategories,
          aiInsights: insights,
          readingTrends: { thisWeek: thisWeekTotal, lastWeek: 0, change: 0 },
          relevanceScore: { current: 0, previous: 0, change: 0 },
          _trendSeries: series,
        });
      } catch (e) {
        setAnalyticsData(prev => ({ ...prev, articlesRead: 0, timeSpent: 0, topCategories: [], aiInsights: [], _trendSeries: defaultTrendSeries() }));
      }
    };
    fetchAnalytics();
  }, []);

  if (isLoading) {
    return (
      <AnalyticsContainer>
        <div style={{ textAlign: 'center', padding: '4rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📊</div>
          <div>Loading analytics...</div>
        </div>
      </AnalyticsContainer>
    );
  }

  return (
    <AnalyticsContainer>
      <AnalyticsHeader>
        <AnalyticsTitle>Analytics Dashboard</AnalyticsTitle>
        <AnalyticsSubtitle>
          AI-powered insights into your blockchain news consumption patterns
        </AnalyticsSubtitle>
      </AnalyticsHeader>

      <StatsGrid>
        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <StatIcon>
            <Eye size={24} />
          </StatIcon>
          <StatValue>{analyticsData?.articlesRead || 0}</StatValue>
          <StatLabel>Articles Read</StatLabel>
          <StatChange positive={analyticsData?.readingTrends?.change > 0}>
            {analyticsData?.readingTrends?.change > 0 ? (
              <TrendingUp size={16} />
            ) : (
              <TrendingDown size={16} />
            )}
            {analyticsData?.readingTrends?.change || 0}% this week
          </StatChange>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <StatIcon>
            <Calendar size={24} />
          </StatIcon>
          <StatValue>
            {Object.values(analyticsData?._trendSeries || []).filter(d => (d.value || 0) > 0).length}
          </StatValue>
          <StatLabel>Active Days This Week</StatLabel>
          <StatChange positive>
            <TrendingUp size={16} />
            Keep it up
          </StatChange>
        </StatCard>

        <StatCard
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <StatIcon>
            <Target size={24} />
          </StatIcon>
          <StatValue>{Math.round((analyticsData?.averageRelevance || 0) * 100)}%</StatValue>
          <StatLabel>Relevance Score</StatLabel>
          <StatChange positive={analyticsData?.relevanceScore?.change > 0}>
            {analyticsData?.relevanceScore?.change > 0 ? (
              <TrendingUp size={16} />
            ) : (
              <TrendingDown size={16} />
            )}
            {analyticsData?.relevanceScore?.change || 0}% improvement
          </StatChange>
        </StatCard>

        {/* Removed hardcoded liked articles card to avoid misleading stats */}
      </StatsGrid>

      <ChartsGrid>
        <ChartCard>
          <InteractiveChart 
            data={analyticsData?._trendSeries || []}
            title="Reading Trends"
            onDataUpdate={() => {}}
            dataStatus={analyticsData?.articlesRead != null ? 'Data loaded' : 'Loading…'}
          />
        </ChartCard>

        <ChartCard>
          <ChartTitle>Category Distribution</ChartTitle>
          <CategoriesGrid>
            {analyticsData?.topCategories?.map((category, index) => (
              <CategoryCard key={index}>
                <CategoryName>{category.name}</CategoryName>
                <CategoryCount>{category.count}</CategoryCount>
                <CategoryPercentage>{category.percentage}%</CategoryPercentage>
              </CategoryCard>
            ))}
          </CategoriesGrid>
        </ChartCard>
      </ChartsGrid>

      {Array.isArray(analyticsData?.aiInsights) && analyticsData.aiInsights.length > 0 && (
        <AIInsights>
          <AIInsightsHeader>
            <Brain size={24} color="#8b5cf6" />
            <AIInsightsTitle>AI-Powered Insights</AIInsightsTitle>
            <Zap size={20} color="#f59e0b" />
          </AIInsightsHeader>
          {analyticsData.aiInsights.map((insight, index) => (
            <InsightItem key={index}>
              <InsightText>{insight.text}</InsightText>
              <InsightSource>Source: {insight.source}</InsightSource>
            </InsightItem>
          ))}
        </AIInsights>
      )}
    </AnalyticsContainer>
  );
};

export default Analytics;
