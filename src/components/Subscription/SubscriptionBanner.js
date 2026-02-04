import React from 'react';
import styled from 'styled-components';
import { Crown } from 'lucide-react';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { subscriptionEnabled } from '../../config/features';

const Banner = styled.div`
  background: ${props => props.theme.gradients.primary};
  color: white;
  padding: 0.75rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: ${props => props.theme.fontSize.sm};
  font-weight: ${props => props.theme.fontWeight.medium};
`;

export default function SubscriptionBanner() {
  const { enabled, isPro } = useSubscription();
  if (!subscriptionEnabled || !enabled || isPro) return null;
  return (
    <Banner>
      <Crown size={16} />
      Upgrade to Pro for unlimited access and premium features.
    </Banner>
  );
}
