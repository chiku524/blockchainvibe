import React, { useState } from 'react';
import styled from 'styled-components';
import {
  Sparkles,
  MessageCircle,
  Bot,
  Newspaper,
  ChevronRight,
  Loader2,
  Send,
  BarChart2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAIInsights, useAIDailyDigest, useAIAgents, useAIAsk } from '../hooks/useAI';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import LoadingSpinner from './LoadingSpinner';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  min-height: 100vh;
  position: relative;
  z-index: 2;
`;

const PageHeader = styled.div`
  margin-bottom: 2rem;
`;

const PageTitle = styled.h1`
  font-size: ${(p) => p.theme.fontSize['4xl']};
  font-weight: ${(p) => p.theme.fontWeight.bold};
  background: ${(p) => p.theme.gradients.text};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const PageSubtitle = styled.p`
  color: ${(p) => p.theme.colors.textSecondary};
  margin: 0.5rem 0 0 0;
  font-size: ${(p) => p.theme.fontSize.lg};
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
  margin-bottom: 2rem;
  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.borderRadius.lg};
  padding: 1.5rem;
`;

const CardTitle = styled.h2`
  font-size: ${(p) => p.theme.fontSize.xl};
  font-weight: ${(p) => p.theme.fontWeight.semibold};
  color: ${(p) => p.theme.colors.text};
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InsightList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const InsightItem = styled.li`
  padding: 0.75rem 0;
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
  font-size: ${(p) => p.theme.fontSize.sm};
  color: ${(p) => p.theme.colors.text};
  &:last-child {
    border-bottom: none;
  }
`;

const ThemeChips = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const ThemeChip = styled.span`
  padding: 0.35rem 0.75rem;
  background: ${(p) => p.theme.colors.primary}15;
  color: ${(p) => p.theme.colors.primary};
  border-radius: ${(p) => p.theme.borderRadius.full};
  font-size: ${(p) => p.theme.fontSize.xs};
  font-weight: ${(p) => p.theme.fontWeight.medium};
`;

const HeadlineList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const HeadlineLink = styled.a`
  color: ${(p) => p.theme.colors.primary};
  text-decoration: none;
  font-size: ${(p) => p.theme.fontSize.sm};
  display: flex;
  align-items: center;
  gap: 0.25rem;
  &:hover {
    text-decoration: underline;
  }
`;

const AgentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const AgentItem = styled.div`
  padding: 0.75rem;
  background: ${(p) => p.theme.colors.background};
  border-radius: ${(p) => p.theme.borderRadius.md};
  border: 1px solid ${(p) => p.theme.colors.border};
`;

const AgentName = styled.div`
  font-weight: ${(p) => p.theme.fontWeight.semibold};
  color: ${(p) => p.theme.colors.text};
  font-size: ${(p) => p.theme.fontSize.sm};
`;

const AgentDesc = styled.div`
  font-size: ${(p) => p.theme.fontSize.xs};
  color: ${(p) => p.theme.colors.textSecondary};
  margin-top: 0.25rem;
`;

const AskSection = styled(Card)`
  grid-column: 1 / -1;
`;

const AskForm = styled.form`
  display: flex;
  gap: 0.75rem;
  margin-top: 1rem;
`;

const AskInput = styled.input`
  flex: 1;
  padding: 0.75rem 1rem;
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.borderRadius.lg};
  background: ${(p) => p.theme.colors.background};
  color: ${(p) => p.theme.colors.text};
  font-size: ${(p) => p.theme.fontSize.sm};
  &:focus {
    outline: none;
    border-color: ${(p) => p.theme.colors.primary};
  }
`;

const AskButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: ${(p) => p.theme.colors.primary};
  color: ${(p) => p.theme.colors.textInverse};
  border: none;
  border-radius: ${(p) => p.theme.borderRadius.lg};
  font-size: ${(p) => p.theme.fontSize.sm};
  font-weight: ${(p) => p.theme.fontWeight.medium};
  cursor: pointer;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ReplyBox = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: ${(p) => p.theme.colors.background};
  border-radius: ${(p) => p.theme.borderRadius.md};
  border: 1px solid ${(p) => p.theme.colors.border};
  font-size: ${(p) => p.theme.fontSize.sm};
  color: ${(p) => p.theme.colors.text};
  white-space: pre-wrap;
`;

