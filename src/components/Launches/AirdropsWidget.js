import React from 'react';
import styled from 'styled-components';
import { Gift, ExternalLink } from 'lucide-react';

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

const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const Item = styled.a`
  display: block;
  padding: 0.6rem 0.5rem;
  border-radius: ${props => props.theme.borderRadius.md};
  color: ${props => props.theme.colors.text};
  text-decoration: none;
  transition: background 0.2s;
  border-left: 3px solid transparent;

  &:hover {
    background: ${props => props.theme.colors.surfaceHover};
    border-left-color: ${props => props.theme.colors.primary};
  }
`;

const ItemTitle = styled.div`
  font-size: ${props => props.theme.fontSize.sm};
  font-weight: ${props => props.theme.fontWeight.medium};
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
`;

const ItemDate = styled.div`
  font-size: ${props => props.theme.fontSize.xs};
  color: ${props => props.theme.colors.textSecondary};
  margin-top: 0.25rem;
`;

const ExternalIcon = styled(ExternalLink)`
  width: 14px;
  height: 14px;
  color: ${props => props.theme.colors.textSecondary};
  flex-shrink: 0;
`;

const Empty = styled.p`
  font-size: ${props => props.theme.fontSize.sm};
  color: ${props => props.theme.colors.textSecondary};
  margin: 0;
`;

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diff = now - d;
  if (diff < 86400000) return 'Today';
  if (diff < 172800000) return 'Yesterday';
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function AirdropsWidget({ airdrops = [], compact = false, maxItems = 5 }) {
  const list = (airdrops || []).slice(0, maxItems);
  return (
    <WidgetCard compact={compact}>
      <WidgetTitle>
        <Gift size={18} />
        Latest airdrops
      </WidgetTitle>
      {list.length === 0 ? (
        <Empty>No airdrops loaded yet.</Empty>
      ) : (
        <List>
          {list.map((a, i) => (
            <Item
              key={a.id || i}
              href={a.link || '#'}
              target="_blank"
              rel="noopener noreferrer"
              title={a.title}
            >
              <ItemTitle>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {a.title}
                </span>
                <ExternalIcon />
              </ItemTitle>
              {a.date && <ItemDate>{formatDate(a.date)}</ItemDate>}
            </Item>
          ))}
        </List>
      )}
    </WidgetCard>
  );
}
