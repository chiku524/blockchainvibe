import { useQuery, useMutation, useQueryClient } from 'react-query';
import { aiAPI } from '../services/api';

const getUserId = () => {
  try {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    return user?.user_id || user?.id || null;
  } catch {
    return null;
  }
};

export function useAIInsights() {
  const userId = getUserId();
  return useQuery(
    ['ai', 'insights', userId],
    () => aiAPI.getInsights(userId),
    {
      enabled: !!userId,
      staleTime: 2 * 60 * 1000,
      cacheTime: 5 * 60 * 1000,
    }
  );
}

export function useAIDailyDigest() {
  const userId = getUserId();
  return useQuery(
    ['ai', 'daily-digest', userId],
    () => aiAPI.getDailyDigest(userId),
    {
      staleTime: 10 * 60 * 1000,
      cacheTime: 15 * 60 * 1000,
    }
  );
}

export function useAIAgents() {
  return useQuery(
    ['ai', 'agents'],
    () => aiAPI.getAgents(),
    {
      staleTime: 5 * 60 * 1000,
      cacheTime: 10 * 60 * 1000,
    }
  );
}

export function useAIAsk() {
  const queryClient = useQueryClient();
  const userId = getUserId();
  return useMutation(
    (query) => aiAPI.ask(query, userId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['ai']);
      },
    }
  );
}

export function useMeTTaStatus() {
  return useQuery(
    ['ai', 'metta-status'],
    () => aiAPI.getMeTTaStatus(),
    {
      staleTime: 60 * 1000,
      cacheTime: 5 * 60 * 1000,
    }
  );
}