const EmptyState = styled.p`
  color: ${(p) => p.theme.colors.textSecondary};
  font-size: ${(p) => p.theme.fontSize.sm};
  margin: 0;
`;

const AIInsights = () => {
  const [query, setQuery] = useState('');
  const [lastReply, setLastReply] = useState(null);

  const { data: insightsData, isLoading: insightsLoading } = useAIInsights();
  const { data: digestData, isLoading: digestLoading } = useAIDailyDigest();
  const { data: agentsData, isLoading: agentsLoading } = useAIAgents();
  const askMutation = useAIAsk();
  useDocumentTitle('AI Insights');

  const handleAsk = async (e) => {
    e.preventDefault();
    const q = query.trim();
    if (!q) return;
    try {
      const res = await askMutation.mutateAsync(q);
      setLastReply(res?.reply || 'No response.');
      setQuery('');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to get answer');
    }
  };

  const insights = insightsData?.insights || [];
  const digest = digestData;
  const agents = agentsData?.agents || [];

  return (
    <PageContainer>
      <PageHeader>
        <PageTitle>
          <Sparkles size={32} />
          AI Insights & Agents
        </PageTitle>
        <PageSubtitle>
          Personalized insights, daily digest, and AI-powered Q&A over your feed.
        </PageSubtitle>
      </PageHeader>

      <Grid>
        <Card>
          <CardTitle>
            <BarChart2 size={20} />
            Your reading insights
          </CardTitle>
          {insightsLoading ? (
            <LoadingSpinner message="Loading insights..." />
          ) : insights.length > 0 ? (
            <InsightList>
              {insights.map((item, i) => (
                <InsightItem key={i}>{item.text}</InsightItem>
              ))}
            </InsightList>
          ) : (
            <EmptyState>
              Read a few articles and return here to see personalized insights.
            </EmptyState>
          )}
        </Card>

        <Card>
          <CardTitle>
            <Newspaper size={20} />
            Today&apos;s digest
          </CardTitle>
          {digestLoading ? (
            <LoadingSpinner message="Loading digest..." />
          ) : digest?.success ? (
            <>
              <ThemeChips>
                {(digest.themes || []).slice(0, 6).map((t) => (
                  <ThemeChip key={t.name}>
                    {t.name} ({t.count})
                  </ThemeChip>
                ))}
              </ThemeChips>
              <HeadlineList>
                {(digest.top_headlines || []).slice(0, 5).map((h) => (
                  <HeadlineLink
                    key={h.id}
                    href={h.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {h.title?.slice(0, 60)}
                    {h.title?.length > 60 ? '…' : ''}
                    <ChevronRight size={14} />
                  </HeadlineLink>
                ))}
              </HeadlineList>
            </>
          ) : (
            <EmptyState>Could not load today&apos;s digest.</EmptyState>
          )}
        </Card>

        <Card style={{ gridColumn: '1 / -1' }}>
          <CardTitle>
            <Bot size={20} />
            AI agents powering your feed
          </CardTitle>
          {agentsLoading ? (
            <LoadingSpinner message="Loading agents..." />
          ) : agents.length > 0 ? (
            <AgentList>
              {agents.map((agent) => (
                <AgentItem key={agent.id}>
                  <AgentName>{agent.name}</AgentName>
                  <AgentDesc>{agent.description}</AgentDesc>
                </AgentItem>
              ))}
            </AgentList>
          ) : (
            <EmptyState>News Fetcher and Relevance Scorer agents run in the backend.</EmptyState>
          )}
        </Card>

        <AskSection>
          <CardTitle>
            <MessageCircle size={20} />
            Ask AI about trends or your insights
          </CardTitle>
          <AskForm onSubmit={handleAsk}>
            <AskInput
              type="text"
              placeholder="e.g. What's trending in DeFi? or Give me my reading summary"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={askMutation.isLoading}
            />
            <AskButton type="submit" disabled={askMutation.isLoading}>
              {askMutation.isLoading ? (
                <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
              ) : (
                <Send size={18} />
              )}
              Ask
            </AskButton>
          </AskForm>
          {lastReply && (
            <ReplyBox>{lastReply}</ReplyBox>
          )}
        </AskSection>
      </Grid>
    </PageContainer>
  );
};

export default AIInsights;
