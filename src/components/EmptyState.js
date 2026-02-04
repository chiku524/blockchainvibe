import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  max-width: 400px;
  margin: 0 auto;
`;

const IconWrap = styled.div`
  font-size: 3.5rem;
  margin-bottom: 1rem;
  line-height: 1;
  color: ${(p) => p.theme.colors.textMuted};
`;

const Title = styled.h3`
  font-size: ${(p) => p.theme.fontSize.xl};
  font-weight: ${(p) => p.theme.fontWeight.semibold};
  color: ${(p) => p.theme.colors.text};
  margin-bottom: 0.5rem;
`;

const Description = styled.p`
  color: ${(p) => p.theme.colors.textSecondary};
  font-size: ${(p) => p.theme.fontSize.sm};
  margin-bottom: ${(p) => (p.$hasAction ? '1.5rem' : '0')};
  line-height: 1.5;
`;

const Action = styled.div`
  margin-top: 1rem;
`;

/**
 * Reusable empty state with optional CTA.
 * @param {React.ReactNode} icon - Emoji or icon component (e.g. "📭" or <Inbox size={48} />)
 * @param {string} title - Short title
 * @param {string} description - One or two lines of explanation
 * @param {React.ReactNode} action - Optional button or link (e.g. "Browse news")
 */
export default function EmptyState({ icon = '📭', title = 'Nothing here yet', description, action }) {
  return (
    <Container>
      <IconWrap aria-hidden>{icon}</IconWrap>
      <Title>{title}</Title>
      {description && <Description $hasAction={!!action}>{description}</Description>}
      {action && <Action>{action}</Action>}
    </Container>
  );
}
