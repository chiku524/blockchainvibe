import React from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router-dom';
import { Gift, ArrowRight } from 'lucide-react';
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
  display: block;
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

const ItemTitle = styled.span`
  font-weight: ${(p) => p.theme.fontWeight.semibold};
`;

const ItemMeta = styled.span`
  font-size: ${(p) => p.theme.fontSize.sm};
  color: ${(p) => p.theme.colors.textSecondary};
  margin-left: 0.5rem;
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

export default function AirdropsLanding() {
  const navigate = useNavigate();
  const { data, isLoading } = useQuery(
    ['launches', 'drops'],
    () => launchesAPI.getDrops(),
    { staleTime: 6 * 60 * 1000 }
  );
  const airdrops = data?.airdrops ?? [];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Latest Crypto Airdrops',
    description: 'Curated list of active crypto and blockchain airdrops.',
    numberOfItems: airdrops.length,
    itemListElement: airdrops.slice(0, 20).map((a, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: a.title,
      url: a.link || undefined
    }))
  };

  return (
    <Page>
      <PageMeta jsonLd={jsonLd} />

      <Title>Latest crypto airdrops</Title>
      <Subtitle>
        Curated list of active airdrops. For full details, AI explanations, and new token launches, use the Launches hub.
      </Subtitle>

      {isLoading ? (
        <LoadingSpinner message="Loading airdrops..." />
      ) : (
        <>
          <List>
            {airdrops.slice(0, 15).map((a, i) => (
              <Item key={a.id || i}>
                <ItemLink href={a.link || '#'} target="_blank" rel="noopener noreferrer">
                  <ItemTitle>{a.title}</ItemTitle>
                  {a.source && <ItemMeta> · {a.source}</ItemMeta>}
                </ItemLink>
              </Item>
            ))}
          </List>
          <Cta type="button" onClick={() => navigate('/launches')}>
            <Gift size={18} />
            Open Launches & Drops hub
            <ArrowRight size={18} />
          </Cta>
        </>
      )}
    </Page>
  );
}
