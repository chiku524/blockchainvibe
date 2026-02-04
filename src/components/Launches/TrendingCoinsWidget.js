import React from 'react';
import styled from 'styled-components';
import { TrendingUp, ExternalLink } from 'lucide-react';

const WidgetCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1.25rem;
  height: 100%;
  min-height: ${props => (props.compact ? 'auto' : '220px')};
`;

const WidgetTitle = styled.h3`
  font-size: ${props => props.theme.fontSize.base};
  font-weight: ${props => props.theme.fontWeight.semibold};
  color: ${props => props.theme.colors.text};
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CoinList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const CoinRow = styled.a`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 0.5rem 0.5rem 0;
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text};
  text-decoration: none;
  transition: background 0.2s;

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
  }
`;

const CoinRank = styled.span`
  width: 1.25rem;
  height: 1.25rem;
  border-radius: 50%;
  background: ${props => props.theme.colors.primary};
  color: ${props => props.theme.colors.textInverse};
  font-size: ${props => props.theme.fontSize.xs};
  font-weight: ${props => props.theme.fontWeight.bold};
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const CoinThumb = styled.img`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
`;

const CoinName = styled.span`
  flex: 1;
  font-size: ${props => props.theme.fontSize.sm};
  font-weight: ${props => props.theme.fontWeight.medium};
`;

const CoinSymbol = styled.span`
  font-size: ${props => props.theme.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
`;

const ExternalIcon = styled(ExternalLink)`
  width: 14px;
  height: 14px;
  color: ${props => props.theme.colors.textSecondary};
`;

const Empty = styled.p`
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

export default function TrendingCoinsWidget({ coins = [], compact = false, maxItems = 7 }) {
  const list = (coins || []).slice(0, maxItems);
  return (
    <WidgetCard compact={compact}>
      <WidgetTitle>
        <TrendingUp size={18} />
        Trending coins
      </WidgetTitle>
      {list.length === 0 ? (
        <Empty>No trending data yet.</Empty>
      ) : (
        <CoinList>
          {list.map((coin, i) => (
            <CoinRow
              key={coin.id || i}
              href={coin.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              title={coin.name}
            >
              <CoinRank>{i + 1}</CoinRank>
              {coin.thumb && <CoinThumb src={coin.thumb} alt="" />}
              <CoinName>{coin.name}</CoinName>
              <CoinSymbol>{coin.symbol}</CoinSymbol>
              <ExternalIcon />
            </CoinRow>
          ))}
        </CoinList>
      )}
    </WidgetCard>
  );
}
