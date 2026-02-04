import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import {
  Gift,
  Zap,
  Image as ImageIcon,
  RefreshCw,
  ExternalLink,
  Calendar,
  ChevronRight,
} from 'lucide-react';
import { launchesAPI } from '../../services/api';
import LoadingSpinner from '../LoadingSpinner';
import TrendingCoinsWidget from './TrendingCoinsWidget';
import AirdropsWidget from './AirdropsWidget';
import LaunchesCalendar from './LaunchesCalendar';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const Page = styled.div`
  min-height: 100vh;
  padding: 1rem;
  position: relative;
  z-index: 2;
  max-width: 100%;
  box-sizing: border-box;

  @media (min-width: ${(p) => p.theme.breakpoints.md}) {
    padding: 1.5rem;
  }
  @media (min-width: ${(p) => p.theme.breakpoints.lg}) {
    padding: 2rem;
  }
`;

const Header = styled.header`
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: ${(p) => p.theme.fontSize['2xl']};
  font-weight: ${(p) => p.theme.fontWeight.bold};
  color: ${(p) => p.theme.colors.text};
  margin: 0;

  @media (min-width: ${(p) => p.theme.breakpoints.md}) {
    font-size: ${(p) => p.theme.fontSize['3xl']};
  }
`;

const Subtitle = styled.p`
  font-size: ${(p) => p.theme.fontSize.sm};
  color: ${(p) => p.theme.colors.textSecondary};
  margin: 0.5rem 0 0 0;
`;

const Tabs = styled.div`
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
`;

const Tab = styled.button`
  padding: 0.75rem 1.25rem;
  border: none;
  background: none;
  color: ${(p) => (p.$active ? p.theme.colors.primary : p.theme.colors.textSecondary)};
  font-size: ${(p) => p.theme.fontSize.sm};
  font-weight: ${(p) => p.theme.fontWeight.medium};
  cursor: pointer;
  border-bottom: 2px solid ${(p) => (p.$active ? p.theme.colors.primary : 'transparent')};
  margin-bottom: -1px;
  display: flex;
  align-items: center;
  gap: 0.5rem;

  &:hover {
    color: ${(p) => p.theme.colors.primary};
  }
`;

const WidgetsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  margin-bottom: 2rem;

  @media (min-width: ${(p) => p.theme.breakpoints.sm}) {
    grid-template-columns: repeat(2, 1fr);
  }
  @media (min-width: ${(p) => p.theme.breakpoints.lg}) {
    grid-template-columns: 1fr 1fr 1.2fr;
    gap: 1.5rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: ${(p) => p.theme.fontSize.lg};
  font-weight: ${(p) => p.theme.fontWeight.semibold};
  color: ${(p) => p.theme.colors.text};
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const RefreshBtn = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  font-size: ${(p) => p.theme.fontSize.xs};
  color: ${(p) => p.theme.colors.primary};
  background: transparent;
  border: 1px solid ${(p) => p.theme.colors.primary};
  border-radius: ${(p) => p.theme.borderRadius.md};
  cursor: pointer;

  &:hover {
    background: ${(p) => p.theme.colors.primary}15;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const Card = styled.a`
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.borderRadius.lg};
  color: ${(p) => p.theme.colors.text};
  text-decoration: none;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:hover {
    border-color: ${(p) => p.theme.colors.primary};
    box-shadow: ${(p) => p.theme.shadows.md};
  }
`;

const CardIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${(p) => p.theme.borderRadius.md};
  background: ${(p) => p.theme.colors.background};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const CardThumb = styled.img`
  width: 48px;
  height: 48px;
  border-radius: ${(p) => p.theme.borderRadius.md};
  object-fit: cover;
`;

const CardBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const CardTitle = styled.div`
  font-size: ${(p) => p.theme.fontSize.base};
  font-weight: ${(p) => p.theme.fontWeight.semibold};
  margin-bottom: 0.25rem;
`;

const CardMeta = styled.div`
  font-size: ${(p) => p.theme.fontSize.sm};
  color: ${(p) => p.theme.colors.textSecondary};
`;

const CardLink = styled(ExternalLink)`
  width: 18px;
  height: 18px;
  color: ${(p) => p.theme.colors.textSecondary};
  flex-shrink: 0;
`;

const EmptyState = styled.p`
  color: ${(p) => p.theme.colors.textSecondary};
  font-size: ${(p) => p.theme.fontSize.sm};
  padding: 2rem;
  text-align: center;
`;

const TAB_KEYS = { airdrops: 'airdrops', tokens: 'tokens', nfts: 'nfts' };

export default function LaunchesPage() {
  useDocumentTitle('Launches & Drops');
  const [activeTab, setActiveTab] = useState(TAB_KEYS.airdrops);

  const { data, isLoading, isFetching, refetch } = useQuery(
    ['launches', 'drops'],
    () => launchesAPI.getDrops(),
    {
      staleTime: 6 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );

  const airdrops = data?.airdrops ?? [];
  const trendingCoins = data?.trendingCoins ?? [];
  const newTokens = data?.newTokens ?? [];
  const nftDrops = data?.nftDrops ?? [];
  const calendarEvents = data?.calendarEvents ?? [];

  if (isLoading && !data) {
    return (
      <Page>
        <LoadingSpinner message="Loading launches and drops..." />
      </Page>
    );
  }

  return (
    <Page>
      <Header>
        <Title>Launches & Drops</Title>
        <Subtitle>
          Latest airdrops, new token launches, and trending NFT collections — all in one place.
        </Subtitle>
      </Header>

      <WidgetsRow>
        <TrendingCoinsWidget coins={trendingCoins} compact maxItems={5} />
        <AirdropsWidget airdrops={airdrops} compact maxItems={5} />
        <LaunchesCalendar events={calendarEvents} compact />
      </WidgetsRow>

      <Tabs>
        <Tab
          $active={activeTab === TAB_KEYS.airdrops}
          onClick={() => setActiveTab(TAB_KEYS.airdrops)}
        >
          <Gift size={18} />
          Airdrops
        </Tab>
        <Tab
          $active={activeTab === TAB_KEYS.tokens}
          onClick={() => setActiveTab(TAB_KEYS.tokens)}
        >
          <Zap size={18} />
          New tokens
        </Tab>
        <Tab $active={activeTab === TAB_KEYS.nfts} onClick={() => setActiveTab(TAB_KEYS.nfts)}>
          <ImageIcon size={18} />
          NFT drops
        </Tab>
      </Tabs>

      <SectionTitle>
        <span>
          {activeTab === TAB_KEYS.airdrops && 'Airdrop campaigns'}
          {activeTab === TAB_KEYS.tokens && 'New & featured tokens'}
          {activeTab === TAB_KEYS.nfts && 'Trending NFT collections'}
        </span>
        <RefreshBtn onClick={() => refetch()} disabled={isFetching}>
          <RefreshCw size={14} />
          Refresh
        </RefreshBtn>
      </SectionTitle>

      <List>
        {activeTab === TAB_KEYS.airdrops &&
          (airdrops.length === 0 ? (
            <EmptyState>No airdrops available at the moment. Check back later.</EmptyState>
          ) : (
            airdrops.map((a, i) => (
              <Card key={a.id || i} href={a.link || '#'} target="_blank" rel="noopener noreferrer">
                <CardIcon>
                  <Gift size={24} color="var(--primary, #6366f1)" />
                </CardIcon>
                <CardBody>
                  <CardTitle>{a.title}</CardTitle>
                  <CardMeta>
                    {a.source} {a.date && ` · ${new Date(a.date).toLocaleDateString()}`}
                  </CardMeta>
                </CardBody>
                <CardLink />
              </Card>
            ))
          ))}

        {activeTab === TAB_KEYS.tokens &&
          (newTokens.length === 0 ? (
            <EmptyState>No new tokens loaded. Try refreshing.</EmptyState>
          ) : (
            newTokens.map((t, i) => (
              <Card key={t.id || i} href={t.url || '#'} target="_blank" rel="noopener noreferrer">
                {t.icon ? (
                  <CardThumb src={t.icon} alt="" />
                ) : (
                  <CardIcon>
                    <Zap size={24} color="var(--primary, #6366f1)" />
                  </CardIcon>
                )}
                <CardBody>
                  <CardTitle>{t.title}</CardTitle>
                  <CardMeta>
                    {t.chainId} {t.description && ` · ${t.description.slice(0, 80)}...`}
                  </CardMeta>
                </CardBody>
                <CardLink />
              </Card>
            ))
          ))}

        {activeTab === TAB_KEYS.nfts &&
          (nftDrops.length === 0 ? (
            <EmptyState>No trending NFTs at the moment.</EmptyState>
          ) : (
            nftDrops.map((n, i) => (
              <Card key={n.id || i} href={n.link || '#'} target="_blank" rel="noopener noreferrer">
                {n.thumb ? (
                  <CardThumb src={n.thumb} alt="" />
                ) : (
                  <CardIcon>
                    <ImageIcon size={24} color="var(--primary, #6366f1)" />
                  </CardIcon>
                )}
                <CardBody>
                  <CardTitle>{n.name}</CardTitle>
                  <CardMeta>
                    {n.symbol && `${n.symbol} · `}
                    {n.floor_price_usd != null && `Floor: $${Number(n.floor_price_usd).toFixed(2)}`}
                  </CardMeta>
                </CardBody>
                <CardLink />
              </Card>
            ))
          ))}
      </List>
    </Page>
  );
}
