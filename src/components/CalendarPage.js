import React from 'react';
import styled from 'styled-components';
import { useQuery } from 'react-query';
import { Calendar as CalendarIcon } from 'lucide-react';
import { launchesAPI } from '../services/api';
import LaunchesCalendar from './Launches/LaunchesCalendar';
import LoadingSpinner from './LoadingSpinner';

const Page = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  position: relative;
  z-index: 2;
  min-height: 100vh;
  box-sizing: border-box;
`;

const Header = styled.header`
  margin-bottom: 1.5rem;
`;

const Title = styled.h1`
  font-size: ${(p) => p.theme.fontSize['2xl']};
  font-weight: ${(p) => p.theme.fontWeight.bold};
  color: ${(p) => p.theme.colors.text};
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Subtitle = styled.p`
  font-size: ${(p) => p.theme.fontSize.sm};
  color: ${(p) => p.theme.colors.textSecondary};
  margin: 0.5rem 0 0 0;
`;

const CalendarWrap = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.borderRadius.lg};
  padding: 1.5rem;
`;

export default function CalendarPage() {
  const { data, isLoading } = useQuery(
    ['launches', 'drops'],
    () => launchesAPI.getDrops(),
    { staleTime: 6 * 60 * 1000 }
  );
  const events = data?.calendarEvents ?? [];

  return (
    <Page>
      <Header>
        <Title>
          <CalendarIcon size={28} />
          Crypto calendar
        </Title>
        <Subtitle>Upcoming and recent airdrops, launches, and events</Subtitle>
      </Header>
      <CalendarWrap>
        {isLoading ? (
          <LoadingSpinner message="Loading calendar..." />
        ) : (
          <LaunchesCalendar events={events} compact={false} />
        )}
      </CalendarWrap>
    </Page>
  );
}
