import React, { useState } from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import {
  Gift,
  Zap,
  Image as ImageIcon,
  RefreshCw,
  ExternalLink,
  Sparkles,
  X,
  AlertTriangle,
  ListChecks,
  Bell,
} from 'lucide-react';
import { launchesAPI, aiAPI } from '../../services/api';
import LoadingSpinner from '../LoadingSpinner';
import TrendingCoinsWidget from './TrendingCoinsWidget';
import AirdropsWidget from './AirdropsWidget';
import toast from 'react-hot-toast';

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
    grid-template-columns: 1fr 1fr;
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

const ChainBadge = styled.span`
  display: inline-block;
  padding: 0.2rem 0.5rem;
  font-size: ${(p) => p.theme.fontSize.xs};
  font-weight: ${(p) => p.theme.fontWeight.medium};
  background: ${(p) => p.theme.colors.primary}20;
  color: ${(p) => p.theme.colors.primary};
  border-radius: ${(p) => p.theme.borderRadius.sm};
  margin-right: 0.5rem;
`;

const CardLinkLabel = styled.span`
  font-size: ${(p) => p.theme.fontSize.xs};
  color: ${(p) => p.theme.colors.primary};
  display: flex;
  align-items: center;
  gap: 0.25rem;
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

const ExplainBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.6rem;
  font-size: ${(p) => p.theme.fontSize.xs};
  color: ${(p) => p.theme.colors.primary};
  background: ${(p) => p.theme.colors.primary}12;
  border: 1px solid ${(p) => p.theme.colors.primary}40;
  border-radius: ${(p) => p.theme.borderRadius.md};
  cursor: pointer;
  margin-top: 0.5rem;

  &:hover {
    background: ${(p) => p.theme.colors.primary}20;
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
`;

