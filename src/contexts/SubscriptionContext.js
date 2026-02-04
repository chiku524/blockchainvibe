import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { subscriptionAPI } from '../services/api';
import { subscriptionEnabled } from '../config/features';

const SubscriptionContext = createContext();

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    return {
      plan: 'free',
      isPro: false,
      enabled: false,
      loading: false,
      refetch: () => {},
      updatePlan: async () => ({ success: false }),
    };
  }
  return context;
};

export const SubscriptionProvider = ({ children }) => {
  const [plan, setPlan] = useState('free');
  const [status, setStatus] = useState('active');
  const [loading, setLoading] = useState(false);

  const refetch = useCallback(async (userId) => {
    if (!subscriptionEnabled || !userId) return;
    setLoading(true);
    try {
      const data = await subscriptionAPI.getSubscription(userId);
      if (data.enabled) {
        setPlan(data.plan || 'free');
        setStatus(data.status || 'active');
      }
    } catch {
      setPlan('free');
      setStatus('active');
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePlan = useCallback(async (userId, newPlan) => {
    if (!subscriptionEnabled || !userId) return { success: false };
    try {
      const data = await subscriptionAPI.updateSubscription(userId, newPlan);
      if (data.success) {
        setPlan(data.plan || newPlan);
        return { success: true };
      }
      return { success: false };
    } catch {
      return { success: false };
    }
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const userId = user?.user_id || user?.id;
    if (subscriptionEnabled && userId) {
      refetch(userId);
    }
  }, [refetch]);

  const value = {
    plan,
    status,
    isPro: plan === 'pro',
    enabled: subscriptionEnabled,
    loading,
    refetch,
    updatePlan,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};
