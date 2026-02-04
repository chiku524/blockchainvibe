import React, { useState } from 'react';
import styled from 'styled-components';
import { Crown, Loader } from 'lucide-react';
import toast from 'react-hot-toast';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { subscriptionEnabled } from '../../config/features';
import { useUser } from '../../hooks/useUser';

const Section = styled.section`
  margin-bottom: 2rem;
`;

const PlanCard = styled.div`
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.borderRadius.lg};
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: ${props => props.theme.colors.background};
`;

const PlanInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const PlanName = styled.span`
  font-weight: ${props => props.theme.fontWeight.semibold};
  text-transform: capitalize;
`;

const Badge = styled.span`
  font-size: ${props => props.theme.fontSize.xs};
  padding: 0.25rem 0.5rem;
  border-radius: ${props => props.theme.borderRadius.sm};
  background: ${props => props.theme.colors.primary}20;
  color: ${props => props.theme.colors.primary};
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  border-radius: ${props => props.theme.borderRadius.md};
  font-weight: ${props => props.theme.fontWeight.medium};
  border: none;
  cursor: pointer;
  background: ${props => props.theme.colors.primary};
  color: white;
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

export default function SubscriptionSettings() {
  const { enabled, plan, isPro, loading, updatePlan } = useSubscription();
  const { userProfile } = useUser();
  const [updating, setUpdating] = useState(false);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = userProfile?.user_id || userProfile?.id || user?.user_id || user?.id;

  if (!subscriptionEnabled || !enabled) return null;
  const handleUpgrade = async () => {
    if (!userId || isPro || updating) return;
    setUpdating(true);
    try {
      const result = await updatePlan(userId, 'pro');
      if (result.success) toast.success('Plan updated to Pro');
      else toast.error('Could not update plan');
    } catch {
      toast.error('Something went wrong');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Section>
      <PlanCard>
        <PlanInfo>
          <Crown size={20} />
          <PlanName>{plan}</PlanName>
          {isPro && <Badge>Current</Badge>}
        </PlanInfo>
        {!isPro && (
          <Button onClick={handleUpgrade} disabled={loading || updating}>
            {updating ? <Loader size={16} /> : 'Upgrade to Pro'}
          </Button>
        )}
      </PlanCard>
    </Section>
  );
}