const ModalBox = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.borderRadius.xl};
  max-width: 480px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: ${(p) => p.theme.shadows['2xl']};
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid ${(p) => p.theme.colors.border};
`;

const ModalTitle = styled.h3`
  font-size: ${(p) => p.theme.fontSize.lg};
  font-weight: ${(p) => p.theme.fontWeight.semibold};
  color: ${(p) => p.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ModalClose = styled.button`
  background: none;
  border: none;
  color: ${(p) => p.theme.colors.textSecondary};
  cursor: pointer;
  padding: 0.25rem;

  &:hover {
    color: ${(p) => p.theme.colors.text};
  }
`;

const ModalBody = styled.div`
  padding: 1.25rem;
`;

const ExplainSummary = styled.p`
  font-size: ${(p) => p.theme.fontSize.sm};
  color: ${(p) => p.theme.colors.text};
  line-height: 1.6;
  margin: 0 0 1rem 0;
`;

const ExplainSection = styled.div`
  margin-top: 1rem;
`;

const ExplainSectionTitle = styled.h4`
  font-size: ${(p) => p.theme.fontSize.sm};
  font-weight: ${(p) => p.theme.fontWeight.semibold};
  color: ${(p) => p.theme.colors.text};
  margin: 0 0 0.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ExplainList = styled.ul`
  margin: 0;
  padding-left: 1.25rem;
  font-size: ${(p) => p.theme.fontSize.sm};
  color: ${(p) => p.theme.colors.textSecondary};
  line-height: 1.6;
`;

const TAB_KEYS = { airdrops: 'airdrops', tokens: 'tokens', nfts: 'nfts' };
const AIRDROP_REMINDERS_KEY = 'blockchainvibe_airdrop_reminders';

function getAirdropReminders() {
  try {
    const raw = localStorage.getItem(AIRDROP_REMINDERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function addAirdropReminder(item) {
  const list = getAirdropReminders();
  const id = item.id || item.link || item.title || `${Date.now()}`;
  if (list.some((r) => (r.id || r.link) === id)) return false;
  list.push({ id, title: item.title, link: item.link || item.url, source: item.source });
  localStorage.setItem(AIRDROP_REMINDERS_KEY, JSON.stringify(list));
  return true;
}

/** Format chain ID for display (e.g. solana -> Solana) */
function formatChainId(id) {
  if (!id) return '';
  const s = String(id).toLowerCase();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Strip URLs from text for display */
function stripUrls(text) {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/https?:\/\/[^\s]+/g, '').replace(/\s+/g, ' ').trim();
}


export default function LaunchesPage() {
  const [activeTab, setActiveTab] = useState(TAB_KEYS.airdrops);
  const [explainAirdrop, setExplainAirdrop] = useState(null);
  const [explainResult, setExplainResult] = useState(null);
  const [explainLoading, setExplainLoading] = useState(false);

  const handleExplainWithAI = async (a) => {
    setExplainAirdrop(a);
    setExplainResult(null);
    setExplainLoading(true);
    try {
      const res = await aiAPI.explainAirdrop({
        title: a.title,
        source: a.source,
        date: a.date,
        link: a.link,
      });
      if (res.success) setExplainResult(res);
      else toast.error(res.message || 'Could not load explanation');
    } catch (e) {
      toast.error('Failed to get AI explanation');
    } finally {
      setExplainLoading(false);
    }
  };

  const closeExplainModal = () => {
    setExplainAirdrop(null);
    setExplainResult(null);
  };

  const handleRemindMe = (e, a) => {
    e.stopPropagation();
    if (addAirdropReminder(a)) {
      toast.success('Added to your airdrop reminders (see Dashboard)');
    } else {
      toast('Already in your reminders');
    }
  };

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
              <Card key={a.id || i} as="div" style={{ cursor: 'default' }}>
                <CardIcon>
                  <Gift size={24} color="var(--primary, #6366f1)" />
                </CardIcon>
                <CardBody>
                  <CardTitle>
                    {a.link ? (
                      <a href={a.link} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'none' }}>
                        {a.title}
                      </a>
                    ) : (
                      a.title
                    )}
                  </CardTitle>
                  <CardMeta>
                    {a.source} {a.date && ` · ${new Date(a.date).toLocaleDateString()}`}
                  </CardMeta>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                    <ExplainBtn
                      type="button"
                      onClick={(e) => { e.stopPropagation(); handleExplainWithAI(a); }}
                      disabled={explainLoading && explainAirdrop?.title === a.title}
                    >
                      <Sparkles size={12} />
                      Explain with AI
                    </ExplainBtn>
                    <ExplainBtn
                      type="button"
                      onClick={(e) => handleRemindMe(e, a)}
                      style={{ background: 'transparent', borderColor: 'var(--text-secondary)' }}
                    >
                      <Bell size={12} />
                      Remind me
                    </ExplainBtn>
                  </div>
                </CardBody>
                {a.link && (
                  <a href={a.link} target="_blank" rel="noopener noreferrer" aria-label="Open link">
                    <CardLink />
                  </a>
                )}
              </Card>
            ))
          ))}

        {activeTab === TAB_KEYS.tokens &&
          (newTokens.length === 0 ? (
            <EmptyState>No new tokens loaded. Try refreshing.</EmptyState>
          ) : (
            newTokens.map((t, i) => {
              const cleanDesc = stripUrls(t.description);
              return (
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
                      {t.chainId && <ChainBadge>{formatChainId(t.chainId)}</ChainBadge>}
                      {cleanDesc ? `${cleanDesc.slice(0, 80)}${cleanDesc.length > 80 ? '…' : ''}` : 'View chart on DexScreener'}
                    </CardMeta>
                  </CardBody>
                  <CardLinkLabel>
                    <CardLink size={14} />
                    Chart
                  </CardLinkLabel>
                </Card>
              );
            })
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

      {explainAirdrop && (
        <ModalOverlay onClick={closeExplainModal}>
          <ModalBox onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                <Sparkles size={20} />
                AI explains: {explainAirdrop.title}
              </ModalTitle>
              <ModalClose type="button" onClick={closeExplainModal} aria-label="Close">
                <X size={20} />
              </ModalClose>
            </ModalHeader>
            <ModalBody>
              {explainLoading ? (
                <LoadingSpinner message="Getting AI explanation..." />
              ) : explainResult ? (
                <>
                  <ExplainSummary>{explainResult.summary}</ExplainSummary>
                  <ExplainSection>
                    <ExplainSectionTitle><ListChecks size={16} /> How to qualify</ExplainSectionTitle>
                    <ExplainList>
                      {explainResult.steps.map((step, i) => (
                        <li key={i}>{step}</li>
                      ))}
                    </ExplainList>
                  </ExplainSection>
                  <ExplainSection>
                    <ExplainSectionTitle><AlertTriangle size={16} /> Risks to consider</ExplainSectionTitle>
                    <ExplainList>
                      {explainResult.risks.map((risk, i) => (
                        <li key={i}>{risk}</li>
                      ))}
                    </ExplainList>
                  </ExplainSection>
                  {explainResult.link && (
                    <p style={{ marginTop: '1rem', fontSize: '0.875rem' }}>
                      <a href={explainResult.link} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)' }}>
                        Open official link →
                      </a>
                    </p>
                  )}
                </>
              ) : null}
            </ModalBody>
          </ModalBox>
        </ModalOverlay>
      )}
    </Page>
  );
}
