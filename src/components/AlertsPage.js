import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import { Bell, Plus, Trash2, Newspaper } from 'lucide-react';
import toast from 'react-hot-toast';
import { newsAPI } from '../services/api';
import NewsCard from './NewsCard';
import LoadingSpinner from './LoadingSpinner';

const ALERTS_KEY = 'blockchainvibe_alerts';

const Page = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 1rem;
  position: relative;
  z-index: 2;
  min-height: 100vh;
  box-sizing: border-box;
`;

const Title = styled.h1`
  font-size: ${(p) => p.theme.fontSize['2xl']};
  font-weight: ${(p) => p.theme.fontWeight.bold};
  color: ${(p) => p.theme.colors.text};
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: ${(p) => p.theme.fontSize.sm};
  color: ${(p) => p.theme.colors.textSecondary};
  margin: 0 0 1.5rem 0;
`;

const Section = styled.section`
  margin-bottom: 2rem;
`;

const SectionTitle = styled.h2`
  font-size: ${(p) => p.theme.fontSize.lg};
  font-weight: ${(p) => p.theme.fontWeight.semibold};
  color: ${(p) => p.theme.colors.text};
  margin: 0 0 1rem 0;
`;

const AddRow = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
`;

const Input = styled.input`
  flex: 1;
  min-width: 160px;
  padding: 0.75rem 1rem;
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.borderRadius.md};
  background: ${(p) => p.theme.colors.surface};
  color: ${(p) => p.theme.colors.text};
  font-size: ${(p) => p.theme.fontSize.sm};
`;

const Btn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: ${(p) => p.theme.borderRadius.md};
  font-size: ${(p) => p.theme.fontSize.sm};
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: ${(p) => p.theme.colors.primary};
  color: ${(p) => p.theme.colors.textInverse};

  &:hover {
    opacity: 0.9;
  }
  &.secondary {
    background: transparent;
    color: ${(p) => p.theme.colors.text};
    border: 1px solid ${(p) => p.theme.colors.border};
  }
`;

const TagList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const Tag = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.4rem 0.75rem;
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.borderRadius.full};
  font-size: ${(p) => p.theme.fontSize.sm};
  color: ${(p) => p.theme.colors.text};
`;

const RemoveBtn = styled.button`
  background: none;
  border: none;
  color: ${(p) => p.theme.colors.textSecondary};
  cursor: pointer;
  padding: 0;
  display: flex;

  &:hover {
    color: ${(p) => p.theme.colors.error};
  }
`;

const NewsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const Empty = styled.p`
  font-size: ${(p) => p.theme.fontSize.sm};
  color: ${(p) => p.theme.colors.textSecondary};
  margin: 0;
`;

function loadAlerts() {
  try {
    const raw = localStorage.getItem(ALERTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState(loadAlerts);
  const [input, setInput] = useState('');

  useEffect(() => {
    setAlerts(loadAlerts());
  }, []);

  const addAlert = () => {
    const keyword = (input || '').trim().toLowerCase();
    if (!keyword) {
      toast.error('Enter a keyword');
      return;
    }
    const list = loadAlerts();
    if (list.includes(keyword)) {
      toast('Already added');
      return;
    }
    list.push(keyword);
    localStorage.setItem(ALERTS_KEY, JSON.stringify(list));
    setAlerts(list);
    setInput('');
    toast.success('Alert added');
  };

  const removeAlert = (keyword) => {
    const list = loadAlerts().filter((k) => k !== keyword);
    localStorage.setItem(ALERTS_KEY, JSON.stringify(list));
    setAlerts(list);
    toast.success('Alert removed');
  };

  const { data: newsData, isLoading } = useQuery(
    ['news', 'trending', 'alerts'],
    () => newsAPI.getTrendingNews({ limit: 50 }),
    { staleTime: 2 * 60 * 1000, enabled: alerts.length > 0 }
  );

  const articles = newsData?.articles || newsData?.news || [];
  const matching = alerts.length > 0
    ? articles.filter((a) => {
        const t = (a.title || '').toLowerCase();
        const s = (a.summary || '').toLowerCase();
        return alerts.some((k) => t.includes(k) || s.includes(k));
      }).slice(0, 20)
    : [];

  return (
    <Page>
      <Title>
        <Bell size={28} />
        Alerts
      </Title>
      <Subtitle>
        Add keywords and see recent news that matches. Great for tracking tokens, projects, or topics.
      </Subtitle>

      <Section>
        <SectionTitle>Your alert keywords</SectionTitle>
        <AddRow>
          <Input
            placeholder="e.g. Bitcoin, Ethereum, airdrop"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addAlert()}
          />
          <Btn type="button" onClick={addAlert}>
            <Plus size={16} />
            Add
          </Btn>
        </AddRow>
        {alerts.length > 0 ? (
          <TagList>
            {alerts.map((k) => (
              <Tag key={k}>
                {k}
                <RemoveBtn type="button" onClick={() => removeAlert(k)} aria-label={`Remove ${k}`}>
                  <Trash2 size={14} />
                </RemoveBtn>
              </Tag>
            ))}
          </TagList>
        ) : (
          <Empty>No alerts yet. Add keywords above to get started.</Empty>
        )}
      </Section>

      <Section>
        <SectionTitle>
          <Newspaper size={20} />
          Recent news matching your alerts
        </SectionTitle>
        {alerts.length === 0 ? (
          <Empty>Add at least one keyword to see matching news here.</Empty>
        ) : isLoading ? (
          <LoadingSpinner message="Loading news..." />
        ) : matching.length === 0 ? (
          <Empty>No recent articles match your keywords. Try different terms or check back later.</Empty>
        ) : (
          <NewsList>
            {matching.map((article, i) => (
              <NewsCard key={article.id || i} article={article} news={article} onBookmark={() => {}} onLike={() => {}} onShare={() => {}} />
            ))}
          </NewsList>
        )}
      </Section>
    </Page>
  );
}
