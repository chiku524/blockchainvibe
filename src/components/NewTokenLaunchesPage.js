import React from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, ExternalLink } from 'lucide-react';
import { launchesAPI } from '../services/api';
import PageMeta from './PageMeta';
import LoadingSpinner from './LoadingSpinner';

const Page = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
  position: relative;
  z-index: 2;
  min-height: 100vh;
  box-sizing: border-box;
`;

const Title = styled.h1`
  font-size: ${(p) => p.theme.fontSize['3xl']};
  font-weight: ${(p) => p.theme.fontWeight.bold};
  color: ${(p) => p.theme.colors.text};
  margin: 0 0 0.5rem 0;
`;

const Subtitle = styled.p`
  font-size: ${(p) => p.theme.fontSize.lg};
  color: ${(p) => p.theme.colors.textSecondary};
  margin: 0 0 2rem 0;
`;

const List = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 2rem 0;
`;

const Item = styled.li`
  margin-bottom: 0.75rem;
`;

const ItemLink = styled.a`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.25rem;
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

const ItemThumb = styled.img`
  width: 40px;
  height: 40px;
  border-radius: ${(p) => p.theme.borderRadius.md};
  object-fit: cover;
`;

const ItemIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${(p) => p.theme.borderRadius.md};
  background: ${(p) => p.theme.colors.primary}20;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${(p) => p.theme.colors.primary};
`;

const ItemBody = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemTitle = styled.span`
  font-weight: ${(p) => p.theme.fontWeight.semibold};
  display: block;
`;

const ItemMeta = styled.span`
  font-size: ${(p) => p.theme.fontSize.sm};
  color: ${(p) => p.theme.colors.textSecondary};
`;

const Cta = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: ${(p) => p.theme.colors.primary};
  color: ${(p) => p.theme.colors.textInverse};
  border: none;
  border-radius: ${(p) => p.theme.borderRadius.lg};
  font-weight: 500;
  cursor: pointer;
  margin-top: 0.5rem;

  &:hover {
    opacity: 0.9;
  }
`;

function stripUrls(text) {
  if (!text || typeof text !== 'string') return '';
  return text.replace(/https?:\/\/[^\s]+/g, '').replace(/\s+/g, ' ').trim().slice(0, 80);
}

export default function NewTokenLaunchesPage() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(
    ['launches', 'drops'],
    () => launchesAPI.getDrops(),
    { staleTime: 6 * 60 * 1000 }
  );
  const tokens = data?.newTokens ?? [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'New Token Launches',
    description: 'Latest new token and coin launches in crypto.',
    numberOfItems: tokens.length,
    itemListElement: tokens.slice(0, 20).map((t, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: t.title,
      url: t.url || undefined
    }))
  };

  return (
    <Page>
      <PageMeta jsonLd={jsonLd} />

      <Title>New token launches</Title>
      <Subtitle>
        New and featured tokens. For airdrops, NFT drops, and the full Launches hub, use the link below.
      </Subtitle>

      {isLoading ? (
        <LoadingSpinner message="Loading launches..." />
      ) : (
        <>
          <List>
            {tokens.slice(0, 15).map((t, i) => (
              <Item key={t.id || i}>
                <ItemLink href={t.url || '#'} target="_blank" rel="noopener noreferrer">
                  {t.icon ? (
                    <ItemThumb src={t.icon} alt="" />
                  ) : (
                    <ItemIcon><Zap size={20} /></ItemIcon>
                  )}
                  <ItemBody>
                    <ItemTitle>{t.title}</ItemTitle>
                    <ItemMeta>
                      {t.chainId ? `${String(t.chainId).charAt(0).toUpperCase() + String(t.chainId).slice(1)} · ` : ''}
                      {stripUrls(t.description) || 'View chart'}
                    </ItemMeta>
                  </ItemBody>
                  <ExternalLink size={18} color="var(--text-secondary)" />
                </ItemLink>
              </Item>
            ))}
          </List>
          <Cta type="button" onClick={() => navigate('/launches')}>
            <Zap size={18} />
            Open Launches & Drops hub
            <ArrowRight size={18} />
          </Cta>
        </>
      )}
    </Page>
  );
}
